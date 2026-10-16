# dm-telas

Repositório **público** para telas HTML5 personalizadas do ERP Sankhya (GoldenGear). O GitHub Pages também será **público**.

## Projetos

- [Fluxo de Caixa — Diretoria](fluxo-caixa-diretoria/README.md) — migração do gadget XML 380 para HTML5 no gadget de testes 465.

## Convenções

- Cada tela fica em pasta própria com `css/`, `js/`, documentação e ponto de entrada JSP.
- Gadget **380** e dashboard oficial **226** continuam preservados durante a homologação.
- JSP mínimo no Sankhya, CSS/JS separados e versionados; a publicação de cada arquivo depende de aprovação específica.
- Os resultados e critérios fiscais/financeiros devem ser comparados com a configuração existente.
- Não armazenar credenciais, tokens, senhas ou dados pessoais/financeiros reais, mesmo em repositório privado.

## GitHub Pages — repositório e site públicos

A publicação é realizada **somente** pela Action `.github/workflows/pages.yml`, com lista explícita dos arquivos permitidos. **Não configurar “Deploy from a branch” apontando para a raiz deste repositório**: a publicação por GitHub Actions envia somente os arquivos aprovados. Todos os arquivos commitados no repositório público já são visíveis pelo GitHub, mesmo que não sejam incluídos no Pages.

Configuração manual necessária em [Settings → Pages](https://github.com/willdarkmode/dm-telas/settings/pages):
1. Usar o GitHub Pages gratuito com este repositório público.
2. Selecionar **Source → GitHub Actions** (não *Deploy from a branch*).
3. Conferir em **Actions** o workflow “Publicar apenas arquivos aprovados no GitHub Pages”.
4. Depois da publicação, verificar o endereço `https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/`.

Observação: **tanto o repositório quanto o Pages são públicos**. Qualquer arquivo comitado poderá ser lido no GitHub, e qualquer arquivo copiado para o Pages poderá ser lido no site. A Action inicial publica apenas uma página de referência e CSS sem lógica financeira.

A publicação e a execução ainda precisam ser validadas no GitHub/Sankhya; a presença do workflow no repositório não significa implantação concluída.
