/* Regression of single default projection: 100-day SQL only loads upon user request. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const code=fs.readFileSync(path.join(__dirname,"..","js","financeiro.js"),"utf8");
const ids=["svl_2EJ","svl_05Q","svl_05V","svl_05W"];
const sqls=Object.fromEntries(ids.map(id=>[id,"SELECT '"+id+"' AS RESULT FROM DUAL WHERE CODEMP IN :CODEMP"]));
sqls.cht_1JA="SELECT 'ORIGINAL_100_DIAS' FROM DUAL WHERE CODEMP IN :CODEMP";
let customPaints=0,extrasPaints=0,extrasLoads=0;
const fakeWindow={GGFluxoOriginalSQL:sqls,GGFluxoCaixa:{getCurrentPage:()=>"078"},
 GGProjecao:{render:()=>customPaints++},
 GGPrincipalExtras:{render:()=>extrasPaints++,load:async()=>extrasLoads++}};
const sandbox={window:fakeWindow,console};vm.createContext(sandbox);vm.runInContext(code,sandbox);
const executed=[],root={innerHTML:"",addEventListener(){},removeEventListener(){}};
const context={container:root,companies:[{CODEMP:1,NOMEFANTASIA:"Empresa de teste"}],selected:[1],
 execute:async sql=>{executed.push(sql);return [{SALDO:100,BAIXADOS:70,PENDENTES:30}];},setSelected(){}};
(async()=>{
 fakeWindow.GGFinancePrincipal.render(context);
 assert.equal(customPaints,1,"Projection must render from main container");
 assert.doesNotMatch(root.innerHTML,/FLUXO ACUMULADO · 100 DIAS/);
 assert.match(root.innerHTML,/INDICADORES ORIGINAIS/);
 await fakeWindow.GGFinancePrincipal.load();
 assert.equal(executed.length,4,"Only four executive indicator SQLs must run initially");
 assert.equal(executed.some(x=>x.includes("ORIGINAL_100_DIAS")),false);
 assert.ok(customPaints>=2);assert.ok(extrasPaints>=2);assert.equal(extrasLoads,1);
 const preview=fakeWindow.GGFinancePrincipal.legacyPreview([
  {PERIODO:"Hoje",AReceber_Acumulado:100,APagar_Acumulado:-50,Saldo_Acumulado:50}]);
 assert.match(preview,/svg/,"Original chart can still be drawn on request");
 console.log("PASS: uma única projeção padrão e comparação legada sob demanda");
})().catch(e=>{console.error(e);process.exit(1)});
