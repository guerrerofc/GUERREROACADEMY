// ===== Router: #admin muestra admin, si no, muestra landing =====
(function () {
  const adminApp = document.getElementById("adminApp");
  if (!adminApp) return;

  const landingEls = Array.from(document.querySelectorAll(".landing, #landingHero"));

  function renderRoute() {
    const isAdmin = (location.hash || "") === "#admin";
    adminApp.style.display = isAdmin ? "block" : "none";
    landingEls.forEach(el => el.style.display = isAdmin ? "none" : "");
    if (isAdmin) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  const back = document.getElementById("backToSite");
  back?.addEventListener("click", (e) => {
    e.preventDefault();
    location.hash = "";
  });
})();


// ===== NIVEL DIOS: Cupo Intelligence + Confetti + Auto WhatsApp =====
(function(){
  const chip = document.getElementById("chipCupo");
  const chipTxt = document.getElementById("chipCupoText");
  const chipTag = document.getElementById("chipTag");
  const cupoHint = document.getElementById("fCupoHint");
  const inscSuccess = document.getElementById("inscSuccess");
  const inscForm = document.getElementById("inscForm");
  const okWhats = document.getElementById("okWhats");
  const okAgain = document.getElementById("okAgain");
  const okText = document.getElementById("okText");

  if (!chip || !cupoHint || !inscForm) return;

  function stateFromHint(t){
    const s = String(t||"").toLowerCase();
    if (!s) return { state:"ok", tag:"OK" };
    if (s.includes("llena") || s.includes("full") || s.includes("lista de espera")) return { state:"full", tag:"FULL" };
    const m = s.match(/quedan\s+(\d+)/);
    if (m && Number(m[1]) <= 5) return { state:"warn", tag:"POCOS" };
    return { state:"ok", tag:"OK" };
  }

  function setChip(state, tag, text){
    chip.setAttribute("data-state", state);
    if (chipTag) chipTag.textContent = tag || "OK";
    if (chipTxt && text) chipTxt.textContent = text;
  }

  function getIsFull(){
    const t = (cupoHint.textContent || "");
    const { state } = stateFromHint(t);
    return state === "full";
  }

  const sync = () => {
    const t = (cupoHint.textContent || "").trim();
    const { state, tag } = stateFromHint(t);
    setChip(state, tag, t || "Cupos limitados");
  };
  const mo = new MutationObserver(sync);
  mo.observe(cupoHint, { childList:true, subtree:true, characterData:true });
  sync();

  function launchConfetti(){
    const c = document.createElement("div");
    c.className = "confetti";
    const pieces = 42;

    for (let i=0; i<pieces; i++){
      const p = document.createElement("i");
      const left = Math.random() * 100;
      const delay = Math.random() * 0.25;
      const dur = 1.2 + Math.random() * 0.9;
      const sizeW = 8 + Math.random() * 10;
      const sizeH = 10 + Math.random() * 12;

      p.style.left = left + "vw";
      p.style.top = (-10 - Math.random()*30) + "vh";
      p.style.width = sizeW + "px";
      p.style.height = sizeH + "px";
      p.style.animationDelay = delay + "s";
      p.style.animationDuration = dur + "s";

      const palette = ["rgba(216,112,147,.95)", "rgba(255,255,255,.9)", "rgba(224,112,159,.95)", "rgba(22,255,122,.85)"];
      p.style.background = palette[Math.floor(Math.random()*palette.length)];

      c.appendChild(p);
    }

    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }

  function autoWhatsAfterSuccess(){
    if (!okWhats) return;
    setTimeout(() => {
      try{ okWhats.click(); } catch(e){}
    }, 2000);
  }

  okAgain?.addEventListener("click", () => {
    try{
      inscSuccess.style.display = "none";
      inscForm.style.display = "block";
      inscForm.reset();
      const pages = Array.from(inscForm.querySelectorAll(".step-page"));
      pages.forEach((p,i)=>p.classList.toggle("is-active", i===0));
      const prog = Array.from(document.querySelectorAll(".p-step"));
      prog.forEach((s,i)=>s.classList.toggle("is-active", i===0));
      location.hash = "#inscripcion";
    }catch(e){}
  });

  const successObserver = new MutationObserver(() => {
    const isVisible = inscSuccess && inscSuccess.style.display !== "none";
    if (!isVisible) return;

    const full = getIsFull();
    if (okText && full){
      okText.textContent = "Recibimos la inscripción ✅ Esta categoría está FULL, así que quedaste en LISTA DE ESPERA. Te escribimos por WhatsApp con la confirmación.";
    } else if (okText && !okText.textContent){
      okText.textContent = "Recibimos la inscripción ✅ Te escribimos por WhatsApp para confirmar el cupo.";
    }

    launchConfetti();
    autoWhatsAfterSuccess();
  });

  successObserver.observe(inscSuccess, { attributes:true, attributeFilter:["style"] });

})();


// ===== Galería Lightbox =====
(function(){
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  if (!lb || !lbImg || !lbClose) return;

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".gcard");
    if (!card) return;

    const src = card.getAttribute("data-img");
    if (!src) return;

    lbImg.src = src;
    lb.classList.add("show");
    lb.setAttribute("aria-hidden", "false");
  });

  function close(){
    lb.classList.remove("show");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  }

  lbClose.addEventListener("click", close);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();


// ===== Supabase Client =====
const supabaseClient = window.sb;

// Permite cambiar tablas sin tocar toda la app.
const DB_TABLES = {
  enrollments: window.APP_TABLES?.enrollments || "inscripciones_bk",
  capacities: window.APP_TABLES?.capacities || "cupos",
  payments: window.APP_TABLES?.payments || "payments",
  memberships: window.APP_TABLES?.memberships || "",
  players: window.APP_TABLES?.players || "",
  sessions: window.APP_TABLES?.sessions || "sessions",
  attendance: window.APP_TABLES?.attendance || "attendance"
};

const APP_STATUS = {
  activeEnrollment: window.APP_STATUS?.activeEnrollment || "Inscrito",
  activePlayer: window.APP_STATUS?.activePlayer || "activo"
};

const DB_FIELDS = {
  enrollments: {
    id: window.APP_FIELDS?.enrollments?.id || "id",
    parent: window.APP_FIELDS?.enrollments?.parent || "padre",
    whatsapp: window.APP_FIELDS?.enrollments?.whatsapp || "whatsapp",
    player: window.APP_FIELDS?.enrollments?.player || "jugador",
    age: window.APP_FIELDS?.enrollments?.age || "edad",
    category: window.APP_FIELDS?.enrollments?.category || "categoria",
    status: window.APP_FIELDS?.enrollments?.status || "estado",
    paymentStatus: window.APP_FIELDS?.enrollments?.paymentStatus || "pago_status",
    notes: window.APP_FIELDS?.enrollments?.notes || "notas",
    scholarship: window.APP_FIELDS?.enrollments?.scholarship || "beca_req",
    channel: window.APP_FIELDS?.enrollments?.channel || "canal",
    createdAt: window.APP_FIELDS?.enrollments?.createdAt || "created_at"
  },
  capacities: {
    id: window.APP_FIELDS?.capacities?.id || "id",
    category: window.APP_FIELDS?.capacities?.category || "categoria",
    total: window.APP_FIELDS?.capacities?.total || "cupo_total"
  },
  memberships: {
    category: window.APP_FIELDS?.memberships?.category || "categoria",
    status: window.APP_FIELDS?.memberships?.status || "estado"
  },
  players: {
    id: window.APP_FIELDS?.players?.id || "id",
    name: window.APP_FIELDS?.players?.name || "nombre",
    whatsapp: window.APP_FIELDS?.players?.whatsapp || "tutor_whatsapp",
    status: window.APP_FIELDS?.players?.status || "status",
    categoryId: window.APP_FIELDS?.players?.categoryId || "category_id"
  }
};

