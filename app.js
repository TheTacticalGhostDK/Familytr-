"use strict";

/* ═════════════════════════════════════════════════════════════
   app.js — turns the data in family-data.js into the page

   Coming from Python? A cheat sheet for what you'll see below:
     const x = 5               a variable you won't reassign   (let = one you will)
     function f(a) { ... }     def f(a):
     a => a * 2                lambda a: a * 2
     `Hello ${name}`           f"Hello {name}"
     for (const x of list)     for x in list:
     list.filter(fn)           [x for x in list if fn(x)]
     list.map(fn)              [fn(x) for x in list]
     list.find(fn)             next((x for x in list if fn(x)), None)
     { id: "hans", ... }       a dict (JS calls it an "object"); person.id == person["id"]
     ===                       ==   (always use three equals signs in JS)
   ═════════════════════════════════════════════════════════════ */


/* ── 1. Setup ─────────────────────────────────────────────── */

// A lookup table so we can find anyone from their id:  byId["hans"]
const byId = {};
for (const person of PEOPLE) {
  byId[person.id] = person;
}

// Grab the pieces of the page we need to change (like finding widgets by name)
const viewport = document.getElementById("viewport");
const treeEl   = document.getElementById("tree");
const panel    = document.getElementById("panel");

// Remember who we've already drawn, so nobody appears twice
// (and so a typo in the data can never cause an endless loop)
const placed = new Set();


/* ── 2. Family relationships ──────────────────────────────── */

function spouseOf(person) {
  if (person.spouse) return byId[person.spouse];
  // Nobody wrote "spouse" on this person — maybe it's written on their partner instead
  return PEOPLE.find(other => other.spouse === person.id);
}

function parentsOf(person) {
  return (person.parents || []).map(id => byId[id]).filter(Boolean);
}

function childrenOf(person) {
  const spouse = spouseOf(person);
  const couple = spouse ? [person.id, spouse.id] : [person.id];

  return PEOPLE
    .filter(other => (other.parents || []).some(id => couple.includes(id)))
    .sort((a, b) => birthYear(a) - birthYear(b));   // oldest child on the left
}

