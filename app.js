/* ============================================
   ZYNIFLIX - Netflix-Style Streaming App
   ============================================ */

// ===== CONFIG =====
const CV_API = 'https://moviebox.davidcyril.name.ng/api';
const CV_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://cineverse.name.ng/',
  'Origin': 'https://cineverse.name.ng',
  'Accept': 'application/json'
};
const MYLIST_KEY = 'zynflix-list-v2';
const INTRO_KEY = 'zynflix-intro';
const SEARCH_KEY = 'zynflix-search-v1';
const VERSION = Date.now();

// ===== STATE =====
let heroTimer = null;
let heroItems = [];
let heroIdx = 0;
let currentMovie = null;
let currentSeason = 1;
let currentEpisode = 1;
let mylist = loadList();
let recentSearches = loadSearches();
let playerActive = false;
let currentSubtitles = [];
let activeSubLang = '';
let allMovies = [];
let allSeries = [];
let allTrending = [];

// ===== DOM =====
const $ = id => document.getElementById(id);
const intro = $('intro');
const app = $('app');
const heroBackdrop = $('heroBackdrop');
const heroTitle = $('heroTitle');
const heroOverview = $('heroOverview');
const heroMeta = $('heroMeta');
const heroBadge = $('heroBadge');
const heroPlay = $('heroPlay');
const heroInfo = $('heroInfo');
const rowsContainer = $('rowsContainer');
const searchResults = $('searchResults');
const searchInput = $('searchInput');
const modalOverlay = $('modalOverlay');
const modalClose = $('modalClose');
const modalBackdrop = $('modalBackdrop');
const modalTitle = $('modalTitle');
const modalPlay = $('modalPlay');
const modalMatch = $('modalMatch');
const modalYear = $('modalYear');
const modalDuration = $('modalDuration');
const modalRating = $('modalRating');
const modalDescription = $('modalDescription');
const modalCast = $('modalCast');
const modalGenres = $('modalGenres');
const modalTags = $('modalTags');
const modalEpisodes = $('modalEpisodes');
const seasonSelect = $('seasonSelect');
const episodeList = $('episodeList');
const similarGrid = $('similarGrid');
const playerOverlay = $('playerOverlay');
const videoPlayer = $('videoPlayer');
const playerBack = $('playerBack');
const playerTitle = $('playerTitle');
const subtitleBtn = $('subtitleBtn');
const subtitleMenu = $('subtitleMenu');
const subtitleLabel = $('subtitleLabel');
const subtitleControls = $('subtitleControls');
const playerNotReady = $('playerNotReady');
const notReadyMsg = $('notReadyMsg');
const qualityOverlay = $('qualityOverlay');
const qualityClose = $('qualityClose');
const qualityMovieName = $('qualityMovieName');
const qualityOptions = $('qualityOptions');
const qualityLoading = $('qualityLoading');
const bottomNav = $('bottomNav');
const searchOverlay = $('searchOverlay');
const searchOverlayInput = $('searchOverlayInput');
const searchOverlayClear = $('searchOverlayClear');
const searchOverlayCancel = $('searchOverlayCancel');
const recentSearchesDiv = $('recentSearches');
const recentSearchList = $('recentSearchList');
const clearRecentSearches = $('clearRecentSearches');
const searchOverlayResults = $('searchOverlayResults');
const downloadsPage = $('downloadsPage');
const mylistResults = $('mylistResults');
const installPrompt = $('installPrompt');
const installDismiss = $('installDismiss');
const castGrid = $('castGrid');
const modalAddList = $('modalAddList');
const modalDownload = $('modalDownload');

// ===== UTILS =====
function getYear(d) { return d ? d.split('-')[0] : ''; }
function formatDur(s) {
  if (!s) return '';
  if (typeof s === 'number') return s >= 60 ? `${Math.floor(s/60)}h ${s%60}m` : `${s}m`;
  return s;
}

// ===== STORAGE =====
const CONTINUE_KEY = 'zynflix-continue-v1';
function loadContinueWatching() { try { return JSON.parse(localStorage.getItem(CONTINUE_KEY)) || []; } catch { return []; } }
function saveContinueWatching(list) { try { localStorage.setItem(CONTINUE_KEY, JSON.stringify(list)); } catch {} }
let continueWatching = loadContinueWatching();

function updateContinueWatching(id, title, poster, type, progress, duration, season, episode) {
  continueWatching = continueWatching.filter(c => String(c.id) !== String(id));
  if (progress > 0 && progress < 95) {
    continueWatching.unshift({ id, title, poster, type, progress, duration, season, episode, updated: Date.now() });
    if (continueWatching.length > 20) continueWatching = continueWatching.slice(0, 20);
  }
  saveContinueWatching(continueWatching);
}

function getContinueProgress(id) {
  return continueWatching.find(c => String(c.id) === String(id));
}

