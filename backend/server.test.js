const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtemp, readFile, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { criarServidor } = require('./server');

let servidor;
let endereco;
let diretorio;
let caminhoUsuarios;
let dadosIniciais;

before(async () => {
  diretorio = await mkdtemp(join(tmpdir(), 'autenticacao-'));
  caminhoUsuarios = join(diretorio, 'usuarios.json');
  dadosIniciais = await readFile(join(__dirname, 'data', 'usuarios.json'), 'utf8');
  servidor = criarServidor(caminhoUsuarios);
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  endereco = `http://127.0.0.1:${servidor.address().port}`;
});

beforeEach(async () => {
  await writeFile(caminhoUsuarios, dadosIniciais);
});

after(async () => {
  if (servidor?.listening) {
    await new Promise((resolve) => servidor.close(resolve));
  }
  if (diretorio) await rm(diretorio, { recursive: true });
});

function enviarFormulario(campos) {
  return fetch(`${endereco}/autenticar`, {
    method: 'POST',
    body: new URLSearchParams(campos),
  });
}

test('credenciais válidas retornam somente a identificação, sem criar sessão', async () => {
  const resposta = await enviarFormulario({
    email: 'usuario@exemplo.com', senha: 'SenhaTeste123!',
  });
  assert.equal(resposta.status, 200);
  assert.match(resposta.headers.get('content-type'), /^application\/json; charset=utf-8$/);
  assert.equal(resposta.headers.get('set-cookie'), null);
  assert.deepEqual(await resposta.json(), { id: '1', email: 'usuario@exemplo.com' });
});

test('o e-mail é aparado e convertido para letras minúsculas', async () => {
  const resposta = await enviarFormulario({
    email: ' USUARIO@EXEMPLO.COM ', senha: 'SenhaTeste123!',
  });
  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), { id: '1', email: 'usuario@exemplo.com' });
});

test('senha incorreta e usuário inexistente recebem o mesmo erro', async () => {
  for (const campos of [
    { email: 'usuario@exemplo.com', senha: 'errada' },
    { email: 'inexistente@exemplo.com', senha: 'SenhaTeste123!' },
    { email: 'usuario@exemplo.com', senha: ' SenhaTeste123! ' },
  ]) {
    const resposta = await enviarFormulario(campos);
    assert.equal(resposta.status, 403);
    assert.deepEqual(await resposta.json(), { erro: 'Credenciais inválidas' });
  }
});

test('campos ausentes, vazios ou repetidos são rejeitados', async () => {
  const entradasInvalidas = [
    {},
    { email: 'usuario@exemplo.com' },
    { senha: 'SenhaTeste123!' },
    { email: '', senha: 'SenhaTeste123!' },
    { email: '   ', senha: 'SenhaTeste123!' },
    { email: 'usuario@exemplo.com', senha: '' },
    [['email', 'usuario@exemplo.com'], ['email', 'outro@exemplo.com'], ['senha', 'SenhaTeste123!']],
    [['email', 'usuario@exemplo.com'], ['senha', 'SenhaTeste123!'], ['senha', 'outra']],
  ];
  for (const campos of entradasInvalidas) {
    const resposta = await enviarFormulario(campos);
    assert.equal(resposta.status, 400);
    assert.deepEqual(await resposta.json(), { erro: 'Entrada inválida' });
  }
});

test('a API exige o formato enviado pelo formulário HTML', async () => {
  const resposta = await fetch(`${endereco}/autenticar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usuario@exemplo.com', senha: 'SenhaTeste123!' }),
  });
  assert.equal(resposta.status, 400);
  assert.deepEqual(await resposta.json(), { erro: 'Entrada inválida' });
});

test('métodos incorretos retornam 405 e indicam o método permitido', async () => {
  for (const [caminho, metodo, permitido] of [
    ['/autenticar', 'GET', 'POST'],
    ['/', 'POST', 'GET'],
  ]) {
    const resposta = await fetch(`${endereco}${caminho}`, { method: metodo });
    assert.equal(resposta.status, 405);
    assert.equal(resposta.headers.get('allow'), permitido);
    assert.deepEqual(await resposta.json(), { erro: 'Método não permitido' });
  }
});

test('rotas inexistentes não permitem ler arquivos do servidor', async () => {
  for (const caminho of ['/inexistente', '/data/usuarios.json', '/server.js']) {
    const resposta = await fetch(`${endereco}${caminho}`);
    assert.equal(resposta.status, 404);
    assert.deepEqual(await resposta.json(), { erro: 'Recurso não encontrado' });
  }
});

test('falhas no repositório retornam erro genérico, sem expor os dados', async () => {
  const registroInvalido = JSON.parse(dadosIniciais);
  registroInvalido[0].hashSenha = 'hash-inválido';
  for (const conteudo of ['JSON inválido', '{}', JSON.stringify(registroInvalido)]) {
    await writeFile(caminhoUsuarios, conteudo);
    const resposta = await enviarFormulario({
      email: 'usuario@exemplo.com', senha: 'SenhaTeste123!',
    });
    assert.equal(resposta.status, 500);
    assert.deepEqual(await resposta.json(), { erro: 'Falha no processamento' });
  }

  await rm(caminhoUsuarios);
  const resposta = await enviarFormulario({
    email: 'usuario@exemplo.com', senha: 'SenhaTeste123!',
  });
  assert.equal(resposta.status, 500);
  assert.deepEqual(await resposta.json(), { erro: 'Falha no processamento' });
});
