/* GoldenGear · Receitas e Despesas por mês · v0.7.0
 * Interface pública sem SQL financeiro; consultas originais permanecem no JSP.
 * Gráficos do gadget 380 20P/41W compartilham a mesma consulta (receitas e despesas).
 * A tabela de despesas usa exceções TOP distintas do gráfico, como no XML original. */
(function () {
"use strict";
const MONTHS=[
 ["JAN","Janeiro","jan/25"],["FEV","Fevereiro","fev/25"],["MAR","Março","mar/25"],["ABR","Abril","abr/25"],
 ["MAI","Maio","mai/25"],["JUN","Junho","jun/25"],["JUL","Julho","jul/25"],["AGO","Agosto","ago/25"],
 ["SET","Setembro","set/25"],["OUT","Outubro","out/25"],["NOV","Novembro","nov/25"],["DEZ","Dezembro","dez/25"]
];
const CONFIG={
 "20P":{title:"Receitas por mês",grid:"grd_20V",chart:"cht_20W",primary:"RECEITA",accent:"#0c9685",secondary:"#d76b76"},
 "41W":{title:"Despesas por mês",grid:"grd_464",chart:"cht_465",primary:"DESPESA",accent:"#d76b76",secondary:"#0c9685"}
};
const ctx={},states={};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=v=>{const n=Number(v);return Number.isFinite(n)?n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"—";};
const number=(r,k)=>{if(!r)return 0;const key=Object.keys(r).find(x=>x.toUpperCase()===k.toUpperCase());const n=Number(key?r[key]:0);return Number.isFinite(n)?n:0;};
const state=page=>states[page]||(states[page]={key:null,chart:[],grid:[],month:0,needle:"",page:1,sort:"",loading:false,errorChart:"",errorGrid:"",token:0});
const current=page=>window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage()===page;
function companies(page){
 const c=ctx[page],chosen=c.selected.filter(n=>Number.isSafeInteger(n)&&n>0&&c.companies.some(x=>Number(x.CODEMP)===n));
 if(!chosen.length)throw Error("Selecione ao menos uma empresa.");
 return "("+chosen.join(",")+")";
}
function query(page,id){
 const raw=window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[id];
 if(typeof raw!=="string"||!raw.trim())throw Error("SQL "+id+" ausente. Importe o JSP v0.7.0.");
 return raw.replace(/:CODEMP\b/g,companies(page)).replace(/;\s*$/,"").trim();
}
function chartMonths(rows){
 const out=new Array(12).fill(null).map((_,i)=>({month:MONTHS[i][0],RECEITA:0,DESPESA:0,exists:false}));
 for(const row of rows||[]){
  const label=String(row.MES||"").trim().toLowerCase();
  const ix=MONTHS.findIndex(x=>x[2]===label);
  if(ix>=0){out[ix]={month:MONTHS[ix][0],RECEITA:number(row,"RECEITA"),DESPESA:number(row,"DESPESA"),exists:true};}
 }
 return out;
}
function selectedRows(page){
 const st=state(page),search=st.needle.toLocaleLowerCase("pt-BR");
 const rows=st.grid.filter(r=>!search||String(r.DESCRNAT||"").toLocaleLowerCase("pt-BR").includes(search)||
  String(r.DESCRCENCUS||"").toLocaleLowerCase("pt-BR").includes(search)||String(r.NATUREZA||"").includes(search));
 const col=MONTHS[st.month][0]+"_2025";
 rows.sort((a,b)=>st.sort==="az"?String(a.DESCRNAT||"").localeCompare(String(b.DESCRNAT||""),"pt-BR"):
  number(b,col)-number(a,col)||String(a.DESCRNAT||"").localeCompare(String(b.DESCRNAT||""),"pt-BR"));
 return rows;
}
function monthBar(page){
 const st=state(page),c=CONFIG[page],vals=chartMonths(st.chart);
 const max=Math.max(1,...vals.flatMap(r=>[r.RECEITA,r.DESPESA].map(Math.abs)));
 const plotTop=34,plotBottom=224,usable=plotBottom-plotTop;
 const group=79,bar=22,space=4,x=i=>62+group*i,y=v=>plotBottom-Math.abs(v)/max*usable;
 const lineBase=plotBottom;
 const bars=vals.map((r,i)=>{
  const selected=st.month===i;const p1=c.primary,p2=p1==="RECEITA"?"DESPESA":"RECEITA";
  const a=r[p1],b=r[p2];
  return '<g class="ggm-bar-group'+(selected?" is-active":"")+'"><rect x="'+x(i)+'" y="'+y(a)+'" width="'+bar+'" height="'+Math.max(0,lineBase-y(a))+'" rx="3" fill="'+c.accent+'">'+
   '<title>'+esc(MONTHS[i][1]+": "+(p1==="RECEITA"?"Receitas":"Despesas")+" "+money(a))+'</title></rect>'+
   '<rect x="'+(x(i)+bar+space)+'" y="'+y(b)+'" width="'+bar+'" height="'+Math.max(0,lineBase-y(b))+'" rx="3" fill="'+c.secondary+'">'+
   '<title>'+esc(MONTHS[i][1]+": "+(p2==="RECEITA"?"Receitas":"Despesas")+" "+money(b))+'</title></rect>'+
   '<text x="'+(x(i)+bar+space/2)+'" y="246" font-size="12" text-anchor="middle" fill="'+(selected?"#1a354b":"#678093")+'" font-weight="'+(selected?"700":"400")+'">'+MONTHS[i][0]+'</text>'+
   (selected?'<rect x="'+(x(i)-7)+'" y="22" width="62" height="237" fill="none" stroke="#8ab9b3" stroke-width="1.5" rx="7"/>':'')+'</g>';
 }).join("");
 const lines=[0,.25,.5,.75,1].map(p=>{
  const yy=lineBase-p*usable,value=max*p;
  return '<line x1="58" x2="1015" y1="'+yy+'" y2="'+yy+'" stroke="#e7eef3"/><text x="50" y="'+(yy+4)+'" font-size="11" text-anchor="end" fill="#718598">'+
   esc((value/1000000).toLocaleString("pt-BR",{maximumFractionDigits:1}))+' mi</text>';
 }).join("");
 return '<div class="ggm-legend"><span><i style="background:'+c.accent+'"></i>'+esc(p1label(page))+'</span><span><i style="background:'+c.secondary+'"></i>'+esc(p2label(page))+'</span></div>'+
 '<div class="ggm-chart"><svg viewBox="0 0 1030 265" role="img" aria-label="Receitas e despesas baixadas por mês no ano de 2025">'+
 lines+bars+'</svg></div>';
}
const p1label=p=>p==="20P"?"Receitas (destaque)":"Despesas (destaque)";
const p2label=p=>p==="20P"?"Despesas (comparativo)":"Receitas (comparativo)";
function monthSummary(page){
 const st=state(page),r=chartMonths(st.chart)[st.month],primary=CONFIG[page].primary,secondary=primary==="RECEITA"?"DESPESA":"RECEITA";
 const active=MONTHS[st.month],available=st.chart.length>0;
 return '<div class="ggm-month-cards">'+
 '<section class="gg-panel ggm-metric"><div class="gg-kicker">'+esc(active[1])+' DE 2025</div><h3>'+p1label(page).replace(" (destaque)","")+'</h3><strong>'+
 (st.loading&&!available?"Consultando…":available?money(r[primary]):"—")+'</strong></section>'+
 '<section class="gg-panel ggm-metric muted"><div class="gg-kicker">COMPARATIVO · '+esc(active[1].toUpperCase())+'</div><h3>'+p2label(page).replace(" (comparativo)","")+'</h3><strong>'+
 (st.loading&&!available?"Consultando…":available?money(r[secondary]):"—")+'</strong></section></div>';
}
function displayGrid(page){
 const cfg=CONFIG[page],st=state(page),all=selectedRows(page);
 const maxPages=Math.max(1,Math.ceil(all.length/50));st.page=Math.min(st.page,maxPages);
 const visible=all.slice((st.page-1)*50,st.page*50);
 const key=MONTHS[st.month][0]+"_2025";
 const columns=[...MONTHS.map(x=>x[0]+"_2025")];
 const heading=cfg.primary==="RECEITA"?"Natureza":"Natureza / centro de custo";
 const th='<th>'+heading+'</th>'+
  '<th class="ggm-selected-col">Mês</th><th>Total de 2025</th>';
 const rows=visible.map(r=>{
  const total=cfg.primary==="DESPESA"?number(r,"TOTAL"):columns.reduce((a,k)=>a+number(r,k),0);
  const title=cfg.primary==="DESPESA"?
   '<strong>'+esc(r.DESCRNAT)+'</strong><span>'+esc(r.DESCRCENCUS||"Sem centro")+'</span>':
   '<strong>'+esc(r.DESCRNAT)+'</strong>';
  return '<tr><td class="ggm-name">'+title+'</td><td class="ggm-selected-col">'+money(number(r,key))+'</td><td>'+money(total)+'</td></tr>';
 }).join("");
 const grand=all.reduce((t,r)=>t+number(r,key),0);
 return '<div class="ggm-table-hint"><span>Exibindo <b>'+all.length+'</b> natureza(s)/centro(s) após o filtro</span>'+
 '<span>'+MONTHS[st.month][1]+': <b>'+money(grand)+'</b> na grade</span></div>'+
 '<div class="ggm-scroll"><table class="ggm-table"><thead><tr>'+th+'</tr></thead><tbody>'+
 (rows||'<tr><td colspan="3">Nenhum registro encontrado.</td></tr>')+
 '</tbody></table></div>'+
 '<div class="ggm-paging"><button type="button" data-ggm-prev'+(st.page<=1?' disabled':'')+'>Anterior</button>'+
 '<span>Página '+st.page+' de '+maxPages+'</span><button type="button" data-ggm-next'+(st.page>=maxPages?' disabled':'')+'>Próxima</button></div>';
}
function paint(page){
 const c=ctx[page],st=state(page),conf=CONFIG[page];if(!c||!current(page))return;
 const companyHTML=c.companies.map(emp=>
  '<label class="gg-check"><input type="checkbox" data-ggm-emp value="'+Number(emp.CODEMP)+'"'+
  (c.selected.includes(Number(emp.CODEMP))?' checked':'')+'><span>'+esc(emp.NOMEFANTASIA)+' <small>('+Number(emp.CODEMP)+')</small></span></label>'
 ).join("");
 const nav=MONTHS.map((m,i)=>'<button data-ggm-month="'+i+'" type="button" class="'+(st.month===i?"active":"")+'">'+m[0]+'</button>').join("");
 c.container.innerHTML=
 '<header class="gg-panel ggm-header"><div><div class="gg-kicker">FLUXO DE CAIXA · EXERCÍCIO ORIGINAL 2025</div>'+
 '<h2>'+esc(conf.title)+'</h2><p>Baixas registradas de janeiro a dezembro de 2025. Valores aguardam conciliação com o gadget 380.</p></div>'+
 '<button type="button" data-ggm-refresh class="gg-button"'+(st.loading?' disabled':'')+'>Atualizar</button></header>'+
 '<section class="gg-panel ggm-filters"><div><div class="gg-kicker">EMPRESAS</div><div class="ggm-company-list">'+companyHTML+
 '</div></div><button type="button" data-ggm-apply class="gg-button"'+(st.loading?' disabled':'')+'>Aplicar filtro</button></section>'+
 '<div class="ggm-monthbar">'+nav+'</div>'+
 monthSummary(page)+
 '<section class="gg-panel ggm-graphic"><div class="ggm-section-title"><h3>Receitas × despesas por mês</h3>'+
 '<p>O gráfico original de ambas as seções possui a mesma consulta, com as duas séries.</p></div>'+
 (st.errorChart?'<p class="ggm-error">'+esc(st.errorChart)+'</p>':st.loading&&!st.chart.length?'<p class="ggm-hint">Consultando gráfico…</p>':monthBar(page))+
 '</section>'+
 '<section class="gg-panel ggm-grid"><div class="ggm-grid-head"><div><h3>Detalhamento por '+(page==="20P"?"natureza":"natureza e centro de custo")+'</h3>'+
 '<p>A coluna do mês acompanha a seleção acima; o total utiliza a regra da grade original.</p></div>'+
 '<div class="ggm-search"><input id="ggm-filter-text" type="text" placeholder="Buscar natureza ou centro" value="'+esc(st.needle)+'" />'+
 '<button type="button" data-ggm-search>Pesquisar</button></div></div>'+
 (st.errorGrid?'<p class="ggm-error">'+esc(st.errorGrid)+'</p>':st.loading&&!st.grid.length?'<p class="ggm-hint">Consultando tabela…</p>':displayGrid(page))+
 '</section><p class="ggm-foot">As consultas da grade e do gráfico mantêm suas próprias exclusões de TOP e natureza, como no gadget 380. Por isso os totais podem não coincidir exatamente. Não somar os dois conjuntos.</p>';
}
async function load(page,force){
 const c=ctx[page],st=state(page);if(!c||!c.companies.length||st.loading)return;
 let key;
 try{key=companies(page);}catch(e){st.errorGrid=String(e.message||e);paint(page);return;}
 if(!force&&st.key===key){paint(page);return;}
 const token=++st.token;st.key=key;st.chart=[];st.grid=[];st.errorChart="";st.errorGrid="";st.loading=true;st.page=1;paint(page);
 for(const [type,id] of [["chart",CONFIG[page].chart],["grid",CONFIG[page].grid]]){
  try{const rows=await c.execute(query(page,id));if(token!==st.token)return;st[type]=Array.isArray(rows)?rows:[];}
  catch(e){if(token!==st.token)return;st[type==="chart"?"errorChart":"errorGrid"]=String(e&&e.message||e);}
  paint(page);
 }
 st.loading=false;paint(page);
}
function click(page,event){
 const st=state(page),c=ctx[page];if(!c||st.loading)return;
 const btn=event.target.closest("button");if(!btn)return;
 if(btn.hasAttribute("data-ggm-refresh")){load(page,true);return;}
 if(btn.hasAttribute("data-ggm-apply")){
  const ids=[...c.container.querySelectorAll("[data-ggm-emp]:checked")].map(x=>Number(x.value)).filter(Number.isSafeInteger);
  if(!ids.length){st.errorGrid="Selecione ao menos uma empresa.";paint(page);return;}
  c.selected=ids;c.setSelected(ids);load(page,true);return;
 }
 if(btn.hasAttribute("data-ggm-month")){
  const ix=Number(btn.dataset.ggmMonth);if(ix>=0&&ix<12){st.month=ix;st.page=1;paint(page);}return;
 }
 if(btn.hasAttribute("data-ggm-search")){
  const input=c.container.querySelector("#ggm-filter-text");
  st.needle=input?input.value.trim():"";st.page=1;paint(page);return;
 }
 if(btn.hasAttribute("data-ggm-prev")){if(st.page>1){st.page--;paint(page);}return;}
 if(btn.hasAttribute("data-ggm-next")){st.page++;paint(page);}
}
window.GGMensal={
 version:"0.7.0",
 render(page,options){
  if(!CONFIG[page])return;
  ctx[page]=Object.assign({},options);
  const host=options.container;
  if(!host.dataset.ggmListener){
   host.addEventListener("click",ev=>{
    const curr=window.GGFluxoCaixa&&window.GGFluxoCaixa.getCurrentPage();
    if(CONFIG[curr])click(curr,ev);
   });
   host.dataset.ggmListener="1";
  }
  paint(page);if(options.companies.length)load(page,false);
 },
 refresh(page){if(CONFIG[page])load(page,true);}
};
})();