function loadList() { try { return JSON.parse(localStorage.getItem(MYLIST_KEY)) || []; } catch { return []; } }
function saveList() { try { localStorage.setItem(MYLIST_KEY, JSON.stringify(mylist)); } catch {} }
function loadSearches() { try { return JSON.parse(localStorage.getItem(SEARCH_KEY)) || []; } catch { return []; } }
function saveSearches() { try { localStorage.setItem(SEARCH_KEY, JSON.stringify(recentSearches)); } catch {} }

function addSearch(q) {
  q = q.trim();
  if (!q) return;
  recentSearches = recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase());
  recentSearches.unshift(q);
  if (recentSearches.length > 10) recentSearches = recentSearches.slice(0, 10);
  saveSearches();
  renderRecentSearches();
}

function removeSearch(q) {
  recentSearches = recentSearches.filter(s => s !== q);
  saveSearches();
  renderRecentSearches();
}

function isInList(id) { return mylist.some(m => String(m.id) === String(id)); }

function toggleList(item) {
  const idx = mylist.findIndex(m => String(m.id) === String(item.id));
  if (idx >= 0) mylist.splice(idx, 1);
  else mylist.push({ id: item.id, title: item.title, poster: item.poster, type: item.type || 'movie' });
  saveList();
  updateListButtons();
}

function updateListButtons() {
  document.querySelectorAll('[data-list-id]').forEach(btn => {
    const id = btn.dataset.listId;
    btn.classList.toggle('in-list', isInList(id));
  });
}

