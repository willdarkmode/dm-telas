# Fluxo de Caixa — Diretoria

Projeto público de portabilidade do gadget Sankhya **380** para HTML5, em testes no gadget **465**.

## Arquitetura proposta

Inspirada em `willdarkmode/DM-Dashboard`:
- um único componente HTML5, com JSP mínimo;
- navegação interna em JavaScript entre sete seções;
- dados consultados no contexto autenticado do Sankhya via `executeQuery()`;
- CSS e JS desacoplados do JSP e versionados;
- dados e regras homologados contra o gadget original.

## Sete seções a preservar

1. Principal
2. Centros de Custo
3. Receitas por mês
4. Despesas por mês
5. Salários CC
6. Receitas Pendentes
7. Despesas Pendentes

## Estado

**Base inicial em desenvolvimento, ainda não homologada.** O Pages publica por enquanto apenas uma página de referência e CSS, sem SQL financeiro. O JSP de demonstração `principal.jsp.template` não é uma versão pronta para implantação.

A equivalência dos 26 SQLs originais, das regras, dos detalhamentos e da abertura nativa da Movimentação Financeira ainda precisa de validação. O erro HTTP 500 da primeira portabilidade não foi esclarecido por logs.

## Segurança e Pages

**O repositório e o Pages são públicos.** Apenas os arquivos copiados explicitamente na workflow `../.github/workflows/pages.yml` poderão entrar no Pages. Nunca publicar consultas proprietárias, saldos ou dados sensíveis na camada pública sem avaliação e autorização; segredos e credenciais não devem ser armazenados no GitHub.

O formato esperado do site é `https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/`, após ativação de GitHub Actions em Settings → Pages.

## Atualização no Sankhya

- Alterações de CSS/JS aprovado: commit + publicação Pages.
- Alteração no JSP/XML: novo ZIP do JSP e importação manual somente no gadget 465.
- Homologação dos totais financeiros com o gadget 380 antes de substituição.
