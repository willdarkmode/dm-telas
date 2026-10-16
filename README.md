# dm-telas

Repositório **privado** para telas HTML5 personalizadas do ERP Sankhya (GoldenGear). O GitHub Pages de recursos estáticos será **público**.

## Projetos

- [Fluxo de Caixa — Diretoria](fluxo-caixa-diretoria/README.md) — migração do gadget XML 380 para HTML5 no gadget de testes 465.

## Convenções

- Cada tela fica em pasta própria com `css/`, `js/`, documentação e ponto de entrada JSP.
- Gadget **380** e dashboard oficial **226** continuam preservados durante a homologação.
- JSP mínimo no Sankhya, CSS/JS separados e versionados; a publicação de cada arquivo depende de aprovação específica.
- Os resultados e critérios fiscais/financeiros devem ser comparados com a configuração existente.
- Não armazenar credenciais, tokens, senhas ou dados pessoais/financeiros reais, mesmo em repositório privado.

## GitHub Pages — privado na origem, público no destino

A publicação é realizada **somente** pela Action `.github/workflows/pages.yml`, com lista explícita dos arquivos permitidos. **Nunca configure “Deploy from a branch” apontando para a raiz deste repositório**, porque isso pode publicar arquivos internos, inclusive SQLs e JSPs de desenvolvimento.

Configuração manual necessária em [Settings → Pages](https://github.com/willdarkmode/dm-telas/settings/pages):
1. Confirmar que o plano permite GitHub Pages em repositório privado (GitHub Pro/Team/Enterprise).
2. Selecionar **Source → GitHub Actions** (não *Deploy from a branch*).
3. Conferir em **Actions** o workflow “Publicar apenas arquivos aprovados no GitHub Pages”.
4. Depois da publicação, verificar o endereço `https://willdarkmode.github.io/dm-telas/fluxo-caixa-diretoria/`.

Observação: **o Pages é público**. Todos os arquivos copiados para o artefato podem ser lidos por qualquer pessoa, incluindo JS com SQL, mesmo que o repositório-fonte seja privado. A Action inicial publica apenas uma página de referência e CSS sem lógica financeira.

A publicação e a execução ainda precisam ser validadas no GitHub/Sankhya; a presença do workflow no repositório não significa implantação concluída.
