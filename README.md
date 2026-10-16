# dm-telas

Repositório central para telas HTML5 personalizadas do ERP Sankhya, desenvolvido pelo GoldenGear.

## Projetos

- [Fluxo de Caixa — Diretoria](fluxo-caixa-diretoria/README.md) — migração do gadget XML 380 para HTML5 no gadget de testes 465.

## Convenções

- Cada tela mora em uma pasta própria, com `css/`, `js/`, documentação e versão de entrada JSP.
- O gadget 380 e o dashboard oficial 226 **não são alterados** durante a homologação do fluxo de caixa.
- O JSP hospedado no Sankhya fica mínimo; CSS e JS públicos podem ser versionados aqui e entregues pelo GitHub Pages.
- Atualizações somente de CSS/JS não exigem novo ZIP JSP, desde que URLs e ponto de entrada permaneçam os mesmos.
- A publicação neste repositório **público** não deve incluir credenciais, dados financeiros reais, informações pessoais, configurações internas ou SQL proprietário sem revisão/autorização específica.
- Mudanças financeiras devem ser confrontadas com os resultados oficiais no gadget 380 e validadas com o financeiro.

## GitHub Pages

Com a publicação habilitada em Settings → Pages, o caminho da primeira tela será:
`https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/`.

> A existência dos arquivos no GitHub não habilita GitHub Pages automaticamente. Verifique a publicação e o carregamento dos recursos antes de importar um JSP que dependa deles.
