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

**Integração HTML5 v0.2.0 preparada, ainda não homologada.** O Pages publica CSS e `js/app.js`, com menu para sete seções, leitura de empresas e contagem técnica limitada de títulos abertos. Não são os indicadores financeiros oficiais. O arquivo antigo `principal.jsp.template` é apenas referência histórica; o JSP de instalação v0.2.0 foi entregue em ZIP na conversa.

A equivalência dos 26 SQLs originais, das regras, dos detalhamentos e da abertura nativa da Movimentação Financeira ainda precisa de validação. O erro HTTP 500 da primeira portabilidade não foi esclarecido por logs.

## Segurança e Pages

**O repositório e o Pages são públicos.** Apenas os arquivos copiados explicitamente na workflow `../.github/workflows/pages.yml` poderão entrar no Pages. Nunca publicar consultas proprietárias, saldos ou dados sensíveis na camada pública sem avaliação e autorização; segredos e credenciais não devem ser armazenados no GitHub.

O formato esperado do site é `https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/`, após ativação de GitHub Actions em Settings → Pages.

## Atualização no Sankhya

- Alterações de CSS/JS aprovado: commit + publicação Pages.
- Alteração no JSP/XML: novo ZIP do JSP e importação manual somente no gadget 465.
- Homologação dos totais financeiros com o gadget 380 antes de substituição.

## Integração inicial v0.2.0 — instruções

