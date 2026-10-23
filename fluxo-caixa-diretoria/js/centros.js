/* GoldenGear | Centros de Custo e Salarios CC | HTML5 v0.6.0
 * Apenas interface: cinco SQLs originais sao entregues no JSP do Sankhya.
 * Consultas executadas exclusivamente pela ponte executeQuery do app.js. */
(function(){
"use strict";
const RULES={
 "056":{name:"Centros de Custo",chart:"cht_0RO",nature:"cht_05K",detail:"grd_09D"},
 "0E8":{name:"Salários CC",chart:"cht_0IL",detail:"grd_2OZ"}
};
const MONTHS=[["JAN","Jan"],["FEV","Fev"],["MAR","Mar"],["ABR","Abr"],["MAI","Mai"],["JUN","Jun"],["JUL","Jul"],["AGO","Ago"],["SETE","Set"],["OUT","Out"],["NOV","Nov"],["DEZ","Dez"]];
const contexts={},states={};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=(r,k)=>{const f=r&&Object.keys(r).find(x=>x.toUpperCase()===k.toUpperCase());const n=Number(f?r[f]:0);return Number.isFinite(n)?n:0;};
const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const state=page=>states[page]||(states[page]={list:[],selected:-1,natures:[],partners:[],loading:false,detailLoading:false,error:"",detailError:"",baseKey:null,page:1,hasMore:false,baseToken:0,detailToken:0});
const visible=page=>window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage()===page;
const stringify=e=>String((e&&e.message)||e||"Erro desconhecido");
function selectedCompanies(ctx){
 const ids=(ctx.selected||[]).filter(n=>Number.isSafeInteger(n)&&n>0&&ctx.companies.some(c=>Number(c.CODEMP)===n));
 if(!ids.length)throw Error("Selecione pelo menos uma empresa.");
 return "("+ids.join(",")+")";
}
function prepared(page,id,cc){
 const sql=window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[id];
 if(typeof sql!=="string"||!sql.trim())throw Error("Consulta "+id+" não encontrada no JSP v0.6.0.");
 let q=window.GGExercicio.prepare(sql,id,contexts[page].year).replace(/:CODEMP\b/g,selectedCompanies(contexts[page]));
 if(/:DESCRCENCUS\b/.test(q)){
  if(typeof cc!=="string"||!cc)throw Error("Selecione um centro de custo válido.");
  if(!state(page).list.some(r=>String(r.DESCRCENCUS)===cc))throw Error("O centro escolhido não pertence ao ranking carregado.");
  q=q.replace(/:DESCRCENCUS\b/g,"'"+cc.replace(/'/g,"''")+"'");
 }
 return q.trim().replace(/;\s*$/,"");
}
function paginated(sql,page){
 return sql+" OFFSET "+((page-1)*50)+" ROWS FETCH NEXT 50 ROWS ONLY";
}
function filters(page){
 const ctx=contexts[page];
 return '<section class="gg-panel gcc-filter"><div><div class="gg-kicker">EMPRESAS PARA O RANKING</div>'+
 '<div class="gcc-company-list">'+ctx.companies.map(c=>'<label class="gg-check"><input data-gcc-company type="checkbox" value="'+Number(c.CODEMP)+'"'+(ctx.selected.includes(Number(c.CODEMP))?' checked':'')+'><span>'+esc(c.NOMEFANTASIA)+' <small>('+Number(c.CODEMP)+')</small></span></label>').join("")+'</div></div>'+
 '<div class="gg-year-field"><label for="gcc-year-'+page+'">Exercício</label><select id="gcc-year-'+page+'" data-gcc-year aria-label="Selecionar exercício financeiro">'+window.GGExercicio.options(ctx.year)+'</select></div>'+
 '<button type="button" class="gg-button" data-gcc-apply>Aplicar filtro</button></section>';
}
function ranking(page){
 const st=state(page),rows=st.list,top=Math.max(1,...rows.map(r=>num(r,"RECEBIDO")));
 const total=rows.reduce((sum,r)=>sum+num(r,"RECEBIDO"),0);
 return '<section class="gg-panel gcc-ranking"><div class="gcc-panel-heading"><div><h3>Despesas por centro de custo</h3>'+
 '<p>Baixas do exercício de '+contexts[page].year+'; escolha um centro para abrir o detalhamento.</p></div>'+
 '<strong class="gcc-total">'+money(total)+'</strong></div>'+
 (st.error?'<p class="gcc-error">'+esc(st.error)+'</p>':st.loading?'<p class="gcc-muted">Consultando centros de custo…</p>':
 rows.length?'<div class="gcc-ranking-list">'+rows.map((r,i)=>'<button type="button" class="gcc-rank'+(i===st.selected?' is-active':'')+'" data-gcc-index="'+i+'">'+
 '<span class="gcc-rank-row"><strong>'+esc(r.DESCRCENCUS)+'</strong><b>'+money(num(r,"RECEBIDO"))+'</b></span>'+
 '<span class="gcc-track"><i style="width:'+Math.max(1,100*num(r,"RECEBIDO")/top).toFixed(2)+'%"></i></span></button>').join("")+'</div>':
 '<p class="gcc-muted">Nenhum centro retornado para as empresas selecionadas.</p>')+
 '<p class="gcc-muted">Total do ranking: soma das linhas do gráfico original (não equivale ao saldo bancário).</p></section>';
}
function natures(page){
 const st=state(page);
 if(!st.natures.length)return '<p class="gcc-muted">Nenhuma natureza retornada.</p>';
 const total=st.natures.reduce((sum,r)=>sum+num(r,"VALOR"),0)||1;
 return '<div class="gcc-nature-list">'+st.natures.map((r,i)=>{
 const value=num(r,"VALOR"),percentage=100*value/total;
 return '<div class="gcc-nature-item"><div><span>'+esc(r.DESCRNAT)+'</span><strong>'+money(value)+'</strong></div>'+
 '<div class="gcc-track"><i style="width:'+Math.max(0,Math.min(100,percentage)).toFixed(2)+'%;background:'+
 (i%2===0?'#0b8f82':'#4683b0')+'"></i></div></div>';
 }).join("")+'</div>';
}
function partners(page){
 const st=state(page);
 const rows=st.partners;
 if(!rows.length)return '<p class="gcc-muted">Nenhum parceiro retornado nesta página.</p>';
 return '<div class="gcc-table-scroll"><table class="gcc-table"><thead><tr><th>Parceiro</th><th>Pago</th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td>'+esc(r.NOMEPARC)+'</td><td>'+money(num(r,"PAGO"))+'</td></tr>').join("")+'</tbody></table></div>';
}
function salaries(page){
 const st=state(page);
 if(!st.partners.length)return '<p class="gcc-muted">Nenhum parceiro retornado nesta página.</p>';
 return '<div class="gcc-table-scroll"><table class="gcc-table gcc-salary"><thead><tr><th>Parceiro</th>'+MONTHS.map(m=>'<th>'+m[1]+'</th>').join("")+'<th>Total</th></tr></thead><tbody>'+
 st.partners.map(r=>'<tr><th>'+esc(r.NOMEPARC)+'</th>'+MONTHS.map(m=>'<td>'+money(num(r,m[0]))+'</td>').join("")+'<td><strong>'+money(num(r,"TOTAL"))+'</strong></td></tr>').join("")+'</tbody></table></div>';
}
function pager(page){
 const st=state(page);
 return '<div class="gcc-pager"><button type="button" data-gcc-prev'+(st.page<=1||st.detailLoading?' disabled':'')+'>Anterior</button><span>Página '+st.page+'</span>'+
 '<button type="button" data-gcc-next'+(!st.hasMore||st.detailLoading?' disabled':'')+'>Próxima</button></div>';
}
function details(page){
 const st=state(page),rule=RULES[page],row=st.list[st.selected];
 const title=row&&row.DESCRCENCUS;
 return '<section class="gg-panel gcc-detail"><h3>'+esc(title||"Detalhamento por centro")+'</h3>'+
 (!title?'<p class="gcc-empty">Selecione um centro no ranking para ver sua composição.</p>':
 '<p class="gcc-muted">'+(page==="056"?'Composição de despesas por natureza e parceiro • exercício '+contexts[page].year+'.':
 'Composição de pagamentos por parceiro e por mês • exercício '+contexts[page].year+'.')+'</p>'+
 (page==="0E8"?'<div class="gcc-alert">Dados salariais sensíveis. O filtro de empresas não substitui as permissões de acesso do Sankhya.</div>':'')+
 (st.detailError?'<p class="gcc-error">'+esc(st.detailError)+'</p>':
 st.detailLoading?'<p class="gcc-muted">Consultando detalhamento…</p>':
 page==="056"?
 '<h4>Naturezas de despesa</h4>'+natures(page)+'<h4>Parceiros</h4>'+partners(page)+pager(page):
 '<h4>Pagamentos mensais por parceiro</h4>'+salaries(page)+pager(page)))+
 '</section>';
}
function paint(page){
 const ctx=contexts[page];if(!ctx||!visible(page))return;
 const st=state(page),rule=RULES[page],root=ctx.container;
 root.innerHTML='<header class="gg-panel gcc-intro"><div><div class="gg-kicker">CENTROS DE CUSTO • EXERCÍCIO '+ctx.year+'</div><h2>'+esc(rule.name)+'</h2>'+
 '<p>Regras, naturezas e períodos preservados do gadget original 380. Valores aguardam conferência financeira.</p></div>'+
 '<button type="button" class="gg-button" data-gcc-refresh>Atualizar</button></header>'+filters(page)+
 '<div class="gcc-columns">'+ranking(page)+details(page)+'</div>'+
 '<p class="gcc-footer">P&R Automação Industrial · Somente leitura · Valores agregados por centro de custo.</p>';
}
async function load(page,force){
 const ctx=contexts[page],st=state(page);if(!ctx||st.loading||!ctx.companies.length)return;
 let key;
 try{key=selectedCompanies(ctx)+"|"+ctx.year;}catch(e){st.error=stringify(e);paint(page);return;}
 if(!force&&st.baseKey===key){paint(page);return;}
 st.baseKey=key;st.baseToken++;st.detailToken++;st.loading=true;st.error="";st.detailError="";st.list=[];st.natures=[];st.partners=[];st.selected=-1;st.page=1;st.hasMore=false;
 const token=st.baseToken;
 paint(page);
 try{
  const rows=await ctx.execute(prepared(page,RULES[page].chart));
  if(st.baseToken!==token)return;
  st.list=Array.isArray(rows)?rows:[];
 }catch(e){if(st.baseToken===token)st.error=stringify(e);}
 finally{if(st.baseToken===token){st.loading=false;paint(page);}}
}
async function loadDetail(page,target){
 const ctx=contexts[page],st=state(page),rule=RULES[page];
 if(!ctx||st.selected<0||!st.list[st.selected])return;
 const name=String(st.list[st.selected].DESCRCENCUS),token=++st.detailToken;
 st.detailLoading=true;st.detailError="";if(target===1)st.natures=[];st.partners=[];paint(page);
 try{
  // A query por natureza e a grade de parceiros sao independentes,
  // mas evitamos consultar mais de uma grade pesada de cada vez.
  if(page==="056"&&target===1){
    const nats=await ctx.execute(prepared(page,rule.nature,name));
    if(token!==st.detailToken)return;
    st.natures=Array.isArray(nats)?nats:[];
  }
  const partners=await ctx.execute(paginated(prepared(page,rule.detail,name),target));
  if(token!==st.detailToken)return;
  st.partners=Array.isArray(partners)?partners:[];st.page=target;st.hasMore=st.partners.length===50;
 }catch(e){if(token===st.detailToken)st.detailError=stringify(e);}
 finally{if(token===st.detailToken){st.detailLoading=false;paint(page);}}
}
function handle(page,e){
 const ctx=contexts[page],st=state(page);if(!ctx)return;
 if(e.target.closest("[data-gcc-refresh]")){load(page,true);return;}
 if(e.target.closest("[data-gcc-apply]")){
  const ids=[...ctx.container.querySelectorAll("[data-gcc-company]:checked")].map(el=>Number(el.value)).filter(Number.isSafeInteger);
  if(!ids.length){st.error="Selecione ao menos uma empresa.";paint(page);return;}
  ctx.selected=ids;ctx.setSelected(ids);load(page,true);return;
 }
 const rank=e.target.closest("[data-gcc-index]");
 if(rank){
  const idx=Number(rank.dataset.gccIndex);
  if(!Number.isSafeInteger(idx)||idx<0||idx>=st.list.length)return;
  st.selected=idx;st.detailToken++;st.natures=[];st.partners=[];st.detailError="";st.page=1;st.hasMore=false;paint(page);loadDetail(page,1);return;
 }
 if(e.target.closest("[data-gcc-prev]")&&st.page>1){loadDetail(page,st.page-1);return;}
 if(e.target.closest("[data-gcc-next]")&&st.hasMore){loadDetail(page,st.page+1);}
}
window.GGCentros={
 version:"1.0.2",
 render(page,options){
  if(!RULES[page])return;
  const st=state(page);
  if(contexts[page]&&contexts[page].year!==options.year){
   st.baseToken++;st.detailToken++;st.loading=false;st.detailLoading=false;st.baseKey=null;
   st.list=[];st.natures=[];st.partners=[];st.selected=-1;st.page=1;st.hasMore=false;
  }
  contexts[page]=Object.assign({},options);
  if(!options.container.dataset.ggCentersListener){
   options.container.addEventListener("click",event=>{const p=window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage();if(RULES[p])handle(p,event);});
   options.container.addEventListener("change",event=>{
    const picker=event.target.closest("[data-gcc-year]");
    if(!picker)return;
    const p=window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage();
    if(RULES[p]&&contexts[p])contexts[p].setYear(Number(picker.value));
   });
   options.container.dataset.ggCentersListener="1";
  }
  paint(page);
  if(options.companies.length)load(page,false);
 },
 refresh(page){if(RULES[page])load(page,true);}
};
})();