const ENR = DB_FIELDS.enrollments;
const CAP = DB_FIELDS.capacities;
const MEM = DB_FIELDS.memberships;
const PLY = DB_FIELDS.players;

const ENR_SELECT = `id:${ENR.id},padre:${ENR.parent},whatsapp:${ENR.whatsapp},jugador:${ENR.player},edad:${ENR.age},categoria:${ENR.category},estado:${ENR.status},pago_status:${ENR.paymentStatus},notas:${ENR.notes},beca_req:${ENR.scholarship},created_at:${ENR.createdAt}`;
const DASH_ENR_SELECT = `estado:${ENR.status},pago_status:${ENR.paymentStatus},created_at:${ENR.createdAt}`;
const CAP_SELECT = `id:${CAP.id},categoria:${CAP.category},cupo_total:${CAP.total}`;
const PLY_SELECT = `id:${PLY.id},nombre:${PLY.name},tutor_whatsapp:${PLY.whatsapp},status:${PLY.status},category_id:${PLY.categoryId},payments!left(id,month,status)`;

const ENR_PATCH_MAP = {
  estado: ENR.status,
  pago_status: ENR.paymentStatus,
  notas: ENR.notes
};


// ===== Admin Login =====
(function () {
  const adminApp = document.getElementById("adminApp");
  if (!adminApp) return;

  const adminLogin = document.getElementById("adminLogin");
  const adminPanelWrap = document.getElementById("adminPanelWrap");
  const adEmail = document.getElementById("adEmail");
  const adPass = document.getElementById("adPass");
  const adLoginBtn = document.getElementById("adLoginBtn");
  const adLogoutBtn = document.getElementById("adLogoutBtn");
  const adMsg = document.getElementById("adMsg");

  const setMsg = (t) => { if (adMsg) adMsg.textContent = t || ""; };

  async function refreshAuthUI() {
    const { data } = await supabaseClient.auth.getSession();
    const isAuthed = !!data.session;

    if (adminLogin) adminLogin.style.display = isAuthed ? "none" : "block";
    if (adminPanelWrap) adminPanelWrap.style.display = isAuthed ? "block" : "none";
    if (adLogoutBtn) adLogoutBtn.style.display = isAuthed ? "inline-flex" : "none";

    if (isAuthed) {
      window.ADMIN_READY = true;
      window.dispatchEvent(new Event("admin:ready"));
    } else {
      window.ADMIN_READY = false;
    }
  }

  adLoginBtn?.addEventListener("click", async () => {
    setMsg("");
    const email = (adEmail?.value || "").trim();
    const password = (adPass?.value || "").trim();
    if (!email || !password) return setMsg("Pon tu email y password.");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return setMsg("No pude entrar. Revisa email/password.");
    setMsg("Entraste ✅");
    await refreshAuthUI();
  });

  adLogoutBtn?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    setMsg("Sesión cerrada.");
    await refreshAuthUI();
  });

  refreshAuthUI();
})();


