/* P&R · Exercício anual compartilhado · v1.0.2
 * Adaptador restrito às nove SQLs do exercício, sem publicar SQL financeira.
 * Nunca substituir números 2025 em CODTIPOPER, CODNAT ou demais constantes. */
(function(){
"use strict";
const targets=new Set(["cht_0RO","cht_05K","grd_09D","cht_0IL","grd_2OZ",
 "grd_20V","cht_20W","grd_464","cht_465"]);
const base=2025;
const currentYear=()=>new Date().getFullYear();
const valid=y=>Number.isSafeInteger(y)&&y>=2021&&y<=Math.max(2027,currentYear()+1);
function parse(y){
 const n=typeof y==="number"?y:Number(y);
 if(!valid(n))throw Error("Exercício inválido. Selecione um ano da lista.");
 return n;
}
function options(selected){
 const year=parse(selected),end=Math.max(2027,currentYear()+1,year);
 let html="";
 for(let y=end;y>=2021;y--)html+='<option value="'+y+'"'+(year===y?' selected':'')+'>'+y+'</option>';
 return html;
}
function prepare(original,id,year){
 const y=parse(year);
 if(!targets.has(id))throw Error("O seletor de exercício não se aplica à consulta "+id+".");
 if(typeof original!=="string"||!original.trim())throw Error("SQL anual ausente: "+id+".");
 if(!original.includes("01/01/2025")||!original.includes("31/12/2025"))
   throw Error("Formato do exercício original inesperado na consulta "+id+".");
 if(y===base)return original;
 const yy=String(y).slice(-2);
 // SOMENTE datas dd/mm/2025, aliases mensais _2025 e rótulos abreviados /25.
 // IDs de TOP, natureza e empresa não são tocados.
 const result=original
   .replace(/\b(\d{2}\/\d{2}\/)2025\b/g,(_,prefix)=>prefix+y)
   .replace(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|SETE|OUT|NOV|DEZ)_2025\b/g,(_,m)=>m+"_"+y)
   .replace(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\/25\b/g,(_,m)=>m+"/"+yy);
 if(result===original||result.includes("01/01/2025")||result.includes("31/12/2025"))
   throw Error("Não foi possível aplicar exercício "+y+" à consulta "+id+".");
 return result;
}
window.GGExercicio={version:"1.0.2",currentYear,parse,options,prepare,targets:[...targets]};
})();
