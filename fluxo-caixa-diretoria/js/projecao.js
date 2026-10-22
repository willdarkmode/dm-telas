/* GoldenGear · Projecao com intervalos livres · v0.9.0
 * SQL financeiro somente no JSP. Regras herdadas do chart cht_1JA: exclusoes,
 * ABS(VLRDESDOB), negativos para despesas, saldo = recebiveis - pagaveis abertos.
 * Intervalo começa em zero: nao soma saldo bancario, nem importa vencidos anteriores. */
(function(){
"use strict";
const MS=86400000,MAX_DAYS=730;
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cash=n=>Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const number=(r,k)=>{const key=r&&Object.keys(r).find(x=>x.toUpperCase()===k.toUpperCase());const n=Number(key?r[key]:0);return Number.isFinite(n)?n:0;};
const fmt=iso=>/^\d{4}-\d{2}-\d{2}$/.test(String(iso))?iso.slice(8,10)+"/"+iso.slice(5,7)+"/"+iso.slice(0,4):String(iso||"");
const isoToday=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const dt=iso=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso)))throw Error("Informe datas completas no formato dia/mês/ano.");
 const value=new Date(iso+"T00:00:00Z");
 if(!Number.isFinite(value.getTime())||value.toISOString().slice(0,10)!==iso)throw Error("Data inválida.");
 return value.getTime();
};
const addDays=(start,n)=>new Date(dt(start)+n*MS).toISOString().slice(0,10);
const now=isoToday();
const p={start:now,end:addDays(now,99),group:"week",ctx:null,root:null,
 data:[],groups:[],loadedKey:"",error:"",busy:false,detailBusy:false,detailErr:"",
 selectedIndex:-1,kind:"ARECEBER",details:[],detailPage:1,hasMore:false,detailToken:0,queryToken:0,
 legacy:[],legacyChart:[],legacyError:"",legacyChartError:"",legacyBusy:false,legacyKey:"",legacyToken:0,tablePage:1,notice:""};
const kinds=[
 ["ARECEBER","A receber","ABERTO",1,"ARECEBER_DIA"],
 ["APAGAR","A pagar","ABERTO",-1,"APAGAR_DIA"],
 ["RECEBIDO","Recebido","BAIXADO",1,"RECEBIDO_DIA"],
 ["PAGO","Pago","BAIXADO",-1,"PAGO_DIA"]];
