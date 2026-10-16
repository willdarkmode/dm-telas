# Fluxo de Caixa — Diretoria

Portabilidade do gadget Sankhya **380** para HTML5, desenvolvida e testada somente no gadget **465**.

## Estratégia

Inspirada em `willdarkmode/DM-Dashboard`:
- um componente HTML5 com JSP de entrada mínimo;
- navegação entre as sete seções via JavaScript;
- arquivos estáticos versionados e servidos via GitHub Pages, após configuração;
- acesso aos dados realizado no contexto autenticado do Sankhya;
- conferência dos valores com o gadget original antes de implantação.

## Telas a preservar

1. Principal
2. Centros de Custo
3. Receitas por mês
4. Despesas por mês
5. Salários CC
6. Receitas Pendentes
7. Despesas Pendentes

## Estado do desenvolvimento

**Estrutura inicial publicada; NÃO apta à implantação.** A aplicação completa depende de JavaScript de consultas financeiras ainda não publicado por conter regras internas de negócio e referências específicas às contas financeiras.

O projeto original do fluxo continua no pacote de trabalho da conversa e o gadget **380** permanece como referência funcional. O erro HTTP 500 da primeira tentativa não foi definitivamente diagnosticado em logs.

## Segurança / publicação

Este repositório está **público**. Nenhuma consulta financeira real, dados bancários, credenciais ou identificadores sensíveis serão publicados aqui sem autorização apropriada.

**Habilitar GitHub Pages não torna privado o código JavaScript.** Para hospedar regras financeiras privadamente, considere uma infraestrutura autenticada sob controle da empresa, ou mover a lógica para camada de execução dentro do Sankhya.

## Atualizações

- CSS/JS externos: versionamento aqui, atualização sem reimportar ZIP do gadget.
- JSP de entrada / estrutura XML: gerar um ZIP com `principal.jsp` e importar manualmente no **465**.
- Toda alteração funcional depende de homologação no Sankhya.