1. Em [Actions](https://github.com/willdarkmode/dm-telas/actions), confirmar a execução bem-sucedida do workflow de Pages após os commits.
2. Confirmar acesso público aos recursos:
   - https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/css/dashboard.css?v=0.2.0
   - https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/js/app.js?v=0.2.0
3. Fazer backup do gadget de **testes 465**, mantendo `entryPoint="principal.jsp"`.
4. Importar apenas o ZIP atualizado do JSP entregue na conversa (contém apenas `principal.jsp`, aproximadamente 1 KB).
5. Validar interface, carregamento da lista de empresas via `executeQuery()` e contagem técnica de títulos não baixados na janela de vencimento dos últimos 100 dias.
6. Reportar qualquer HTTP 500 do próprio JSP com trecho relevante do log de aplicação. Não alterar o 380.

**A URL do Pages ainda não pôde ser confirmada como publicamente acessível a partir do ambiente de preparação.** A publicação só estará efetiva após o GitHub Actions finalizar com sucesso.

A consulta técnica de contagem **não substitui as 26 SQLs originais**. As sete seções originais permanecem planejadas, e nenhum saldo/valor financeiro foi publicado como resultado no Pages.

## Versão v0.3.4 — retorno ao contrato da v0.2

A v0.3.1–0.3.3 apresentou objeto `{c,b}` no callback de `executeQuery()`, inclusive para `SELECT 1 FROM DUAL`. Não se provou defeito na consulta SQL; a integração foi revertida ao **caminho da v0.2 que já funcionou**: JSP de entrada, JavaScript externo carregado pelo GitHub Pages e ponte única `executeQuery` no `js/app.js`.

Arquivos de interface versionados: `js/app.js` (ponte), `js/financeiro.js` (indicadores), `css/dashboard.css`, `css/financeiro.css`. SQL financeiro original permanece no JSP distribuído por ZIP para homologação no **465**, não no Pages público. O workflow do Pages publica apenas arquivos explicitamente listados.

Antes de importar o ZIP v0.3.4, aguardar conclusão do workflow GitHub Actions e verificar `js/app.js`, `js/financeiro.js` e `css/financeiro.css` nas URLs públicas. **Ainda não foi homologado em execução real no Sankhya**; indicadores e gráfico devem ser comparados ao gadget 380.

## Versão v0.4.0 — Principal ampliada (19/10/2026)

A base comprovada da v0.3.4 foi mantida: `principal.jsp` como entry point, `<snk:load/>` e `js/app.js` como ponte única `executeQuery()`. A publicação do GitHub Pages não contém SQL de negócio.

Novidades: `js/principal-extras.js` e `css/principal-extras.css`; cartões com posição das contas, faturamento/meta anual e valor de estoque, além de projeção de 100 dias com três séries. As consultas originais adicionais (`svl_22D`, `svl_8UZ`, `svl_8QN`, `svl_11E`) ficam **somente no ZIP JSP** disponibilizado na conversa para importar no gadget 465.

**Ressalvas da regra original:** saldos das contas e faturamento/meta não usam `CODEMP`; não devem ser apresentados como filtrados. O total bancário original soma quatro contas e não inclui espécie nem cheques. A query bancária teve removido apenas um `ORDER BY` redundante sobre agregado. O bloco de investimentos do XML original exibia valores de placeholder; por isso continua sem saldo. Estoque permanece dependente de `CODEMP` e dos custos originais.

Status: GitHub Actions publicou os módulos em 19/10/2026 e os scripts passaram no `node --check`; **a execução e os valores v0.4.0 no gadget 465 ainda não foram homologados**. Confrontar cada quadro com a referência oficial 380 e ter cautela com consultas pesadas.

## Versão v0.5.0 — Receitas e Despesas Pendentes (19/10/2026)

As seções **Receitas Pendentes** (`20O`) e **Despesas Pendentes** (`06B`) agora têm navegação funcional em HTML5, resumo por período e detalhamento de títulos em páginas de 50 registros. Consultas extraídas do gadget 380: `grd_0LY`, `grd_0LW`, `grd_06J`, `grd_06I`, incluídas **somente** no ZIP JSP. Os nove SQLs da Principal v0.4.0 foram mantidos byte a byte.

Publicados no Pages: `js/pendentes.js`, `css/pendentes.css` e uma atualização do `js/app.js`, preservando a mesma ponte `executeQuery` funcional da v0.3.4. `OFFSET ... FETCH NEXT 50 ROWS ONLY` foi testado em consulta de leitura na versão Oracle do ambiente, antes de ser aplicado à paginação de títulos.

Cuidado: o agrupamento do XML original mistura 2025 consolidado e os meses de 2025; não somar períodos sobrepostos. O `NUFIN` é exibido para rastreabilidade, mas o launcher nativo de Movimentação Financeira **ainda não foi convertido** para HTML5. Não há alterações no gadget 380 nem no dashboard 226.

Status: [GitHub Actions publicado](https://github.com/willdarkmode/dm-telas/actions/runs/39251337818) com checagem de sintaxe bem-sucedida; os novos relatórios ainda dependem do teste funcional e da conferência de valores no gadget 465. O HTML5 v0.5.0 só estará disponível após o ZIP atualizado ser importado no Sankhya.

## Versão v0.6.0 — Centros de Custo e Salários CC (19/10/2026)

Nova interface em `js/centros.js` e `css/centros.css`; a configuração principal do Sankhya permanece um único JSP com `<snk:load/>` e a ponte externa `executeQuery()`.

**Centros de Custo (056):** ranking 2025 (consulta `cht_0RO`), seleção do centro, naturezas de despesa (`cht_05K`) e parceiros (`grd_09D`). A pizza original é apresentada como barras comparativas, com a mesma origem SQL.

**Salários CC (0E8):** ranking 2025 por centro (`cht_0IL`) e tabela mensal por parceiro, janeiro a dezembro, com total (`grd_2OZ`). Paginação de 50 parceiros por vez via `OFFSET ... FETCH NEXT`, recurso previamente validado no Oracle do Sankhya.

**Ressalva de filtro e acesso:** `cht_0IL` usa `:CODEMP`, mas **`grd_2OZ` não contém `:CODEMP`** na consulta original. O detalhamento pode incluir empresas além das selecionadas. Não dar acesso ao painel salarial a usuários sem autorização. Na migração mantivemos essa regra literalmente para fins de comparação com o 380; a empresa deve homologar a correção ou não dessa divergência.

O JSP da v0.6.0 contém **18 consultas**, sendo 13 idênticas à v0.5.0 e cinco novas, extraídas do XML oficial do 380. SQL financeiro não foi publicado no Pages. Os módulos CSS/JS passam por `node --check` no GitHub Actions.

GitHub Actions: [publicação da v0.6.0](https://github.com/willdarkmode/dm-telas/actions/runs/39255276521) concluída com sucesso. O Sankhya 465 ainda requer importação do ZIP JSP e homologação dos resultados; o gadget 380 e dashboard 226 não foram alterados.

Restantes: Receitas por mês, Despesas por mês e integração do detalhamento por NUFIN.
