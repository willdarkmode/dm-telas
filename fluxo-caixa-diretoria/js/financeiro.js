/* GoldenGear · Principal do Fluxo de Caixa v0.3.4
   Apenas visualização: as 5 consultas originais ficam no JSP do Sankhya.
   Utiliza a MESMA função executeQuery do app Pages v0.2 funcional. */
(function(){
"use strict";
const specs=[
 ["svl_2EJ","Receitas","2025","in"],["svl_05Q","Despesas","2025","out"],
 ["svl_05V","Receitas","Próximos 12 meses","in"],["svl_05W","Despesas","Próximos 12 meses","out"]
];
const order=["Hoje","5 dias","10 dias","20 dias","30 dias","40 dias","50 dias","60 dias","70 dias","80 dias","90 dias","100 dias"];
const cols=[["AReceber_Acumulado","A receber"],["APagar_Acumulado","A pagar"],["Recebido_Acumulado","Recebido"],["Pago_Acumulado","Pago"],["Saldo_Acumulado","Saldo"]];
const st={ctx:null,root:null,rows:{},errors:{},loading:false,version:0};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const field=(r,k)=>{if(!r)return 0;const key=Object.keys(r).find(x=>x.toUpperCase()===k.toUpperCase());const n=Number(key?r[key]:0);return Number.isFinite(n)?n:0;};
const money=x=>Number(x||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function codes(){
 const chosen=st.ctx.selected.filter(x=>Number.isSafeInteger(x)&&x>0&&st.ctx.companies.some(c=>Number(c.CODEMP)===x));
 if(!chosen.length)throw Error("Selecione pelo menos uma empresa.");
 return "("+chosen.join(",")+")";
}
function sql(id){
 const raw=window.GGFluxoOriginalSQL&&window.GGFluxoOriginalSQL[id];
 if(typeof raw!=="string")throw Error("Consulta "+id+" não encontrada no JSP. Importe a v0.3.4.");
 return raw.replace(/:CODEMP\b/g,codes());
}
function card(spec){
 const [id,label,period,type]=spec,rows=st.rows[id],r=Array.isArray(rows)?rows[0]:null;
 const err=st.errors[id],pending=st.loading&&!rows&&!err;
 return '<article class="gg-panel ggf-card ggf-'+type+'"><div class="gg-kicker">'+esc(period)+'</div><h3>'+label+'</h3>'+
 '<strong class="ggf-big">'+(pending?"Consultando…":err?"Erro":r?money(field(r,"SALDO")):"—")+'</strong>'+
 '<div class="ggf-parts"><span>Baixados <b>'+(!err&&r?money(field(r,"BAIXADOS")):"—")+'</b></span>'+
 '<span>Pendentes <b>'+(!err&&r?money(field(r,"PENDENTES")):"—")+'</b></span></div>'+
 (err?'<p class="ggf-error">'+esc(err)+'</p>':'')+'</article>';
}
function series(input){
 const x=input; if(!Array.isArray(x))return [];
 return x.filter(r=>order.includes(String(r.PERIODO))).sort((a,b)=>order.indexOf(a.PERIODO)-order.indexOf(b.PERIODO));
}
function plot(rows){
 if(!rows.length)return '<p class="ggf-muted">Nenhum período retornado pela consulta.</p>';
 const traces=[
  {key:"AReceber_Acumulado",label:"A receber",color:"#0b9780"},
  {key:"APagar_Acumulado",label:"A pagar",color:"#d66378"},
  {key:"Saldo_Acumulado",label:"Saldo projetado",color:"#2d659a"}
 ];
 const all=traces.flatMap(t=>rows.map(r=>field(r,t.key)));
 const lo=Math.min(0,...all),hi=Math.max(0,...all);
 const X=i=>70+820*i/Math.max(1,rows.length-1),Y=v=>22+(hi-v)/(hi-lo||1)*176;
 const ticks=[0,.25,.5,.75,1].map(t=>{
   const v=lo+(hi-lo)*t,y=Y(v);
   return '<line x1="70" y1="'+y+'" x2="890" y2="'+y+'" stroke="#e3eaf0"/>'+
   '<text x="61" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#687c8e">'+esc((v/1000).toLocaleString("pt-BR",{maximumFractionDigits:0}))+' mil</text>';
 }).join("");
 const lines=traces.map(t=>{
   const points=rows.map((r,i)=>X(i)+","+Y(field(r,t.key))).join(" ");
   return '<polyline points="'+points+'" stroke="'+t.color+'" stroke-width="'+(t.key==="Saldo_Acumulado"?3.5:2.5)+'" fill="none" stroke-linejoin="round"/>'+
    rows.map((r,i)=>'<circle cx="'+X(i)+'" cy="'+Y(field(r,t.key))+'" r="'+(t.key==="Saldo_Acumulado"?4:2.5)+'" fill="'+t.color+'"><title>'+esc(t.label+' · '+r.PERIODO)+': '+esc(money(field(r,t.key)))+'</title></circle>').join("");
 }).join("");
 const labels=rows.map((r,i)=>'<text x="'+X(i)+'" y="237" text-anchor="middle" font-size="11" fill="#687c8e">'+esc(String(r.PERIODO).replace(" dias","d"))+'</text>').join("");
 const legend='<div class="ggf-legend">'+traces.map(t=>'<span><i style="background:'+t.color+'"></i>'+t.label+'</span>').join("")+'</div>';
 return legend+'<div class="ggf-chart"><svg viewBox="0 0 920 250" role="img" aria-label="Três séries acumuladas: a receber, a pagar e saldo projetado até 100 dias">'+ticks+lines+labels+'</svg></div>';
}
function table(rows){
 if(!rows.length)return "";
 return '<div class="ggf-table-wrap"><table class="ggf-table"><thead><tr><th>Horizonte</th>'+cols.map(c=>'<th>'+c[1]+'</th>').join("")+'</tr></thead><tbody>'+
 rows.map(r=>'<tr><th>'+esc(r.PERIODO)+'</th>'+cols.map(c=>'<td>'+money(field(r,c[0]))+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
}
function paint(){
 if(!st.ctx)return;
 if(window.GGFluxoCaixa && window.GGFluxoCaixa.getCurrentPage()!=="078")return;
 st.ctx.container.innerHTML='<section class="gg-panel ggf-filter"><div><div class="gg-kicker">EMPRESAS SELECIONADAS</div><div class="ggf-companies">'+
 st.ctx.companies.map(c=>'<label class="gg-check"><input type="checkbox" class="ggf-company" value="'+Number(c.CODEMP)+'"'+(st.ctx.selected.includes(Number(c.CODEMP))?" checked":"")+'><span>'+esc(c.NOMEFANTASIA)+' <small>('+Number(c.CODEMP)+')</small></span></label>').join("")+
 '</div></div><button class="gg-button" type="button" data-ggf-apply'+(st.loading?' disabled':'')+'>Aplicar filtro</button></section>'+
 '<div class="ggf-heading"><div class="gg-kicker">INDICADORES ORIGINAIS · GADGET 380</div><h2>Receitas e despesas</h2><p>Períodos originais, sujeitos a conciliação financeira.</p></div>'+
 '<div class="ggf-cards">'+specs.map(card).join("")+'</div>'+
 '<p class="ggf-status" role="status">'+(st.loading?'Consultando Sankhya…':'Homologação pendente: comparar os resultados com o gadget 380.')+'</p>';
 if (window.GGProjecao && typeof window.GGProjecao.render === 'function') window.GGProjecao.render(st.ctx);
 if (window.GGPrincipalExtras && typeof window.GGPrincipalExtras.render === 'function') window.GGPrincipalExtras.render(st.ctx);
}
async function load(){
 if(!st.ctx||st.loading||!st.ctx.selected.length)return;
 const serial=++st.version;
 st.loading=true;st.rows={};st.errors={};paint();
 for(const id of specs.map(x=>x[0])){
  try { const result=await st.ctx.execute(sql(id));if(serial!==st.version)return;st.rows[id]=Array.isArray(result)?result:[]; }
  catch(e){if(serial===st.version)st.errors[id]=String(e&&e.message||e);}
  paint();
 }
 st.loading=false;paint();
 if (window.GGPrincipalExtras && typeof window.GGPrincipalExtras.load === "function") await window.GGPrincipalExtras.load(true);
}
function click(ev){
 if(!ev.target.closest("[data-ggf-apply]")||!st.ctx)return;
 const selected=[...st.ctx.container.querySelectorAll(".ggf-company:checked")].map(x=>Number(x.value)).filter(Number.isSafeInteger);
 if(!selected.length){window.alert("Selecione ao menos uma empresa.");return;}
 st.ctx.selected=selected;st.ctx.setSelected(selected);load();
}
window.GGFinancePrincipal={
 version:"0.9.1",
 legacyPreview(rows){return plot(series(rows));},
 render(args){st.ctx=args;if(st.root!==args.container){if(st.root)st.root.removeEventListener("click",click);st.root=args.container;st.root.addEventListener("click",click);}paint();},
 load
};
})();