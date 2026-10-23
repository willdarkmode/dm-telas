/* Testes anuais sem SQL privado: anos, aliases, filtros e mudança de contexto. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const base=path.join(__dirname,"..","js");
const load=(name,scope)=>vm.runInNewContext(fs.readFileSync(path.join(base,name),"utf8"),scope);
const window={GGFluxoCaixa:{getCurrentPage:()=>"20P"}};
load("exercicio.js",{window,Date,console});
const eg=window.GGExercicio;
assert.equal(eg.version,"1.0.2");
assert.match(eg.options(2026),/value="2026" selected/);
const ids=eg.targets;
assert.equal(ids.length,9);
const template="SELECT CODTIPOPER, CODNAT, CODEMP, SUM(CASE WHEN FIN.DHBAIXA BETWEEN TO_DATE('01/01/2025','DD/MM/YYYY') AND TO_DATE('31/12/2025','DD/MM/YYYY') THEN FIN.VLRBAIXA ELSE 0 END) JAN_2025, 'jan/25' AS MES FROM TGFFIN FIN WHERE CODEMP IN :CODEMP AND FIN.CODTIPOPER IN (2025, 2026) AND FIN.CODNAT=2025";
for(const id of ids){
 assert.equal(eg.prepare(template,id,2025),template,"2025 preserva SQL byte a byte");
 const q=eg.prepare(template,id,2026);
 assert.match(q,/01\/01\/2026/);
 assert.match(q,/31\/12\/2026/);
 assert.match(q,/JAN_2026/);
 assert.match(q,/'jan\/26'/);
 assert.match(q,/CODTIPOPER IN \(2025, 2026\)/,"não troca números de TOP");
 assert.match(q,/CODNAT=2025/,"não troca natureza");
 assert.doesNotMatch(q,/JAN_2025/);
}
assert.throws(()=>eg.prepare(template,"svl_2EJ",2026),/não se aplica/);
assert.throws(()=>eg.prepare(template,"cht_0RO",2020),/inválido/);
const host={dataset:{},innerHTML:"",handlers:{},
 addEventListener(event,fn){this.handlers[event]=fn;},
 querySelector(){return null;},querySelectorAll(){return [];}};
const sqls={cht_20W:template,grd_20V:template};
let requested=[],selectedYear=2026;
window.GGFluxoOriginalSQL=sqls;
const page="20P";
const getChart=q=>[{MES:q.includes("'jan/26'")?"jan/26":"jan/25",RECEITA:700,DESPESA:400}];
const getGrid=q=>[{DESCRNAT:"Teste",NATUREZA:1,[q.includes("JAN_2026")?"JAN_2026":"JAN_2025"]:700}];
load("mensal.js",{window,console,Number,Array,Date});
const options=(year)=>({container:host,companies:[{CODEMP:1,NOMEFANTASIA:"Empresa de teste"}],
 selected:[1],year,setYear:y=>{selectedYear=y;},setSelected(){},
 execute:async q=>{requested.push(q);return q.includes("AS MES")?getChart(q):getGrid(q);}});
const sleep=()=>new Promise(resolve=>setTimeout(resolve,30));
(async()=>{
 window.GGMensal.render(page,options(2026));await sleep();
 assert.equal(requested.length,2);
 assert.match(host.innerHTML,/EXERCÍCIO 2026/);
 assert.match(host.innerHTML,/Janeiro DE 2026/);
 assert.match(host.innerHTML,/Total de 2026/);
 assert.match(host.innerHTML,/R\$\s*700,00/);
 assert.match(requested[0],/jan\/26/);
 assert.match(requested[1],/JAN_2026/);
 // Uma consulta em andamento de outro ano não pode sobrescrever os resultados.
 window.GGMensal.render(page,options(2025));await sleep();
 assert.equal(requested.length,4);
 assert.match(host.innerHTML,/EXERCÍCIO 2025/);
 assert.match(host.innerHTML,/Total de 2025/);
 assert.match(requested[2],/jan\/25/);
 assert.match(requested[3],/JAN_2025/);
 host.handlers.change({target:{value:"2026",closest:s=>s==="[data-ggm-exercise]"?{value:"2026"}:null}});
 assert.equal(selectedYear,2026,"seletor encaminha ano ao estado global");
 console.log("PASS: nove SQLs parametrizadas, TOP preservado, 2025 idêntico, gráfico e grade mensal 2026⇄2025");
})().catch(err=>{console.error(err);process.exitCode=1});