// ===== CINEVERSE API =====
async function cvFetch(url) {
  try {
    const res = await fetch(url, { headers: CV_HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { console.warn('API error:', e); return null; }
}

async function cvSearch(query) {
  const data = await cvFetch(`${CV_API}/search/${encodeURIComponent(query)}`);
  return data?.data?.items || [];
}

async function cvPopular() {
  const data = await cvFetch(`${CV_API}/search/popular`);
  return data?.data?.items || [];
}

async function cvInfo(subjectId) {
  const data = await cvFetch(`${CV_API}/info/${subjectId}`);
  return data?.data?.subject || data?.data || null;
}

async function cvSources(subjectId, season, episode) {
  let url = `${CV_API}/sources/${subjectId}`;
  if (season && episode) url += `?season=${season}&episode=${episode}`;
  const data = await cvFetch(url);
  return data?.data || data || null;
}

// Get detail path from item and fetch sources
async function getSourceFromDetailPath(item) {
  const detailPath = item.detailPath || item.subjectId;
  if (!detailPath) return null;
  return await cvSources(detailPath);
}

// ===== IMAGE HELPERS =====
function thumbUrl(item) {
  return item.thumbnail || item.cover?.url || item.poster || '';
}

function backdropUrl(item) {
  return item.cover?.url || item.thumbnail || item.backdrop || '';
}

// ===== INTRO =====
function playIntro() {
  if (sessionStorage.getItem(INTRO_KEY)) {
    intro.style.display = 'none';
    app.style.display = 'block';
    return;
  }
  sessionStorage.setItem(INTRO_KEY, '1');
  setTimeout(() => {
    intro.classList.add('fade-out');
    setTimeout(() => { intro.style.display = 'none'; app.style.display = 'block'; }, 600);
  }, 2500);
}

// ===== HERO BANNER =====
async function loadHero() {
  try {
    const trending = await cvPopular();
    heroItems = trending.filter(m => (m.cover?.url || m.thumbnail)).slice(0, 10);
    if (!heroItems.length) {
      // Fallback
      const movies = await cvSearch('action');
      heroItems = movies.filter(m => (m.cover?.url || m.thumbnail)).slice(0, 10);
    }
    if (!heroItems.length) return;
    heroIdx = 0;
    showHero(heroItems[0]);
    startHeroRotation();
  } catch (e) { console.warn('Hero error:', e); }
}

function showHero(item) {
  const title = item.title || 'Unknown';
  const desc = item.description || item.overview || '';
  const year = getYear(item.releaseDate || item.first_air_date);
  const rating = item.rating || item.vote_average || '';
  const isSeries = item.subjectType === 2;
  const genres = (item.genres || []).slice(0, 3);
  const bg = item.cover?.url || item.thumbnail || '';

  if (bg) heroBackdrop.style.backgroundImage = `url(${bg})`;
  heroTitle.textContent = title;
  heroOverview.textContent = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
  heroBadge.textContent = isSeries ? 'Series' : 'Film';
  heroMeta.innerHTML = `
    ${rating ? `<span class="meta-imdb">★ ${rating}</span>` : ''}
    ${year ? `<span class="meta-year">${year}</span>` : ''}
    ${genres.length ? `<span class="meta-genre">${genres.join(' · ')}</span>` : ''}
  `;

  heroPlay.onclick = () => showQualityPicker(item.subjectId || item.id, isSeries ? 'tv' : 'movie', item);
  heroInfo.onclick = () => openModal(item.subjectId || item.id, isSeries ? 'tv' : 'movie');
}

function startHeroRotation() {
  stopHeroRotation();
  if (heroItems.length <= 1) return;
  heroTimer = setInterval(() => {
    heroIdx = (heroIdx + 1) % heroItems.length;
    const hero = document.querySelector('.hero');
    hero.style.transition = 'opacity 0.6s ease';
    hero.style.opacity = '0.5';
    setTimeout(() => { showHero(heroItems[heroIdx]); hero.style.opacity = '1'; }, 400);
  }, 5000);
}

function stopHeroRotation() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
}

// ===== BUILD POSTER CARD =====
function buildCard(item) {
  const id = item.subjectId || item.id;
  const title = item.title || 'Unknown';
  const poster = item.poster || thumbUrl(item);
  const year = getYear(item.releaseDate || item.release_date);
  const rating = item.rating || item.vote_average || '';
  const isSeries = item.subjectType === 2;
  const inList = isInList(id);
  const genres = (item.genres || []).slice(0, 2).join(', ');
  const progress = item.progress || 0;
  
  const progressBar = progress > 0 ? `<div class="progress-bar" style="width:${progress}%"></div>` : '';

  return `
    <div class="poster-card" data-id="${id}" data-type="${isSeries ? 'tv' : 'movie'}">
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22 fill=%22%23222%22%3E%3Crect width=%22300%22 height=%22450%22/%3E%3Ctext x=%22150%22 y=%22225%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
      <div class="poster-overlay">
        <div class="poster-title">${title}</div>
        <div class="poster-meta">
          ${rating ? `<span class="match">★ ${rating}</span>` : ''}
          ${year ? `<span class="year">${year}</span>` : ''}
          <span class="rating-badge">${isSeries ? 'TV' : 'Movie'}</span>
        </div>
        ${genres ? `<div class="poster-genres">${genres}</div>` : ''}
        <div class="poster-actions">
          <button class="poster-action-btn play-btn" data-play-id="${id}" data-play-type="${isSeries ? 'tv' : 'movie'}" title="Play">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="poster-action-btn ${inList ? 'in-list' : ''}" data-list-id="${id}" data-list-title="${title}" data-list-poster="${poster}" data-list-type="${isSeries ? 'tv' : 'movie'}" title="My List">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${inList ? '<polyline points="20 6 9 17 4 12"/>' : '<path d="M12 5v14"/><path d="M5 12h14"/>'}
            </svg>
          </button>
        </div>
      </div>
      ${progressBar}
    </div>`;
}

function buildRow(title, items, isContinue, isTop10) {
  if (!items.length) return '';
  const rowClass = isTop10 ? 'movie-row top-10-row' : (isContinue ? 'movie-row continue-row' : 'movie-row');
  const itemsHtml = isTop10 
    ? items.map((item, idx) => buildTop10Card(item, idx + 1)).join('')
    : items.map(buildCard).join('');
  return `<section class="${rowClass}">
    <h2 class="row-title">${title}</h2>
    <div class="row-slider">
      <button class="slider-arrow left" data-dir="-1">&#8249;</button>
      <div class="row-posters">${itemsHtml}</div>
      <button class="slider-arrow right" data-dir="1">&#8250;</button>
    </div>
  </section>`;
}

function buildTop10Card(item, rank) {
  const id = item.subjectId || item.id;
  const type = item.subjectType === 2 ? 'tv' : 'movie';
  const title = item.title || item.name || 'Unknown';
  const poster = thumbUrl(item);
  return `<div class="poster-card top-10-card" data-id="${id}" data-type="${type}">
    <div class="top-10-rank">${rank}</div>
    <img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.background='#222'" />
    <div class="poster-overlay">
      <div class="poster-title">${title}</div>
    </div>
  </div>`;
}

function setupArrows() {
  document.querySelectorAll('.slider-arrow').forEach(a => {
    a.onclick = () => {
      const p = a.closest('.row-slider').querySelector('.row-posters');
      p.scrollBy({ left: parseInt(a.dataset.dir) * p.clientWidth * 0.75, behavior: 'smooth' });
    };
  });
}

function bindCards(container) {
  container.querySelectorAll('.poster-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.poster-action-btn')) return;
      openModal(card.dataset.id, card.dataset.type || 'movie');
    };
  });
  container.querySelectorAll('[data-play-id]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const card = btn.closest('.poster-card');
      const item = {
        subjectId: btn.dataset.playId,
        title: card?.querySelector('.poster-title')?.textContent || '',
        subjectType: btn.dataset.playType === 'tv' ? 2 : 1
      };
      showQualityPicker(btn.dataset.playId, btn.dataset.playType || 'movie', item);
    };
  });
  container.querySelectorAll('[data-list-id]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleList({
        id: btn.dataset.listId,
        title: btn.dataset.listTitle || '',
        poster: btn.dataset.listPoster || '',
        type: btn.dataset.listType || 'movie'
      });
      btn.classList.toggle('in-list', isInList(btn.dataset.listId));
    };
  });
}

