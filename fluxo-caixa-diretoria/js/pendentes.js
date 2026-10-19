/* GoldenGear — Receitas/Despesas Pendentes, HTML5 v0.5.0.
   A interface publica NAO guarda SQL financeiro. As quatro consultas do
   gadget 380 sao entregues exclusivamente no principal.jsp do Sankhya. */
(function () {
 "use strict";
 const defs={
  "20O":{title:"Receitas Pendentes",kind:"Recebimento",sum:"grd_0LY",details:"grd_0LW"},
  "06B":{title:"Despesas Pendentes",kind:"Pagamento",sum:"grd_06J",details:"grd_06I"}
 };
 const contexts={};
 const store={};
 const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const cash=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"—";};
 const count=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString("pt-BR"):"—";};
 const rawSQL=id=>{
  const sql=window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[id];
  if(typeof sql!=="string"||!sql.trim())throw Error("A consulta "+id+" não está no JSP. Importe o pacote v0.5.0.");
  return sql;
 };
 const numCompanies=(ctx)=>{
  const ids=(ctx.selected||[]).filter(n=>Number.isSafeInteger(n)&&n>0&&ctx.companies.some(c=>Number(c.CODEMP)===n));
  if(!ids.length)throw Error("Selecione pelo menos uma empresa.");
  return "("+ids.join(",")+")";
 };
 function prepare(id,ctx,period){
  let sql=rawSQL(id).replace(/:CODEMP\b/g,numCompanies(ctx));
  if(sql.includes(":MES")){
    if(!period)throw Error("Escolha um período antes de abrir títulos.");
    const valid=store[ctx.page]&&store[ctx.page].summary.some(r=>String(r.MES)===period);
    if(!valid)throw Error("Período inválido ou não carregado da consulta.");
    sql=sql.replace(/:MES\b/g,"'"+period.replace(/'/g,"''")+"'");
  }
  return sql.replace(/;\s*$/,"").trim();
 }
 function paginate(sql,page,size){
  const from=(page-1)*size;
  return sql+" OFFSET "+from+" ROWS FETCH NEXT "+size+" ROWS ONLY";
 }
 function isShown(page){
  const app=window.GGFluxoCaixa;
  return !app||typeof app.getCurrentPage!=="function"||app.getCurrentPage()===page;
 }
 function s(page){return store[page]||(store[page]={summary:[],details:[],period:"",pageNum:1,loading:false,detailLoading:false,error:"",detailError:"",hasMore:false,token:0,detailToken:0,group:""});}
 function paint(page){
  const ctx=contexts[page],def=defs[page],st=s(page);if(!ctx||!isShown(page))return;
  const host=ctx.container; if(!host)return;
  const options=ctx.companies.map(c=>'<label class="gg-check"><input type="checkbox" data-pend-company value="'+Number(c.CODEMP)+'"'+(ctx.selected.includes(Number(c.CODEMP))?" checked":"")+'><span>'+esc(c.NOMEFANTASIA)+' <small>('+Number(c.CODEMP)+')</small></span></label>').join("");
  const periods=st.summary.map((r,i)=>'<tr class="'+(st.period===String(r.MES)?"ggp-selected":"")+'"><td><button type="button" class="ggp-period" data-period="'+i+'">'+esc(r.MES)+'</button></td><td>'+cash(r.ARECEBER)+'</td><td>'+cash(r.VENCIDO)+'</td><td>'+cash(r.AVENCER)+'</td></tr>').join("");
  const titles=st.details.map(r=>'<tr><td>'+esc(r.NUFIN)+'</td><td>'+esc(r.NUMNOTA)+'</td><td>'+esc(r.NOMEPARC)+'</td><td>'+esc(r.DTVENC)+'</td><td>'+cash(r.VALOR)+'</td><td>'+esc(r.STATUS)+'</td></tr>').join("");
  host.innerHTML=
   '<section class="gg-panel ggp-hero"><div><div class="gg-kicker">FINANCEIRO • '+esc(def.kind.toUpperCase())+'</div><h2>'+esc(def.title)+'</h2>'+
   '<p>Consulta original do gadget 380. Selecione um período à esquerda para detalhar seus títulos.</p></div>'+
   '<button type="button" class="gg-button" data-pend-refresh'+(st.loading?' disabled':'')+'>Atualizar</button></section>'+
   '<section class="gg-panel ggp-filter"><div class="gg-kicker">EMPRESAS DO FILTRO</div><div class="ggp-companies">'+options+
   '</div><button class="gg-button" type="button" data-pend-apply>Aplicar filtro</button></section>'+
   '<div class="ggp-split"><section class="gg-panel ggp-periods"><h3>Resumo por período</h3>'+
   '<p class="ggp-helper">Os períodos anuais e mensais podem se sobrepor. Não some as linhas para obter um total geral.</p>'+
   (st.error?'<p class="ggp-error">'+esc(st.error)+'</p>':st.loading?'<p>Consultando períodos…</p>':
   '<div class="ggp-scroll"><table class="ggp-table"><thead><tr><th>Período</th><th>'+ (page==="20O"?"A receber":"A pagar")+'</th><th>Vencido</th><th>A vencer</th></tr></thead><tbody>'+periods+'</tbody></table></div>')+
   '</section><section class="gg-panel ggp-titles"><h3>Títulos '+(st.period?'— '+esc(st.period):'por período')+'</h3>'+
   '<p class="ggp-helper">Paginação no Oracle: 50 títulos por página. NUFIN é o identificador nativo; abertura da Movimentação Financeira ainda pendente de integração.</p>'+
   (st.detailError?'<p class="ggp-error">'+esc(st.detailError)+'</p>':st.detailLoading?'<p>Carregando títulos…</p>':
   st.period?'<div class="ggp-scroll"><table class="ggp-table"><thead><tr><th>NUFIN</th><th>Nota</th><th>Parceiro</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>'+
   (titles||'<tr><td colspan="6">Nenhum título neste período.</td></tr>')+'</tbody></table></div>':
   '<p class="ggp-empty">Escolha um período no resumo para visualizar os títulos financeiros.</p>')+
   (st.period?'<div class="ggp-pager"><button data-pend-prev type="button"'+(st.pageNum<=1||st.detailLoading?' disabled':'')+'>Anterior</button><span>Página '+st.pageNum+'</span><button data-pend-next type="button"'+(!st.hasMore||st.detailLoading?' disabled':'')+'>Próxima</button></div>':'')+
   '</section></div>'+
   '<p class="ggp-foot">Etapa de homologação · Consultas de leitura • Recorte fixo de 2021 a 2026 conforme XML original.</p>';
 }
 async function load(page,force){
  const ctx=contexts[page],st=s(page);if(!ctx||st.loading)return;
  const key=(ctx.selected||[]).join(",");
  if(!force&&st.group===key&&st.summary.length){paint(page);return;}
  const token=++st.token;st.detailToken++;st.group=key;st.summary=[];st.details=[];st.period="";st.error="";st.detailError="";st.pageNum=1;st.hasMore=false;st.loading=true;paint(page);
  try{
   const rows=await ctx.execute(prepare(defs[page].sum,ctx));
   if(st.token!==token)return;
   st.summary=Array.isArray(rows)?rows:[];
  }catch(e){if(st.token===token)st.error=String(e&&e.message||e);}
  finally{if(st.token===token){st.loading=false;paint(page);}}
 }
 async function loadDetails(page,targetPage){
  const ctx=contexts[page],st=s(page);if(!ctx||!st.period)return;
  const period=st.period,token=++st.detailToken;
  st.detailLoading=true;st.detailError="";paint(page);
  try{
    const sql=paginate(prepare(defs[page].details,ctx,period),targetPage,50);
    const rows=await ctx.execute(sql);
    if(st.detailToken!==token||st.period!==period)return;
    st.details=Array.isArray(rows)?rows:[];st.pageNum=targetPage;st.hasMore=st.details.length===50;
  }catch(e){if(st.detailToken===token&&st.period===period)st.detailError=String(e&&e.message||e);}
  finally{if(st.detailToken===token){st.detailLoading=false;paint(page);}}
}
function handle(page,ev){
  const ctx=contexts[page],st=s(page);if(!ctx)return;
  if(ev.target.closest("[data-pend-refresh]")){load(page,true);return;}
  if(ev.target.closest("[data-pend-apply]")){
    const vals=[...ctx.container.querySelectorAll("[data-pend-company]:checked")].map(x=>Number(x.value)).filter(Number.isSafeInteger);
    if(!vals.length){st.error="Selecione pelo menos uma empresa.";paint(page);return;}
    ctx.selected=vals;ctx.setSelected(vals);load(page,true);return;
  }
  const periodBtn=ev.target.closest("[data-period]");
  if(periodBtn){
    const row=st.summary[Number(periodBtn.dataset.period)];if(!row)return;
    st.period=String(row.MES);st.details=[];st.pageNum=1;st.hasMore=false;loadDetails(page,1);return;
  }
  if(ev.target.closest("[data-pend-prev]"))loadDetails(page,st.pageNum-1);
  if(ev.target.closest("[data-pend-next]"))loadDetails(page,st.pageNum+1);
 }
 window.GGPendentes={
   version:"0.5.0",
   render(page,args){
     if(!defs[page])return;
     contexts[page]=Object.assign({},args,{page});
     const host=args.container;if(!host.dataset.ggPendingHandler){
       host.addEventListener("click",ev=>{const current=window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage();if(defs[current])handle(current,ev);});
       host.dataset.ggPendingHandler="1";
     }
     paint(page);
     if(args.companies.length)load(page,false);
   },
   refresh(page){if(defs[page])load(page,true);}
 };
})();