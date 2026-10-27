# APS: Software Web para Autenticação de Usuários

**Disciplina:** Domínios de Software, UFG, semestre 2026/2.

**Tarefa:** Projeto de um software no domínio de aplicações Web.

**Autoria:** Brenner Rodrigues, Enzo Machado e Heitor Barbosa.

**Entrega:** 27 de outubro de 2026.

**Índice**

- [1. Ambiente operacional](#1-ambiente-operacional)
  - [1.1. Softwares e configuração](#11-softwares-e-configuração)
  - [1.2. Processamento de uma requisição](#12-processamento-de-uma-requisição)
- [2. Arquitetura e desenho detalhado dos componentes](#2-arquitetura-e-desenho-detalhado-dos-componentes)
  - [2.1. Escopo](#21-escopo)
  - [2.2. Arquitetura](#22-arquitetura)
  - [2.3. Componentes, dados e comunicação](#23-componentes-dados-e-comunicação)
  - [2.4. Fluxos de autenticação](#24-fluxos-de-autenticação)
- [Referências](#referências)

## 1. Ambiente operacional

### 1.1. Softwares e configuração

**Responsável pela elaboração:** Enzo Machado. **Revisor designado:** Heitor Barbosa.

A aplicação será executada localmente. O navegador apresentará um formulário HTML e o servidor Node.js receberá as credenciais e verificará a senha. O mesmo programa exercerá as funções de servidor web, ao entregar a página, e de servidor de aplicação, ao processar a autenticação. A comunicação seguirá o modelo de requisição e resposta HTTP [2].

A Tabela 1 apresenta o ambiente adotado para o projeto. Linux Mint 22.3 e Node.js 24.20.0 correspondem ao ambiente consultado na elaboração da documentação. Chromium é o navegador de referência escolhido; não há dependência de uma versão específica, pois a interface usará apenas um formulário HTML.

**Tabela 1. Ambiente operacional.**

| Elemento | Software ou recurso | Função |
|---|---|---|
| Sistema operacional | Linux Mint 22.3 | Executar o processo Node.js e disponibilizar os arquivos locais. |
| Navegador | Chromium | Solicitar a página, apresentar o formulário e enviar as credenciais. |
| Servidor web | Node.js 24.20.0, módulo nativo `node:http` | Receber requisições e enviar respostas HTTP [6]. |
| Servidor de aplicação | Mesmo processo Node.js, em JavaScript puro | Executar a busca do usuário e a verificação da senha. |
| Acesso aos dados | Módulo nativo `node:fs/promises` | Ler o arquivo de usuários [7]. |
| Verificação da senha | Módulo nativo `node:crypto` | Derivar e comparar a credencial [8]. |
| Repositório | Arquivo local `backend/data/usuarios.json` | Conter os usuários previamente registrados. |

Legenda: os papéis de servidor web e de aplicação pertencem a um único processo. O repositório não exige servidor de banco de dados.

A aplicação será organizada em duas pastas: `frontend/`, com `index.html`, e `backend/`, com `server.js` e `data/usuarios.json`. A execução será feita com `node backend/server.js`, a partir da raiz do projeto. O servidor escutará em `127.0.0.1`, porta `3000`, e a página será acessada por `http://127.0.0.1:3000/`.

O ambiente projetado usará HTTP somente no acesso local. Não haverá publicação em rede ou configuração de HTTPS nesta solução. No processamento Web por HTTPS, a conexão também envolve TLS, conforme [4]. O acesso pelo endereço IP local dispensa a resolução de um nome por DNS [3].

### 1.2. Processamento de uma requisição

**Responsável pela elaboração:** Enzo Machado. **Revisor designado:** Brenner Rodrigues.

Ao acessar a aplicação, o navegador abrirá uma conexão com o servidor local e enviará `GET /`. O programa identificará o método e o caminho da requisição, lerá `frontend/index.html` e responderá com status `200` e conteúdo `text/html; charset=utf-8`. O navegador interpretará o HTML e exibirá os campos de e-mail e senha e o botão de envio [2, 6].

O formulário terá `method="post"`, `action="/autenticar"` e campos chamados `email` e `senha`. Ao enviá-lo, o navegador produzirá uma requisição `POST /autenticar` com conteúdo `application/x-www-form-urlencoded`. Não haverá JavaScript no frontend.

No servidor, o tratamento seguirá esta sequência:

1. O código receberá os trechos do corpo da requisição e, ao final da leitura, decodificará os campos com `URLSearchParams`.
2. A aplicação verificará se há um único e-mail e uma única senha, ambos preenchidos. O e-mail será aparado e convertido para letras minúsculas; a senha será mantida exatamente como recebida.
3. O código lerá `backend/data/usuarios.json` como texto UTF-8 e usará `JSON.parse` para obter a lista de usuários. A busca comparará o e-mail recebido com os e-mails registrados [7].
4. Se o usuário existir, a aplicação usará o salt e o hash armazenados para verificar a senha pelo procedimento do [item 2.3](#23-componentes-dados-e-comunicação).
5. A aplicação montará uma resposta JSON com a identificação ou o erro correspondente, conforme a Tabela 4.
6. O servidor enviará o status, o cabeçalho `Content-Type: application/json; charset=utf-8` e o corpo serializado com `JSON.stringify`. O navegador exibirá o JSON recebido. A operação terminará nesse retorno [6].

Somente a rota da página entregará um arquivo da interface. O arquivo de usuários não terá rota de acesso pelo navegador. A descrição acima define o processamento projetado; não representa um relato de testes executados.

## 2. Arquitetura e desenho detalhado dos componentes

### 2.1. Escopo

**Responsável pela elaboração:** Enzo Machado. **Revisor designado:** Brenner Rodrigues.

O software realizará somente a verificação de credenciais prevista no Apêndice A do enunciado [1]:

1. Receber e-mail e senha enviados pelo cliente.
2. Verificar se o usuário existe no repositório de dados.
3. Comparar a senha fornecida com a credencial registrada.
4. Retornar um objeto com a identificação do usuário quando as credenciais forem válidas.
5. Retornar um erro de autenticação quando o usuário não existir ou a senha estiver incorreta.

Os usuários estarão previamente registrados no arquivo de dados. Cadastro, sessão, logout e área protegida não fazem parte do escopo.

### 2.2. Arquitetura

**Responsável pela elaboração:** Enzo Machado. **Revisor designado:** Heitor Barbosa.

A Figura 1 mostra a comunicação da solução. O navegador enviará requisições ao programa Node.js, que atenderá à interface e executará a autenticação [2, 6]. O acesso ao arquivo de usuários será feito pelo servidor [7].

**Figura 1. Arquitetura da aplicação.**

```text
Navegador                          Servidor Node.js
Formulário HTML <--- HTTP -------> backend/server.js
                                  - entrega da página
                                  - autenticação
                                  - verificação da senha
                                         |
                                         | leitura local
                                         v
                                  backend/data/usuarios.json
```

Legenda: a comunicação HTTP ocorrerá em `127.0.0.1:3000`; a leitura do arquivo ocorrerá no mesmo computador do servidor.

O programa será organizado em funções para receber as requisições, buscar o usuário, comparar a senha e montar a resposta. Essas responsabilidades não exigem classes, serviços separados ou frameworks. Brenner Rodrigues ficará responsável pela interface, Heitor Barbosa pelo backend e Enzo Machado pela arquitetura e consolidação da documentação.

### 2.3. Componentes, dados e comunicação

**Responsáveis pela elaboração:** Brenner Rodrigues e Heitor Barbosa. **Revisor designado:** Enzo Machado.

A Tabela 2 apresenta as responsabilidades dos componentes. As operações são funções lógicas do projeto, não serviços independentes.

**Tabela 2. Componentes da solução.**

| Componente | Entrada | Processamento | Saída |
|---|---|---|---|
| Formulário HTML | E-mail e senha | Enviar POST para `/autenticar`. | Requisição ao servidor. |
| Tratamento HTTP | Método, caminho e corpo | Entregar a página ou encaminhar as credenciais para `autenticar(email, senha)` [6]. | Resposta HTML ou JSON. |
| Autenticação | E-mail e senha | Validar a entrada, buscar o usuário e verificar a senha. | Identificação ou erro. |
| Consulta de usuários | E-mail | Ler o JSON e localizar o registro pelo e-mail [7]. | Registro ou ausência de usuário. |
| Comparação de senha | Senha, salt e hash | Derivar a senha recebida com scrypt e comparar os resultados [8]. | Verdadeiro ou falso. |

Legenda: todas as operações do servidor pertencerão ao mesmo processo Node.js.

O repositório será uma lista JSON com a estrutura da Tabela 3. O e-mail será único, aparado e armazenado em letras minúsculas. A identidade retornada ao cliente conterá apenas `id` e `email`.

**Tabela 3. Dados de cada usuário.**

| Campo | Tipo | Conteúdo |
|---|---|---|
| `id` | String | Identificador único do usuário. |
| `email` | String | E-mail utilizado na busca. |
| `salt` | String hexadecimal | Salt aleatório de 16 bytes, próprio de cada usuário. |
| `hashSenha` | String hexadecimal | Resultado de 64 bytes da derivação da senha. |

Legenda: `salt` e `hashSenha` serão utilizados somente no servidor.

A senha será tratada com scrypt, disponível em `node:crypto`. O projeto adotará `N = 131072`, `r = 8` e `p = 1`, configuração indicada em [5], com saída de 64 bytes e limite `maxmem` de 256 MiB. Na preparação dos registros, o salt será gerado por `randomBytes(16)`. Na autenticação, a aplicação decodificará o salt, derivará a senha recebida com `scrypt` e comparará buffers de mesmo tamanho com `timingSafeEqual` [8]. A senha original não será armazenada no JSON nem incluída na resposta.

O contrato será `POST /autenticar`, com corpo `application/x-www-form-urlencoded`. Exemplo de entrada: `email=usuario%40exemplo.com&senha=valor`. A Tabela 4 estabelece as respostas, usando os status HTTP descritos em [4].

**Tabela 4. Respostas da autenticação.**

| Situação | Status | Corpo JSON |
|---|---|---|
| Credenciais válidas | `200` | `{"id":"1","email":"usuario@exemplo.com"}` |
| Campos ausentes, repetidos ou vazios | `400` | `{"erro":"Entrada inválida"}` |
| Usuário inexistente ou senha incorreta | `403` | `{"erro":"Credenciais inválidas"}` |
| Falha na leitura dos dados ou no processamento | `500` | `{"erro":"Falha no processamento"}` |

Legenda: os valores de usuário são ilustrativos. O status `403` representa a recusa da autenticação; erros internos não serão apresentados como senha incorreta.

O acesso a um caminho inexistente receberá `404`. Nas rotas existentes, um método diferente do previsto receberá `405`, com o cabeçalho `Allow` correspondente [4].

### 2.4. Fluxos de autenticação

**Responsável pela elaboração:** Enzo Machado. **Revisor designado:** Heitor Barbosa.

Os fluxos atendem às decisões do Apêndice A [1] e utilizam os componentes e respostas do [item 2.3](#23-componentes-dados-e-comunicação):

- **Credenciais válidas:** o servidor recebe o formulário, encontra o usuário e confirma a senha. Retorna `200` com `id` e `email`.
- **Usuário inexistente:** a leitura dos dados termina, mas a busca não encontra o e-mail. Retorna `403` com erro de credenciais inválidas.
- **Senha incorreta:** o usuário é encontrado, mas o resultado da derivação não corresponde ao hash registrado. Retorna o mesmo erro `403`.
- **Entrada inválida:** falta algum campo, há campos repetidos ou um dos valores está vazio. Retorna `400` antes da consulta dos usuários.
- **Falha interna:** o arquivo não pode ser lido, seu conteúdo não tem o formato esperado ou a verificação da senha falha por erro de processamento. Retorna `500`, sem expor detalhes internos ao cliente.

Esses fluxos descrevem o comportamento projetado. A verificação de sua implementação não faz parte dos resultados apresentados neste documento.

## Referências

**Responsável pela consolidação:** Enzo Machado. **Revisor designado:** Brenner Rodrigues.

[1] UNIVERSIDADE FEDERAL DE GOIÁS. Instituto de Informática. **Definição de Atividades Práticas Supervisionadas (APS) da Disciplina: Domínios de Software, semestre 2026/2.** Documento fornecido pela disciplina: `2026-2-Domínios de Software-Definição de APS.pdf`.

[2] MDN WEB DOCS. **Uma visão geral do HTTP.** Disponível em: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/Overview. Acesso em: 26 out. 2026.

[3] MDN WEB DOCS. **Como a Internet funciona?** Disponível em: https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work. Acesso em: 26 out. 2026.

[4] FIELDING, R.; NOTTINGHAM, M.; RESCHKE, J. (ed.). **HTTP Semantics.** RFC 9110. Junho de 2022. Disponível em: https://www.rfc-editor.org/rfc/rfc9110.html. Acesso em: 26 out. 2026.

[5] OWASP FOUNDATION. **Password Storage Cheat Sheet.** Disponível em: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html. Acesso em: 26 out. 2026.

[6] NODE.JS. **HTTP.** Documentação da linha 24.x. Disponível em: https://nodejs.org/docs/latest-v24.x/api/http.html. Acesso em: 26 out. 2026.

[7] NODE.JS. **File system.** Documentação da linha 24.x. Disponível em: https://nodejs.org/docs/latest-v24.x/api/fs.html. Acesso em: 26 out. 2026.

[8] NODE.JS. **Crypto.** Documentação da linha 24.x. Disponível em: https://nodejs.org/docs/latest-v24.x/api/crypto.html. Acesso em: 26 out. 2026.
