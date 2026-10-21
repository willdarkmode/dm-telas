# Preparação para piloto v1.0 — Fluxo de Caixa - Diretoria

**Estado:** candidato a homologação, não liberado para uso irrestrito.
**Referência estável:** gadget 465, JSP v0.9.2, identidade P&R Automação Industrial.
**Preservar:** gadget original 380, dashboard 226, configurações de Projeto de Produção.

## 1. Bloqueadores de liberação

- [ ] **Acesso autorizado:** associar o dashboard de testes a um lançador no **Construtor de Dashboard** e habilitar o acesso, na tela **Acessos**, somente aos usuários/grupos da P&R explicitamente aprovados. A permissão deve ser verificada com login de um usuário autorizado e outro não autorizado.
- [ ] **Salários CC:** a SQL original do detalhe (`grd_2OZ`) não continha `FIN.CODEMP IN :CODEMP` na cláusula WHERE, embora tivesse referências a CODEMP em cálculos. Foi gerado um **JSP RC1 privado** para homologação que acrescenta o filtro ao detalhe, preservando as outras 21 SQLs originais, as 2 SQLs de período livre e a interface.
- [ ] **Confidencialidade salarial:** o filtro CODEMP é um ajuste de escopo de consulta, **não é um controle de permissão**. Um usuário com acesso ao gadget não deve ser considerado autorizado a dados salariais apenas por isso. Para piloto geral sem RH/folha autorizados, usar versão/painel separado **sem distribuir a consulta salarial ao navegador**, ou limitar o lançador inteiro aos usuários já autorizados a ela.
- [ ] **Validação do RH/Financeiro:** aprovar a diferença em relação à SQL antiga antes de substituir a v0.9.2 em qualquer ambiente de uso. Não assumir que mostrar/ocultar menu no front-end equivale a segurança.

## 2. Roteiro do lançador (sem alterar o gadget 465)

1. Abrir **Construtor de Dashboard**.
2. Criar novo registro com nome apropriado para o piloto.
3. Na guia **Galeria**, associar o dashboard correto da P&R; salvar.
4. Em **Outras Opções → Adicionar Lançador**, atribuir nome e pasta de destino.
5. Abrir **Configurações → Controle de Acesso → Acessos** e liberar o lançador exclusivamente aos usuários ou grupo de teste autorizados.
6. Testar **negação do acesso** com usuário fora do grupo. Não permitir acesso por um segundo lançador já existente sem avaliação.

Referência oficial Sankhya: https://ajuda.sankhya.com.br/hc/pt-br/articles/31005922889367-Libera%C3%A7%C3%A3o-de-Acessos-a-um-Dashboard-Constru%C3%ADdo-no-Construtor-de-Componentes-BI

## 3. Testes funcionais e de cálculo

- [ ] Empresas 1, 2 e 3: filtros, cards e regras de TOP/natureza verificadas com as mesmas datas.
- [ ] Salários CC: testar uma empresa por vez e todas combinadas; confrontar a regra do ranking com a do detalhamento.
- [ ] Principal: somente uma projeção visível; antiga de 100 dias acessível sob demanda.
- [ ] Intervalos personalizados: 100 e 365 dias, semana/mês/dia; confirmar total de períodos e saldo aritmético.
- [ ] Detalhamento por período: páginas de 50 títulos e categorias a receber/a pagar/recebido/pago.
- [ ] Abertura pelo NUFIN: título certo na tela nativa, com usuário autorizado.
- [ ] Renderização e logo P&R: Pages funcionando e alternativa jsDelivr caso o domínio esteja indisponível.
- [ ] Testar ausência de acesso fora do grupo piloto; confirmar que informações de Salários CC não são exibidas a perfis não autorizados.

## 4. Critérios de aceite e rollback

**Aprovado para piloto restrito** somente após autorização do responsável por dados salariais, testes com perfis reais e validação das regras financeiras. A previsão personalizada **não inclui saldo bancário de abertura nem vencidos anteriores**, informação a manter explícita.

**Rollback:** preservar o ZIP JSP da v0.9.2 antes de qualquer importação no 465. Em caso de erro, restaurá-lo. Não alterar gadget 380/dashboard 226.

O GitHub Pages hospeda apenas CSS/JS públicos. **Não publicar JSP, consultas financeiras, dados salariais, saldos ou NUFINs** neste repositório.