const samePage=()=>!window.GGFluxoCaixa||window.GGFluxoCaixa.getCurrentPage()==="078";
function companies(){
 const c=p.ctx;if(!c)throw Error("Aguarde as empresas serem carregadas.");
 const codes=c.selected.filter(n=>Number.isSafeInteger(n)&&n>0&&c.companies.some(x=>Number(x.CODEMP)===n));
 if(!codes.length)throw Error("Selecione ao menos uma empresa na área superior.");
 return "("+codes.join(",")+")";
}
function validate(){
 const start=dt(p.start),end=dt(p.end),days=Math.round((end-start)/MS)+1;
 if(days<1)throw Error("A data final precisa ser igual ou posterior à inicial.");
 if(days>MAX_DAYS)throw Error("O intervalo máximo é de 730 dias por consulta. Divida a análise em períodos menores.");
 return days;
}
function sql(name,replacements={}){
 const templ= ["grd_1BP","cht_1JA"].includes(name)?window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[name]:
   window.GGFluxoPeriodoSQL&&window.GGFluxoPeriodoSQL[name];
 if(typeof templ!=="string"||!templ.trim())throw Error("A consulta "+name+" não está no JSP. Importe a v0.9.0.");
 let output=templ.replace(/:CODEMP\b/g,companies());
 for(const [k,v] of Object.entries(replacements))output=output.replace(new RegExp(":"+k+"\\b","g"),v);
 if(/:(?:DATA_INICIO|DATA_FIM|DET_INICIO|DET_FIM|RECDESP|MODO)\b/.test(output))throw Error("Parâmetro da consulta não resolvido.");
 return output.trim().replace(/;\s*$/,"");
}
function reportKey(){return p.start+"|"+p.end+"|"+companies();}
function resetDetail(){p.detailToken++;p.selectedIndex=-1;p.details=[];p.detailErr="";p.detailBusy=false;p.detailPage=1;p.hasMore=false;p.notice="";}
function calcGroups(){
 const groups=[],items=p.data;
 for(let i=0;i<items.length;i++){
  const row=items[i],day=String(row.DT_REF);
  const key=p.group==="day"?day:p.group==="week"?String(Math.floor(i/7)):day.slice(0,7);
  const last=groups[groups.length-1];
  if(!last||last.key!==key)groups.push({key,start:day,end:day,receive:0,pay:0,received:0,paid:0,ar:0,ap:0,rc:0,pg:0,saldo:0});
  const g=groups[groups.length-1];g.end=day;
  g.receive+=number(row,"ARECEBER_DIA");
  g.pay+=number(row,"APAGAR_DIA");
  g.received+=number(row,"RECEBIDO_DIA");
  g.paid+=number(row,"PAGO_DIA");
  g.ar=number(row,"ARECEBER_ACUMULADO");
  g.ap=number(row,"APAGAR_ACUMULADO");
  g.rc=number(row,"RECEBIDO_ACUMULADO");
  g.pg=number(row,"PAGO_ACUMULADO");
  g.saldo=number(row,"SALDO_ACUMULADO");
 }
 p.groups=groups;
}
const label=g=>g.start===g.end?fmt(g.start):fmt(g.start)+" – "+fmt(g.end);
function curve(){
 const g=p.groups;if(!g.length)return '<p>Não houve dados para exibir no período.</p>';
 const lines=[["ar","#0e9b83","A receber acumulado"],["ap","#dc7081","A pagar acumulado"],["saldo","#2b6b9a","Saldo projetado"]];
 const values=lines.flatMap(([k])=>g.map(x=>x[k]));
 const low=Math.min(0,...values),high=Math.max(0,...values);
 const x=i=>72+855*i/Math.max(1,g.length-1),y=v=>22+(high-v)/(high-low||1)*198;
 const ticks=[0,.25,.5,.75,1].map(f=>{
  const val=low+(high-low)*f,py=y(val);
  return '<line x1="72" x2="928" y1="'+py+'" y2="'+py+'" stroke="#e8edf2"/>'+
  '<text x="64" y="'+(py+4)+'" text-anchor="end" font-size="11" fill="#61798d">'+esc((val/1000).toLocaleString("pt-BR",{maximumFractionDigits:0}))+' mil</text>';
 }).join("");
 const chart=lines.map(([k,color,title])=>{
  const pts=g.map((r,i)=>x(i)+","+y(r[k])).join(" ");
  const points=g.length<=60?g.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(r[k])+'" r="3" fill="'+color+'"></circle>').join(""):"";
  return '<polyline fill="none" stroke="'+color+'" stroke-width="'+(k==="saldo"?3.3:2.4)+'" stroke-linejoin="round" points="'+pts+'"/>'+points;
 }).join("");
 const idx=[0,Math.floor((g.length-1)/4),Math.floor((g.length-1)/2),Math.floor(3*(g.length-1)/4),g.length-1];
 const labs=[...new Set(idx)].map(i=>'<text x="'+x(i)+'" y="249" font-size="11" text-anchor="middle" fill="#718498">'+esc(fmt(g[i].end).slice(0,5))+'</text>').join("");
 const focus='<g data-ggpr-focus class="ggpr-focus" visibility="hidden" pointer-events="none">'+
  '<line data-ggpr-focus-line x1="72" x2="72" y1="20" y2="220" stroke="#6c8996" stroke-width="1.5" stroke-dasharray="5 4"/>'+
  lines.map(([k,color])=>'<circle data-ggpr-focus-marker="'+k+'" cx="72" cy="220" r="5.4" fill="'+color+'" stroke="#ffffff" stroke-width="2.2"/>').join("")+
  '</g>';
 return '<div class="ggpr-legend">'+lines.map(([k,c,t])=>'<span><i style="background:'+c+'"></i>'+t+'</span>').join("")+'</div>'+
 '<div class="ggpr-chart-shell"><div class="ggpr-curve"><svg data-ggpr-plot tabindex="0" viewBox="0 0 970 265" role="img" aria-label="Projeção acumulada: passe o mouse pelo gráfico ou use as setas do teclado para consultar os valores de cada período">'+ticks+chart+labs+focus+'</svg></div>'+
 '<div data-ggpr-tooltip class="ggpr-tooltip" role="status" aria-live="off" hidden></div></div>';
}
// Tooltip usa os mesmos acumulados da série renderizada: não realiza consultas.
let activeHover=-1;
function clearChartFocus(){
 activeHover=-1;
 if(!p.root)return;
 const tip=p.root.querySelector("[data-ggpr-tooltip]");
 const group=p.root.querySelector("[data-ggpr-focus]");
 if(tip)tip.hidden=true;
 if(group)group.setAttribute("visibility","hidden");
}
function showChartFocus(index){
 if(!p.root||!samePage()||!p.groups.length)return;
 const svg=p.root.querySelector("svg[data-ggpr-plot]");
 const shell=p.root.querySelector(".ggpr-chart-shell");
 const tip=p.root.querySelector("[data-ggpr-tooltip]");
 if(!svg||!shell||!tip)return;
 const i=Math.max(0,Math.min(p.groups.length-1,Math.round(index))),row=p.groups[i];
 if(!row)return;
 activeHover=i;
 const all=p.groups.flatMap(r=>[r.ar,r.ap,r.saldo]);
 const low=Math.min(0,...all),high=Math.max(0,...all);
 const x=72+855*i/Math.max(1,p.groups.length-1);
 const y=v=>22+(high-v)/(high-low||1)*198;
 const focus=svg.querySelector("[data-ggpr-focus]");
 const guide=svg.querySelector("[data-ggpr-focus-line]");
 if(focus)focus.setAttribute("visibility","visible");
 if(guide){guide.setAttribute("x1",x);guide.setAttribute("x2",x);}
 for(const key of ["ar","ap","saldo"]){
  const marker=svg.querySelector('[data-ggpr-focus-marker="'+key+'"]');
  if(marker){marker.setAttribute("cx",x);marker.setAttribute("cy",y(row[key]));}
 }
 tip.innerHTML='<div class="ggpr-tooltip-period">'+esc(label(row))+'</div>'+
  '<div class="ggpr-tooltip-value"><span><i class="ggpr-dot is-receive"></i>A receber acumulado</span><strong>'+cash(row.ar)+'</strong></div>'+
  '<div class="ggpr-tooltip-value"><span><i class="ggpr-dot is-pay"></i>A pagar acumulado</span><strong>'+cash(row.ap)+'</strong></div>'+
  '<div class="ggpr-tooltip-value"><span><i class="ggpr-dot is-balance"></i>Saldo projetado</span><strong>'+cash(row.saldo)+'</strong></div>';
 tip.hidden=false;
 const graphic=svg.getBoundingClientRect(),area=shell.getBoundingClientRect();
 const scaledX=graphic.left-area.left+x/970*graphic.width;
 const width=tip.offsetWidth||260,height=tip.offsetHeight||125;
 let left=scaledX+16;
 if(left+width>area.width-6)left=scaledX-width-16;
 left=Math.max(6,Math.min(left,Math.max(6,area.width-width-6)));
 const top=Math.max(4,Math.min(20,area.height-height-4));
 tip.style.left=Math.round(left)+"px";
 tip.style.top=Math.round(top)+"px";
}
function onPlotMove(event){
 const svg=event.target.closest&&event.target.closest("svg[data-ggpr-plot]");
 if(!svg||!p.groups.length||!samePage())return;
 const bounds=svg.getBoundingClientRect();
 if(bounds.width<=0)return;
 const relativeX=(event.clientX-bounds.left)*970/bounds.width;
 const index=Math.round((relativeX-72)/855*Math.max(1,p.groups.length-1));
 showChartFocus(index);
}
function onPlotOut(event){
 const svg=event.target.closest&&event.target.closest("svg[data-ggpr-plot]");
 if(!svg)return;
 if(event.relatedTarget&&svg.contains(event.relatedTarget))return;
 clearChartFocus();
}
function onPlotFocus(event){
 if(event.target.matches&&event.target.matches("svg[data-ggpr-plot]"))
   showChartFocus(activeHover>=0?activeHover:0);
}
function onPlotBlur(event){
 if(event.target.matches&&event.target.matches("svg[data-ggpr-plot]"))clearChartFocus();
}
function onPlotKey(event){
 if(!event.target.matches||!event.target.matches("svg[data-ggpr-plot]"))return;
 if(!["ArrowLeft","ArrowRight","Home","End","Escape"].includes(event.key))return;
 event.preventDefault();
 if(event.key==="Escape"){clearChartFocus();return;}
 if(event.key==="Home"){showChartFocus(0);return;}
 if(event.key==="End"){showChartFocus(p.groups.length-1);return;}
 showChartFocus((activeHover<0?0:activeHover)+(event.key==="ArrowRight"?1:-1));
}
function cards(){
 const last=p.data[p.data.length-1];if(!last)return "";
 const rec=number(last,"ARECEBER_ACUMULADO"),pag=number(last,"APAGAR_ACUMULADO");
 const received=number(last,"RECEBIDO_ACUMULADO"),paid=number(last,"PAGO_ACUMULADO");
 return '<div class="ggpr-kpis">'+[
  ["A receber",rec,"in"],["A pagar",pag,"out"],["Saldo projetado",rec+pag,"balance"],
  ["Já baixados no intervalo",received+paid,"done"]
 ].map(([t,v,type])=>'<div class="gg-panel ggpr-kpi '+type+'"><div class="gg-kicker">'+esc(t)+'</div>'+
 '<strong>'+cash(v)+'</strong></div>').join("")+'</div>';
}
function summary(){
 const groups=p.groups,pages=Math.max(1,Math.ceil(groups.length/50));
 p.tablePage=Math.max(1,Math.min(pages,p.tablePage));
 const shown=groups.slice((p.tablePage-1)*50,p.tablePage*50);
 return '<div class="ggpr-table-wrap"><table class="ggpr-table"><thead><tr><th>Período</th><th>A receber</th><th>A pagar</th><th>Saldo acumulado</th><th>Recebido</th><th>Pago</th></tr></thead><tbody>'+
 shown.map(g=>{
  const ix=groups.indexOf(g);
  return '<tr class="'+(p.selectedIndex===ix?'selected':'')+'"><td><button type="button" data-ggpr-period="'+ix+'">'+esc(label(g))+'</button></td>'+
   '<td>'+cash(g.receive)+'</td><td>'+cash(g.pay)+'</td><td><b>'+cash(g.saldo)+'</b></td>'+
   '<td>'+cash(g.received)+'</td><td>'+cash(g.paid)+'</td></tr>';
 }).join("")+'</tbody></table></div><div class="ggpr-pagination">'+
 '<button type="button" data-ggpr-page="-1"'+(p.tablePage<=1?' disabled':'')+'>Anterior</button>'+
 '<span>Página '+p.tablePage+' de '+pages+' · '+groups.length+' período(s)</span>'+
 '<button type="button" data-ggpr-page="1"'+(p.tablePage>=pages?' disabled':'')+'>Próxima</button></div>';
}
function selectedDetail(){
 if(p.selectedIndex<0||!p.groups[p.selectedIndex])return "";
 const g=p.groups[p.selectedIndex],kind=kinds.find(x=>x[0]===p.kind)||kinds[0];
 const tabs=kinds.map(x=>'<button type="button" data-ggpr-kind="'+x[0]+'"'+(p.kind===x[0]?' class="active"':'')+'>'+
   x[1]+'</button>').join("");
 const rows=p.details.map((r,i)=>{
  const n=Number(r.NUFIN),ok=Number.isSafeInteger(n)&&n>0;
  return '<tr><td>'+(ok?'<button type="button" data-ggpr-nufin="'+i+'" class="ggpr-link" title="Abrir título financeiro">↗ '+n+'</button>':esc(r.NUFIN))+
  '</td><td>'+esc(r.NUMNOTA)+'</td><td>'+esc(r.NOMEPARC)+'</td><td>'+esc(r.CODEMP)+'</td>'+
  '<td>'+esc(r.DTVENC)+'</td><td>'+esc(r.DHBAIXA)+'</td><td>'+cash(r.VALOR)+'</td></tr>';
 }).join("");
 return '<section class="gg-panel ggpr-titles"><div class="ggpr-subhead"><div><h3>Títulos de '+esc(label(g))+'</h3>'+
  '<p>Selecione uma categoria e abra a nota pelo NUFIN no Sankhya.</p></div><button data-ggpr-close type="button">Fechar detalhes</button></div>'+
  '<div class="ggpr-tabs">'+tabs+'</div>'+
  (p.notice?'<div role="status" class="ggpr-notice">'+esc(p.notice)+'</div>':'')+
  (p.detailErr?'<p class="ggpr-error">'+esc(p.detailErr)+'</p>':
    p.detailBusy?'<p>Consultando títulos financeiros…</p>':
    '<div class="ggpr-table-wrap"><table class="ggpr-table"><thead><tr><th>NUFIN</th><th>Nota</th><th>Parceiro</th>'+
     '<th>Empresa</th><th>Vencimento</th><th>Baixa</th><th>Valor</th></tr></thead><tbody>'+
     (rows||'<tr><td colspan="7">Nenhum título nessa categoria e período.</td></tr>')+'</tbody></table></div>')+
  '<div class="ggpr-pagination"><button type="button" data-ggpr-detailpage="-1"'+(p.detailPage<=1||p.detailBusy?' disabled':'')+'>Anterior</button>'+
  '<span>Página '+p.detailPage+' · 50 títulos por consulta</span>'+
  '<button type="button" data-ggpr-detailpage="1"'+(!p.hasMore||p.detailBusy?' disabled':'')+'>Próxima</button></div></section>';
}
const legacyColumns=[["Hoje","Hoje"],["Amanha","Amanhã"],["Dez","10 dias"],["Vinte","20 dias"],["Trinta","30 dias"],
 ["Quarenta","40 dias"],["Cinquenta","50 dias"],["Sessenta","60 dias"],["Setenta","70 dias"],
 ["Oitenta","80 dias"],["Noventa","90 dias"],["Cem","100 dias"]];
