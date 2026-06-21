const CATS = {
  all:        { label: "All", icon: "🛍️" },
  makeup:     { label: "Makeup", icon: "💄" },
  shoes:      { label: "Shoes", icon: "👟" },
  clothing:   { label: "Clothing", icon: "👗" },
  appliances: { label: "Appliances", icon: "🔌" },
};

let DATA = { passes: [], rejects: [], meta: {} };
let activeCat = "all";
let searchQuery = "";

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const savings = (d) => Math.round((1 - d.dupe.price / d.original.price) * 100);
const money = (n) => "$" + (Number(n) % 1 === 0 ? n : n.toFixed(2));

function stars(rating) {
  const full = Math.round(rating);
  return `<span class="stars">${"★".repeat(full)}${"☆".repeat(5 - full)}<small>${rating.toFixed(1)}</small></span>`;
}

function card(d) {
  const isReject = d.verdict === "reject";
  return `
  <button class="card" data-id="${esc(d.id)}">
    <div class="card-top">
      <span class="cat-tag">${CATS[d.category]?.icon || ""} ${CATS[d.category]?.label || d.category}</span>
      <span class="badge ${isReject ? "reject" : "pass"}">${isReject ? "✕ Rejected" : "✓ Review-vetted"}</span>
    </div>
    <h3>${esc(d.dupe.brand)} ${esc(d.dupe.name)}</h3>
    <p class="dupe-for">${isReject ? "Sold as a dupe for" : "Dupe for"} <b>${esc(d.original.brand)} ${esc(d.original.name)}</b></p>
    <div class="price-row">
      <span class="price-dupe">${money(d.dupe.price)}</span>
      <span class="price-orig">${money(d.original.price)}</span>
      <span class="save">save ${savings(d)}%</span>
    </div>
    <div class="card-foot">
      ${stars(d.rating)}
      <span class="see">${isReject ? "Why it failed →" : "See reviews →"}</span>
    </div>
  </button>`;
}

function renderStats() {
  const n = DATA.passes.length;
  const avg = Math.round(DATA.passes.reduce((a, d) => a + savings(d), 0) / n);
  const checked = n + DATA.rejects.length;
  $("#stats").innerHTML = `
    <div class="stat accent"><b>${n}</b><span>dupes that passed</span></div>
    <div class="stat"><b>${avg}%</b><span>avg. you save</span></div>
    <div class="stat"><b>${checked}</b><span>researched in total</span></div>
    <div class="stat"><b>${DATA.rejects.length}</b><span>rejected (shown below)</span></div>`;
}

function renderFilters() {
  $("#filters").innerHTML = Object.entries(CATS).map(([key, c]) => {
    const count = key === "all" ? DATA.passes.length : DATA.passes.filter((d) => d.category === key).length;
    return `<button class="filter-btn ${key === activeCat ? "active" : ""}" data-cat="${key}">
      ${c.icon} ${c.label} <span class="count">${count}</span></button>`;
  }).join("");
}

function renderGrid() {
  let list = activeCat === "all" ? DATA.passes : DATA.passes.filter((d) => d.category === activeCat);
  
  // Apply search filter if query exists
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    list = list.filter((d) => 
      d.dupe.name.toLowerCase().includes(query) ||
      d.dupe.brand.toLowerCase().includes(query) ||
      d.original.name.toLowerCase().includes(query) ||
      d.original.brand.toLowerCase().includes(query)
    );
  }
  
  $("#grid").innerHTML = list.map(card).join("");
  $("#resultsNote").textContent =
    `Showing ${list.length} review-vetted ${activeCat === "all" ? "" : CATS[activeCat].label.toLowerCase() + " "}dupe${list.length === 1 ? "" : "s"}${searchQuery.trim() ? ` matching "${searchQuery}"` : ""} — each one passed the check.`;
}

function renderRejects() {
  $("#rejectsGrid").innerHTML = DATA.rejects.map(card).join("");
  $("#rejectsLabel").textContent = `Didn't make the cut (${DATA.rejects.length})`;
}

function openModal(d) {
  const isReject = d.verdict === "reject";
  const reviews = (d.reviews || []).map((r) => `
    <div class="review">
      <div class="src"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.source)}</a><span class="ext">source ↗</span></div>
      <p>${esc(r.takeaway)}</p>
    </div>`).join("");
  const reasons = d.reasons ? `<ul class="m-reasons">${d.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  $("#modalBody").innerHTML = `
    <div class="m-head">
      <span class="cat-tag">${CATS[d.category]?.icon || ""} ${CATS[d.category]?.label}</span>
      <span class="badge ${isReject ? "reject" : "pass"}">${isReject ? "✕ Rejected" : "✓ Review-vetted"}</span>
      ${stars(d.rating)}
    </div>
    <h2 id="modalTitle">${esc(d.dupe.brand)} ${esc(d.dupe.name)}</h2>
    <div class="m-compare">
      <div class="col dupe"><small>The dupe</small><div class="name">${esc(d.dupe.brand)} ${esc(d.dupe.name)}</div><div class="p">${money(d.dupe.price)}</div></div>
      <div class="vs">vs</div>
      <div class="col"><small>The original</small><div class="name">${esc(d.original.brand)} ${esc(d.original.name)}</div><div class="p">${money(d.original.price)}</div></div>
    </div>
    <p class="m-save">You save about ${money(d.original.price - d.dupe.price)} (${savings(d)}%)</p>
    <p class="m-summary">${esc(d.summary)}</p>
    ${reasons}
    ${d.caveat ? `<div class="m-caveat"><b>${isReject ? "Our take:" : "Heads up:"}</b> ${esc(d.caveat)}</div>` : ""}
    <div class="m-reviews"><h4>${isReject ? "What reviewers found" : "Reviews that passed our check"}</h4>${reviews}</div>
    ${isReject ? "" : `<p class="m-buy">Where to find it: search “${esc(d.dupe.brand)} ${esc(d.dupe.name)}” at major retailers. We don't use affiliate links — prices are approximate, verify before buying.</p>`}`;
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }

function byId(id) { return [...DATA.passes, ...DATA.rejects].find((d) => d.id === id); }

document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (cardEl) { openModal(byId(cardEl.dataset.id)); return; }
  const filterEl = e.target.closest(".filter-btn");
  if (filterEl) { activeCat = filterEl.dataset.cat; renderFilters(); renderGrid(); return; }
  if (e.target.closest("#modalClose") || e.target.id === "modal") closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
$("#rejectsToggle").addEventListener("click", () => {
  const g = $("#rejectsGrid");
  const open = g.hidden;
  g.hidden = !open;
  $("#rejectsToggle").setAttribute("aria-expanded", String(open));
});

// Search functionality
$("#searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderGrid();
});

fetch("data.json")
  .then((r) => r.json())
  .then((json) => {
    DATA.meta = json.meta || {};
    DATA.passes = json.dupes.filter((d) => d.verdict === "pass");
    DATA.rejects = json.dupes.filter((d) => d.verdict === "reject");
    renderStats(); renderFilters(); renderGrid(); renderRejects();
    $("#methodology").textContent = DATA.meta.methodology || "";
    $("#disclaimer").textContent = DATA.meta.disclaimer || "";
    $("#updated").textContent = DATA.meta.updated || "";
  })
  .catch((err) => {
    $("#grid").innerHTML = `<p style="color:var(--warn)">Couldn't load data: ${esc(err.message)}. (If opening locally, run a local server — see README.)</p>`;
  });
