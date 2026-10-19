/* GoldenGear Fluxo de Caixa — inicialização Pages v0.5.0.
   Interface pública; as consultas financeiras originais ficam no JSP do Sankhya. */
(function () {
  "use strict";
  const pages = [
    {id:"078", title:"Principal", subtitle:"Posição financeira e projeção até 100 dias"},
    {id:"056", title:"Centros de Custo", subtitle:"Módulo em portabilidade"},
    {id:"20P", title:"Receitas por mês", subtitle:"Módulo em portabilidade"},
    {id:"41W", title:"Despesas por mês", subtitle:"Módulo em portabilidade"},
    {id:"0E8", title:"Salários CC", subtitle:"Módulo em portabilidade"},
    {id:"20O", title:"Receitas Pendentes", subtitle:"Módulo em portabilidade"},
    {id:"06B", title:"Despesas Pendentes", subtitle:"Módulo em portabilidade"}
  ];
  const root = document.getElementById("gg-fc-app");
  if (!root) return;
  const state = { page:"078", companies:[], selected:[], busy:false, connection:"Aguardando", counter:null };
  const escapeHtml = s => String(s == null ? "" : s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const query = sql => new Promise((resolve,reject) => {
    if (typeof executeQuery !== "function") { reject(new Error("executeQuery() indisponível no JSP. Verifique snk:load().")); return; }
    try {
      executeQuery(sql, [], raw => {
        try { resolve(Array.isArray(raw) ? raw : JSON.parse(raw || "[]")); }
        catch(e) { reject(new Error("Retorno inválido: "+e.message)); }
      }, error => reject(new Error(typeof error==="string" ? error : (error && error.message) || JSON.stringify(error))));
    } catch(e) { reject(e); }
  });
  function selectedSQL() {
    const ids = state.selected.filter(x=>Number.isSafeInteger(x) && x > 0);
    if (!ids.length) throw new Error("Selecione pelo menos uma empresa.");
    return "("+ids.join(",")+")";
  }
  root.innerHTML =
    '<div class="gg-frame"><aside class="gg-side">'+
      '<div class="gg-brand"><span class="gg-mark">G</span><div><strong>GoldenGear</strong><small>GESTÃO FINANCEIRA</small></div></div>'+
      '<div class="gg-side-caption">FLUXO DE CAIXA</div><nav id="gg-menu" aria-label="Seções do painel"></nav>'+
      '<div class="gg-side-bottom"><span class="gg-pulse"></span> HTML5 Pages · v0.5.0<br><small>Homologação no gadget 465</small></div>'+
    '</aside><main class="gg-main">'+
      '<header class="gg-head"><div><div class="gg-eyebrow">DIRETORIA / SANKHYA</div><h1 id="gg-title">Fluxo de Caixa — Diretoria</h1><p id="gg-subtitle"></p></div>'+
      '<button type="button" class="gg-refresh" id="gg-refresh">↻ Atualizar</button></header>'+
      '<section class="gg-info"><strong>Em homologação financeira.</strong> Os valores são consultados no Sankhya e seguem as regras específicas do XML original. Compare-os ao gadget 380 antes do uso gerencial; algumas seções continuam em migração.</section>'+
      '<div id="gg-body"></div><footer>GoldenGear · Sankhya HTML5 · Somente leitura</footer>'+
    '</main></div>';
  const byId = id => document.getElementById(id);
  function menu() {
    byId("gg-menu").innerHTML = pages.map(p=>'<button type="button" data-page="'+p.id+'" class="gg-nav-item'+(state.page===p.id?" active":"")+'">'+escapeHtml(p.title)+'</button>').join("");
  }
  function render() {
    menu();
    const page = pages.find(x=>x.id===state.page) || pages[0];
    byId("gg-title").textContent = page.id==="078" ? "Fluxo de Caixa — Diretoria" : page.title;
    byId("gg-subtitle").textContent=page.subtitle;
    if (page.id!=="078") {
      if ((page.id==="20O" || page.id==="06B") && window.GGPendentes) {
        window.GGPendentes.render(page.id,{container:byId("gg-body"),companies:state.companies,selected:state.selected,execute:query,setSelected:ids=>{state.selected=ids;}});
        return;
      }
      byId("gg-body").innerHTML='<section class="gg-panel"><div class="gg-kicker">SEÇÃO ORIGINAL · '+escapeHtml(page.id)+'</div><h2>'+escapeHtml(page.title)+'</h2><p>Esta seção está preparada na navegação HTML5. As consultas e o detalhamento financeiro serão migrados na etapa de homologação com o gadget 380.</p></section>';
      return;
    }
    if (window.GGFinancePrincipal && typeof window.GGFinancePrincipal.render === "function") {
      window.GGFinancePrincipal.render({container:byId("gg-body"),companies:state.companies,selected:state.selected,execute:query,setSelected:ids=>{state.selected=ids;}});
      return;
    }
    byId("gg-body").innerHTML =
      '<div class="gg-kicker">CONSULTAS DE VALIDAÇÃO</div>'+
      '<div class="gg-stats"><section class="gg-panel"><div class="gg-kicker">STATUS DE INTEGRAÇÃO</div><h2 id="gg-status">'+escapeHtml(state.connection)+'</h2><p>Consulta de empresas via executeQuery()</p></section>'+
      '<section class="gg-panel"><div class="gg-kicker">TÍTULOS NÃO BAIXADOS</div><h2 id="gg-count">'+(state.counter==null?"—":escapeHtml(Number(state.counter).toLocaleString("pt-BR")))+'</h2><p>Vencimento nos últimos 100 dias. Amostra técnica, não equivale aos indicadores oficiais.</p></section></div>'+
      '<section class="gg-panel"><h2>Empresas</h2><p>Selecione as empresas para validar o filtro de dados financeiros.</p>'+
      '<div id="gg-company-list" class="gg-companies">Consultando empresas...</div>'+
      '<button class="gg-button" id="gg-check" type="button">Validar consulta financeira</button>'+
      '<p role="status" id="gg-feedback" class="gg-feedback">Aguardando consulta...</p></section>';
    companiesMarkup();
  }
  function companiesMarkup() {
    const el=byId("gg-company-list"); if (!el) return;
    el.innerHTML=state.companies.length ? state.companies.map(c =>
      '<label class="gg-check"><input type="checkbox" value="'+c.CODEMP+'"'+(state.selected.includes(c.CODEMP)?" checked":"")+'><span>'+escapeHtml(c.NOMEFANTASIA)+' <small>('+c.CODEMP+')</small></span></label>'
    ).join("") : '<span class="gg-muted">Ainda não foi possível carregar a lista de empresas.</span>';
  }
  async function loadCompanies() {
    state.connection="Conectando...";
    render();
    try {
      const rows=await query("SELECT CODEMP, NOMEFANTASIA FROM TSIEMP ORDER BY NOMEFANTASIA");
      state.companies=(rows||[]).map(x=>({CODEMP:Number(x.CODEMP),NOMEFANTASIA:String(x.NOMEFANTASIA||"Empresa")})).filter(c=>Number.isSafeInteger(c.CODEMP)&&c.CODEMP>0);
      if (!state.companies.length) throw new Error("Nenhuma empresa retornada.");
      const preferred=state.companies.filter(c=>[1,2,3].includes(c.CODEMP));
      const initial=(preferred.length?preferred:state.companies).map(c=>c.CODEMP);
      state.selected=state.selected.length ? state.selected.filter(x=>state.companies.some(c=>c.CODEMP===x)) : initial;
      state.connection="Conectado";
      render();
      if (window.GGFinancePrincipal) await window.GGFinancePrincipal.load();
      else await financialCount();
    } catch(e) {
      state.connection="Falha na consulta";
      render();
      setFeedback("Não foi possível carregar empresas: "+String(e.message||e),true);
    }
  }
  function setFeedback(s,fail) {
    const el=byId("gg-feedback"); if (!el) return;
    el.textContent=s;el.className="gg-feedback"+(fail?" fail":"");
  }
  async function financialCount() {
    if (state.busy) return;
    state.busy=true;
    const button=byId("gg-check");if(button)button.disabled=true;
    setFeedback("Consultando títulos pelo Sankhya...",false);
    try {
      const sql="SELECT COUNT(*) AS QTD FROM TGFFIN WHERE DHBAIXA IS NULL AND RECDESP IN (-1,1) AND CODEMP IN "+selectedSQL()+" AND DTVENC >= TRUNC(SYSDATE)-100 AND DTVENC < TRUNC(SYSDATE)+1";
      const rows=await query(sql);
      const n=Number(rows[0]&&rows[0].QTD);
      if (!Number.isFinite(n)) throw new Error("A consulta não retornou o total esperado.");
      state.counter=n;
      const el=byId("gg-count");if(el)el.textContent=n.toLocaleString("pt-BR");
      setFeedback("Consulta de leitura realizada com sucesso. Próximo passo: conciliar os indicadores com o gadget 380.",false);
    } catch(e) {
      setFeedback("Falha na consulta de validação: "+String(e.message||e),true);
    } finally {
      state.busy=false;
      const b=byId("gg-check");if(b)b.disabled=false;
    }
  }
  root.addEventListener("click",event=>{
    const btn=event.target.closest("[data-page]");
    if (btn) { state.page=btn.dataset.page; render(); return; }
    if (event.target.closest("#gg-refresh")) {loadCompanies();return;}
    if (event.target.closest("#gg-check")) {
      const checkboxes=[...byId("gg-company-list").querySelectorAll('input[type="checkbox"]:checked')];
      state.selected=checkboxes.map(x=>Number(x.value)).filter(Number.isSafeInteger);
      financialCount();
    }
  });
  window.GGFluxoCaixa={version:"0.5.0",openSection:id=>{state.page=id;render();},getCurrentPage:()=>state.page,reload:loadCompanies,runSQL:query,getCompanies:()=>state.companies.slice(),getSelected:()=>state.selected.slice()};
  loadCompanies();
})();