function legacy(){
 if(!p.legacy.length&&!p.legacyChart.length)return '<p class="ggpr-muted">A referência original só será consultada quando você solicitar.</p>';
 const rows=p.legacy.slice().sort((a,b)=>number(a,"ORDEM")-number(b,"ORDEM"));
 const oldGraph=p.legacyChart.length&&window.GGFinancePrincipal&&typeof window.GGFinancePrincipal.legacyPreview==="function"?
   '<h4>Gráfico original de 100 dias</h4>'+window.GGFinancePrincipal.legacyPreview(p.legacyChart):'';
 return '<p class="ggpr-muted">Dados de referência do gadget 380. O gráfico e a grade antigos possuem critérios diferentes de agrupamento e fim de semana; não compare automaticamente com a projeção por datas livres.</p>'+
 (p.legacyChartError?'<p class="ggpr-error">'+esc(p.legacyChartError)+'</p>':'')+oldGraph+
 '<h4>Grade histórica do gadget 380</h4>'+
 '<div class="ggpr-table-wrap"><table class="ggpr-table ggpr-legacy"><thead><tr><th>Componente</th>'+legacyColumns.map(x=>'<th>'+x[1]+'</th>').join("")+'</tr></thead><tbody>'+
 rows.map(r=>'<tr><th>'+esc(String(r.TIPO||"").replace(/<[^>]*>/g,""))+'</th>'+
 legacyColumns.map(x=>'<td>'+cash(number(r,x[0]))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
}
function paint(){
 if(!p.ctx||!samePage())return;
 let host=p.ctx.container.querySelector("#gg-projecao-periodo");
 if(!host){host=document.createElement("section");host.id="gg-projecao-periodo";p.ctx.container.appendChild(host);}
 const busy=p.busy,days=(()=>{try{return validate()}catch{return 0}})();
 host.innerHTML='<div class="ggpr-heading"><div class="gg-kicker">PROJEÇÃO FINANCEIRA · PERÍODO LIVRE</div>'+
 '<h2>Projeção de caixa</h2>'+
 '<p>Escolha datas livres (até 730 dias), agrupe por dia, semana ou mês e abra os títulos do período.</p></div>'+
 '<section class="gg-panel ggpr-filters"><div class="ggpr-dates">'+
 '<label>Data inicial<input data-ggpr-start type="date" value="'+esc(p.start)+'"></label>'+
 '<label>Data final<input data-ggpr-end type="date" value="'+esc(p.end)+'"></label>'+
 '<label>Agrupamento<select data-ggpr-group><option value="day"'+(p.group==="day"?" selected":"")+'>Diário</option>'+
 '<option value="week"'+(p.group==="week"?" selected":"")+'>Semanal (7 dias)</option>'+
 '<option value="month"'+(p.group==="month"?" selected":"")+'>Mensal</option></select></label>'+
 '<button type="button" class="gg-button" data-ggpr-run'+(busy?' disabled':'')+'>Consultar período</button></div>'+
 '<div class="ggpr-presets"><span>Atalhos a partir de hoje:</span>'+
 [30,90,100,180,365,730].map(n=>'<button type="button" data-ggpr-preset="'+n+'">'+n+' dias</button>').join("")+
 '</div><div class="ggpr-help">'+(days?days+" dia(s) selecionados. ":"")+
 'Saldo inicial da simulação = R$ 0,00. Apenas títulos do intervalo selecionado; não incorpora saldo bancário nem vencimentos anteriores.</div></section>'+
 (p.error?'<p role="alert" class="ggpr-error">'+esc(p.error)+'</p>':'')+
 (p.busy?'<section class="gg-panel">Consultando período no Sankhya…</section>':
 p.data.length?cards()+'<section class="gg-panel"><h3>Projeção acumulada</h3>'+curve()+
 '<p class="ggpr-muted">Recebido e pago representam títulos baixados; o saldo projetado utiliza apenas os títulos ainda em aberto.</p>'+
 '</section><section class="gg-panel"><h3>Composição por período</h3>'+
 '<p class="ggpr-muted">A receber, a pagar, recebido e pago são valores do período. O saldo é acumulado desde a data inicial. Clique em um período para consultar os títulos.</p>'+
 summary()+'</section>'+selectedDetail():
 '<section class="gg-panel ggpr-empty">Selecione o intervalo desejado e clique em <strong>Consultar período</strong>. A consulta só é executada quando solicitada.</section>')+
 '<details class="gg-panel ggpr-original"'+(p.legacyBusy||p.legacy.length||p.legacyChart.length||p.legacyError?' open':'')+'><summary>Comparar com o gadget 380 · referência antiga de 100 dias</summary>'+
 '<p class="ggpr-muted">Opcional para auditoria. O gráfico e a grade originais são consultados somente ao solicitar; sua projeção personalizada permanece a visão principal.</p>'+
 '<button type="button" class="gg-button" data-ggpr-legacy'+(p.legacyBusy?' disabled':'')+'>'+(p.legacyBusy?'Consultando referência…':'Carregar comparação original')+'</button>'+
 (p.legacyError?'<p class="ggpr-error">'+esc(p.legacyError)+'</p>':'')+
 legacy()+'</details>';
}
function invalidateIfCompaniesChanged(){
 if(!p.ctx)return;
 let key;
 try{key=companies();}catch(_){key="";}
 if(p.loadedKey&&p.loadedKey.split("|").slice(-1)[0]!==key){
  p.data=[];p.groups=[];p.loadedKey="";p.error="";p.queryToken++;p.busy=false;resetDetail();
 }
 if(p.legacyKey&&p.legacyKey!==key){p.legacyToken++;p.legacyBusy=false;p.legacy=[];p.legacyChart=[];p.legacyKey="";p.legacyError="";p.legacyChartError="";}
}
function rebuildCumulative(rows){
 const totals={ARECEBER:0,APAGAR:0,RECEBIDO:0,PAGO:0};
 return rows.map(r=>{
   const normalized=Object.assign({},r);
   for(const key of Object.keys(totals)){
     totals[key]+=number(r,key+"_DIA");
     normalized[key+"_ACUMULADO"]=totals[key];
   }
   normalized.SALDO_ACUMULADO=totals.ARECEBER+totals.APAGAR;
   return normalized;
 });
}
async function run(){
 if(p.busy)return;
 let days,key;
 try{days=validate();key=reportKey();}catch(e){p.error=String(e.message||e);paint();return;}
 const start=p.start,end=p.end;
 p.busy=true;p.error="";resetDetail();p.data=[];p.groups=[];p.tablePage=1;const token=++p.queryToken;paint();
 try{
  let rows=await p.ctx.execute(sql("diario",{DATA_INICIO:start,DATA_FIM:end}));
  if(token!==p.queryToken)return;
  if(!Array.isArray(rows))throw Error("Resposta inesperada da consulta.");
  // Alguns ambientes limitam linhas por retorno. Reconsultar em blocos
  // preserva qualquer horizonte até 730 dias e evita saldos truncados.
  if(rows.length!==days && rows.length<days && days>90){
    const slices=[];
    for(let from=0;from<days;from+=90){
      if(token!==p.queryToken||reportKey()!==key)return;
      const size=Math.min(90,days-from);
      const part=await p.ctx.execute(sql("diario",{
        DATA_INICIO:addDays(start,from),DATA_FIM:addDays(start,from+size-1)
      }));
      if(token!==p.queryToken)return;
      if(!Array.isArray(part)||part.length!==size)throw Error("O conector não retornou todos os dias no lote "+(Math.floor(from/90)+1)+".");
      slices.push(...part);
    }
    rows=rebuildCumulative(slices);
  }
  if(rows.length!==days)throw Error("O Sankhya retornou "+rows.length+" dias para um intervalo de "+days+". Verifique limites do conector.");
  if(token!==p.queryToken||reportKey()!==key)return;
  p.data=rows;p.loadedKey=key;calcGroups();
 }catch(e){if(token===p.queryToken)p.error=String(e&&e.message||e);}
 finally{if(token===p.queryToken){p.busy=false;paint();}}
}
async function loadDetails(targetPage){
 if(p.detailBusy||p.selectedIndex<0||!p.groups[p.selectedIndex])return;
 const g=p.groups[p.selectedIndex],kind=kinds.find(x=>x[0]===p.kind)||kinds[0],token=++p.detailToken;
 p.detailBusy=true;p.detailErr="";p.notice="";paint();
 try{
  const query=sql("titulos",{DET_INICIO:g.start,DET_FIM:g.end,RECDESP:String(kind[3]),MODO:"'"+kind[2]+"'"});
  const rows=await p.ctx.execute(query+" OFFSET "+((targetPage-1)*50)+" ROWS FETCH NEXT 50 ROWS ONLY");
  if(token!==p.detailToken)return;
  p.details=Array.isArray(rows)?rows:[];p.detailPage=targetPage;p.hasMore=p.details.length===50;
 }catch(e){if(token===p.detailToken)p.detailErr=String(e&&e.message||e);}
 finally{if(token===p.detailToken){p.detailBusy=false;paint();}}
}
async function loadLegacy(){
 if(p.legacyBusy)return;
 let key;
 try{key=companies();}catch(e){p.legacyError=String(e.message||e);paint();return;}
 const token=++p.legacyToken,ctx=p.ctx;
 p.legacyKey=key;p.legacyBusy=true;p.legacyError="";p.legacyChartError="";p.legacy=[];p.legacyChart=[];paint();
 try{
  for(const id of ["cht_1JA","grd_1BP"]){
   try{
    const rows=await ctx.execute(sql(id));
    if(token!==p.legacyToken||companies()!==key)return;
    if(id==="cht_1JA")p.legacyChart=Array.isArray(rows)?rows:[];
    else p.legacy=Array.isArray(rows)?rows:[];
   }catch(e){
    if(token!==p.legacyToken)return;
    if(id==="cht_1JA")p.legacyChartError=String(e&&e.message||e);
    else p.legacyError=String(e&&e.message||e);
   }
   paint();
  }
 }finally{if(token===p.legacyToken){p.legacyBusy=false;paint();}}
}
function openNufin(index){
 const row=p.details[index],n=Number(row&&row.NUFIN);
 if(!Number.isSafeInteger(n)||n<=0){p.notice="NUFIN inválido.";paint();return;}
 let w,fn;
 for(const maybe of [window,window.parent,window.top]){
  try{if(maybe&&typeof maybe.openApp==="function"){w=maybe;fn=maybe.openApp;break;}}catch(_){}
 }
 if(!fn){p.notice="openApp indisponível. Procure o NUFIN "+n+" na Movimentação Financeira.";paint();return;}
 try{fn.call(w,"br.com.sankhya.fin.cad.movimentacaoFinanceira",{NUFIN:n});
  p.notice="Abertura solicitada para o NUFIN "+n+". Confira o título no Sankhya.";}
 catch(e){p.notice="Falha ao abrir NUFIN "+n+": "+String(e.message||e);}
 paint();
}
function onClick(ev){
 const b=ev.target.closest("button");if(!b||!p.ctx||!samePage())return;
 if(b.hasAttribute("data-ggpr-preset")){
  const n=Number(b.dataset.ggprPreset);if(![30,90,100,180,365,730].includes(n))return;
  const today=isoToday();p.start=today;p.end=addDays(today,n-1);
  p.error="";p.data=[];p.groups=[];p.loadedKey="";p.queryToken++;p.busy=false;resetDetail();paint();return;
 }
 if(b.hasAttribute("data-ggpr-run")){run();return;}
 if(b.hasAttribute("data-ggpr-page")){p.tablePage+=Number(b.dataset.ggprPage);paint();return;}
 if(b.hasAttribute("data-ggpr-period")){
  const idx=Number(b.dataset.ggprPeriod);if(!Number.isSafeInteger(idx)||!p.groups[idx])return;
  resetDetail();p.selectedIndex=idx;p.kind="ARECEBER";paint();loadDetails(1);return;
 }
 if(b.hasAttribute("data-ggpr-kind")){
  if(!kinds.some(x=>x[0]===b.dataset.ggprKind))return;
  p.kind=b.dataset.ggprKind;p.detailToken++;p.detailBusy=false;p.details=[];p.detailPage=1;p.hasMore=false;paint();loadDetails(1);return;
 }
 if(b.hasAttribute("data-ggpr-detailpage")){if(!p.detailBusy)loadDetails(p.detailPage+Number(b.dataset.ggprDetailpage));return;}
 if(b.hasAttribute("data-ggpr-close")){resetDetail();paint();return;}
 if(b.hasAttribute("data-ggpr-nufin")){openNufin(Number(b.dataset.ggprNufin));return;}
 if(b.hasAttribute("data-ggpr-legacy")){loadLegacy();return;}
}
function onChange(ev){
 const a=ev.target;if(!a||!a.matches)return;
 if(a.matches("[data-ggpr-start],[data-ggpr-end]")){
  const start=a.matches("[data-ggpr-start]");
  if(start)p.start=a.value;else p.end=a.value;
  p.error="";p.data=[];p.groups=[];p.loadedKey="";p.queryToken++;p.busy=false;resetDetail();paint();
 }else if(a.matches("[data-ggpr-group]")){
  if(!["day","week","month"].includes(a.value))return;
  p.group=a.value;p.tablePage=1;resetDetail();calcGroups();paint();
 }
}
window.GGProjecao={
 version:"1.0.1",
 render(context){
  p.ctx=context;
  if(p.root!==context.container){
   if(p.root){
    p.root.removeEventListener("click",onClick);
    p.root.removeEventListener("change",onChange);
    p.root.removeEventListener("pointermove",onPlotMove);
    p.root.removeEventListener("pointerout",onPlotOut);
    p.root.removeEventListener("focusin",onPlotFocus);
    p.root.removeEventListener("focusout",onPlotBlur);
    p.root.removeEventListener("keydown",onPlotKey);
   }
   p.root=context.container;
   p.root.addEventListener("click",onClick);
   p.root.addEventListener("change",onChange);
   p.root.addEventListener("pointermove",onPlotMove);
   p.root.addEventListener("pointerout",onPlotOut);
   p.root.addEventListener("focusin",onPlotFocus);
   p.root.addEventListener("focusout",onPlotBlur);
   p.root.addEventListener("keydown",onPlotKey);
  }
  invalidateIfCompaniesChanged();paint();
 }
};
})();