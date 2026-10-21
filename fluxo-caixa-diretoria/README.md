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

## v0.7.0 — Receitas por mês e Despesas por mês (19/10/2026)

As sete seções originais agora têm interfaces HTML5 implementadas. Esta versão acrescenta:

- **Receitas por mês (20P):** gráfico `cht_20W`, grade `grd_20V` por natureza e mês (janeiro a dezembro de 2025).
- **Despesas por mês (41W):** gráfico `cht_465`, grade `grd_464` por natureza, centro de custo e mês (janeiro a dezembro de 2025).
- Nova interface de gráfico de duas séries (receitas/despesas, inclusive valores negativos), seleção de mês, cards mensais, pesquisa, opção **Ver 12 meses** na grade, atalho para Pendentes e paginação de 50 linhas na tela. Dados vêm do `executeQuery()` do app validado, sem mudar a ponte SQL.
- `js/mensal.js` e `css/mensal.css` servidos pelo GitHub Pages; SQL de negócio mantido no ZIP do componente instalado no gadget 465.

**Detalhes de equivalência:** os dois gráficos compartilham exatamente o mesmo SQL no XML 380. As grades e o gráfico mantêm listas de exclusões TOP/natureza próprias; diferenças entre total da grade e do gráfico podem ocorrer por essas regras, e devem ser conferidas antes de alterar qualquer cálculo. O ano 2025 e as datas Oracle continuam fixos. A grade de receitas não tinha uma coluna SQL `TOTAL`; o total anual exibido na interface resulta da soma de suas 12 colunas, enquanto o total da grade de despesas vem da SQL original.

