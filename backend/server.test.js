const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const usuarioExemplo = {
  id: '1',
  email: 'usuario@exemplo.com',
  salt: '1a8b7a615e6a2be755f00ede2309b4dd',
  hashSenha: 'f55bf517893b8457a9d7a14930ffd99329467eaaafcc5be29216eefa8ce42f182347d21551face56bf2b5b6ddd4e7c485f7d0fdfb30150b93403118c0765a7ac',
};
const { criarServidor } = require('./server');

let servidor;
let endereco;
let falhaBanco = false;
let consultas = [];
const pool = {
  async query(sql, valores) {
    consultas.push({ sql, valores });
    if (falhaBanco) throw new Error('Banco indisponível');
    return { rows: valores[0] === usuarioExemplo.email ? [usuarioExemplo] : [] };
  },
};

before(async () => {
  servidor = criarServidor(pool);
  servidor.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  endereco = `http://127.0.0.1:${servidor.address().port}`;
});

beforeEach(() => {
  falhaBanco = false;
  consultas = [];
});

after(async () => {
  if (servidor?.listening) {
    await new Promise((resolve) => servidor.close(resolve));
  }
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

test('a consulta ao PostgreSQL usa parâmetro para o e-mail', async () => {
  const resposta = await enviarFormulario({
    email: "' OR 1=1 --", senha: 'SenhaTeste123!',
  });
  assert.equal(resposta.status, 403);
  assert.equal(consultas.length, 1);
  assert.match(consultas[0].sql, /WHERE email = \$1/);
  assert.deepEqual(consultas[0].valores, ["' or 1=1 --"]);
});

test('falha na consulta ao PostgreSQL retorna erro genérico', async () => {
  falhaBanco = true;
  const resposta = await enviarFormulario({
    email: 'usuario@exemplo.com', senha: 'SenhaTeste123!',
  });
  assert.equal(resposta.status, 500);
  assert.deepEqual(await resposta.json(), { erro: 'Falha no processamento' });
});