// ===== LOAD HOME =====
async function loadHome() {
  rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';

  try {
    const trending = await cvPopular();
    allTrending = trending;
    const top10 = trending.slice(0, 10);

    const continueList = continueWatching.filter(c => {
      const item = trending.find(t => String(t.subjectId || t.id) === String(c.id));
      return item && c.progress > 0 && c.progress < 95;
    });

    const actionResults = await cvSearch('action');
    const horrorResults = await cvSearch('horror');
    const comedyResults = await cvSearch('comedy');
    const romanceResults = await cvSearch('romance');
    const scifiResults = await cvSearch('sci-fi');
    const thrillerResults = await cvSearch('thriller');
    const dramaResults = await cvSearch('drama');
    const animationResults = await cvSearch('animation');
    const adventureResults = await cvSearch('adventure');
    const crimeResults = await cvSearch('crime');
    const fantasyResults = await cvSearch('fantasy');
    const documentaryResults = await cvSearch('documentary');

    const rows = [];
    if (continueList.length) rows.push({ title: 'Continue Watching', items: continueList, isContinue: true });
    if (top10.length) rows.push({ title: 'Top 10 Movies', items: top10, isTop10: true });
    if (trending.length) rows.push({ title: 'Trending Now', items: trending });
    if (actionResults.length) rows.push({ title: 'Action Movies', items: actionResults });
    if (scifiResults.length) rows.push({ title: 'Sci-Fi & Fantasy', items: scifiResults });
    if (thrillerResults.length) rows.push({ title: 'Thrillers', items: thrillerResults });
    if (horrorResults.length) rows.push({ title: 'Horror', items: horrorResults });
    if (comedyResults.length) rows.push({ title: 'Comedy', items: comedyResults });
    if (romanceResults.length) rows.push({ title: 'Romance', items: romanceResults });
    if (dramaResults.length) rows.push({ title: 'Drama', items: dramaResults });
    if (adventureResults.length) rows.push({ title: 'Adventure', items: adventureResults });
    if (crimeResults.length) rows.push({ title: 'Crime', items: crimeResults });
    if (animationResults.length) rows.push({ title: 'Animation', items: animationResults });
    if (fantasyResults.length) rows.push({ title: 'Fantasy', items: fantasyResults });
    if (documentaryResults.length) rows.push({ title: 'Documentaries', items: documentaryResults });

    rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items, r.isContinue, r.isTop10)).join('');
    setupArrows();
    bindCards(rowsContainer);
  } catch (e) {
    console.warn('Load home error:', e);
    rowsContainer.innerHTML = '<div class="no-results">Unable to load movies. Please try again.</div>';
  }
}

// ===== CATEGORY LOAD =====
async function loadCategory(cat) {
  stopHeroRotation();
  searchResults.classList.add('hidden');
  mylistResults.classList.add('hidden');
  downloadsPage.classList.add('hidden');
  rowsContainer.style.display = '';

  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === cat));

  if (cat === 'home') { await loadHero(); await loadHome(); return; }
  if (cat === 'mylist') {
    rowsContainer.style.display = 'none';
    mylistResults.classList.remove('hidden');
    renderMyList();
    return;
  }
  if (cat === 'hot') {
    rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';
    const trending = await cvPopular();
    const nowPlaying = await cvSearch('now playing');
    const upcoming = await cvSearch('upcoming');
    const rows = [];
    if (trending.length) rows.push({ title: 'Top 10 This Week', items: trending });
    if (nowPlaying.length) rows.push({ title: 'Now Playing', items: nowPlaying });
    if (upcoming.length) rows.push({ title: 'Coming Soon', items: upcoming });
    rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items)).join('');
    setupArrows();
    bindCards(rowsContainer);
    return;
  }
  if (cat === 'search') {
    rowsContainer.style.display = 'none';
    openSearchOverlay();
    return;
  }
  if (cat === 'downloads') {
    rowsContainer.style.display = 'none';
    downloadsPage.classList.remove('hidden');
    return;
  }
}

// ===== MY LIST =====
function renderMyList() {
  if (!mylist.length) {
    mylistResults.innerHTML = '<h2>My List</h2><div class="no-results">Your list is empty. Tap + on any movie to add it here.</div>';
    return;
  }
  mylistResults.innerHTML = `<h2>My List</h2><div class="search-grid">${mylist.map(m => `
    <div class="poster-card" data-id="${m.id}" data-type="${m.type || 'movie'}">
      <img src="${m.poster || ''}" alt="${m.title}" loading="lazy" onerror="this.style.background='#222'" />
      <div class="poster-overlay">
        <div class="poster-title">${m.title}</div>
        <div class="poster-actions">
          <button class="poster-action-btn play-btn" data-play-id="${m.id}" data-play-type="${m.type || 'movie'}" title="Play">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="poster-action-btn in-list" data-list-id="${m.id}" title="Remove">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>
    </div>`).join('')}</div>`;
  bindCards(mylistResults);
}

