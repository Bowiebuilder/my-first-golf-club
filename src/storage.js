/* ============================================
   STORAGE & STATE - src/storage.js
   Global state, localStorage helpers, shared utils
   ============================================ */

// --- Storage Keys ---
const STORAGE_USERS = 'mfgc_users';
const STORAGE_CARDS = 'mfgc_cards_v3';
const STORAGE_ROUNDS = 'mfgc_rounds';
const STORAGE_FEED = 'mfgc_feed';
const STORAGE_SESSION = 'mfgc_session';

// --- Global UI State ---
let currentCardType = 'player';
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'newest';
let currentTop100List = 'world';
let currentTop100Search = '';
let currentTop100View = 'grid';
let currentClubhouseTab = 'overview';
let playerPhotoData = null;
let orgPhotoData = null;

// --- Generic Helpers ---
function _get(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function _set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// --- Users ---
function getUsers() { return _get(STORAGE_USERS); }
function saveUsers(u) { _set(STORAGE_USERS, u); }

// --- Cards ---
function getCards() { return _get(STORAGE_CARDS); }
function saveCards(c) { _set(STORAGE_CARDS, c); }

function addCard(card) {
  const cards = getCards();
  card.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  card.createdAt = new Date().toISOString();
  card.tips = 0;
  cards.unshift(card);
  saveCards(cards);
  return card;
}

// --- Rounds ---
function getRounds() { return _get(STORAGE_ROUNDS); }
function saveRounds(r) { _set(STORAGE_ROUNDS, r); }

// --- Feed ---
function getFeed() { return _get(STORAGE_FEED); }
function saveFeed(f) { _set(STORAGE_FEED, f); }

// --- Shared Utility Functions ---
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getEra(year) {
  if (year < 1960) return 'vintage';
  if (year < 2000) return 'classic';
  return 'modern';
}

function getEraLabel(era) {
  return { vintage: 'Vintage', classic: 'Classic', modern: 'Modern' }[era] || 'Modern';
}

function generateSerial(card) {
  const prefix = card.type === 'player' ? 'PLR' : 'CLB';
  const year = card.yearStarted || '0000';
  const seq = card.id ? card.id.slice(-4).toUpperCase() : '0000';
  return 'MFGC-' + prefix + '-' + year + '-' + seq;
}

function animateNumber(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  const duration = 600;
  const start = parseInt(el.textContent) || 0;
  if (start === target) { el.textContent = target; return; }
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const secs = Math.floor((now - then) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  if (secs < 604800) return Math.floor(secs / 86400) + 'd ago';
  return then.toLocaleDateString();
}
