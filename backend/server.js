const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const arquivoPagina = join(__dirname, '..', 'frontend', 'index.html');

function responderJson(resposta, status, dados) {
  resposta.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  resposta.end(JSON.stringify(dados));
}

function criarServidor() {
  return createServer(async (requisicao, resposta) => {
    const caminho = requisicao.url.split('?')[0];

    if (caminho !== '/') {
      responderJson(resposta, 404, { erro: 'Recurso não encontrado' });
      return;
    }

    if (requisicao.method !== 'GET') {
      resposta.setHeader('Allow', 'GET');
      responderJson(resposta, 405, { erro: 'Método não permitido' });
      return;
    }

    try {
      const pagina = await readFile(arquivoPagina);
      resposta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      resposta.end(pagina);
    } catch (erro) {
      if (erro.code === 'ENOENT') {
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
