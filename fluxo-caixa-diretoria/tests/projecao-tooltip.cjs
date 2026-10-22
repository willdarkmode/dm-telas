/* Regressão do tooltip na projeção: valores exatos, proximidade do ponto, teclado e sem SQL adicional. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const code=fs.readFileSync(path.join(__dirname,"..","js","projecao.js"),"utf8");
const callbacks={},calls=[];
const attrs={};
const marker=()=>({setAttribute(k,v){this[k]=v;}});
const focus=marker(),guide=marker(),ar=marker(),ap=marker(),saldo=marker();
const svg={getBoundingClientRect:()=>({left:100,top:100,width:970,height:265}),
 querySelector(q){return q==="[data-ggpr-focus]"?focus:q==="[data-ggpr-focus-line]"?guide:
 q==='[data-ggpr-focus-marker="ar"]'?ar:q==='[data-ggpr-focus-marker="ap"]'?ap:saldo;},
 matches(q){return q==="svg[data-ggpr-plot]";},contains:()=>false};
const shell={getBoundingClientRect:()=>({left:100,top:100,width:970,height:265})};
const tip={hidden:true,innerHTML:"",style:{},offsetWidth:280,offsetHeight:128};
const host={innerHTML:"",id:"gg-projecao-periodo"};
const root={querySelector(q){return q==="#gg-projecao-periodo"?host:
 q==="svg[data-ggpr-plot]"?svg:q===".ggpr-chart-shell"?shell:
 q==="[data-ggpr-tooltip]"?tip:null;},
 appendChild(){},addEventListener(name,fn){callbacks[name]=fn;},removeEventListener(){}};
const fakeWindow={GGFluxoCaixa:{getCurrentPage:()=>"078"},
 GGFluxoOriginalSQL:{grd_1BP:"SELECT CODEMP FROM TSIEMP WHERE CODEMP IN :CODEMP"},
 GGFluxoPeriodoSQL:{diario:"SELECT ':DATA_INICIO', ':DATA_FIM' FROM DUAL WHERE CODEMP IN :CODEMP",
 titulos:"SELECT NUFIN FROM TGFFIN WHERE CODEMP IN :CODEMP ORDER BY NUFIN"}};
fakeWindow.parent=fakeWindow;fakeWindow.top=fakeWindow;
vm.runInNewContext(code,{window:fakeWindow,document:{createElement:()=>host},console});
function iso(i){return new Date(Date.UTC(2026,9,22+i)).toISOString().slice(0,10);}
const rows=Array.from({length:14},(_,i)=>({
 DT_REF:iso(i),ARECEBER_DIA:100,APAGAR_DIA:-40,RECEBIDO_DIA:30,PAGO_DIA:-10,
 ARECEBER_ACUMULADO:(i+1)*100,APAGAR_ACUMULADO:(i+1)*-40,
 RECEBIDO_ACUMULADO:(i+1)*30,PAGO_ACUMULADO:(i+1)*-10,SALDO_ACUMULADO:(i+1)*60}));
fakeWindow.GGProjecao.render({container:root,companies:[{CODEMP:1,NOMEFANTASIA:"Empresa teste"}],selected:[1],
 execute:async sql=>{calls.push(sql);return rows;},setSelected(){}});
function change(name,value){callbacks.change({target:{value,matches:q=>q.split(",").includes("["+name+"]")}});}
const button={hasAttribute:k=>k==="data-ggpr-run"};
async function main(){
 change("data-ggpr-start",iso(0));change("data-ggpr-end",iso(13));
 callbacks.click({target:{closest:x=>x==="button"?button:null}});
 await new Promise(r=>setTimeout(r,30));
 assert.equal(calls.length,1);
 assert.match(host.innerHTML,/data-ggpr-plot/);
 assert.match(host.innerHTML,/data-ggpr-focus-marker="saldo"/);
 assert.match(host.innerHTML,/data-ggpr-tooltip/);
 callbacks.pointermove({target:{closest:x=>x==="svg[data-ggpr-plot]"?svg:null},clientX:172});
 assert.equal(tip.hidden,false);
 assert.match(tip.innerHTML,/22\/10\/2026/);
 // Agrupamento padrão semanal: o primeiro ponto acumula sete dias.
 assert.match(tip.innerHTML,/700,00/);
 assert.match(tip.innerHTML,/-R\$\s*280,00/);
 assert.match(tip.innerHTML,/420,00/);
 assert.equal(guide.x1,72);
 callbacks.pointermove({target:{closest:x=>x==="svg[data-ggpr-plot]"?svg:null},clientX:1027});
 assert.match(tip.innerHTML,/29\/10\/2026/);
 assert.match(tip.innerHTML,/1\.400,00/);
 assert.match(tip.innerHTML,/560,00/);
 assert.match(tip.innerHTML,/840,00/);
 assert.equal(guide.x1,927);
 assert.ok(Number.parseFloat(tip.style.left)>=0);
 assert.equal(calls.length,1,"Mover o mouse não deve executar novas SQLs");
 callbacks.pointerout({target:{closest:x=>x==="svg[data-ggpr-plot]"?svg:null},relatedTarget:null});
 assert.equal(tip.hidden,true);
 callbacks.focusin({target:svg});
 assert.equal(tip.hidden,false);
 callbacks.keydown({target:svg,key:"ArrowLeft",preventDefault(){}});
 assert.match(tip.innerHTML,/22\/10\/2026/);
 callbacks.keydown({target:svg,key:"Escape",preventDefault(){}});
 assert.equal(tip.hidden,true);
 console.log("PASS: tooltip semanal, valores 3 séries, mouse, teclado e nenhuma SQL extra");
}
main().catch(e=>{console.error(e);process.exitCode=1});
