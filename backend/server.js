const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const derivarSenha = promisify(scrypt);
const arquivoPagina = join(__dirname, '..', 'frontend', 'index.html');
const arquivoUsuarios = join(__dirname, 'data', 'usuarios.json');
const parametrosScrypt = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

function responderJson(resposta, status, dados) {
  resposta.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  resposta.end(JSON.stringify(dados));
}

async function lerCredenciais(requisicao) {
  const tipo = requisicao.headers['content-type']?.split(';')[0].trim();
  if (tipo !== 'application/x-www-form-urlencoded') return null;

  requisicao.setEncoding('utf8');
  let corpo = '';
  for await (const trecho of requisicao) {
    corpo += trecho;
  }

  const campos = new URLSearchParams(corpo);
  if (campos.getAll('email').length !== 1 || campos.getAll('senha').length !== 1) {
    return null;
  }

  const email = campos.get('email').trim().toLowerCase();
  const senha = campos.get('senha');
  if (!email || !senha) return null;

  return { email, senha };
}

async function buscarPorEmail(email, caminhoUsuarios) {
  const conteudo = await readFile(caminhoUsuarios, 'utf8');
  const usuarios = JSON.parse(conteudo);
  if (!Array.isArray(usuarios)) throw new Error('O arquivo deve conter uma lista de usuários.');

  for (const usuario of usuarios) {
    if (
      !usuario || typeof usuario.id !== 'string' || !usuario.id ||
      typeof usuario.email !== 'string' || !usuario.email ||
      typeof usuario.salt !== 'string' || !/^[a-f0-9]{32}$/i.test(usuario.salt) ||
      typeof usuario.hashSenha !== 'string' || !/^[a-f0-9]{128}$/i.test(usuario.hashSenha)
    ) {
      throw new Error('Registro de usuário inválido.');
    }
  }

  return usuarios.find((usuario) => usuario.email === email);
}

async function compararSenha(senha, usuario) {
  const salt = Buffer.from(usuario.salt, 'hex');
  const hashRegistrado = Buffer.from(usuario.hashSenha, 'hex');
  const hashRecebido = await derivarSenha(senha, salt, 64, parametrosScrypt);
  return timingSafeEqual(hashRecebido, hashRegistrado);
}

// O caminho opcional permite testar a API sem modificar os usuários do projeto.
function criarServidor(caminhoUsuarios = arquivoUsuarios) {
  return createServer(async (requisicao, resposta) => {
    const caminho = requisicao.url.split('?')[0];

    try {
      if (caminho !== '/' && caminho !== '/autenticar') {
        responderJson(resposta, 404, { erro: 'Recurso não encontrado' });
        return;
      }

      const metodoPermitido = caminho === '/' ? 'GET' : 'POST';
      if (requisicao.method !== metodoPermitido) {
        resposta.setHeader('Allow', metodoPermitido);
        responderJson(resposta, 405, { erro: 'Método não permitido' });
        return;
      }

      if (caminho === '/') {
        const pagina = await readFile(arquivoPagina);
        resposta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        resposta.end(pagina);
        return;
      }

      const credenciais = await lerCredenciais(requisicao);
      if (!credenciais) {
        responderJson(resposta, 400, { erro: 'Entrada inválida' });
        return;
      }

      const usuario = await buscarPorEmail(credenciais.email, caminhoUsuarios);
      if (!usuario || !(await compararSenha(credenciais.senha, usuario))) {
        responderJson(resposta, 403, { erro: 'Credenciais inválidas' });
        return;
      }

      responderJson(resposta, 200, { id: usuario.id, email: usuario.email });
    } catch (erro) {
      if (caminho === '/' && erro.code === 'ENOENT') {
        responderJson(resposta, 404, { erro: 'Página não encontrada' });
        return;
      }

      responderJson(resposta, 500, { erro: 'Falha no processamento' });
    }
  });
}

if (require.main === module) {
  criarServidor().listen(3000, '127.0.0.1', () => {
    console.log('Servidor em http://127.0.0.1:3000');
  });
}

module.exports = { criarServidor };
