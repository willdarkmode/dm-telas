const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","js","projecao.js"),"utf8");
const events={},calls=[],opened=[],panel={innerHTML:"",id:"gg-projecao-periodo"};
const root={querySelector(s){return s==="#gg-projecao-periodo"?panel:null;},appendChild(){},
 addEventListener(k,v){events[k]=v;},removeEventListener(){}};
const w={GGFluxoCaixa:{getCurrentPage:()=>"078"},
 GGFluxoOriginalSQL:{grd_1BP:"SELECT CODEMP FROM TSIEMP WHERE CODEMP IN :CODEMP"},
 GGFluxoPeriodoSQL:{
 diario:"SELECT ':DATA_INICIO' INICIO, ':DATA_FIM' FIM FROM DUAL WHERE CODEMP IN :CODEMP",
 titulos:"SELECT ':DET_INICIO',':DET_FIM' FROM TGFFIN WHERE CODEMP IN :CODEMP AND RECDESP=:RECDESP AND MODO=:MODO ORDER BY NUFIN"},
 openApp:(...args)=>opened.push(args)};
w.parent=w;w.top=w;
const context={window:w,document:{createElement(){return panel;}},console};
vm.createContext(context);vm.runInContext(src,context);
function iso(i){return new Date(Date.UTC(2026,9,20+i)).toISOString().slice(0,10);}
const data=Array.from({length:7},(_,i)=>({
 DT_REF:iso(i),ARECEBER_DIA:100,APAGAR_DIA:-40,RECEBIDO_DIA:70,PAGO_DIA:-20,
 ARECEBER_ACUMULADO:100*(i+1),APAGAR_ACUMULADO:-40*(i+1),RECEBIDO_ACUMULADO:70*(i+1),
 PAGO_ACUMULADO:-20*(i+1),SALDO_ACUMULADO:60*(i+1)}));
const execute=async sql=>{calls.push(sql);return sql.includes("OFFSET ")?[{NUFIN:789,NUMNOTA:21,NOMEPARC:"Teste",CODEMP:1,DTVENC:"20/10/2026",VALOR:100}]:data;};
w.GGProjecao.render({container:root,companies:[{CODEMP:1,NOMEFANTASIA:"Teste"}],selected:[1],execute,setSelected(){}});
const click=(attribute,value)=>{
 const prop=attribute.replace("data-ggpr-","").replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
 const button={dataset:{[prop]:String(value)},hasAttribute:k=>k===attribute};
 events.click({target:{closest:tag=>tag==="button"?button:null}});
};
const change=(attribute,value)=>{
 const node={value,matches:selector=>selector.split(",").some(s=>s==="["+attribute+"]")};
 events.change({target:node});
};
const wait=()=>new Promise(resolve=>setTimeout(resolve,25));
(async()=>{
 assert.match(panel.innerHTML,/730 dias/);
 change("data-ggpr-start","2026-10-20");change("data-ggpr-end","2026-10-26");
 click("data-ggpr-run");await wait();
 assert.equal(calls.length,1);assert.match(calls[0],/2026-10-20/);assert.match(calls[0],/2026-10-26/);
 assert.match(calls[0],/CODEMP IN \(1\)/);assert.match(panel.innerHTML,/Projeção acumulada/);
 assert.match(panel.innerHTML,/420,00/);
 click("data-ggpr-period",0);await wait();
 assert.equal(calls.length,2);assert.match(calls[1],/OFFSET 0 ROWS FETCH NEXT 50 ROWS ONLY/);
 assert.match(panel.innerHTML,/data-ggpr-nufin="0"/);
 click("data-ggpr-nufin",0);
 assert.equal(opened.length,1);
 assert.equal(opened[0][0],"br.com.sankhya.fin.cad.movimentacaoFinanceira");
 assert.equal(opened[0][1].NUFIN,789);
 change("data-ggpr-end","2028-10-20");click("data-ggpr-run");await wait();
 assert.match(panel.innerHTML,/intervalo máximo é de 730 dias/);
 assert.equal(calls.length,2,"Invalid range must not query database");
 console.log("PASS: datas personalizadas, limite 730, drilldown e NUFIN");
})().catch(e=>{console.error(e);process.exit(1)});