// ===== MOVIE MODAL =====
async function openModal(id, type) {
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modalBackdrop.style.backgroundImage = '';
  modalTitle.textContent = 'Loading...';
  modalDescription.textContent = '';
  modalMatch.textContent = '';
  modalYear.textContent = '';
  modalDuration.textContent = '';
  modalRating.textContent = '';
  modalCast.textContent = '';
  modalGenres.textContent = '';
  modalTags.textContent = '';
  modalEpisodes.classList.add('hidden');
  similarGrid.innerHTML = '';
  castGrid.innerHTML = '';

  const details = await cvInfo(id);
  if (!details) {
    modalTitle.textContent = 'Details unavailable';
    return;
  }

  currentMovie = { ...details, id };
  const title = details.title || 'Unknown';
  const year = getYear(details.releaseDate);
  const rating = details.rating || '';
  const isSeries = details.subjectType === 2;
  const desc = details.description || details.overview || '';
  const genres = details.genres || [];
  const duration = details.duration || details.runtime || '';
  const cast = details.casts || details.cast || [];
  const bg = details.cover?.url || details.thumbnail || '';

  if (bg) modalBackdrop.style.backgroundImage = `url(${bg})`;
  modalTitle.textContent = title;
  modalDescription.textContent = desc;
  modalMatch.textContent = rating ? `${rating}/10` : '';
  modalYear.textContent = year;
  modalDuration.textContent = formatDur(duration);
  modalRating.textContent = rating ? `★ ${rating}` : '';
  modalGenres.textContent = genres.join(', ') || 'N/A';
  modalTags.textContent = genres.slice(0, 2).join(', ') || 'N/A';

  // Cast
  if (Array.isArray(cast) && cast.length) {
    const castSection = $('modalCastSection');
    if (castSection) castSection.classList.remove('hidden');
    modalCast.textContent = cast.slice(0, 10).map(c => typeof c === 'string' ? c : (c.name || '')).filter(Boolean).join(', ');
    castGrid.innerHTML = cast.slice(0, 12).map(c => {
      const name = typeof c === 'string' ? c : (c.name || '');
      const char = typeof c === 'object' ? (c.character || c.role || '') : '';
      const photo = typeof c === 'object' ? (c.photo || c.profile_path || '') : '';
      return `<div class="cast-card">
        <img class="cast-photo" src="${photo || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22 fill=%22%23333%22%3E%3Crect width=%2280%22 height=%2280%22 rx=%2240%22/%3E%3Ctext x=%2240%22 y=%2246%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2224%22%3E${name.charAt(0)}%3C/text%3E%3C/svg%3E'}" alt="${name}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22 fill=%22%23333%22%3E%3Crect width=%2280%22 height=%2280%22 rx=%2240%22/%3E%3Ctext x=%2240%22 y=%2246%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2224%22%3E${name.charAt(0)}%3C/text%3E%3C/svg%3E'" />
        <div class="cast-name">${name}</div>
        ${char ? `<div class="cast-char">${char}</div>` : ''}
      </div>`;
    }).join('');
  }

  // Play
  modalPlay.onclick = () => showQualityPicker(id, isSeries ? 'tv' : 'movie', details);

  // Download
  modalDownload.onclick = () => showDownloadPicker(id, isSeries ? 'tv' : 'movie', details);

  // Watchlist (Add to List button inside modal)
  modalAddList.dataset.listId = id;
  modalAddList.classList.toggle('in-list', isInList(id));
  modalAddList.onclick = () => {
    toggleList({ id, title, poster: bg, type: isSeries ? 'tv' : 'movie' });
    modalAddList.classList.toggle('in-list', isInList(id));
  };

  // Episodes for series
  if (isSeries && details.seasons?.length) {
    modalEpisodes.classList.remove('hidden');
    loadSeasons(id, details.seasons);
  }

  // More Like This - search similar
  const similarQuery = genres[0] || title.split(' ')[0] || 'popular';
  const similarItems = await cvSearch(similarQuery);
  const filtered = similarItems.filter(m => String(m.subjectId || m.id) !== String(id)).slice(0, 6);
  if (filtered.length) {
    similarGrid.innerHTML = filtered.map(buildCard).join('');
    bindCards(similarGrid);
  }
}

async function loadSeasons(subjectId, seasons) {
  seasonSelect.innerHTML = '';
  const valid = seasons.filter(s => (s.seasonNumber || s.season_number || 0) > 0);
  valid.forEach(s => {
    const num = s.seasonNumber || s.season_number;
    const opt = document.createElement('option');
    opt.value = num;
    opt.textContent = `Season ${num}`;
    seasonSelect.appendChild(opt);
  });
  if (valid.length) {
    currentSeason = valid[0].seasonNumber || valid[0].season_number;
    seasonSelect.value = currentSeason;
    await loadEpisodes(subjectId, currentSeason);
  }
  seasonSelect.onchange = async () => {
    currentSeason = parseInt(seasonSelect.value);
    currentEpisode = 1;
    await loadEpisodes(subjectId, currentSeason);
  };
}

