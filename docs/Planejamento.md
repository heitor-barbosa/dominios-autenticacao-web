# Projeto Acadêmico: Sistema de Login Web

## 1. Objetivo e escopo

O objetivo é desenvolver e apresentar um sistema web completo de autenticação, com foco exclusivo no login. O trabalho deve explicar não apenas a interface, mas também o funcionamento do frontend, backend, banco de dados e segurança.

### Funcionalidades incluídas

- Login com e-mail e senha.
- Validação dos campos obrigatórios e do formato do e-mail.
- Verificação das credenciais no servidor.
- Armazenamento de senhas com hash, nunca em texto puro.
- Mensagens de erro para credenciais inválidas, campos incorretos e falhas de conexão.
- Criação e encerramento de sessão.
- Área protegida simples, acessível somente após autenticação.

### Fora do escopo

- Cadastro de usuários pela interface.
- Recuperação de senha por e-mail.
- Login social.
- Autenticação em dois fatores.
- Gerenciamento de perfil.

Para a demonstração, um usuário de teste pode ser criado previamente no banco de dados. A área protegida serve apenas para comprovar que a autenticação funciona, não sendo uma segunda funcionalidade de negócio.

## 2. Tecnologias recomendadas

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React + Vite | Interface e validações visuais |
| Backend | Node.js + Express | API de autenticação |
| Banco de dados | PostgreSQL | Persistência dos usuários |
| Segurança de senha | Argon2id ou bcrypt | Armazenamento de hashes |
| Sessão | Cookie de sessão seguro | Manter o usuário autenticado |
| Testes | Vitest e Supertest | Testar interface e API |
| Versionamento | Git + GitHub | Histórico e colaboração |

Essa stack é uma sugestão e pode ser adaptada.

## 3. Checklist detalhado de implementação

### Parte 1 — Planejamento e requisitos

**Responsáveis: todos os integrantes**

- [ ] Definir o objetivo e o escopo do sistema.
  - **Critério de aceite:** documento com o que será implementado e o que ficará fora do escopo.
- [ ] Levantar requisitos funcionais.
  - RF01: permitir login.
  - RF02: validar credenciais.
  - RF03: criar sessão autenticada.
  - RF04: permitir logout.
  - **Critério de aceite:** requisitos registrados e revisados pelos três integrantes.
- [ ] Levantar requisitos não funcionais.
  - Segurança, usabilidade, acessibilidade, desempenho e compatibilidade.
  - **Critério de aceite:** requisitos documentados e verificáveis.
- [ ] Descrever os casos de uso.
  - Login válido, login inválido, sessão expirada e logout.
  - **Critério de aceite:** fluxos principais documentados.
- [ ] Desenhar a arquitetura.
  - Navegador, frontend, API, banco de dados e sessão.
  - **Critério de aceite:** diagrama legível que represente a comunicação entre as camadas.
- [ ] Criar o repositório Git e o quadro de tarefas.
  - **Critério de aceite:** código versionado, README inicial e tarefas atribuídas.

### Parte 2 — Interface e experiência do usuário

**Responsável principal:**

- [ ] Criar o projeto React com Vite.
  - **Critério de aceite:** aplicação inicia localmente sem erros.
- [ ] Construir o layout da página de login.
  - Campos de e-mail e senha, botão Entrar e identidade visual.
  - **Critério de aceite:** formulário apresenta todos os elementos necessários.
- [ ] Implementar responsividade.
  - **Critério de aceite:** layout utilizável em computador, tablet e celular.
- [ ] Implementar mostrar/ocultar senha.
  - **Critério de aceite:** controle alterna a visibilidade da senha e é acessível.
- [ ] Validar os campos no frontend.
  - E-mail obrigatório, formato válido e senha obrigatória.
  - **Critério de aceite:** mensagens de validação claras e coerentes.
- [ ] Criar estados visuais.
  - Carregamento, erro de autenticação, falha de conexão e sucesso.
  - **Critério de aceite:** usuário recebe feedback adequado em cada situação.
- [ ] Implementar acessibilidade básica.
  - Rótulos associados aos campos, navegação por teclado e foco visível.
  - **Critério de aceite:** formulário pode ser operado sem depender exclusivamente do mouse.

### Parte 3 — Backend e autenticação

**Responsável principal:**

- [ ] Criar a API com Node.js e Express.
  - **Critério de aceite:** servidor inicia e disponibiliza a rota de autenticação.
- [ ] Definir o contrato da API.
  - Documentar método, rota, entrada, respostas e códigos HTTP.
  - Exemplo de rota: `POST /api/auth/login`.
  - **Critério de aceite:** frontend e backend usam o mesmo formato de requisição e resposta.
- [ ] Implementar validação no servidor.
  - **Critério de aceite:** dados ausentes, inválidos ou inesperados são rejeitados.
- [ ] Consultar o usuário no banco.
  - Utilizar consultas parametrizadas.
  - **Critério de aceite:** usuário é localizado pelo e-mail sem concatenar dados diretamente no SQL.