// ===== Form Inscripción (Landing) =====
(function () {
  const inscForm = document.getElementById("inscForm");
  if (!inscForm) return;

  const DEFAULT_CUPO = 30;
  const ACADEMY_WHATS = "8296396001";

  const inscSuccess = document.getElementById("inscSuccess");
  const fMsg = document.getElementById("fMsg");

  const fPadre = document.getElementById("fPadre");
  const fWhats = document.getElementById("fWhats");
  const fJugador = document.getElementById("fJugador");
  const fEdad = document.getElementById("fEdad");
  const fCategoria = document.getElementById("fCategoria");
  const fNotas = document.getElementById("fNotas");
  const fBecaReq = document.getElementById("fBecaReq");
  const fCupoHint = document.getElementById("fCupoHint");
  const okText = document.getElementById("okText");
  const okWhats = document.getElementById("okWhats");
  const fSubmit = document.getElementById("fSubmit") || inscForm.querySelector('button[type="submit"]');

  const setMsg = (t) => { if (fMsg) fMsg.textContent = t || ""; };
  const onlyDigits = (s) => String(s || "").replace(/\D/g, "");
  const normalizeRDPhone = (raw) => {
    const d = onlyDigits(raw);
    if (d.length === 10) return d;
    if (d.length === 11 && d.startsWith("1")) return d.slice(1);
    return d;
  };
  const waLink = (phone10) => `https://wa.me/1${phone10}`;

  let cuposCache = {};
  let inscritosCache = {};

  const calcInscritosByCategoria = (rows) => {
    const map = {};
    const activeKey = String(APP_STATUS.activeEnrollment || "").toLowerCase();
    (rows || []).forEach(r => {
      const cat = r.categoria || "";
      if (!cat) return;
      map[cat] = (map[cat] || 0) + (String(r.estado || "").toLowerCase() === activeKey ? 1 : 0);
    });
    return map;
  };

  const isFull = (cat) => (inscritosCache[cat] ?? 0) >= (cuposCache[cat] ?? DEFAULT_CUPO);
  const remaining = (cat) => Math.max(0, (cuposCache[cat] ?? DEFAULT_CUPO) - (inscritosCache[cat] ?? 0));

  function updateCupoHint() {
    const cat = fCategoria?.value;
    if (!cat) return;
    const full = isFull(cat);
    const rem = remaining(cat);
    if (fCupoHint) fCupoHint.textContent = full
      ? `Esta categoría está completa. Puedes enviar la solicitud y quedas en lista de espera.`
      : `Disponibilidad: quedan ${rem} cupos.`;
  }

  function renderCategorias() {
    // Ajusta si quieres otras categorías
    const cats = ["8–10 años", "11–13 años", "14–17 años"];
    fCategoria.innerHTML = cats.map(cat => {
      const full = isFull(cat);
      const rem = remaining(cat);
      return `<option value="${cat}">${cat} — ${full ? "LISTA DE ESPERA" : ("Quedan " + rem)}</option>`;
    }).join("");
    updateCupoHint();
  }

  fCategoria?.addEventListener("change", updateCupoHint);

  async function loadCuposAndInscritos() {
    // cupos
    const { data: cupos } = await supabaseClient.from(DB_TABLES.capacities).select(CAP_SELECT);
    cuposCache = {};
    (cupos || []).forEach(x => cuposCache[x.categoria] = x.cupo_total);

    // inscritos
    const sourceTable = DB_TABLES.memberships || DB_TABLES.enrollments;
    const sourceCategory = DB_TABLES.memberships ? MEM.category : ENR.category;
    const sourceStatus = DB_TABLES.memberships ? MEM.status : ENR.status;
    const sourceSelect = `categoria:${sourceCategory},estado:${sourceStatus}`;

    const { data: insc } = await supabaseClient
      .from(sourceTable)
      .select(sourceSelect)
      .eq(sourceStatus, APP_STATUS.activeEnrollment);

    inscritosCache = calcInscritosByCategoria(insc || []);
    renderCategorias();
  }

  async function createInscripcion(payload) {
    const mapped = {
      [ENR.parent]: payload.padre,
      [ENR.whatsapp]: payload.whatsapp,
      [ENR.player]: payload.jugador,
      [ENR.age]: payload.edad,
      [ENR.category]: payload.categoria,
      [ENR.status]: payload.estado,
      [ENR.paymentStatus]: payload.pago_status,
      [ENR.notes]: payload.notas,
      [ENR.scholarship]: payload.beca_req,
      [ENR.channel]: payload.canal
    };

    const { error } = await supabaseClient.from(DB_TABLES.enrollments).insert([mapped]);
    if (!error) return;

    // Fallback automatico si la tabla configurada no existe en cache de PostgREST.
    const shouldFallback = error?.code === "PGRST205";

    if (shouldFallback && DB_TABLES.enrollments !== "inscripciones_bk") {
      DB_TABLES.enrollments = "inscripciones_bk";
      const { error: retryError } = await supabaseClient.from(DB_TABLES.enrollments).insert([mapped]);
      if (!retryError) return;
      throw retryError;
    }

    throw error;
  }

  inscForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const padre = (fPadre.value || "").trim();
    const email = (document.getElementById('fEmail')?.value || "").trim();
    const whatsapp = normalizeRDPhone(fWhats.value);
    const jugador = (fJugador.value || "").trim();
    const edad = Number(fEdad.value);
    const categoria = fCategoria.value;
    const notas = (fNotas?.value || "").trim();
    const beca_req = !!fBecaReq?.checked;
    const es_portero = !!document.getElementById('fPortero')?.checked; // Capturar checkbox portero

    if (!padre || !jugador || !categoria || !email) return setMsg("Completa los campos obligatorios.");
    if (!Number.isFinite(edad) || edad < 8 || edad > 17) return setMsg("Edad inválida (8 a 17).");
    if (whatsapp.length !== 10) return setMsg("WhatsApp inválido. Ej: 8296396001");
    if (!email.includes('@')) return setMsg("Email inválido.");

    const full = isFull(categoria);
    const estado = full ? "Lista de espera" : "Nuevo";

    const payload = {
      padre, whatsapp, jugador, edad, categoria,
      estado,
      pago_status: "Pendiente",
      notas: notas || null,
      beca_req,
      canal: "web"
    };

    try {
      fSubmit.disabled = true;
      fSubmit.textContent = "Enviando...";


      // Guardar en nueva tabla de solicitudes para el Super Admin
      try {
        const requestPayload = {
          tutor_nombre: padre,
          tutor_email: email,
          tutor_whatsapp: whatsapp,
          jugador_nombre: jugador,
          jugador_edad: edad,
          category_name: categoria,
          es_portero: es_portero, // Agregar campo portero
          status: 'pending'
        };
        
        const { error: requestError } = await supabaseClient
          .from('inscription_requests')
          .insert([requestPayload]);

        if (requestError) {
          console.warn('No se pudo guardar en inscription_requests:', requestError);
        } else {
          console.log('✅ Solicitud guardada en inscription_requests');
        }
      } catch (err) {
        console.warn('Error guardando solicitud:', err);
      }

      await createInscripcion(payload);

      inscForm.style.display = "none";
      if (inscSuccess) inscSuccess.style.display = "block";

      if (okText) okText.textContent = `Recibimos la inscripción. En breve te escribiremos por WhatsApp para confirmar el cupo del jugador.`;

      if (okWhats) okWhats.onclick = () => {
        const msg =
          `Hola Guerrero Academy ⚽\n\n` +
          `Acabo de enviar la inscripción.\n` +
          `Padre/Tutor: ${padre}\nJugador: ${jugador}\nEdad: ${edad}\nCategoría: ${categoria}\n` +
          `${es_portero ? '🧤 Portero\n' : ''}` +
          `${full ? "Estado: Lista de espera" : "Estado: Nueva"}\n\n` +
          `Mi WhatsApp: ${whatsapp}`;
        window.open(`${waLink(ACADEMY_WHATS)}?text=${encodeURIComponent(msg)}`, "_blank");
      };

      await loadCuposAndInscritos();
    } catch (err) {
      console.error(err);
      setMsg("No se pudo enviar. Revisa permisos (RLS) o intenta de nuevo.");
    } finally {
      if (fSubmit) {
        fSubmit.disabled = false;
        fSubmit.textContent = "Reservar cupo";
      }
    }
  });

  loadCuposAndInscritos();
})();


