/* GoldenGear — Complementos da Principal v0.4.0.
 * Renderização pública: as consultas financeiras permanecem no JSP do Sankhya.
 * Preserva diferenças do gadget 380: contas e faturamento NÃO têm filtro CODEMP;
 * estoque TEM filtro CODEMP; investimentos eram exibidos sem valores apurados. */
(function(){
  "use strict";
  const defs=[
    {id:"svl_22D",title:"Saldos das contas",context:"Última referência bancária • global"},
    {id:"svl_8UZ",title:"Faturamento anual",context:"05/01/2025 a 04/01/2026 • global"},
    {id:"svl_8QN",title:"Meta anual",context:"Indicador original • meta de R$ 45 milhões"},
    {id:"svl_11E",title:"Valor do estoque",context:"Custo conforme regra do XML • empresas selecionadas"}
  ];
  const bankFields=[
    ["PERITAU","PeR Itaú"],["PERBB","PeR BB"],
    ["RGAITAU","RGA Itaú"],["RGABB","RGA BB"],
    ["CXESP","Caixa espécie"],["CXCHEQ","Caixa cheques"]
  ];
  const state={context:null,rows:{},errors:{},busy:false,serial:0,selectedKey:""};
  const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const field=(r,k)=>{if(!r)return null;const name=Object.keys(r).find(x=>x.toUpperCase()===k.toUpperCase());if(!name)return null;const v=Number(r[name]);return Number.isFinite(v)?v:null;};
  const money=v=>v==null?"—":v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const number=v=>v==null?"—":v.toLocaleString("pt-BR",{maximumFractionDigits:0});
  const item=id=>Array.isArray(state.rows[id])?state.rows[id][0]:null;
  const status=id=>state.errors[id]?'<p class="gge-error">'+esc(state.errors[id])+'</p>':state.busy&&!Object.hasOwn(state.rows,id)?'<p class="gge-muted">Consultando Sankhya…</p>':'';
  function selection(){
    const ctx=state.context;
    if(!ctx)throw Error("Filtro de empresas indisponível.");
    const selected=(ctx.selected||[]).filter(n=>Number.isSafeInteger(n)&&n>0&&ctx.companies.some(c=>Number(c.CODEMP)===n));
    if(!selected.length)throw Error("Selecione pelo menos uma empresa.");
    return "("+selected.join(",")+")";
  }
  function prepared(id){
    const orig=window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[id];
    if(typeof orig!=="string"||!orig.trim())throw Error("SQL "+id+" não incluído no JSP desta versão.");
    if(orig.includes(":CODEMP"))return orig.replace(/:CODEMP\b/g,selection());
    return orig;
  }
  function bank(){
    const r=item("svl_22D"),total=field(r,"SOMA_TOTAL");
    return '<article class="gg-panel gge-bank"><div class="gg-kicker">POSIÇÃO DAS CONTAS • GLOBAL</div>'+
     '<div class="gge-card-head"><h3>Disponibilidades bancárias</h3><span class="gge-context">Última referência por conta</span></div>'+
     '<strong class="gge-big">'+money(total)+'</strong>'+
     '<p class="gge-muted">Total original: quatro contas bancárias. Espécie e cheques aparecem abaixo, mas não entram nesta soma.</p>'+
     '<div class="gge-bank-list">'+bankFields.map(([fieldName,label])=>'<div><span>'+label+'</span><strong>'+money(field(r,fieldName))+'</strong></div>').join("")+'</div>'+
     '<div class="gge-warning">Este bloco não acompanha o filtro de empresas no XML original.</div>'+status("svl_22D")+'</article>';
  }
  function business(){
    const row=item("svl_8UZ"),goal=item("svl_8QN");
    const pct=field(goal,"PORCENTAGEM");
    return '<article class="gg-panel gge-commercial"><div class="gg-kicker">EXERCÍCIO COMERCIAL 2025/2026 • GLOBAL</div>'+
      '<h3>Faturamento e meta anual</h3><strong class="gge-big">'+money(field(row,"VALOR"))+'</strong>'+
      '<div class="gge-kpis"><span>Notas de venda <b>'+number(field(row,"QTD"))+'</b></span>'+
      '<span>Indicador de meta original <b>'+(pct==null?"—":pct.toLocaleString("pt-BR",{maximumFractionDigits:1,minimumFractionDigits:1})+"%")+'</b></span></div>'+
      '<div class="gge-progress" role="progressbar" aria-label="Meta anual original" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.max(0,Math.min(100,pct||0))+'"><div style="width:'+Math.max(0,Math.min(100,pct||0))+'%"></div></div>'+
      '<p class="gge-muted">A meta utiliza consulta e regras de TOP próprias, distintas do cálculo de faturamento. Ambos conservam o período fixo original.</p>'+
      '<div class="gge-warning">Sem filtro CODEMP no XML de origem. Os valores são globais.</div>'+status("svl_8UZ")+status("svl_8QN")+'</article>';
  }
  function inventory(){
    const r=item("svl_11E");
    return '<article class="gg-panel gge-inventory"><div class="gg-kicker">ESTOQUE • EMPRESAS SELECIONADAS</div>'+
      '<h3>Valor do estoque</h3><strong class="gge-big">'+money(field(r,"TOTAL_CALCULADO"))+'</strong>'+
      '<p class="gge-muted">Apuração monetária de estoque usando os locais, custos e coeficientes do XML original. Não é saldo bancário.</p>'+status("svl_11E")+'</article>';
  }
  function investments(){
    return '<article class="gg-panel gge-investments"><div class="gg-kicker">INVESTIMENTOS</div><h3>Posição de investimentos</h3><strong class="gge-big">—</strong>'+
       '<p class="gge-muted">O quadro de investimentos do XML 380 apresenta traços, sem apuração de valores próprios. Aguardando regra oficial antes de exibir qualquer saldo.</p></article>';
  }
  function render(ctx){
    if(ctx)state.context=ctx;
    const parent=state.context&&state.context.container;
    if(!parent)return;
    if(window.GGFluxoCaixa && window.GGFluxoCaixa.getCurrentPage()!=="078")return;
    let host=parent.querySelector("#gge-principal");
    if(!host){host=document.createElement("section");host.id="gge-principal";parent.appendChild(host);}
    host.innerHTML='<div class="gge-section-head"><div class="gg-kicker">DEMAIS INDICADORES DO GADGET 380</div><h2>Posição financeira e comercial</h2>'+
      '<p>Indicadores adicionais da Principal com as regras de origem identificadas.</p></div>'+
      '<div class="gge-top-grid">'+bank()+business()+'</div>'+
      '<div class="gge-bottom-grid">'+inventory()+investments()+'</div>';
  }
  async function load(force){
    if(!state.context||state.busy)return;
    let key;
    try{key=selection();}catch(e){state.errors.filter=String(e.message||e);render();return;}
    if(!force&&key===state.selectedKey)return;
    state.selectedKey=key;state.errors={};state.rows={};state.busy=true;
    const serial=++state.serial;render();
    // Evita consultas pesadas simultâneas e mantém cada erro isolado.
    for(const id of defs.map(x=>x.id)){
      try {
        const rows=await state.context.execute(prepared(id));
        if(serial!==state.serial)return;
        state.rows[id]=Array.isArray(rows)?rows:[];
      }catch(e){if(serial===state.serial)state.errors[id]=String(e&&e.message||e);}
      render();
    }
    state.busy=false;render();
  }
  window.GGPrincipalExtras={version:"0.4.0",render,load};
})();