- [ ] Verificar a senha.
  - Comparar a senha informada com o hash armazenado.
  - **Critério de aceite:** senha correta é aceita e senha incorreta é rejeitada.
- [ ] Implementar respostas de erro.
  - Não revelar se o e-mail existe; usar mensagem genérica para credenciais inválidas.
  - **Critério de aceite:** erros de autenticação não expõem informações desnecessárias.
- [ ] Implementar proteção contra tentativas excessivas.
  - Aplicar limitação de requisições e definir uma política de tentativas.
  - **Critério de aceite:** requisições excessivas são limitadas conforme a política definida.
- [ ] Criar e validar a sessão.
  - **Critério de aceite:** uma sessão autenticada só é criada após credenciais válidas.
- [ ] Proteger as rotas privadas.
  - **Critério de aceite:** requisições sem sessão válida não acessam recursos protegidos.
- [ ] Implementar logout.
  - **Critério de aceite:** sessão encerrada deixa de autorizar novas requisições protegidas.

### Parte 4 — Banco de dados e segurança

**Responsável principal:**

- [ ] Modelar a tabela de usuários.
  - Definir ID, e-mail único, hash da senha e campos necessários.
  - **Critério de aceite:** modelo de dados documentado e consistente.
- [ ] Criar migração ou script SQL.
  - **Critério de aceite:** banco pode ser configurado de forma reproduzível.
- [ ] Criar usuário de demonstração.
  - Cadastrar previamente um usuário de teste com senha transformada em hash.
  - **Critério de aceite:** credenciais de teste funcionam sem armazenar a senha original no banco.
- [ ] Configurar variáveis de ambiente.
  - Separar credenciais do banco, segredo de sessão e configurações do ambiente.
  - **Critério de aceite:** segredos não ficam escritos diretamente no código nem são enviados ao Git.
- [ ] Proteger os cookies.
  - Usar `HttpOnly`, `Secure` em HTTPS e `SameSite` apropriado ao cenário.
  - **Critério de aceite:** configuração de cookie documentada e testada.
- [ ] Configurar CORS e transporte.
  - Restringir origens permitidas e usar HTTPS em implantação.
  - **Critério de aceite:** origens não autorizadas não são liberadas indevidamente.
- [ ] Evitar vulnerabilidades comuns.
  - Prevenir SQL injection, exposição de segredos e armazenamento de senhas em texto puro.
  - **Critério de aceite:** controles implementados e revisados.
- [ ] Documentar privacidade e limitações.
  - **Critério de aceite:** documento informa quais dados são armazenados e quais medidas de proteção foram adotadas.

### Parte 5 — Integração e testes

**Responsáveis: todos os integrantes**

- [ ] Integrar frontend, API e banco.
  - **Critério de aceite:** login realizado pela interface percorre todas as camadas.
- [ ] Testar login com credenciais válidas.
  - **Critério de aceite:** usuário é autenticado e consegue acessar a área protegida.
- [ ] Testar senha incorreta.
  - **Critério de aceite:** acesso negado e nenhuma sessão autenticada criada.
- [ ] Testar e-mail inexistente.
  - **Critério de aceite:** acesso negado com mensagem genérica.
- [ ] Testar campos vazios e inválidos.
  - **Critério de aceite:** formulário informa os erros adequadamente.
- [ ] Testar acesso direto à área protegida.
  - **Critério de aceite:** usuário sem sessão não acessa o recurso.
- [ ] Testar logout e sessão expirada.
  - **Critério de aceite:** sessão deixa de autorizar novas requisições protegidas.
- [ ] Testar tentativas excessivas e falhas do servidor.
  - **Critério de aceite:** proteções e mensagens funcionam conforme definido.
- [ ] Executar testes de interface e API.
  - **Critério de aceite:** resultados reais são registrados e falhas são corrigidas ou documentadas.
- [ ] Revisar o código e a documentação.
  - **Critério de aceite:** código consistente, organizado e sem segredos no Git.

### Parte 6 — Preparação da entrega

**Responsáveis: todos os integrantes**

- [ ] Preparar ambiente de demonstração.
  - **Critério de aceite:** aplicação e banco funcionam com instruções reproduzíveis.
- [ ] Escrever o README.
  - Incluir pré-requisitos, instalação, variáveis de ambiente e execução.
  - **Critério de aceite:** outra pessoa consegue iniciar o projeto seguindo as instruções.
- [ ] Preparar diagramas e slides.
  - Arquitetura, fluxo de autenticação, modelo de dados e segurança.
  - **Critério de aceite:** diagramas legíveis e alinhados à implementação real.
- [ ] Separar evidências dos testes.
  - **Critério de aceite:** capturas de tela e resultados correspondem a testes realmente executados.
- [ ] Ensaiar a apresentação.
  - **Critério de aceite:** cada aluno domina sua parte e consegue explicar a integração.
- [ ] Preparar plano de contingência.
  - **Critério de aceite:** aplicação local testada e roteiro disponível caso a internet falhe.
