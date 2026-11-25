/* ==========================================================
   WEIRD ART MEDIEVAL — script
   1) Une carte se retourne (rotation horizontale) uniquement au clic.
   2) Quand il n'y a plus aucune activité, la page descend lentement.
   ========================================================== */

/* ---------- Réglages faciles à changer ---------- */
const IDLE_DELAY_MS  = 5000; // temps sans activité avant le début du défilement
const SCROLL_SPEED   = 40;   // vitesse en pixels par seconde (plus petit = plus lent)

/* ---------- 1) Retournement des cartes ---------- */
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));
  });
});

/* ---------- 2) Défilement automatique quand il n'y a plus d'activité ---------- */
let idleTimer = null;
let rafId = null;
let lastFrame = 0;
let exactY = 0;   // position "réelle" (avec décimales) pour que le défilement reste fluide et lent
let lastSetY = 0; // dernière position imposée par le script

function maxScroll() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function stopAutoScroll() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function step(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.1); // secondes écoulées (plafonné)
  lastFrame = now;

  exactY += SCROLL_SPEED * dt;
  const limit = maxScroll();

  if (exactY >= limit) {      // arrivé en bas : on s'arrête
    window.scrollTo(0, limit);
    rafId = null;
    return;
  }

  lastSetY = exactY;
  window.scrollTo(0, exactY);
  rafId = requestAnimationFrame(step);
}

function startAutoScroll() {
  if (maxScroll() <= 0) return;           // rien à faire défiler
  exactY = window.scrollY;
  lastSetY = exactY;
  lastFrame = performance.now();
  rafId = requestAnimationFrame(step);
}

/* Toute activité : on arrête le défilement et on relance le compte à rebours */
function onActivity() {
  stopAutoScroll();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startAutoScroll, IDLE_DELAY_MS);
}

['mousemove', 'mousedown', 'click', 'wheel', 'keydown',
 'touchstart', 'touchmove', 'pointerdown'].forEach((evt) => {
  window.addEventListener(evt, onActivity, { passive: true });
});

/* Un défilement fait par la personne (barre de défilement, trackpad...) compte aussi comme activité */
window.addEventListener('scroll', () => {
  if (rafId === null || Math.abs(window.scrollY - lastSetY) > 3) {
    onActivity();
  }
}, { passive: true });

window.addEventListener('resize', onActivity);

/* Départ : compte à rebours dès l'ouverture de la page */
idleTimer = setTimeout(startAutoScroll, IDLE_DELAY_MS);
