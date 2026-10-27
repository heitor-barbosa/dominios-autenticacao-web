# dominios-autenticacao-web

Projeto de uma aplicação Web de autenticação de usuários para a APS de Domínios de Software, UFG, semestre 2026/2.

## Equipe

- Brenner Rodrigues: frontend.
- Enzo Machado: arquitetura, documentação e consolidação da entrega.
- Heitor Barbosa: backend.

## Documentação

- [Planejamento](docs/Planejamento.md): divisão do trabalho e conferência da entrega de 27/10/2026.
- [Trabalho da APS](docs/Trabalho.md): ambiente operacional, arquitetura, componentes e referências.

A solução usa HTML puro no frontend e JavaScript puro com Node.js no backend. O formulário envia as credenciais diretamente ao servidor. Os usuários ficam em um arquivo JSON local; a autenticação não inclui cadastro, sessão, logout ou área protegida.

O enunciado é `2026-2-Domínios de Software-Definição de APS.pdf`, localizado dois diretórios acima deste repositório. A entrega exigida é um único PDF.

## Executar o backend

O backend está na pasta `backend/` e requer Node.js 24 ou superior. Não há dependências para instalar. Na raiz do repositório, execute:

```bash
npm --prefix backend start
```

A API fica em `http://127.0.0.1:3000`. O servidor também está preparado para entregar `frontend/index.html` em `GET /`, quando o frontend estiver disponível. Enquanto esse arquivo não existir, essa rota retorna `404`.

O usuário fictício de demonstração é `usuario@exemplo.com`, com senha `SenhaTeste123!`. O arquivo `backend/data/usuarios.json` contém somente o salt e o hash scrypt dessa senha, além da identificação do usuário.

```bash
curl -i http://127.0.0.1:3000/autenticar \
  --data-urlencode 'email=usuario@exemplo.com' \
  --data-urlencode 'senha=SenhaTeste123!'
```

A entrada segue o formato `application/x-www-form-urlencoded`, usado pelo formulário HTML. O sucesso retorna `200` com `id` e `email`. Entrada inválida retorna `400`; credenciais inválidas, `403`; falha de processamento, `500`. Rotas inexistentes retornam `404` e métodos incorretos retornam `405` com o cabeçalho `Allow`.

## Verificar a API

```bash
npm --prefix backend test
```

Os testes usam o executor nativo do Node.js e um arquivo temporário de usuários. Verificam autenticação, validação da entrada, métodos, acesso aos arquivos e falhas no repositório, sem modificar os dados do projeto.
