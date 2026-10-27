# dominios-autenticacao-web

Aplicação Web de autenticação de usuários para a APS de Domínios de Software, UFG, semestre 2026/2.

## Equipe

- Brenner Rodrigues: frontend.
- Enzo Machado: arquitetura, documentação e consolidação da entrega.
- Heitor Barbosa: backend.

## Como funciona

O navegador abre `GET /` e envia e-mail e senha para `POST /autenticar` como `application/x-www-form-urlencoded`. O backend Node.js consulta a tabela `usuarios` no PostgreSQL por e-mail e verifica a senha com scrypt. Em caso de sucesso, retorna somente `id` e `email`. Não há cadastro, sessão, logout ou área protegida.

## Preparar o PostgreSQL

Crie um banco PostgreSQL e um usuário com permissão para criar a tabela e consultar os dados. Exemplo, em uma sessão `psql` de administrador:

```sql
CREATE USER autenticacao WITH PASSWORD 'escolha-uma-senha';
CREATE DATABASE autenticacao OWNER autenticacao;
```

Depois, na raiz do repositório, aplique o esquema e, se quiser testar com o usuário fictício, carregue os dados de exemplo:

```bash
export DATABASE_URL='postgresql://autenticacao:escolha-uma-senha@127.0.0.1:5432/autenticacao'
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/seed.sql
```

O usuário de demonstração é `usuario@exemplo.com`, com senha `SenhaTeste123!`. O SQL guarda apenas o salt e o hash scrypt. O aplicativo usa `DATABASE_URL` ou as variáveis padrão `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` e `PGDATABASE`. Não coloque credenciais reais no repositório.

## Executar

Requer Node.js 24 ou superior e PostgreSQL. Na raiz do projeto:

```bash
npm --prefix backend ci
npm --prefix backend start
```

Abra `http://127.0.0.1:3000/`. A entrada inválida retorna `400`; credenciais inválidas, `403`; falha de processamento ou banco indisponível, `500`. Rotas inexistentes retornam `404` e métodos incorretos, `405` com o cabeçalho `Allow`.

## Testes

```bash
npm --prefix backend test
```

Os testes verificam a API com um substituto do pool PostgreSQL. Eles não exigem um banco em execução. Para conferir a conexão real, aplique o SQL, inicie o servidor e tente autenticar pelo navegador.

## Documentação

- [Planejamento](docs/Planejamento.md)
- [Trabalho da APS](docs/Trabalho.md)

O enunciado original é `2026-2-Domínios de Software-Definição de APS.pdf`, localizado dois diretórios acima deste repositório. A entrega exigida é um único PDF.