function birthYear(person) {
  // Finds the first 4-digit number, so both 1971 and "12 March 1971" work
  const match = String(person.born ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : 9999;
}


/* ── 3. Small helpers ─────────────────────────────────────── */

// Make an element in one line:  el("p", "bio", "Some text")  →  <p class="bio">Some text</p>
// We use textContent (not innerHTML) so names with odd characters can never break the page.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initialsOf(name) {
  const words = name.trim().split(/\s+/);
  const first = words[0][0];
  const last  = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Turns a name into a number 0–359, used as the colour of the initials circle
function hueOf(name) {
  let hue = 0;
  for (const ch of name) hue = (hue * 31 + ch.codePointAt(0)) % 360;
  return hue;
}

function lifespanOf(person) {
  if (person.born && person.died) return `${person.born} – ${person.died}`;
  if (person.born) return `${LABELS.bornPrefix} ${person.born}`;
  if (person.died) return `† ${person.died}`;
  return "";
}


/* ── 4. Building the tree ─────────────────────────────────── */

// The round photo. Initials sit underneath; the <img> covers them if it loads.
// If the file is missing, the <img> removes itself and the initials show through.
function buildAvatar(person) {
  const avatar = el("span", "avatar");
  avatar.style.setProperty("--hue", hueOf(person.name));
  avatar.append(el("span", "initials", initialsOf(person.name)));

  if (person.photo) {
    const img = document.createElement("img");
    img.src = person.photo;
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("error", () => img.remove());
    avatar.append(img);
  }
  return avatar;
}

// One person = one clickable card
function buildCard(person) {
  const card = el("button", "card");
  card.type = "button";
  card.dataset.id = person.id;          // becomes data-id="hans" in the HTML

  card.append(
    buildAvatar(person),
    el("span", "name", person.name),
    el("span", "years", lifespanOf(person)),
  );

  card.addEventListener("click", () => showPerson(person.id));
  return card;
}

// A person (plus spouse) and, recursively, everything below them.
// Returns an <li> — the CSS in style.css draws the connecting lines.
function buildUnit(person) {
  placed.add(person.id);
  const spouse = spouseOf(person);
  if (spouse) placed.add(spouse.id);

  const li = el("li");
  const unit = el("div", "unit");
  unit.append(buildCard(person));
  if (spouse) {
    unit.append(el("span", "bond"), buildCard(spouse));
  }
  li.append(unit);

  // Children who haven't been drawn yet
  const kids = childrenOf(person).filter(kid => !placed.has(kid.id));
  if (kids.length > 0) {
    const ul = el("ul");
    for (const kid of kids) {
      ul.append(buildUnit(kid));        // ← the function calls itself: recursion
    }
    li.append(ul);
  }
  return li;
}


/* ── 5. The detail panel ──────────────────────────────────── */

function buildRelation(label, people) {
  if (people.length === 0) return null;

  const section = el("section", "relation");
  section.append(el("h3", "", label));

  const chips = el("div", "chips");
  for (const p of people) {
    const chip = el("button", "chip", p.name);
    chip.type = "button";
    chip.addEventListener("click", () => showPerson(p.id, { scrollToCard: true }));
    chips.append(chip);
  }
  section.append(chips);
  return section;
}

function showPerson(id, options = {}) {
  const person = byId[id];
  if (!person) return;

  // Highlight the right card
  for (const card of treeEl.querySelectorAll(".card")) {
    card.classList.toggle("selected", card.dataset.id === id);
  }

  // Rebuild the panel from scratch
  panel.replaceChildren();

  const closeButton = el("button", "close", "×");
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", LABELS.close);
  closeButton.addEventListener("click", closePanel);

  const head = el("div", "panel-head");
  head.append(buildAvatar(person), el("h2", "panel-name", person.name));
  const years = lifespanOf(person);
  if (years) head.append(el("p", "panel-years", years));

  panel.append(closeButton, head);
  if (person.bio) panel.append(el("p", "bio", person.bio));

  const spouse = spouseOf(person);
  const sections = [
    buildRelation(LABELS.spouse,   spouse ? [spouse] : []),
    buildRelation(LABELS.parents,  parentsOf(person)),
    buildRelation(LABELS.children, childrenOf(person)),
  ];
  for (const section of sections) {
    if (section) panel.append(section);
  }

  panel.inert = false;
  panel.classList.add("open");
  panel.scrollTop = 0;

  if (options.scrollToCard) {
    const card = treeEl.querySelector(`.card[data-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
}

function closePanel() {
  panel.classList.remove("open");
  panel.inert = true;
  for (const card of treeEl.querySelectorAll(".card.selected")) {
    card.classList.remove("selected");
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanel();
});

// Clicking empty space closes the panel too
viewport.addEventListener("click", event => {
  if (!event.target.closest(".card")) closePanel();
});


/* ── 6. Zoom ──────────────────────────────────────────────── */

let zoom = 1;

function setZoom(newZoom) {
  const clamped = Math.min(1.5, Math.max(0.4, newZoom));

  // Zoom towards the middle of what's currently on screen, not the top-left corner
  const centerX = (viewport.scrollLeft + viewport.clientWidth  / 2) / zoom;
  const centerY = (viewport.scrollTop  + viewport.clientHeight / 2) / zoom;

  zoom = clamped;
  treeEl.style.zoom = zoom;

  viewport.scrollLeft = centerX * zoom - viewport.clientWidth  / 2;
  viewport.scrollTop  = centerY * zoom - viewport.clientHeight / 2;
}

function centerTree() {
  viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  viewport.scrollTop = 0;
}

document.getElementById("zoom-in").addEventListener("click",  () => setZoom(zoom + 0.15));
document.getElementById("zoom-out").addEventListener("click", () => setZoom(zoom - 0.15));
document.getElementById("zoom-reset").addEventListener("click", () => {
  setZoom(1);
  centerTree();
});


/* ── 7. Drag to move around (mouse only; touch screens scroll natively) ── */

let drag = null;          // null = not dragging, otherwise remembers where we started
let justDragged = false;  // used to stop a drag from also counting as a click

viewport.addEventListener("mousedown", event => {
  if (event.button !== 0) return;
  drag = {
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: viewport.scrollLeft,
    scrollTop: viewport.scrollTop,
    moved: false,
  };
});

window.addEventListener("mousemove", event => {
  if (!drag) return;
  const dx = event.clientX - drag.startX;
  const dy = event.clientY - drag.startY;

  if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 5) {
    drag.moved = true;
    viewport.classList.add("dragging");
  }
  if (drag.moved) {
    viewport.scrollLeft = drag.scrollLeft - dx;
    viewport.scrollTop  = drag.scrollTop  - dy;
  }
});

window.addEventListener("mouseup", () => {
  if (drag && drag.moved) {
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
  }
  drag = null;
  viewport.classList.remove("dragging");
});

// "true" = capture phase: runs before the card's own click handler can see the click
viewport.addEventListener("click", event => {
  if (justDragged) {
    event.stopPropagation();
    event.preventDefault();
  }
}, true);


/* ── 8. Start everything ──────────────────────────────────── */

function init() {
  document.title = SETTINGS.title;
  document.getElementById("title").textContent = SETTINGS.title;
  document.getElementById("subtitle").textContent = SETTINGS.subtitle;

  const zoomIn = document.getElementById("zoom-in");
  const zoomOut = document.getElementById("zoom-out");
  zoomIn.textContent = "+";
  zoomIn.setAttribute("aria-label", LABELS.zoomIn);
  zoomOut.textContent = "−";
  zoomOut.setAttribute("aria-label", LABELS.zoomOut);
  document.getElementById("zoom-reset").textContent = LABELS.resetView;

  const root = byId[SETTINGS.rootId];
  if (!root) {
    treeEl.append(el("p", "tree-error", LABELS.rootMissing));
    return;
  }

  const rootList = el("ul");
  rootList.append(buildUnit(root));
  treeEl.append(rootList);

  // Catch mistakes in the data: anyone not connected to the tree gets listed
  const missing = PEOPLE.filter(person => !placed.has(person.id));
  if (missing.length > 0) {
    const names = missing.map(person => person.name).join(", ");
    console.warn("Not connected to the tree:", names);
    treeEl.append(el("p", "tree-note",
      `Not shown: ${names}. Check their "parents" or "spouse" in family-data.js.`));
  }

  centerTree();
}

init();
