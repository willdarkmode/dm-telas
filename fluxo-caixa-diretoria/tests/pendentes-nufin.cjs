/* Teste de regressão da navegação NUFIN, sem acesso ao Sankhya. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const code=fs.readFileSync(require("node:path").join(__dirname,"..","js","pendentes.js"),"utf8");
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
async function scenario(native){
  const calls=[],handlers={};
  const host={dataset:{},innerHTML:"",addEventListener(name,fn){handlers[name]=fn;},querySelectorAll(){return [];}};
  const w={GGFluxoOriginalSQL:{
    grd_0LY:"SELECT CODEMP FROM TSIEMP WHERE CODEMP IN :CODEMP",
    grd_0LW:"SELECT NUFIN FROM TGFFIN WHERE MES=:MES"
  },GGFluxoCaixa:{getCurrentPage(){return "20O";}}};
  w.parent=w;w.top=w;
  if(native) w.openApp=(...args)=>calls.push(args);
  const ctx={window:w,navigator:{clipboard:{writeText:async value=>calls.push(["copy",value])}},Number,String,Array,JSON,Error,Object,Promise,console};
  vm.createContext(ctx);
  vm.runInContext(code,ctx);
  const execute=async sql=>sql.includes("SELECT CODEMP")?
    [{MES:"2025",ARECEBER:100,VENCIDO:10,AVENCER:90}]:
    [{NUFIN:13579,NUMNOTA:123,NOMEPARC:"Empresa teste",DTVENC:"01/01/2025",VALOR:100,STATUS:"Aberto"}];
  w.GGPendentes.render("20O",{container:host,companies:[{CODEMP:1,NOMEFANTASIA:"Empresa teste"}],selected:[1],execute,setSelected(){}});
  await sleep(15);
  const fire=d=>handlers.click({target:{closest:selector=>Object.prototype.hasOwnProperty.call(d,selector)?d[selector]:null}});
  fire({"[data-period]":{dataset:{period:"0"}}});
  await sleep(15);
  assert.match(host.innerHTML,/data-pend-open="0"/);
  fire({"[data-pend-open]":{dataset:{pendOpen:"0"}}});
  if(native){
    assert.equal(calls.length,1);
    assert.equal(calls[0][0],"br.com.sankhya.fin.cad.movimentacaoFinanceira");
    assert.equal(calls[0][1].NUFIN,13579);
    assert.match(host.innerHTML,/Solicitação de abertura enviada/);
  } else {
    assert.equal(calls.length,0);
    assert.match(host.innerHTML,/openApp\(\) não está disponível/);
    assert.match(host.innerHTML,/data-pend-copy="0"/);
    fire({"[data-pend-copy]":{dataset:{pendCopy:"0"}}});
    await sleep(10);
    assert.equal(calls[0][0],"copy");
    assert.equal(calls[0][1],"13579");
  }
}
(async()=>{await scenario(true);await scenario(false);console.log("PASS: NUFIN nativo e fallback Copiar");})().catch(e=>{console.error(e);process.exit(1)});