async function loadEpisodes(subjectId, sn) {
  episodeList.innerHTML = '<div style="padding:20px;text-align:center;"><div class="loading-spinner"></div></div>';
  const info = await cvInfo(subjectId);
  if (!info) { episodeList.innerHTML = '<div class="no-results">No episodes.</div>'; return; }

  const season = (info.seasons || []).find(s => (s.seasonNumber || s.season_number) === sn);
  const eps = season?.episodes || [];

  if (!eps.length) {
    // Try generating episodes
    const count = season?.maxEp || season?.episodeCount || 10;
    episodeList.innerHTML = Array.from({ length: count }, (_, i) => `
      <div class="episode-item" data-episode="${i + 1}">
        <div class="episode-number">${i + 1}</div>
        <div class="episode-thumb"><div class="episode-play-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></div></div>
        <div class="episode-details"><h4>Episode ${i + 1}</h4></div>
      </div>`).join('');
  } else {
    episodeList.innerHTML = eps.map(ep => {
      const num = ep.episodeNumber || ep.episode_number || 0;
      const name = ep.name || ep.title || `Episode ${num}`;
      const desc = ep.description || ep.overview || '';
      const thumb = ep.thumbnail || ep.still_path || '';
      return `<div class="episode-item" data-episode="${num}">
        <div class="episode-number">${num}</div>
        <div class="episode-thumb" style="position:relative;">
          ${thumb ? `<img src="${thumb}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />` : ''}
          <div class="episode-play-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></div>
        </div>
        <div class="episode-details"><h4>${name}</h4><p>${desc}</p></div>
      </div>`;
    }).join('');
  }

  episodeList.querySelectorAll('.episode-item').forEach(item => {
    item.onclick = () => {
      currentEpisode = parseInt(item.dataset.episode);
      showQualityPicker(subjectId, 'tv', currentMovie);
    };
  });
}

function closeModal() { modalOverlay.classList.add('hidden'); document.body.style.overflow = ''; currentMovie = null; }

// ===== QUALITY PICKER =====
let pendingId = null, pendingType = null, pendingItem = null, fetchedSource = null;
let isDownloadMode = false;

function showQualityPicker(id, type, item) {
  isDownloadMode = false;
  pendingId = id; pendingType = type; pendingItem = item; fetchedSource = null;
  qualityMovieName.textContent = item?.title || item?.name || 'Loading...';
  qualityOverlay.classList.remove('hidden');
  qualityOptions.classList.remove('hidden');
  qualityLoading.classList.add('hidden');
  fetchSource(id, type);
}

function showDownloadPicker(id, type, item) {
  isDownloadMode = true;
  pendingId = id; pendingType = type; pendingItem = item; fetchedSource = null;
  qualityMovieName.textContent = `Download: ${item?.title || item?.name || 'Loading...'}`;
  qualityOverlay.classList.remove('hidden');
  qualityOptions.classList.remove('hidden');
  qualityLoading.classList.add('hidden');
  fetchSource(id, type);
}

async function fetchSource(id, type) {
  const s = type === 'tv' ? currentSeason : null;
  const e = type === 'tv' ? currentEpisode : null;
  
  let data = await cvSources(id, s, e);
  
  // If no result, try with detailPath approach
  if (!data || (!data.url && !data.link && !data.streamUrl && !data.videoUrl && !(data.processedSources?.length) && !(data.downloads?.length))) {
    data = await getSourceFromDetailPath({ detailPath: id });
  }
  
  let videoUrl = null;
  let subtitles = [];
  let qualities = [];

  if (data) {
    if (Array.isArray(data.processedSources) && data.processedSources[0]) {
      videoUrl = data.processedSources[0].downloadUrl || data.processedSources[0].directUrl;
      qualities = data.processedSources;
    } else if (Array.isArray(data.downloads) && data.downloads[0]) {
      videoUrl = data.downloads[0].url;
      qualities = data.downloads;
    } else if (data.url) videoUrl = data.url;
    else if (data.link) videoUrl = data.link;
    else if (data.streamUrl) videoUrl = data.streamUrl;
    else if (data.videoUrl) videoUrl = data.videoUrl;

    if (Array.isArray(data.subtitles)) {
      data.subtitles.forEach((s, i) => {
        const url = s.url || s.src || '';
        if (url) subtitles.push({ label: s.label || s.language || `Sub ${i+1}`, language: s.language || s.label || `s${i}`, url });
      });
    }
  }
  fetchedSource = { videoUrl, subtitles, qualities };
  return fetchedSource;
}

function closeQualityPicker() { qualityOverlay.classList.add('hidden'); pendingId = null; }

qualityClose?.addEventListener('click', closeQualityPicker);
qualityOverlay?.addEventListener('click', e => { if (e.target === qualityOverlay) closeQualityPicker(); });

qualityOptions?.querySelectorAll('.quality-btn').forEach(btn => {
  btn.onclick = async () => {
    const quality = btn.dataset.quality;
    if (!pendingId) return;
    qualityOptions.classList.add('hidden');
    qualityLoading.classList.remove('hidden');
    if (!fetchedSource?.videoUrl) await fetchSource(pendingId, pendingType);
    
    if (isDownloadMode) {
      qualityOverlay.classList.add('hidden');
      if (!fetchedSource?.videoUrl) {
        alert('This title is not available for download right now.');
        pendingId = null; isDownloadMode = false; return;
      }
      const url = fetchedSource.qualities?.length 
        ? fetchedSource.qualities.find(q => (q.quality || q.label || '').toLowerCase().includes(quality))?.downloadUrl || fetchedSource.qualities[0]?.downloadUrl
        : fetchedSource.videoUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Download link not available.');
      }
      pendingId = null; isDownloadMode = false;
      return;
    }
    
    closeQualityPicker();
    if (!fetchedSource?.videoUrl) {
      playerOverlay.classList.remove('hidden');
      playerNotReady.classList.remove('hidden');
      notReadyMsg.textContent = 'This title is not available for streaming right now.';
      return;
    }
    await startPlayback(fetchedSource, quality);
  };
});

async function startPlayback(source, quality) {
  playerOverlay.classList.remove('hidden');
  playerNotReady.classList.add('hidden');
  videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoPlayer.load();
  clearSubs();
  playerActive = true; currentSubtitles = source.subtitles || []; activeSubLang = '';

  let url = source.videoUrl;
  if (source.qualities?.length) {
    const q = parseInt(quality);
    const m = source.qualities.find(sq => {
      const l = (sq.quality || sq.label || sq.resolution || '').toLowerCase();
      return l.includes(String(q));
    });
    if (m) url = m.downloadUrl || m.directUrl || m.url || url;
  }

  if (!url) {
    playerNotReady.classList.remove('hidden');
    notReadyMsg.textContent = 'No video source available';
    return;
  }

  let title = pendingItem?.title || 'Now Playing';
  if (pendingType === 'tv') title += ` S${currentSeason}E${currentEpisode}`;
  title += ` (${quality}p)`;
  playerTitle.textContent = title;

  videoPlayer.src = url;
  videoPlayer.load();
  setupSubs();

  videoPlayer.play().catch(e => {});

  setTimeout(() => {
    try {
      if (playerOverlay.requestFullscreen) playerOverlay.requestFullscreen();
      else if (playerOverlay.webkitRequestFullscreen) playerOverlay.webkitRequestFullscreen();
    } catch {}
  }, 3000);
}

// ===== SUBTITLES =====
function setupSubs() {
  subtitleControls?.classList.remove('hidden');
  subtitleMenu.innerHTML = '';
  const off = document.createElement('button');
  off.className = 'subtitle-option' + (activeSubLang === '' ? ' active' : '');
  off.textContent = 'Off'; off.onclick = () => selectSub('');
  subtitleMenu.appendChild(off);
  currentSubtitles.forEach(sub => {
    const b = document.createElement('button');
    b.className = 'subtitle-option' + (activeSubLang === sub.language ? ' active' : '');
    b.textContent = sub.label; b.onclick = () => selectSub(sub.language);
    subtitleMenu.appendChild(b);
  });
  subtitleLabel.textContent = activeSubLang ? (currentSubtitles.find(s => s.language === activeSubLang)?.label || 'On') : 'Off';
}

function selectSub(lang) {
  activeSubLang = lang; clearSubs();
  if (lang) {
    const sub = currentSubtitles.find(s => s.language === lang);
    if (sub?.url) {
      const track = document.createElement('track');
      track.kind = 'subtitles'; track.label = sub.label;
      track.srclang = (sub.language || 'en').slice(0, 2);
      track.src = sub.url; track.default = true;
      videoPlayer.appendChild(track);
      setTimeout(() => {
        Array.from(videoPlayer.textTracks || []).forEach(t => {
          t.mode = (t.label === sub.label || t.language === track.srclang) ? 'showing' : 'disabled';
        });
      }, 200);
    }
  }
  setupSubs();
}

function clearSubs() {
  Array.from(videoPlayer.querySelectorAll('track')).forEach(t => t.remove());
  Array.from(videoPlayer.textTracks || []).forEach(t => { t.mode = 'disabled'; });
}

function closePlayer() {
  playerActive = false; videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoPlayer.load();
  clearSubs();
  playerOverlay.classList.add('hidden');
  subtitleControls?.classList.add('hidden');
  subtitleMenu?.classList.add('hidden');
}

// ===== SEARCH OVERLAY =====
function openSearchOverlay() {
  searchOverlay.classList.remove('hidden');
  renderRecentSearches();
  searchOverlayInput.focus();
  searchOverlayResults.classList.add('hidden');
  recentSearchesDiv.classList.remove('hidden');
}

function closeSearchOverlay() {
  searchOverlay.classList.add('hidden');
  searchOverlayInput.value = '';
}

function renderRecentSearches() {
  if (!recentSearches.length) {
    recentSearchesDiv.classList.add('hidden');
    return;
  }
  recentSearchesDiv.classList.remove('hidden');
  recentSearchList.innerHTML = recentSearches.map(q => `
    <div class="recent-item" data-query="${q}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span>${q}</span>
      <button class="remove-recent" data-remove="${q}">&times;</button>
    </div>`).join('');

  recentSearchList.querySelectorAll('.recent-item').forEach(item => {
    item.onclick = (e) => {
      if (e.target.closest('.remove-recent')) {
        removeSearch(e.target.closest('.remove-recent').dataset.remove);
        return;
      }
      searchOverlayInput.value = item.dataset.query;
      doSearch(item.dataset.query);
    };
  });
}

let searchTimer = null;
async function doSearch(query) {
  if (!query.trim()) {
    searchOverlayResults.classList.add('hidden');
    recentSearchesDiv.classList.remove('hidden');
    return;
  }
  addSearch(query);
  recentSearchesDiv.classList.add('hidden');
  searchOverlayResults.classList.remove('hidden');
  searchOverlayResults.innerHTML = '<div style="display:flex;justify-content:center;padding:40px 0;"><div class="loading-spinner"></div></div>';

  const results = await cvSearch(query);
  if (!results.length) {
    searchOverlayResults.innerHTML = '<h2>Search Results</h2><div class="no-results">No results found.</div>';
    return;
  }
  searchOverlayResults.innerHTML = `<h2>Results for "${query}"</h2><div class="search-grid">${results.map(buildCard).join('')}</div>`;
  bindCards(searchOverlayResults);
}

searchOverlayInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchOverlayInput.value.trim();
  if (!q) { searchOverlayResults.classList.add('hidden'); recentSearchesDiv.classList.remove('hidden'); return; }
  searchTimer = setTimeout(() => doSearch(q), 500);
});

searchOverlayInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch(searchOverlayInput.value.trim());
});

searchOverlayClear?.addEventListener('click', () => {
  searchOverlayInput.value = '';
  searchOverlayResults.classList.add('hidden');
  recentSearchesDiv.classList.remove('hidden');
  searchOverlayInput.focus();
});

searchOverlayCancel?.addEventListener('click', closeSearchOverlay);

clearRecentSearches?.addEventListener('click', () => {
  recentSearches = [];
  saveSearches();
  renderRecentSearches();
});

// ===== INSTALL PROMPT =====
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installPrompt) installPrompt.classList.remove('hidden');
});

installDismiss?.addEventListener('click', () => {
  installPrompt?.classList.add('hidden');
});

installPrompt?.addEventListener('click', (e) => {
  if (e.target === installDismiss || e.target.closest('.install-dismiss')) return;
  if (!deferredPrompt) { installPrompt.classList.add('hidden'); return; }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    installPrompt.classList.add('hidden');
    deferredPrompt = null;
  });
});

// ===== BOTTOM NAV =====
document.querySelectorAll('.bottom-nav-item').forEach(btn => {
  btn.onclick = () => {
    const nav = btn.dataset.nav;
    if (nav === 'search') { openSearchOverlay(); return; }
    closeSearchOverlay();
    loadCategory(nav);
  };
});

// ===== TOP NAV =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = link.dataset.category;
    if (cat) loadCategory(cat);
  });
});

// ===== MODAL EVENTS =====
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
playerBack?.addEventListener('click', closePlayer);
videoPlayer?.addEventListener('timeupdate', () => {
  if (playerActive && videoPlayer.duration > 0) {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    const c = getContinueProgress(pendingId);
    updateContinueWatching(
      pendingId,
      pendingItem?.title || 'Unknown',
      pendingItem?.cover?.url || pendingItem?.thumbnail || '',
      pendingType,
      progress,
      videoPlayer.duration,
      currentSeason,
      currentEpisode
    );
  }
});
subtitleBtn?.addEventListener('click', () => subtitleMenu?.classList.toggle('hidden'));
document.addEventListener('click', e => { if (!e.target.closest('.player-subtitle-controls')) subtitleMenu?.classList.add('hidden'); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (playerActive) closePlayer();
    else if (!qualityOverlay.classList.contains('hidden')) closeQualityPicker();
    else if (!searchOverlay.classList.contains('hidden')) closeSearchOverlay();
    else if (!modalOverlay.classList.contains('hidden')) closeModal();
  }
});

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js?v=' + VERSION).catch(() => {});
  });
}

// ===== INIT =====
async function init() {
  playIntro();
  try { await loadHero(); } catch {}
  try { await loadHome(); } catch {}
}

init().catch(e => console.error('Init error:', e));
