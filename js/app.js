// Álbum Mundial 2026 — lógica del tracker
(function () {
  "use strict";

  const STORAGE_KEY = "mundial2026-album";
  const THEME_KEY = "mundial2026-theme";
  const FECHA_KEY = "mundial2026-fecha";
  const TOKEN_KEY = "mundial2026-token";
  const REPO = "AdrianValenzuela/mundial-2026";
  const REMOTE_FILE = "progress.json";

  const token = localStorage.getItem(TOKEN_KEY);
  // Sin token = modo visita: se muestra el progreso publicado, sin editar
  const readonly = !token;

  // ---------- Estado ----------
  let counts = loadCounts(); // { stickerId: cantidad }
  let mode = "all"; // all | missing | dupes
  let query = "";

  function loadCounts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      return typeof data === "object" && data !== null ? data : {};
    } catch {
      return {};
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }

  function getCount(id) {
    return counts[id] || 0;
  }

  function setCount(id, value) {
    if (value <= 0) delete counts[id];
    else counts[id] = value;
    save();
  }

  // ---------- Tema ----------
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  themeBtn.addEventListener("click", () => {
    const isDark =
      document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });

  // ---------- Construcción del DOM ----------
  const sectionsEl = document.getElementById("sections");
  const cellById = new Map();
  const sectionEls = []; // { section, teamName, rootEl, countEl, meterEl, stickers }

  function buildSection({ key, title, flag, meta, stickers }) {
    const root = document.createElement("section");
    root.className = "team";
    root.dataset.section = key;

    const head = document.createElement("div");
    head.className = "team-head";
    head.innerHTML =
      `<span class="team-flag">${flag}</span>` +
      `<div><div class="team-name">${title}</div><div class="team-meta">${meta}</div></div>` +
      `<span class="team-count"></span>`;
    root.appendChild(head);

    const meter = document.createElement("div");
    meter.className = "team-meter";
    meter.innerHTML = "<div></div>";
    root.appendChild(meter);

    const grid = document.createElement("div");
    grid.className = "grid";
    for (const s of stickers) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.id = s.id;
      cell.textContent = s.code.replace(/^[A-Z]+ /, "").replace(/^FWC /, "");
      cell.title = `${s.code} — ${s.label}`;
      // Los cromos FWC muestran su código completo corto
      if (s.section === "FWC") cell.textContent = s.code === "00" ? "00" : `F${s.code.split(" ")[1]}`;
      grid.appendChild(cell);
      cellById.set(s.id, cell);
    }
    root.appendChild(grid);
    sectionsEl.appendChild(root);
    sectionEls.push({
      key,
      title,
      rootEl: root,
      countEl: head.querySelector(".team-count"),
      meterEl: meter.firstElementChild,
      stickers,
    });
  }

  const fwcStickers = ALL_STICKERS.filter((s) => s.section === "FWC");
  buildSection({
    key: "FWC",
    title: "Especiales FWC",
    flag: "🏆",
    meta: "Logo Panini · emblema · mascotas · Museo FIFA",
    stickers: fwcStickers,
  });

  for (const team of TEAMS) {
    buildSection({
      key: team.code,
      title: team.name,
      flag: `<img src="https://flagcdn.com/32x24/${team.iso}.png" srcset="https://flagcdn.com/64x48/${team.iso}.png 2x" width="32" height="24" alt="${team.flag}" loading="lazy">`,
      meta: `Grupo ${team.group} · ${team.code} 1–20`,
      stickers: ALL_STICKERS.filter((s) => s.section === team.code),
    });
  }

  // ---------- Interacción con celdas ----------
  let longPressFired = false;
  let pressTimer = null;

  sectionsEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    if (longPressFired) {
      longPressFired = false;
      return;
    }
    bump(cell.dataset.id, +1);
  });

  sectionsEl.addEventListener("contextmenu", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    e.preventDefault();
    bump(cell.dataset.id, -1);
  });

  // Pulsación larga en móvil = restar
  sectionsEl.addEventListener("touchstart", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    pressTimer = setTimeout(() => {
      longPressFired = true;
      bump(cell.dataset.id, -1);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, { passive: true });
  ["touchend", "touchmove", "touchcancel"].forEach((ev) =>
    sectionsEl.addEventListener(ev, () => clearTimeout(pressTimer), { passive: true })
  );

  function touch() {
    localStorage.setItem(FECHA_KEY, new Date().toISOString());
    scheduleSync();
  }

  function bump(id, delta) {
    if (readonly) return;
    setCount(id, getCount(id) + delta);
    touch();
    renderCell(id);
    renderStats();
    renderSectionStats();
    if (mode !== "all") applyFilters();
  }

  // ---------- Render ----------
  function renderCell(id) {
    const cell = cellById.get(id);
    const n = getCount(id);
    cell.classList.toggle("owned", n >= 1);
    let badge = cell.querySelector(".badge");
    if (n >= 2) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge";
        cell.appendChild(badge);
      }
      badge.textContent = "×" + n;
    } else if (badge) {
      badge.remove();
    }
  }

  const heroNumber = document.getElementById("hero-number");
  const heroMeter = document.getElementById("hero-meter");
  const tileHave = document.getElementById("tile-have");
  const tileMissing = document.getElementById("tile-missing");
  const tileDupes = document.getElementById("tile-dupes");

  function computeStats() {
    let have = 0;
    let dupes = 0;
    for (const s of ALL_STICKERS) {
      const n = getCount(s.id);
      if (n >= 1) have++;
      if (n >= 2) dupes += n - 1;
    }
    return { have, missing: TOTAL_STICKERS - have, dupes };
  }

  function renderStats() {
    const { have, missing, dupes } = computeStats();
    const pct = (have / TOTAL_STICKERS) * 100;
    heroNumber.textContent =
      (pct > 0 && pct < 100 ? pct.toFixed(1) : Math.round(pct)) + "%";
    heroMeter.style.width = pct + "%";
    tileHave.textContent = have;
    tileMissing.textContent = missing;
    tileDupes.textContent = dupes;
  }

  function renderSectionStats() {
    for (const sec of sectionEls) {
      let have = 0;
      for (const s of sec.stickers) if (getCount(s.id) >= 1) have++;
      const total = sec.stickers.length;
      sec.countEl.textContent = have === total ? `✔ ${have}/${total}` : `${have}/${total}`;
      sec.countEl.classList.toggle("done", have === total);
      sec.meterEl.style.width = (have / total) * 100 + "%";
    }
  }

  // ---------- Filtros ----------
  const searchEl = document.getElementById("search");
  const chips = document.querySelectorAll(".chip");

  searchEl.addEventListener("input", () => {
    query = searchEl.value.trim().toLowerCase();
    applyFilters();
  });

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      mode = chip.dataset.mode;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      applyFilters();
    })
  );

  function applyFilters() {
    for (const sec of sectionEls) {
      const matchesQuery =
        !query ||
        sec.title.toLowerCase().includes(query) ||
        sec.key.toLowerCase().includes(query);
      let visibleCells = 0;
      for (const s of sec.stickers) {
        const n = getCount(s.id);
        const cellMatches =
          mode === "all" || (mode === "missing" && n === 0) || (mode === "dupes" && n >= 2);
        cellById.get(s.id).classList.toggle("dimmed", !cellMatches);
        if (cellMatches) visibleCells++;
      }
      sec.rootEl.style.display = matchesQuery && visibleCells > 0 ? "" : "none";
    }
  }

  // ---------- Exportar / respaldo ----------
  const outEl = document.getElementById("io-output");
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function listMissing() {
    return ALL_STICKERS.filter((s) => getCount(s.id) === 0).map((s) => s.code);
  }

  function listDupes() {
    return ALL_STICKERS.filter((s) => getCount(s.id) >= 2).map(
      (s) => `${s.code} (×${getCount(s.id) - 1})`
    );
  }

  function showAndCopy(text) {
    outEl.value = text;
    outEl.hidden = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast("Copiado al portapapeles"),
        () => toast("Lista generada (copia manual)")
      );
    } else {
      toast("Lista generada (copia manual)");
    }
  }

  document.getElementById("btn-missing").addEventListener("click", () => {
    const list = listMissing();
    showAndCopy(`FALTAN (${list.length} de ${TOTAL_STICKERS}):\n${list.join(", ")}`);
  });

  document.getElementById("btn-dupes").addEventListener("click", () => {
    const list = listDupes();
    const extra = computeStats().dupes;
    showAndCopy(
      list.length
        ? `REPETIDOS (${extra} cromos para cambiar):\n${list.join(", ")}`
        : "Sin repetidos por ahora."
    );
  });

  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify({ album: "mundial-2026", fecha: new Date().toISOString(), counts }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `album-mundial-2026-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Respaldo descargado");
  });

  const importInput = document.getElementById("import-file");
  document.getElementById("btn-import").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (readonly) return;
      try {
        const data = JSON.parse(reader.result);
        const imported = data.counts || data;
        if (typeof imported !== "object" || imported === null) throw new Error();
        counts = {};
        for (const s of ALL_STICKERS) {
          const n = parseInt(imported[s.id], 10);
          if (n > 0) counts[s.id] = n;
        }
        save();
        touch();
        renderAll();
        toast("Respaldo importado");
      } catch {
        toast("Archivo no válido");
      }
      importInput.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (readonly) return;
    if (confirm("¿Seguro que quieres borrar todo tu progreso? Esta acción no se puede deshacer.")) {
      counts = {};
      save();
      touch();
      renderAll();
      toast("Progreso reiniciado");
    }
  });

  // ---------- Sincronización con GitHub (progress.json en el repo) ----------
  const API_URL = `https://api.github.com/repos/${REPO}/contents/${REMOTE_FILE}`;
  const syncStatusEl = document.getElementById("sync-status");
  const bannerEl = document.getElementById("visit-banner");
  let remoteSha; // undefined = desconocido, null = el archivo no existe aún
  let syncTimer = null;
  let pushing = false;
  let pushAgain = false;
  let attempts = 0;

  function authHeaders(t) {
    return { Authorization: `Bearer ${t || token}`, Accept: "application/vnd.github+json" };
  }

  function setSyncStatus(state) {
    if (readonly) return;
    syncStatusEl.hidden = false;
    syncStatusEl.textContent = {
      pending: "✏️ Sin guardar",
      saving: "☁️ Guardando…",
      ok: "☁️ Guardado",
      error: "⚠️ Error al guardar",
    }[state];
  }

  function scheduleSync() {
    if (readonly) return;
    attempts = 0;
    setSyncStatus("pending");
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      syncTimer = null;
      pushRemote();
    }, 2500);
  }

  async function fetchRemote() {
    try {
      if (token) {
        const r = await fetch(`${API_URL}?ref=main&ts=${Date.now()}`, { headers: authHeaders() });
        if (r.status === 404) {
          remoteSha = null;
          return null;
        }
        if (!r.ok) return null;
        const j = await r.json();
        remoteSha = j.sha;
        return JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\n/g, "")))));
      }
      const r = await fetch(`${REMOTE_FILE}?ts=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  async function pushRemote() {
    if (readonly) return;
    if (pushing) {
      pushAgain = true;
      return;
    }
    pushing = true;
    setSyncStatus("saving");
    try {
      if (remoteSha === undefined) await fetchRemote();
      const fecha = localStorage.getItem(FECHA_KEY) || new Date().toISOString();
      const { have, dupes } = computeStats();
      const body = JSON.stringify({ album: "mundial-2026", fecha, counts }, null, 2);
      const res = await fetch(API_URL, {
        method: "PUT",
        keepalive: true,
        headers: authHeaders(),
        body: JSON.stringify({
          message: `Progreso: ${have}/${TOTAL_STICKERS} (+${dupes} repes)`,
          branch: "main",
          content: btoa(unescape(encodeURIComponent(body))),
          ...(remoteSha ? { sha: remoteSha } : {}),
        }),
      });
      if (!res.ok) {
        remoteSha = undefined; // el sha pudo quedar obsoleto: se pide de nuevo
        throw new Error();
      }
      remoteSha = (await res.json()).content.sha;
      attempts = 0;
      setSyncStatus("ok");
    } catch {
      setSyncStatus("error");
      if (attempts++ < 3) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
          syncTimer = null;
          pushRemote();
        }, 6000);
      }
    }
    pushing = false;
    if (pushAgain) {
      pushAgain = false;
      scheduleSync();
    }
  }

  // Último intento de guardado al salir con cambios pendientes
  window.addEventListener("pagehide", () => {
    if (syncTimer && !readonly) {
      clearTimeout(syncTimer);
      pushRemote();
    }
  });

  function updateBanner(fecha) {
    if (!readonly) return;
    const cuando = fecha
      ? " · actualizado el " +
        new Date(fecha).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
      : " · aún sin progreso publicado";
    bannerEl.textContent = `👀 Así va mi colección (solo lectura)${cuando}`;
    bannerEl.hidden = false;
  }

  // ---------- Panel de conexión (dueño) ----------
  const syncPanel = document.getElementById("sync-panel");
  const tokenInput = document.getElementById("token-input");
  const btnConnect = document.getElementById("btn-connect");
  const btnDisconnect = document.getElementById("btn-disconnect");
  const syncNote = document.getElementById("sync-note");

  document.getElementById("sync-open").addEventListener("click", () => {
    syncPanel.hidden = !syncPanel.hidden;
    if (!syncPanel.hidden) syncPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  if (token) {
    tokenInput.hidden = true;
    btnConnect.hidden = true;
    btnDisconnect.hidden = false;
    syncNote.textContent =
      "Conectado como dueño: tus cambios se publican automáticamente en la web.";
  }

  btnConnect.addEventListener("click", async () => {
    const t = tokenInput.value.trim();
    if (!t) {
      toast("Pega primero el token");
      return;
    }
    const r = await fetch(`https://api.github.com/repos/${REPO}`, { headers: authHeaders(t) }).catch(() => null);
    if (!r || !r.ok) {
      toast("Token no válido o sin acceso al repo");
      return;
    }
    localStorage.setItem(TOKEN_KEY, t);
    toast("Conectado — recargando…");
    setTimeout(() => location.reload(), 700);
  });

  btnDisconnect.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    location.reload();
  });

  // ---------- Inicio ----------
  function renderAll() {
    for (const s of ALL_STICKERS) renderCell(s.id);
    renderStats();
    renderSectionStats();
    applyFilters();
  }

  async function init() {
    document.body.classList.toggle("readonly", readonly);
    // Migración: progreso local anterior a la sincronización, sin fecha
    if (!localStorage.getItem(FECHA_KEY) && Object.keys(counts).length) {
      localStorage.setItem(FECHA_KEY, new Date().toISOString());
    }
    renderAll(); // muestra lo local de inmediato mientras llega lo remoto

    const remote = await fetchRemote();
    if (readonly) {
      if (remote) {
        counts = remote.counts || {};
        renderAll();
        updateBanner(remote.fecha);
      } else {
        updateBanner(null);
      }
      return;
    }

    const localFecha = localStorage.getItem(FECHA_KEY) || "";
    const remoteFecha = (remote && remote.fecha) || "";
    if (remote && remoteFecha > localFecha) {
      // Lo publicado es más reciente (p. ej. editaste desde otro dispositivo)
      counts = remote.counts || {};
      save();
      localStorage.setItem(FECHA_KEY, remoteFecha);
      renderAll();
      setSyncStatus("ok");
    } else if (localFecha && localFecha > remoteFecha) {
      scheduleSync(); // lo local va por delante: publicar
    } else {
      setSyncStatus("ok");
    }
  }

  init();
})();