// ===== Wizard PRO Inscripción (20/10) =====
(function(){
  const form = document.getElementById("inscForm");
  if (!form) return;

  // Ordenar páginas por data-step para asegurar orden correcto
  const pages = Array.from(form.querySelectorAll(".step-page")).sort((a, b) => {
    const stepA = parseInt(a.getAttribute('data-step') || '0', 10);
    const stepB = parseInt(b.getAttribute('data-step') || '0', 10);
    return stepA - stepB;
  });
  
  const steps = Array.from(document.querySelectorAll(".p-step"));
  
  console.log('📄 Páginas del wizard cargadas:', pages.length);
  pages.forEach((p, i) => console.log(`  Página ${i}:`, p.getAttribute('data-step'), p.querySelector('.step-h')?.textContent));

  const fPadre = document.getElementById("fPadre");
  const fWhats = document.getElementById("fWhats");
  const fJugador = document.getElementById("fJugador");
  const fEdad = document.getElementById("fEdad");
  const fCategoria = document.getElementById("fCategoria");
  const fCupoHint = document.getElementById("fCupoHint");
  const chipCupoText = document.getElementById("chipCupoText");
  const catSuggest = document.getElementById("catSuggest");
  const catSuggestSub = document.getElementById("catSuggestSub");

  const cfTutor = document.getElementById("cfTutor");
  const cfWhats = document.getElementById("cfWhats");
  const cfJugador = document.getElementById("cfJugador");
  const cfEdad = document.getElementById("cfEdad");
  const cfCat = document.getElementById("cfCat");

  const onlyDigits = (s) => String(s||"").replace(/\D/g, "");
  const normalizeRDPhone = (raw) => {
    const d = onlyDigits(raw);
    if (d.length === 10) return d;
    if (d.length === 11 && d.startsWith("1")) return d.slice(1);
    return d;
  };

  let idx = 0;

  function setStep(i){
    idx = Math.max(0, Math.min(pages.length - 1, i));
    console.log(`🔄 setStep llamado: paso ${i} → idx final: ${idx}`);
    
    pages.forEach((p, k) => {
      const isActive = k === idx;
      p.classList.toggle("is-active", isActive);
      console.log(`  Página ${k} (${p.getAttribute('data-step')}): ${isActive ? '✅ ACTIVA' : '❌ inactiva'}`);
    });
    
    steps.forEach((s, k) => s.classList.toggle("is-active", k <= idx));
    window.scrollTo({ top: document.getElementById("inscripcion")?.offsetTop || 0, behavior: "smooth" });
    if (idx === 2) fillConfirm();
  }

  function currentCategorySuggestion(age){
    const n = Number(age);
    if (!Number.isFinite(n)) return null;
    if (n >= 8 && n <= 10) return "8–10 años";
    if (n >= 11 && n <= 13) return "11–13 años";
    if (n >= 14 && n <= 17) return "14–17 años";
    return null;
  }

  function setSuggestUI(){
    const sug = currentCategorySuggestion(fEdad?.value);
    if (!catSuggest || !catSuggestSub) return;

    if (!sug){
      catSuggest.textContent = "—";
      catSuggestSub.textContent = "Ingresa la edad para sugerir categoría";
      return;
    }
    catSuggest.textContent = sug;
    catSuggestSub.textContent = "Puedes cambiarla manualmente si aplica.";
  }

  function applySuggestedCategory(){
    const sug = currentCategorySuggestion(fEdad?.value);
    if (!sug || !fCategoria) return;
    const opt = Array.from(fCategoria.options || []).find(o => o.value === sug);
    if (opt) fCategoria.value = sug;
    fCategoria.dispatchEvent(new Event("change"));
  }

  function fillConfirm(){
    const padre = (fPadre?.value || "—").trim() || "—";
    const whats = normalizeRDPhone(fWhats?.value || "") || "—";
    const jugador = (fJugador?.value || "—").trim() || "—";
    const edad = (fEdad?.value || "—").toString();
    const catText = fCategoria?.options[fCategoria.selectedIndex]?.text || "—";
    const esPortero = document.getElementById("fPortero")?.checked || false;
    
    if (cfTutor) cfTutor.textContent = padre;
    if (cfWhats) cfWhats.textContent = whats;
    if (cfJugador) cfJugador.textContent = jugador;
    if (cfEdad) cfEdad.textContent = edad;
    if (cfCat) cfCat.textContent = catText;
    
    // Mostrar/ocultar indicador de portero
    const cfPorteroRow = document.getElementById("cfPorteroRow");
    if (cfPorteroRow) {
      cfPorteroRow.style.display = esPortero ? 'flex' : 'none';
    }

    // Actualizar link de WhatsApp con mensaje natural
    if (okWhats) {
      const msg =
        `Hola! 👋\n\n` +
        `Acabo de llenar el formulario de inscripción para mi ${edad <= 12 ? 'hijo/a' : 'joven'} *${jugador}*.\n\n` +
        `${esPortero ? '🧤 Le interesa entrenar como *portero*\n' : ''}` +
        `📋 *Edad:* ${edad} años\n` +
        `⚽ *Categoría:* ${catText}\n` +
        `👤 *Mi nombre:* ${padre}\n` +
        `📱 *Mi WhatsApp:* ${whats}\n\n` +
        `¿Cuándo podemos empezar? 🚀`;
      
      okWhats.onclick = () => window.open(`https://wa.me/18296396001?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }

  function validateStep(i){
    if (i === 0){
      const padre = (fPadre?.value || "").trim();
      const whatsapp = normalizeRDPhone(fWhats?.value || "");
      if (!padre) return "Pon el nombre del tutor.";
      if (whatsapp.length !== 10) return "WhatsApp inválido. Ej: 8296396001";
    }
    if (i === 1){
      const jugador = (fJugador?.value || "").trim();
      const edad = Number(fEdad?.value);
      const cat = fCategoria?.value;
      if (!jugador) return "Pon el nombre del jugador.";
      if (!Number.isFinite(edad) || edad < 8 || edad > 17) return "Edad inválida (8 a 17).";
      if (!cat) return "Selecciona una categoría.";
    }
    return null;
  }

  form.addEventListener("click", (e) => {
    const next = e.target.closest("[data-next]");
    const prev = e.target.closest("[data-prev]");

    if (prev){
      e.preventDefault();
      setStep(idx - 1);
      return;
    }

    if (next){
      e.preventDefault();
      const err = validateStep(idx);
      const fMsg = document.getElementById("fMsg");
      if (fMsg) fMsg.textContent = "";
      if (err){
        if (fMsg && idx === 2) fMsg.textContent = err;
        else alert(err);
        return;
      }
      setStep(idx + 1);
      return;
    }
  });

  fEdad?.addEventListener("input", () => {
    setSuggestUI();
    applySuggestedCategory();
  });

  fCategoria?.addEventListener("change", () => {
    fillConfirm();
  });

  fPadre?.addEventListener("input", fillConfirm);
  fWhats?.addEventListener("input", fillConfirm);
  fJugador?.addEventListener("input", fillConfirm);

  const syncChip = () => {
    const t = (fCupoHint?.textContent || "").trim();
    if (!chipCupoText) return;
    if (!t) chipCupoText.textContent = "Cupos limitados";
    else chipCupoText.textContent = t.length > 28 ? (t.slice(0, 28) + "…") : t;
  };
  const mo = new MutationObserver(syncChip);
  if (fCupoHint) mo.observe(fCupoHint, { childList: true, subtree: true, characterData: true });

  setSuggestUI();
  fillConfirm();
  syncChip();
  setStep(0);
})();


// ===== Admin tabs navigation =====
(function(){
  const adminWrap = document.getElementById("adminPanelWrap");
  if (!adminWrap) return;

  function setView(key){
    document.querySelectorAll(".admin-link").forEach(b => {
      b.classList.toggle("is-active", b.getAttribute("data-view") === key);
    });
    document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("is-active"));

    const map = {
      dash: "view-dash",
      ops: "view-ops",
      fin: "view-fin",
      staff: "view-staff"
    };
    const id = map[key] || "view-dash";
    document.getElementById(id)?.classList.add("is-active");
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".admin-link");
    if (!b) return;
    setView(b.getAttribute("data-view"));
  });

  // default
  setView("dash");

  const kpiToday = document.getElementById("kpiToday");
  const kpiMorosos = document.getElementById("kpiMorosos");
  const kpiOcupados = document.getElementById("kpiOcupados");

  function setKpi(el, value) {
    if (el) el.textContent = String(value ?? "—");
  }

  async function renderDashboardKPIs(){
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData?.session) return;

    const { data: inscripciones } = await supabaseClient
      .from(DB_TABLES.enrollments)
      .select(DASH_ENR_SELECT);

    const { data: cupos } = await supabaseClient
      .from(DB_TABLES.capacities)
      .select(`cupo_total:${CAP.total}`);

    const rows = inscripciones || [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter(r => String(r.created_at || "").slice(0, 10) === todayKey).length;
    const morosos = rows.filter(r => String(r.pago_status || "").toLowerCase().includes("pend")).length;
    const totalCupos = (cupos || []).reduce((acc, x) => acc + Number(x.cupo_total || 0), 0);
    const ocupados = rows.filter(r => (r.estado || "") !== "Lista de espera").length;
    const ocupadosTxt = totalCupos > 0 ? `${ocupados}/${totalCupos}` : ocupados;

    setKpi(kpiToday, todayCount);
    setKpi(kpiMorosos, morosos);
    setKpi(kpiOcupados, ocupadosTxt);
  }

  window.addEventListener("admin:ready", () => {
    renderDashboardKPIs();
  });
})();


// ===== Admin Core (Operaciones + Cupos + Finanzas + Staff) =====
(function () {
  const opsMount = document.getElementById("opsMount");
  const finMount = document.getElementById("finMount");
  const staffMount = document.getElementById("staffMount");
  if (!opsMount || !finMount || !staffMount) return;

  // Estado en memoria
  let INS = [];
  let CUPOS = [];
  let PAYMENTS = [];
  let PLAYERS = [];
  let MOROSOS = [];
  let activePaymentRow = null;
  let usingMembershipFallback = false;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  function onlyDigits(s){ return String(s||"").replace(/\D/g,""); }
  function waLink(phone10){ return `https://wa.me/1${phone10}`; }
  function toISODate(d){ return new Date(d).toISOString().slice(0,10); }
  function getCurrentMonthISO(){
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0,0,0,0);
    return monthStart.toISOString().slice(0,10);
  }
  function monthStartFromDate(rawDate){
    const d = new Date(rawDate);
    if (!Number.isFinite(d.getTime())) return "";
    d.setDate(1);
    d.setHours(0,0,0,0);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
  }
  function isValidMonthStart(iso){
    return /^\d{4}-\d{2}-01$/.test(String(iso || ""));
  }
  function normalizeMethod(v){
    const m = String(v || "").trim().toLowerCase();
    if (["cash","transfer","card"].includes(m)) return m;
    if (m === "efectivo") return "cash";
    if (m === "tarjeta") return "card";
    if (m === "transferencia") return "transfer";
    return "";
  }

  function showSupabaseError(prefix, err){
    const details = err?.message || err?.details || err?.hint || "Error desconocido";
    console.error(prefix, err);
    alert(`${prefix}: ${details}`);
  }

  function errMsg(err){
    return err?.message || err?.details || err?.hint || String(err || "Error desconocido");
  }

  function isMissingTableError(err, tableName){
    const m = String(errMsg(err) || "").toLowerCase();
    const t = String(tableName || "").toLowerCase();
    return m.includes("could not find the table") || m.includes(`public.${t}`) || m.includes("relation") && m.includes("does not exist");
  }

  // ---------- UI Mounts ----------
  function mountOpsUI(){
    opsMount.innerHTML = `
      <div class="card">
        <div class="card-title">Inscripciones</div>
        <div class="hint">Busca, filtra y edita rápido. (Todo queda guardado en Supabase)</div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
          <input id="opsSearch" class="input" placeholder="Buscar: jugador / tutor / whatsapp" style="flex:1; min-width:220px;" />
          <select id="opsFilter" class="select" style="min-width:220px;">
            <option value="all">Todas</option>
            <option value="nuevos">Nuevos</option>
            <option value="pendientes">Pago pendiente</option>
            <option value="espera">Lista de espera</option>
            <option value="beca">Solicita beca</option>
          </select>
          <button id="opsReload" class="btn btn-ghost" type="button">Actualizar</button>
        </div>

        <div id="opsTable" style="margin-top:12px;"></div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="card-title">Cupos por categoría</div>
        <div class="hint">Edita cupos y guarda.</div>
        <div id="cuposTable" style="margin-top:12px;"></div>
        <div style="display:flex; gap:10px; margin-top:12px;">
          <button id="cuposSave" class="btn btn-primary" type="button" style="flex:1;">Guardar cupos</button>
          <button id="cuposReload" class="btn btn-ghost" type="button" style="flex:1;">Recargar</button>
        </div>
        <div class="form-msg" id="cuposMsg"></div>
      </div>
    `;
  }

  function mountFinUI(){
    finMount.innerHTML = `
      <div class="grid-3">
        <div class="card"><div class="card-title">Inscritos</div><div class="card-text"><span id="finInscritos">—</span></div></div>
        <div class="card"><div class="card-title">Pendientes</div><div class="card-text"><span id="finPend">—</span></div></div>
        <div class="card"><div class="card-title">Pagados</div><div class="card-text"><span id="finPagados">—</span></div></div>
        <div class="card"><div class="card-title">Ingresos mes</div><div class="card-text"><span id="finMonthRevenue">—</span></div></div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="card-title">Pendientes (lista)</div>
        <div id="finList" class="hint">Cargando…</div>
      </div>

      <div class="card" style="margin-top:12px;">
        <div class="card-title">Pagos recientes</div>
        <div id="finPayments" class="hint">Cargando…</div>
      </div>
    `;
  }

  function mountPaymentModal(){
    if (document.getElementById("payModal")) return;
    const today = toISODate(new Date());
    const month = getCurrentMonthISO();

    const box = document.createElement("div");
    box.id = "payModal";
    box.className = "pay-modal";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `
      <div class="pay-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="payTitle">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div>
            <div id="payTitle" class="card-title">Registrar pago</div>
            <div id="payPlayer" class="hint">Jugador: —</div>
          </div>
          <button type="button" class="btn btn-ghost" id="payClose">Cerrar</button>
        </div>

        <form id="payForm" style="margin-top:12px; display:grid; gap:10px;">
          <input type="hidden" id="payPlayerId" />
          <input type="hidden" id="payCategoryId" />

          <div class="field">
            <label>Monto</label>
            <input id="payAmount" class="input" type="number" min="1" step="0.01" required />
          </div>

          <div class="field">
            <label>Moneda</label>
            <select id="payCurrency" class="select">
              <option value="DOP">DOP</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div class="field">
            <label>Método</label>
            <select id="payMethod" class="select" required>
              <option value="cash">cash</option>
              <option value="transfer">transfer</option>
              <option value="card">card</option>
            </select>
          </div>

          <div class="field">
            <label>Mes pagado (YYYY-MM-01)</label>
            <input id="payMonth" class="input" type="date" value="${month}" required />
          </div>

          <div class="field">
            <label>Fecha de pago real</label>
            <input id="payPaidAt" class="input" type="date" value="${today}" required />
          </div>

          <div class="field">
            <label>Status</label>
            <select id="payStatus" class="select" required>
              <option value="paid">paid</option>
              <option value="pending">pending</option>
              <option value="refunded">refunded</option>
            </select>
          </div>

          <div class="field">
            <label>Nota (opcional)</label>
            <textarea id="payNote" class="textarea" style="min-height:80px;"></textarea>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" id="paySubmit" type="submit" style="flex:1;">Guardar pago</button>
            <button class="btn btn-ghost" id="payCancel" type="button" style="flex:1;">Cancelar</button>
          </div>
          <div id="payMsg" class="form-msg"></div>
        </form>
      </div>
    `;

    document.body.appendChild(box);

    const close = () => {
      box.classList.remove("show");
      box.setAttribute("aria-hidden", "true");
      activePaymentRow = null;
    };

    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });

    document.getElementById("payClose")?.addEventListener("click", close);
    document.getElementById("payCancel")?.addEventListener("click", close);

    document.getElementById("payForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const msg = document.getElementById("payMsg");
      if (msg) msg.textContent = "";

      const player_id = (document.getElementById("payPlayerId")?.value || "").trim();
      const category_id = (document.getElementById("payCategoryId")?.value || "").trim() || null;
      const amount = Number(document.getElementById("payAmount")?.value || "0");
      const currency = ((document.getElementById("payCurrency")?.value || "DOP").trim().toUpperCase());
      const method = normalizeMethod(document.getElementById("payMethod")?.value || "");
      const rawMonth = (document.getElementById("payMonth")?.value || "").trim();
      const month = monthStartFromDate(rawMonth || new Date());
      const paid_at = (document.getElementById("payPaidAt")?.value || "").trim();
      const status = ((document.getElementById("payStatus")?.value || "paid").trim().toLowerCase());
      const note = (document.getElementById("payNote")?.value || "").trim() || null;

      if (!player_id) return (msg ? msg.textContent = "Falta player_id del jugador." : null);
      if (!Number.isFinite(amount) || amount <= 0) return (msg ? msg.textContent = "El monto debe ser mayor que 0." : null);
      if (!isValidMonthStart(month)) return (msg ? msg.textContent = "month debe ser YYYY-MM-01." : null);
      if (!method) return (msg ? msg.textContent = "Método inválido. Usa cash/transfer/card." : null);
      if (!["paid","pending","refunded"].includes(status)) return (msg ? msg.textContent = "Status inválido." : null);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(paid_at)) return (msg ? msg.textContent = "paid_at inválido." : null);

      const payload = {
        player_id,
        category_id,
        amount,
        currency,
        method,
        month,
        paid_at,
        status,
        note
      };

      const submit = document.getElementById("paySubmit");
      try {
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Guardando...";
        }

        await createPayment(payload);

        if (activePaymentRow?.id && status === "paid") {
          await updateInscripcion(activePaymentRow.id, { pago_status: "Pagado" });
        }

        await reloadAll();
        close();
      } catch (err) {
        showSupabaseError("No pude registrar el pago", err);
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = "Guardar pago";
        }
      }
    });
  }

  function openPaymentModal(row){
    const resolvedPlayerId = row?.player_id || "";
    if (!resolvedPlayerId) return alert("Este registro no tiene player_id (uuid). Primero crea el jugador.");

    activePaymentRow = row;

    const modal = document.getElementById("payModal");
    if (!modal) return;

    const playerTxt = `${row.jugador || "—"} • ${row.categoria || "Sin categoría"}`;
    const playerLabel = document.getElementById("payPlayer");
    if (playerLabel) playerLabel.textContent = `Jugador: ${playerTxt}`;

    const playerIdInput = document.getElementById("payPlayerId");
    if (playerIdInput) playerIdInput.value = resolvedPlayerId;

    const catIdInput = document.getElementById("payCategoryId");
    if (catIdInput) catIdInput.value = row.category_id || "";

    const monthInput = document.getElementById("payMonth");
    if (monthInput) monthInput.value = getCurrentMonthISO();

    const paidAtInput = document.getElementById("payPaidAt");
    if (paidAtInput) paidAtInput.value = toISODate(new Date());

    const msg = document.getElementById("payMsg");
    if (msg) msg.textContent = "";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  function mountStaffUI(){
    staffMount.innerHTML = `
      <div class="card">
        <div class="card-title">Staff</div>
        <div class="hint">Base. Próximo: roles por módulo y permisos.</div>
        <div style="margin-top:12px; display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div>
            <div class="hint">Usuario actual</div>
            <div id="staffMe" style="font-weight:950;">—</div>
          </div>
          <button class="btn btn-primary" type="button" id="staffFuture" style="min-width:220px;">
            + Crear staff (próximo)
          </button>
        </div>
      </div>
    `;
  }

  // ---------- Render ----------
  function renderOpsTable(){
    const q = (document.getElementById("opsSearch")?.value || "").toLowerCase().trim();
    const f = (document.getElementById("opsFilter")?.value || "all");

    let rows = INS.slice();

    if (q){
      rows = rows.filter(r => {
        const blob = `${r.jugador||""} ${r.padre||""} ${r.whatsapp||""}`.toLowerCase();
        return blob.includes(q);
      });
    }

    if (f === "nuevos") rows = rows.filter(r => (r.estado||"").toLowerCase() === "nuevo");
    if (f === "pendientes") rows = rows.filter(r => (r.pago_status||"").toLowerCase().includes("pend"));
    if (f === "espera") rows = rows.filter(r => (r.estado||"").toLowerCase().includes("espera"));
    if (f === "beca") rows = rows.filter(r => !!r.beca_req);

    const html = `
      <div style="overflow:auto;">
        <table style="width:100%; border-collapse:separate; border-spacing:0 10px;">
          <thead>
            <tr style="color:rgba(255,255,255,.65); font-size:12px; text-align:left;">
              <th style="padding:6px 8px;">Jugador</th>
              <th style="padding:6px 8px;">Tutor</th>
              <th style="padding:6px 8px;">Cat</th>
              <th style="padding:6px 8px;">Estado</th>
              <th style="padding:6px 8px;">Pago</th>
              <th style="padding:6px 8px;">Beca</th>
              <th style="padding:6px 8px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => {
              const phone = onlyDigits(r.whatsapp);
              const msg = `Hola Guerrero Academy ⚽\n\nConfirmación inscripción:\nJugador: ${r.jugador}\nCategoría: ${r.categoria}\nEstado: ${r.estado}\nPago: ${r.pago_status}\n\nTutor: ${r.padre}\nWhatsApp: ${r.whatsapp}`;
              return `
                <tr style="background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.10);">
                  <td style="padding:12px 8px; border-radius:14px 0 0 14px;">
                    <div style="font-weight:950;">${esc(r.jugador)}</div>
                    <div class="hint">${esc(r.edad)} años • ${esc(r.created_at ? r.created_at.slice(0,10) : "")}</div>
                  </td>
                  <td style="padding:12px 8px;">
                    <div style="font-weight:850;">${esc(r.padre)}</div>
                    <div class="hint">${esc(r.whatsapp)}</div>
                  </td>
                  <td style="padding:12px 8px;">${esc(r.categoria)}</td>

                  <td style="padding:12px 8px;">
                    <select class="select" data-action="estado" data-id="${r.id}">
                      ${["Nuevo","Inscrito","Lista de espera","Cancelado"].map(x =>
                        `<option ${x===r.estado?"selected":""} value="${x}">${x}</option>`
                      ).join("")}
                    </select>
                  </td>

                  <td style="padding:12px 8px;">
                    <select class="select" data-action="pago" data-id="${r.id}">
                      ${["Pendiente","Pagado","Exento","Beca"].map(x =>
                        `<option ${x===r.pago_status?"selected":""} value="${x}">${x}</option>`
                      ).join("")}
                    </select>
                  </td>

                  <td style="padding:12px 8px;">${r.beca_req ? "✅" : "—"}</td>

                  <td style="padding:12px 8px; border-radius:0 14px 14px 0;">
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                      <button class="btn btn-ghost" type="button" data-action="wa" data-phone="${phone}" data-msg="${encodeURIComponent(msg)}">WhatsApp</button>
                      <button class="btn btn-ghost" type="button" data-action="notes" data-id="${r.id}">Notas</button>
                      <button class="btn btn-primary" type="button" data-action="pay" data-id="${r.id}">Registrar pago</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div class="hint">Mostrando ${rows.length} de ${INS.length}</div>
    `;

    const table = document.getElementById("opsTable");
    if (table) table.innerHTML = html;
  }

  function renderCuposTable(){
    const html = `
      <div style="overflow:auto;">
        <table style="width:100%; border-collapse:separate; border-spacing:0 10px;">
          <thead>
            <tr style="color:rgba(255,255,255,.65); font-size:12px; text-align:left;">
              <th style="padding:6px 8px;">Categoría</th>
              <th style="padding:6px 8px;">Cupo</th>
            </tr>
          </thead>
          <tbody>
            ${CUPOS.map(c => `
              <tr style="background:rgba(255,255,255,.03);">
                <td style="padding:12px 8px; border-radius:14px 0 0 14px; font-weight:900;">
                  ${esc(c.categoria)}
                </td>
                <td style="padding:12px 8px; border-radius:0 14px 14px 0;">
                  <input class="input" style="max-width:140px;" type="number" min="0"
                    data-cupo-id="${c.id}" data-cupo-cat="${esc(c.categoria)}" value="${Number(c.cupo_total||0)}" />
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    const t = document.getElementById("cuposTable");
    if (t) t.innerHTML = html;
  }

  function renderFinanzas(){
    const inscritos = INS.filter(r => (r.estado||"").toLowerCase() !== "cancelado").length;
    const pendFallback = INS.filter(r => (r.pago_status||"").toLowerCase().includes("pend")).length;
    const pend = MOROSOS.length || pendFallback;
    const pag = INS.filter(r => (r.pago_status||"").toLowerCase() === "pagado").length;
    const monthISO = getCurrentMonthISO();
    const monthPaidRows = PAYMENTS.filter(p => p.status === "paid" && p.month === monthISO);
    const totalMonth = monthPaidRows.reduce((s, r) => s + Number(r.amount || 0), 0);

    const finIns = document.getElementById("finInscritos");
    const finPend = document.getElementById("finPend");
    const finPag = document.getElementById("finPagados");
    const finRev = document.getElementById("finMonthRevenue");
    if (finIns) finIns.textContent = inscritos;
    if (finPend) finPend.textContent = pend;
    if (finPag) finPag.textContent = pag;
    if (finRev) finRev.textContent = `DOP ${totalMonth.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const list = (MOROSOS.length
      ? MOROSOS.slice(0, 12).map(r => `<div class="admin-item">
        <div><strong>${esc(r.nombre || r.id)}</strong><div class="meta">Cat: ${esc(r.category_id || "—")} • Tutor: ${esc(r.tutor_whatsapp || "—")}</div></div>
        <div class="meta">${esc(r.status || "")}</div>
      </div>`)
      : INS
        .filter(r => (r.pago_status||"").toLowerCase().includes("pend"))
        .slice(0, 12)
        .map(r => `<div class="admin-item">
          <div><strong>${esc(r.jugador)}</strong><div class="meta">${esc(r.categoria)} • Tutor: ${esc(r.padre)} • ${esc(r.whatsapp)}</div></div>
          <div class="meta">${esc(r.estado)}</div>
        </div>`)
    ).join("");

    const finList = document.getElementById("finList");
    if (finList) finList.innerHTML = list || `<div class="hint">No hay pendientes 🎉</div>`;

    const paymentsHtml = PAYMENTS
      .slice(0, 12)
      .map(p => `<div class="admin-item">
        <div>
          <strong>${esc(p.player_name || p.player_id)}</strong>
          <div class="meta">${esc(p.method)} • ${esc(p.month)} • ${esc(p.status)}</div>
        </div>
        <div class="meta">${esc(p.currency)} ${Number(p.amount || 0).toFixed(2)}</div>
      </div>`).join("");

    const finPayments = document.getElementById("finPayments");
    if (finPayments) finPayments.innerHTML = paymentsHtml || `<div class="hint">No hay pagos registrados.</div>`;
  }

  async function renderStaffMe(){
    const { data } = await supabaseClient.auth.getSession();
    const email = data?.session?.user?.email || "—";
    const el = document.getElementById("staffMe");
    if (el) el.textContent = email;
  }

  // ---------- Data ----------
  async function loadInscripciones(){
    const { data, error } = await supabaseClient
      .from(DB_TABLES.enrollments)
      .select(ENR_SELECT)
      .order("created_at", { ascending:false })
      .limit(500);

    if (!error) {
      usingMembershipFallback = false;
      INS = data || [];
      return;
    }

    if (!DB_TABLES.memberships || !isMissingTableError(error, DB_TABLES.enrollments)) {
      throw new Error(`SELECT ${DB_TABLES.enrollments}: ${errMsg(error)}`);
    }

    const { data: ms, error: mErr } = await supabaseClient
      .from(DB_TABLES.memberships)
      .select("id,player_id,categoria,monto,fecha_inicio,fecha_vencimiento,estado,created_at,legacy_inscripcion_id")
      .order("created_at", { ascending:false })
      .limit(500);

    if (mErr) throw new Error(`SELECT ${DB_TABLES.memberships}: ${errMsg(mErr)}`);

    usingMembershipFallback = true;
    INS = (ms || []).map(r => ({
      id: r.id,
      player_id: r.player_id,
      padre: r.player_id || "—",
      whatsapp: "—",
      jugador: r.player_id || "Jugador",
      edad: "—",
      categoria: r.categoria || "",
      estado: r.estado || "",
      pago_status: Number(r.monto || 0) > 0 ? "Pagado" : "Pendiente",
      notas: r.legacy_inscripcion_id || null,
      beca_req: false,
      created_at: r.created_at || null
    }));
  }

  async function loadCupos(){
    const { data, error } = await supabaseClient
      .from(DB_TABLES.capacities)
      .select(CAP_SELECT)
      .order("categoria", { ascending:true });

    if (error) throw new Error(`SELECT ${DB_TABLES.capacities}: ${errMsg(error)}`);
    CUPOS = data || [];
  }

  async function loadPayments(){
    const { data, error } = await supabaseClient
      .from(DB_TABLES.payments)
      .select("id,player_id,category_id,amount,currency,method,month,paid_at,status,note,created_at")
      .order("created_at", { ascending:false })
      .limit(200);

    if (error) throw new Error(`SELECT ${DB_TABLES.payments}: ${errMsg(error)}`);

    PAYMENTS = (data || []).map(p => {
      const row = INS.find(x =>
        String(x.player_id || "") === String(p.player_id) ||
        String(x.id || "") === String(p.player_id)
      );
      return {
        ...p,
        player_name: row?.jugador || null
      };
    });
  }

  async function loadPlayersAndMorosos(){
    if (!DB_TABLES.players) {
      PLAYERS = [];
      MOROSOS = [];
      return;
    }

    const { data, error } = await supabaseClient
      .from(DB_TABLES.players)
      .select(PLY_SELECT)
      .eq(PLY.status, APP_STATUS.activePlayer)
      .limit(1000);

    if (error) throw new Error(`SELECT ${DB_TABLES.players}: ${errMsg(error)}`);

    PLAYERS = data || [];
    const monthISO = getCurrentMonthISO();
    MOROSOS = PLAYERS.filter(p => {
      const pays = Array.isArray(p.payments) ? p.payments : [];
      const hasMonthPaid = pays.some(x => x?.month === monthISO && String(x?.status || "").toLowerCase() === "paid");
      return !hasMonthPaid;
    });
  }

  async function updateInscripcion(id, patch){
    if (usingMembershipFallback) {
      const mapped = {};
      if (Object.prototype.hasOwnProperty.call(patch, "estado")) mapped.estado = patch.estado;
      if (Object.keys(mapped).length === 0) return;

      const { error } = await supabaseClient
        .from(DB_TABLES.memberships)
        .update(mapped)
        .eq("id", id);

      if (error) throw new Error(`UPDATE ${DB_TABLES.memberships}: ${errMsg(error)}`);
      return;
    }

    const mappedPatch = Object.entries(patch || {}).reduce((acc, [key, value]) => {
      const dbKey = ENR_PATCH_MAP[key] || key;
      acc[dbKey] = value;
      return acc;
    }, {});

    const { error } = await supabaseClient
      .from(DB_TABLES.enrollments)
      .update(mappedPatch)
      .eq(ENR.id, id);

    if (error) throw error;
  }

  async function createPayment(payload){
    const { data, error } = await supabaseClient
      .from(DB_TABLES.payments)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function createSession(category_id){
    const { data, error } = await supabaseClient
      .from(DB_TABLES.sessions)
      .insert({ fecha: toISODate(new Date()), category_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function upsertAttendance(session_id, player_id, estado = "present"){
    const { error } = await supabaseClient
      .from(DB_TABLES.attendance)
      .upsert({ session_id, player_id, estado });

    if (error) throw error;
  }

  async function saveCupos(){
    const inputs = Array.from(document.querySelectorAll("[data-cupo-id]"));
    const updates = inputs
      .map(inp => ({
        [CAP.id]: inp.getAttribute("data-cupo-id"),
        [CAP.category]: (inp.getAttribute("data-cupo-cat") || "").trim(),
        [CAP.total]: Number(inp.value || 0)
      }))
      .filter(row => row[CAP.id] && row[CAP.category]);

    // upsert por id
    const { error } = await supabaseClient
      .from(DB_TABLES.capacities)
      .upsert(updates, { onConflict: CAP.id });

    if (error) throw error;
  }

  // ---------- Dashboard extras ----------
  async function renderDashRecent(){
    const box = document.getElementById("dashRecent");
    if (!box) return;

    const items = INS.slice(0, 6).map(r => `
      <div class="admin-item">
        <div>
          <strong>${esc(r.jugador)}</strong>
          <div class="meta">${esc(r.categoria)} • ${esc(r.estado)} • ${esc(r.pago_status)}</div>
        </div>
        <div class="meta">${r.created_at ? esc(r.created_at.slice(0,10)) : ""}</div>
      </div>
    `).join("");

    box.innerHTML = items || `<div class="hint">No hay inscripciones aún.</div>`;
  }

  // ---------- Bindings ----------
  function bindOpsEvents(){
    document.getElementById("opsSearch")?.addEventListener("input", renderOpsTable);
    document.getElementById("opsFilter")?.addEventListener("change", renderOpsTable);

    document.getElementById("opsReload")?.addEventListener("click", async () => {
      await reloadAll();
    });

    document.getElementById("cuposReload")?.addEventListener("click", async () => {
      await loadCupos();
      renderCuposTable();
    });

    document.getElementById("cuposSave")?.addEventListener("click", async () => {
      const msg = document.getElementById("cuposMsg");
      if (msg) msg.textContent = "";
      try{
        await saveCupos();
        if (msg) msg.textContent = "Cupos guardados ✅";
      }catch(e){
        console.error(e);
        if (msg) msg.textContent = "Error guardando cupos (RLS/permiso).";
      }
    });

    // Delegación para selects y botones de tabla
    opsMount.addEventListener("change", async (e) => {
      const sel = e.target.closest("select[data-action]");
      if (!sel) return;

      const id = sel.getAttribute("data-id");
      const action = sel.getAttribute("data-action");
      const val = sel.value;
      const row = INS.find(x => String(x.id) === String(id));

      if (action === "pago" && !row?.id) return alert("No tengo ID de inscripción para cobrar.");

      try{
        if (action === "estado") await updateInscripcion(id, { estado: val });
        if (action === "pago") {
          await updateInscripcion(id, { pago_status: val });
        }

        // actualiza memoria y re-render
        const r = row;
        if (r){
          if (action === "estado") r.estado = val;
          if (action === "pago") r.pago_status = val;
        }
        renderOpsTable();
        renderFinanzas();
        renderDashRecent();
      }catch(err){
        console.error(err);
        alert("No se pudo guardar (RLS/permiso).");
      }
    });

    opsMount.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");

      if (action === "wa"){
        const phone = btn.getAttribute("data-phone");
        const msg = btn.getAttribute("data-msg");
        if (!phone) return alert("WhatsApp inválido.");
        window.open(`${waLink(phone)}?text=${msg}`, "_blank");
        return;
      }

      if (action === "notes"){
        const id = btn.getAttribute("data-id");
        const r = INS.find(x => String(x.id) === String(id));
        const current = r?.notas || "";
        const next = prompt("Notas (se guarda):", current);
        if (next === null) return;
        updateInscripcion(id, { notas: next || null })
          .then(() => { if (r) r.notas = next; })
          .catch(err => { console.error(err); alert("No se pudo guardar notas."); });
      }

      if (action === "pay"){
        const id = btn.getAttribute("data-id");
        const row = INS.find(x => String(x.id) === String(id));
        openPaymentModal(row);
      }
    });
  }

  async function reloadAll(){
    const failures = [];

    try { await loadInscripciones(); }
    catch (e) { failures.push(errMsg(e)); INS = []; }

    try { await loadCupos(); }
    catch (e) { failures.push(errMsg(e)); CUPOS = []; }

    try { await loadPayments(); }
    catch (e) { failures.push(errMsg(e)); PAYMENTS = []; }

    try { await loadPlayersAndMorosos(); }
    catch (e) { failures.push(errMsg(e)); PLAYERS = []; MOROSOS = []; }

    renderOpsTable();
    renderCuposTable();
    renderFinanzas();
    renderDashRecent();
    await renderStaffMe();

    if (failures.length) {
      const joined = failures.join(" | ");
      console.error("Errores de carga:", joined);
      alert(`Permisos/RLS incompletos: ${joined}`);
    }
  }

  // ---------- Boot ----------
  function boot(){
    mountOpsUI();
    mountFinUI();
    mountStaffUI();
    mountPaymentModal();
    bindOpsEvents();
    window.GA_ADMIN_API = {
      createSession,
      upsertAttendance
    };
  }

  // Arranca cuando estés logueado
  window.addEventListener("admin:ready", async () => {
    try{
      boot();
      await reloadAll();
    }catch(err){
      console.error(err);
      alert(`No pude cargar data: ${errMsg(err)}`);
    }
  });

})();
