// Álbum Mundial 2026 — lógica del tracker
(function () {
  "use strict";

  const STORAGE_KEY = "mundial2026-album";
  const THEME_KEY = "mundial2026-theme";

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

  function bump(id, delta) {
    setCount(id, getCount(id) + delta);
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
    if (confirm("¿Seguro que quieres borrar todo tu progreso? Esta acción no se puede deshacer.")) {
      counts = {};
      save();
      renderAll();
      toast("Progreso reiniciado");
    }
  });

  // ---------- Inicio ----------
  function renderAll() {
    for (const s of ALL_STICKERS) renderCell(s.id);
    renderStats();
    renderSectionStats();
    applyFilters();
  }

  renderAll();
})();