O ZIP v0.7.0 preserva sem alteração os **18 SQLs da v0.6.0**, acrescentando quatro novos (`grd_20V`, `cht_20W`, `grd_464`, `cht_465`): **22 consultas**. A publicação do Pages passou com sucesso pelo workflow [39258115415](https://github.com/willdarkmode/dm-telas/actions/runs/39258115415) com validação de sintaxe JS.

**Status:** o usuário confirmou o carregamento funcional de Centros de Custo e Salários CC na v0.6.0; a v0.7.0 e seus números mensais ainda exigem teste no gadget 465. Nenhuma modificação foi realizada no gadget 380 ou dashboard 226. O detalhamento de salários permanece sujeito à ressalva original de ausência do filtro `CODEMP`, e a abertura nativa de `NUFIN` segue pendente.

## Evidência de testes visuais — v0.7.0 (19/10/2026)

O responsável enviou capturas da execução das telas **Receitas por mês** e **Despesas por mês** no gadget de homologação **465**. Ambas apresentaram: cabeçalho, filtro de empresas, seleção de mês, dois indicadores de baixa, gráfico comparativo receitas × despesas e grade por natureza (com centro de custo no caso de despesas), sem erro visível de carregamento.

**Status atualizado:** sete seções com carregamento e navegação demonstrados nas capturas das versões 0.3–0.7. **Não significa paridade financeira homologada.** Continuam pendentes: comparar valores e critérios de cada consulta ao gadget original 380 nas mesmas empresas e datas; testar a interação `Ver 12 meses`; verificar paginação/filtros de todas as grades; implementar e homologar abertura da Movimentação Financeira pelo `NUFIN`.

O XML original inclui a ação nativa `<on-click-launcher resource-id="br.com.sankhya.fin.cad.movimentacaoFinanceira"><NUFIN>$NUFIN</NUFIN></on-click-launcher>` nas grades de títulos `grd_0LW` e `grd_06I`. Essa é a referência semântica para a futura navegação HTML5; **não assumir** a assinatura da API JavaScript sem validação no Sankhya.

**Segurança:** não incluir saldos bancários, títulos, nomes de colaboradores ou detalhes financeiros das capturas neste repositório público. O código de visualização público deve permanecer sem SQL sensível ou credenciais.

## v0.8.0 — Navegação nativa por NUFIN (20/10/2026)

O responsável confirmou no gadget **465** que a opção **Ver 12 meses** funciona nas duas telas mensais (Receitas por mês e Despesas por mês). Validação visual e interação confirmadas; conciliação com gadget 380 ainda pendente.

**Nova integração:** as seções Receitas Pendentes (20O) e Despesas Pendentes (06B) exibem o NUFIN como botão para solicitar a abertura da tela nativa `br.com.sankhya.fin.cad.movimentacaoFinanceira`. A chamada `openApp(resource, {NUFIN: número})` parte apenas de clique do usuário, aceita somente código inteiro positivo e tenta localizar a função no contexto atual ou nos contêineres acessíveis do Sankhya. Se a função não estiver acessível ou lançar exceção, a tela informa o motivo e mantém o botão **Copiar** para pesquisa manual.

A sintaxe de `openApp(id_da_tela, parâmetros)` é indicada pela [documentação oficial de eventos de click](https://developer.sankhya.com.br/docs/eventos-de-click-no-ireport), mas a integração HTML5 e o posicionamento exato da tela financeira **ainda precisam ser testados no Sankhya do cliente**. Uma chamada sem exceção não comprova que a navegação terminou no título correto.

O módulo visual `js/pendentes.js`, o estilo `css/pendentes.css` e o teste `tests/pendentes-nufin.cjs` foram versionados e passam no [workflow de publicação e teste](https://github.com/willdarkmode/dm-telas/actions/runs/39415920202). Nenhum SQL financeiro foi publicado no Pages.

**JSP v0.8.0:** fornecido somente como ZIP na conversa; é uma cópia da v0.7.0 com a versão de cache das 13 URLs CSS/JS atualizada de `0.7.0` para `0.8.0` e o indicador visual da versão. As **22 consultas originais** são exatamente as mesmas (comparação do objeto `GGFluxoOriginalSQL`). Reinstalar somente no gadget de testes 465, sem alterar o XML.

**Atenção:** a funcionalidade navega para a tela nativa, não efetua alterações nem baixa títulos. Testar primeiro com título já conhecido e usuário autorizado; garantir que o registro aberto corresponda ao NUFIN selecionado, sem editar ou baixar.

## Retorno de homologação da v0.8.0 — abertura de Movimentações Financeiras

O responsável testou o clique em um `NUFIN` a partir do gadget de testes **465** e confirmou que o Sankhya abriu a tela nativa de **Movimentações Financeiras**. A navegação via `openApp()` está, portanto, **operacional quanto à abertura da tela** no ambiente real.

**Validação confirmada em 20/10/2026:** o responsável selecionou uma nota pelo `NUFIN` no gadget 465 e confirmou que o Sankhya abriu **exatamente o título selecionado** na tela nativa de Movimentações Financeiras. A navegação contextual por `NUFIN` fica homologada para o cenário testado, sem edição ou baixa do título. As permissões devem continuar sendo respeitadas para cada usuário.

A portabilidade das sete seções e o botão `Ver 12 meses` já tiveram execução visual confirmada. A conciliação dos valores financeiros do **465** com o gadget original **380** permanece em aberto. Não alterar o gadget **380** ou dashboard **226**.


## Auditoria estrutural e conciliação inicial — 20/10/2026

A homologação financeira entrou na etapa de comparação técnica da v0.8.0, **sem alterar os gadgets 380/465 nem o dashboard 226**. Analisamos o XML extraído do 380, o `principal.jsp` do ZIP v0.8.0 e os metadados de `TSIGDG` no ambiente de produção, exclusivamente por consultas de leitura.

- O XML original contém **26 consultas SQL** e o JSP HTML5 **22 consultas**. Destas, **21 são textualmente idênticas** às originais.
- Exceção: `svl_22D` remove o `ORDER BY SBC.SALDOREAL DESC` após a agregação do saldo bancário. A operação é global e `SOMA_TOTAL` soma apenas contas internas 8, 6, 9 e 7; não inclui espécie (19) nem cheques (10).
- Quatro consultas não migradas: `grd_1BP` (grade analítica da projeção de 100 dias: pendência funcional), `svl_26E` (bloco investimentos com placeholder), `svl_11F` e `svl_11G` (consultas duplicadas exatamente iguais à `svl_8UZ`).
- Conferimos os cálculos agregados de **receitas e despesas de 2025**, os dois indicadores comerciais, o saldo bancário e a avaliação de estoque em consultas de produção *read-only*. Os valores monetários e dados de cliente não devem entrar neste repositório público; estão em relatório privado entregue ao responsável.
- O valor do indicador de faturamento anual e a porcentagem da meta **coincidiram com a evidência visual da v0.7.0**. Os outros itens não podem ser declarados homologados sem valores comparados do 380 e 465 para os mesmos filtros e momento.
- Riscos documentados: `CODEMP` ausente no detalhamento de Salários CC; TOPs diferentes entre faturamento/meta e séries/grades; anos fixos em 2025; uso de referências bancárias e custos de estoque dinâmicos; data final original com `BETWEEN` até meia-noite (risco de corte de horários, não constatado no agregado inspecionado).
- **Próxima validação:** comparar as telas 380 e 465 no mesmo momento, com as mesmas empresas, e preencher as diferenças por indicador; depois migrar `grd_1BP` sem modificar a fórmula da projeção.

A planilha privada de reconciliação contém abas de conferência 380 × 465, inventário das 26 SQLs, riscos e roteiro para testes. Ela não deve ser publicada no GitHub por conter totais financeiros extraídos do ambiente de produção.


## v0.9.0 — Projeção por período personalizado e grade original (20/10/2026)

Solicitação funcional prioritária do financeiro: consultar projeções para **datas inicial/final escolhidas livremente**, não apenas os 100 dias do gadget original.

**Implementação:** inclusão na seção Principal de um novo bloco de projeção diária, com limites de 1 a **730 dias inclusivos**; atalhos para 30, 90, 100, 180, 365 e 730 dias; agrupamento visual diário, semanal (blocos de sete dias desde a data inicial) ou mensal; quadro sintético por período; gráfico de três séries acumuladas; drilldown em **A receber, A pagar, Recebido e Pago**, com títulos paginados (50) e abertura nativa por **NUFIN**. A consulta é executada apenas após clicar em Consultar período. O gráfico original de 100 dias continua executando a SQL `cht_1JA` sem alterações.

**Fonte financeira:** preservados os filtros de TOP/natureza e empresas do gráfico original. A projeção dinâmica usa novas consultas de leitura, `GGFluxoPeriodoSQL.diario` e `GGFluxoPeriodoSQL.titulos`, disponibilizadas apenas no `principal.jsp` instalado no Sankhya. A grade legada `grd_1BP` também foi copiada literalmente do XML original para comparação **sob demanda**, sem execução automática. Todas as **22 consultas antigas permanecem idênticas**, confirmadas por igualdade do objeto JSON original entre v0.8.0 e v0.9.0. O repositório público contém somente a interface `js/projecao.js`/`css/projecao.css` e testes; não contém SQL de negócio real.

**Interpretação financeira obrigatória:** o saldo calculado é o acumulado de títulos **em aberto** com vencimento dentro do período consultado (receber positivo; pagar negativo). Parte de **zero** na data inicial; **não** carrega saldo inicial bancário nem vencidos anteriores. Recebido/Pago são títulos baixados dentro do período classificados por `DHBAIXA` e usando `VLRDESDOB` — foram preservadas as regras financeiras do chart original, e essas séries são mostradas separadamente, sem compor o saldo projetado. A grade original de 100 dias tem regras próprias de fim de semana e intervalos e não é um equivalente matemático perfeito da nova visão diária.

**Validação técnica até aqui:** consultas novas executaram no Oracle do Sankhya **somente leitura** (amostra diária de sete dias e título individual em intervalo), e teste de regressão automático verifica validade de datas, máximo de 730 dias e navegação NUFIN. A **execução de 365/730 dias no gadget 465 ainda depende da homologação do usuário**. A política de saldo de abertura, tratamento de atrasados e horizonte devem ser aprovados pelo financeiro antes de chamar isso de previsão de caixa integral.

**Implantação:** exclusivamente gadget de homologação **465** com ZIP JSP v0.9.0 e entryPoint `principal.jsp`. Não modificar gadget original 380 ou dashboard 226. 

**Proteção adicional de v0.9.0:** quando o conector devolve menos dias do que o intervalo solicitado, a interface refaz a leitura em lotes de até 90 dias e recompõe os acumulados na ordem. Teste de regressão em ambiente simulado aprovado pelo [GitHub Actions](https://github.com/willdarkmode/dm-telas/actions/runs/39425742778). Ainda é necessário validar performance e fechamento financeiro em 365 dias no gadget 465.

## Evidência visual v0.9.0 — período personalizado de 100 dias (20/10/2026)

Captura de homologação do gadget **465** apresentada pelo responsável: a seção **Planejamento financeiro por intervalo** carregou sem erro visível com datas de **20/10/2026 a 27/01/2027** (100 dias), agrupamento semanal, quatro indicadores financeiros e gráfico acumulado. O saldo projetado mostrado é aritmeticamente consistente com as parcelas "a receber" e "a pagar" apresentadas.

**Limites desta evidência:** embora os campos aceitem datas personalizadas, a captura ainda **não** demonstra consulta de 365 ou 730 dias; tampouco comprova a paginação, a grade de componentes, a reconsulta em lotes ou a abertura de NUFIN dentro do novo módulo. Teste seguinte: selecionar **365 dias**, clicar **Consultar período**, verificar valores e períodos; depois selecionar um período na tabela e testar um NUFIN de título conhecido. Não publicar saldos ou dados financeiros da captura no repositório público.


## Evidência visual v0.9.0 — horizonte de 365 dias (20/10/2026)

Captura do gadget de homologação **465** mostra o novo módulo **Planejamento financeiro por intervalo** em execução para **20/10/2026 a 19/10/2027**, totalizando **365 dias inclusivos**, com agrupamento **semanal (7 dias)**. Os quatro cards retornaram valores, e o gráfico acumulado com três séries carregou sem mensagens de erro ou truncamento visíveis. Foi conferido que o saldo final exibido equivale aritmeticamente à soma algébrica de A receber e A pagar.

**Status:** prova visual de funcionamento da consulta e gráfico para 365 dias, que atende ao requisito de horizonte superior a 100 dias solicitado pelo time financeiro. A imagem não comprova, por si só, paridade de todas as regras com a consulta antiga, nem detalhamento funcional dentro da nova projeção. **Próximo teste:** rolar até **Composição por período**, clicar em uma semana, conferir abas A receber/A pagar e abrir um NUFIN de título conhecido. Testes para datas livres não predefinidas e 730 dias permanecem adicionais.

**Importante:** a projeção parte de zero na data inicial, não inclui saldos bancários de abertura, vencidos anteriores nem previsões de movimentos não cadastrados. Não publicar números monetários, nomes ou títulos extraídos das capturas no repositório público. Nenhuma mudança de gadget foi realizada por esta documentação.

## Evidência visual v0.9.0 — composição semanal e títulos (20/10/2026)

O responsável enviou capturas do gadget de homologação **465**, mostrando a grade **Composição por período** preenchida por semanas e, após selecionar a primeira semana, a grade **Títulos** com as categorias A receber, A pagar, Recebido e Pago. A tabela de títulos mostra NUFIN acionável, número da nota, parceiro, empresa, vencimento, baixa e valor. Foi visualizada a paginação de 50 títulos por consulta. Não foram apresentados erros nessas telas.

**Esclarecimento confirmado pelo responsável:** após testar a projeção de **365 dias** (gráfico e indicadores), ele **mudou o intervalo para 100 dias** antes das capturas de composição e detalhamento. As **15 semanas** mostradas na tabela são coerentes com os 100 dias; **não existe evidência de truncamento** nessa captura. Mantêm-se como testes adicionais a composição semanal ao longo de 365 dias e o clique no NUFIN do módulo personalizado; a abertura pelo NUFIN nas abas Pendentes já foi validada.

Não publicar os nomes, NUFINs ou valores financeiros presentes nas imagens no repositório público. O gadget 380 e o dashboard 226 continuam preservados.


## v0.9.1 — Uma projeção, sem duplicidade (20/10/2026)

Após retorno de usabilidade do responsável, a tela Principal foi simplificada para **apresentar somente uma projeção aberta**, a de período personalizado (datas livres até 730 dias, agrupamento dia/semana/mês, gráficos, tabelas e NUFIN). Os quatro indicadores financeiros executivos e os blocos de posição bancária, faturamento e estoque permanecem inalterados.

**O gráfico fixo 100 dias deixou de aparecer e de ser consultado automaticamente.** As consultas originais `cht_1JA` e `grd_1BP` ficam preservadas no JSP, sem qualquer mudança de fórmula, acessíveis apenas pela seção recolhida **Comparar com o gadget 380 · referência antiga de 100 dias** e pelo botão **Carregar comparação original**. São executadas somente após interação explícita do usuário.

O código mantém a ponte `executeQuery` e as demais sete seções. O JSP v0.9.1 distribuído como ZIP único é a reprodução byte a byte da v0.9.0, trocando **apenas o identificador de cache** `0.9.0` por `0.9.1`; a igualdade das **22 consultas originais**, da consulta legada `grd_1BP` e das duas consultas de período livre foi verificada durante a geração do pacote.

Regressões automatizadas: sem consulta automática de 100 dias na Principal; referência antiga consultada sob demanda; período livre, paginação e NUFIN mantidos. [Workflow completo validado](https://github.com/willdarkmode/dm-telas/actions/runs/39433211186).

**Implantação:** instalar somente no gadget de homologação **465**, preservando backup da v0.9.0. Não alterar o gadget nativo 380 ou dashboard 226. Homologação visual desta organização ainda depende de captura do usuário, especialmente verificar que o gráfico legado não aparece sem expandir a comparação.

## Correção de carregamento da v0.9.1 — pacote de recuperação (20/10/2026)

Após importar a v0.9.1 no gadget de homologação **465**, o responsável capturou a mensagem "Não foi possível carregar a interface do GitHub Pages. Confira a publicação de js/app.js." A imagem também estava sem os estilos CSS, indicando possível dificuldade para buscar os recursos estáticos. O workflow da v0.9.1 estava publicado com sucesso, e os caminhos externos no JSP foram conferidos; **não é possível afirmar se a causa foi rede, cache, bloqueio de domínio ou falha transitória sem diagnóstico no navegador**.

Foi produzido um **ZIP de recuperação do v0.9.1** (distribuído somente no chat, sem publicar o JSP nem as SQLs no repositório). O novo carregador tenta primeiro os sete arquivos CSS e sete JS pelo Pages e, em caso de erro ou timeout, tenta os mesmos arquivos no espelho público jsDelivr. Os seis módulos JS independentes são carregados antes de `app.js`, e falhas persistentes geram aviso com arquivo e botão de repetição. **As 22 SQLs originais, a grade legada e as duas SQLs de período livre são byte a byte idênticas** às da versão entregue; a ponte `executeQuery` não mudou.

Testes locais em ambiente de navegador simulado: (1) carregamento normal; (2) Pages indisponível e CDN respondendo; (3) ambos indisponíveis, exibindo informação de falha. Esses testes não substituem a homologação no gadget 465. Se ambos os domínios estiverem bloqueados na rede corporativa, hospedar os recursos estáticos no próprio ambiente Sankhya.

## Confirmação de recuperação e simplificação — v0.9.1 (20/10/2026)

O responsável confirmou que o **ZIP v0.9.1 de recuperação** carregou corretamente a interface no gadget de homologação **465**, após a falha anterior ao buscar os recursos estáticos, e avaliou a Principal com **uma única projeção aberta** como significativamente mais limpa e fácil de usar. O comparativo original de 100 dias permanece recolhido e sob demanda.

A hipótese de instabilidade no GitHub Pages é plausível, **mas não foi tecnicamente comprovada**; o novo carregador conta com endereço alternativo e mensagem de diagnóstico. Preservar essa versão como referência operacional provisória. A conciliação financeira completa e a definição de política de saldo inicial/vencidos permanecem pendentes. O gadget original 380 e dashboard 226 não foram alterados.

O registro não contém valores, nomes de parceiros ou títulos financeiros.

## v0.9.2 — Pré-lançamento P&R Automação Industrial (21/10/2026)

Preparação da tela para testes assistidos com o time financeiro. Alterações **exclusivamente de marca, aparência e textos**: logotipo corporativo indicado pela P&R, nome lateral `P&R Automação Industrial`, subtítulo e título `Fluxo de Caixa - Diretoria`, rodapé corporativo e revisão de rótulos/avisos repetitivos. O banner continua informando que a **conciliação financeira final está em validação**.

**Logotipo:** no deploy do Pages, o arquivo oficial `https://recursos.perautomacao.com.br/i/catus/logo_R.svg` foi obtido e validado como SVG, depois espelhado em `fluxo-caixa-diretoria/assets/logo-pr.svg` (conforme log do workflow). A interface tenta primeiro o espelho do Pages, depois o URL original e, se ambos falharem, exibe `P&R` em texto; a marca não é pré-requisito para carregar consultas. O asset é publicado pelo workflow, não contém código SQL.

**JSP:** ZIP v0.9.2 derivado do **pacote de recuperação v0.9.1** (o que o usuário confirmou funcionar), com atualização somente de título/texto de carregamento e versão do cache `?v=0.9.2-pr1`. As 22 definições SQL iniciais, a consulta da grade legada `grd_1BP` e as duas consultas de período livre foram preservadas **literalmente**. Continua a recuperação de scripts e CSS via `GitHub Pages → jsDelivr`, testada anteriormente.

**Validação:** [workflow completo de publicação e regressões](https://github.com/willdarkmode/dm-telas/actions/runs/39646626005) aprovado. A identidade P&R será considerada validada visualmente somente após importação e captura do gadget 465. **Não modificar gadgets 380/226**. A abertura para usuários finais é uma liberação assistida; saldos, datas fixas legadas e regras de previsão financeira ainda requerem aprovação do financeiro antes de usar os resultados para decisão gerencial.


## Investigação: tela independente sem painel lateral do BI — Projeto de Produção (21/10/2026)

O usuário indicou a tela nativa personalizada **Projeto de Produção** como exemplo de uma tela que, segundo sua experiência, não exibe o painel de filtros que surge ao aproximar o mouse no gadget 465.

Leitura em `TDDINS` confirmou cadastro da tela **AD_PROJPROD**, instância `9999990049`, descrição **Projeto de Produção**, recurso `br.com.sankhya.menu.adicional.AD_PROJPROD`, `ADICIONAL=S`, `ATIVO=S`, categoria ETO, descrição versão 2.0. Também há duas instâncias antigas com mesma identificação lógica mas descritas como "arquivado" (IDs 9999990068, 9999990069), apesar de seu flag ATIVO; não modificá-las nem reutilizar identificadores. Trata-se de **tela adicional/formulário**, diferente do gadget de BI `465` com `html5component entryPoint="principal.jsp"`.

A documentação Sankhya diferencia:
- **Construtor de Telas**: instância adicional e lançador no menu.
- **Add-on Studio**: tela personalizada `.xhtml5` registrada por `<ui>` no dicionário de menus.
- **BI**: visualizador de gadgets, que exibe barra nativa de controle.

**Hipótese:** a ausência do painel decorre da abertura como lançador de tela de cadastro e não no visualizador BI. Não foi confirmado por captura da tela Projeto de Produção nem pela inspeção da configuração do menu. **Não é seguro afirmar que a UI atual possa ser reutilizada diretamente**: a ponte `snk:load` + `executeQuery` foi validada apenas no contexto do componente BI; em tela independente deve ser substituída/validada com APIs suportadas e autenticação do ambiente.

**Prova de conceito futura (ambiente isolado):** criar novo menu/tela sem reutilizar resource ID do Projeto de Produção ou substituir 465; testar consulta mínima read-only, filtros empresa, projeção por data e `openApp({NUFIN})`; depois avaliar performance/permissões e somente então migrar. Preservar gadgets 380 e 465, e dashboard 226.


## Confirmação visual — Projeto de Produção sem painel lateral do BI (21/10/2026)

O responsável forneceu captura de **Projeto de Produção** aberto em aba própria do Sankhya. A imagem mostra barra de ferramentas e grade nativas; no rodapé aparece a mensagem **"Você está em uma tela personalizada."** Não aparece a barra lateral flutuante **"Esconder ao atualizar"** do visualizador de gadgets de BI.

**Confirmado:** a tela Projeto de Produção é apresentada no invólucro de tela personalizada, sem o painel do BI na captura. Em leitura anterior, os metadados de `TDDINS` identificaram a instância adicional `AD_PROJPROD` com o recurso `br.com.sankhya.menu.adicional.AD_PROJPROD` e descrição "versão 2.0".

**Não confirmado:** que uma tela HTML5 standalone do Add-on Studio terá comportamento idêntico, ou que o `executeQuery` disponibilizado pelo `html5component` do gadget 465 funcionará fora do contexto do BI.

**Plano seguro:** manter gadget 465 (v0.9.2) e gadgets originais intactos. Desenvolver prova de conceito *separada*, com entrada única no menu e tela HTML5 minimalista; testar ausência do painel, autenticação/permissões, uma consulta SQL em modo leitura por API suportada e abertura de NUFIN com `openApp`. Migrar dashboard completo apenas após esse teste. Nunca reutilizar o ID/recurso do Projeto de Produção.

Referências de integração: documentação Sankhya de [Telas Personalizadas (UI)](https://developer.sankhya.com.br/docs/07_telas) e [Menus Personalizados](https://developer.sankhya.com.br/docs/06_menu).


## Roteiro v1.0 — liberação assistida ao financeiro (21/10/2026)

Decisão de escopo: **não tentar ocultar por manipulação de DOM a barra lateral nativa do visualizador de gadgets** (botões “Esconder ao atualizar” / “Atualizar”). Não foi identificada configuração documentada e segura que impeça a reabertura por aproximação do mouse. Essa melhoria é adiada para não comprometer a v0.9.2, já funcional.

**Checklist prioritário antes de ampliar o acesso:**

1. **Segurança e perfis:** validar quem pode acessar cada seção, especialmente **Salários CC**, cuja consulta original de detalhamento não restringe `CODEMP`. Manter essa seção restrita até aprovação de controle efetivo de acesso; ocultar botão no navegador não é proteção de dados.
2. **Conciliação financeira:** comparar indicadores executivos e regras de TOP/natureza, com empresas e datas iguais; documentar diferenças sem alterar fórmulas silenciosamente.
3. **Fluxo personalizado:** testar datas livres de 100/365 dias, carregamento por lotes, troca de agrupamento, detalhamento e abertura do título exato por NUFIN em perfil autorizado.
4. **Estabilidade:** verificar carregamento via Pages e fallback, comportamento de erros, desempenho e reversão rápida ao ZIP v0.9.1/v0.9.2 de referência.
5. **Piloto:** liberar a um pequeno grupo autorizado do financeiro, coletar feedback e erros antes de apresentar como produção definitiva. Mostrar claramente que a projeção parte de zero e exclui saldo bancário inicial e títulos vencidos anteriores.

**Ambiente:** todas as alterações e testes continuam no gadget 465; não modificar o gadget 380, dashboard 226 ou a tela Projeto de Produção. O roadmap posterior inclui saldo inicial e disponibilidade de caixa, filtros inteligentes, cenários e relatórios.
