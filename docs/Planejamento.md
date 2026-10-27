# Planejamento da APS de Domínios de Software

## 1. Objetivo e entrega

Projetar uma aplicação Web que receba e-mail e senha, verifique o usuário, compare a senha com a credencial registrada e retorne a identificação do usuário ou um erro de autenticação. O escopo segue o Apêndice A de `2026-2-Domínios de Software-Definição de APS.pdf`, fornecido pela disciplina.

A entrega será realizada em **27 de outubro de 2026**, em um único PDF preparado a partir de [Trabalho.md](Trabalho.md). O corpo terá duas seções: ambiente operacional e arquitetura com desenho detalhado dos componentes. As referências bibliográficas ficarão depois dessas seções.

O frontend usa HTML puro. O backend usa JavaScript com Node.js e a biblioteca `pg`, sem Express. Os usuários são consultados em uma tabela PostgreSQL.

O escopo termina no retorno da identidade ou do erro. Não inclui cadastro, sessão, logout ou área protegida. Implementação, demonstração e slides não são entregas explicitamente exigidas no enunciado.

## 2. Equipe e comunicação

| Integrante | Responsabilidade principal |
|---|---|
| Brenner Rodrigues | Frontend: formulário HTML e envio das credenciais. |
| Enzo Machado | Escopo, ambiente operacional, arquitetura, documentação e consolidação da entrega. |
| Heitor Barbosa | Backend: recebimento das requisições, consulta dos usuários e verificação da senha. |

A comunicação será feita pelo WhatsApp. Cada integrante trabalhará em sua parte e participará da revisão de outra, conferindo também a integração entre a interface, o servidor e os dados.

A tabela de responsabilidades abaixo define a distribuição para a elaboração e a revisão. Ela não é um registro de revisões já realizadas.

## 3. Distribuição do trabalho

**Tabela 1. Responsabilidades para a entrega de 27/10/2026.**

| Atividade | Item do documento | Responsáveis pela elaboração | Revisores designados |
|---|---|---|---|
| Definir o ambiente operacional e o processamento Web | 1.1 e 1.2 | Enzo Machado | Heitor Barbosa no item 1.1; Brenner Rodrigues no item 1.2 |
| Delimitar o escopo | 2.1 | Enzo Machado | Brenner Rodrigues |
| Projetar a arquitetura | 2.2 | Enzo Machado | Heitor Barbosa |
| Detalhar a interface, o servidor e os dados | 2.3 | Brenner Rodrigues e Heitor Barbosa | Enzo Machado |
| Conferir os fluxos de autenticação | 2.4 | Enzo Machado | Heitor Barbosa |
| Consolidar as referências | Referências | Enzo Machado | Brenner Rodrigues |
| Preparar e conferir o PDF único | Documento completo | Enzo Machado | Brenner Rodrigues e Heitor Barbosa |

Legenda: as revisões devem ser feitas por pessoas distintas dos autores do respectivo item.

## 4. Conferência antes da entrega

- [ ] Cada responsável conferiu o conteúdo atribuído a ele e a integração com as demais partes.
- [ ] Cada revisor designado conferiu os itens sob sua responsabilidade.
- [ ] Todos contribuíram na elaboração de algum item e na revisão de outro.
- [ ] O cabeçalho identifica a disciplina, a tarefa e os autores contribuintes em ordem alfabética.
- [ ] A primeira seção explica os softwares de apoio, suas invocações e os resultados do processamento Web.
- [ ] A segunda seção contém a arquitetura, os componentes, os dados e os fluxos de autenticação, sem funcionalidades adicionais.
- [ ] As fontes estão citadas nos respectivos itens e listadas na bibliografia.
- [ ] O PDF tem índice e referências internas funcionais, texto legível e formatação padronizada.
- [ ] As figuras e tabelas têm título, legenda e referência no texto.
- [ ] O PDF foi conferido visualmente e está pronto para entrega em 27/10/2026.
