const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","js","projecao.js"),"utf8");
const events={},calls=[],opened=[],panel={innerHTML:"",id:"gg-projecao-periodo"};
const root={querySelector(s){return s==="#gg-projecao-periodo"?panel:null;},appendChild(){},
 addEventListener(k,v){events[k]=v;},removeEventListener(){}};
const w={GGFluxoCaixa:{getCurrentPage:()=>"078"},
 GGFluxoOriginalSQL:{grd_1BP:"SELECT 'LEGACY_GRID' AS TIPO FROM DUAL WHERE CODEMP IN :CODEMP",cht_1JA:"SELECT 'LEGACY_CHART' AS PERIODO FROM DUAL WHERE CODEMP IN :CODEMP"},
 GGFinancePrincipal:{legacyPreview:rows=>'<section class="ggpr-test-chart">Gráfico de referência '+rows.length+'</section>'},
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
let longMode=false;
const execute=async sql=>{
 calls.push(sql);
 if(sql.includes("LEGACY_CHART"))return [{PERIODO:"Hoje",AReceber_Acumulado:100,APagar_Acumulado:-40,Saldo_Acumulado:60}];
 if(sql.includes("LEGACY_GRID"))return [{TIPO:"Total",Hoje:60,ORDEM:1}];
 if(sql.includes("OFFSET "))return [{NUFIN:789,NUMNOTA:21,NOMEPARC:"Teste",CODEMP:1,DTVENC:"20/10/2026",VALOR:100}];
 if(!longMode)return data;
 const dates=[...sql.matchAll(/'(\d{4}-\d{2}-\d{2})'/g)];
 const start=dates[0][1],end=dates[1][1];
 const days=Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;
 // Simula um conector que trunca qualquer resposta a 90 linhas.
 return Array.from({length:Math.min(days,90)},(_,i)=>({
   DT_REF:new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10),
   ARECEBER_DIA:100,APAGAR_DIA:-40,RECEBIDO_DIA:70,PAGO_DIA:-20,
   ARECEBER_ACUMULADO:(i+1)*100,APAGAR_ACUMULADO:(i+1)*-40,
   RECEBIDO_ACUMULADO:(i+1)*70,PAGO_ACUMULADO:(i+1)*-20,
   SALDO_ACUMULADO:(i+1)*60
 }));
};
w.GGProjecao.render({container:root,companies:[{CODEMP:1,NOMEFANTASIA:"Teste"}],selected:[1],execute,setSelected(){}});
const click=(attribute,value)=>{
 const prop=attribute.replace("data-","").replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
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
 // Consulta 101 dias: backend devolve só 90 linhas. Deve reconsultar 90+11
 // e recompor o saldo acumulado entre lotes (não zerar no segundo lote).
 longMode=true;
 change("data-ggpr-end",iso(100));
 click("data-ggpr-run");await wait();
 assert.equal(calls.length,5,"uma consulta inicial truncada e dois lotes de recuperação");
 assert.match(panel.innerHTML,/6\.060,00/,"Saldo final deve somar os dois lotes");
 assert.equal(calls.filter(x=>x.includes("LEGACY_")).length,0,"Referência original não deve consultar automaticamente");
 assert.match(panel.innerHTML,/Comparar com o gadget 380/);
 click("data-ggpr-legacy");await wait();
 assert.equal(calls.filter(x=>x.includes("LEGACY_")).length,2,"Gráfico e grade legados consultados apenas por clique");
 assert.match(panel.innerHTML,/Gráfico de referência/);
 console.log("PASS: datas livres, 730 dias, NUFIN e referência antiga sob demanda");
})().catch(e=>{console.error(e);process.exit(1)});
