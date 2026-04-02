/* ============================================
   ZYNIFLIX - Netflix-Style App
   ============================================ */

// ===== CONFIGURATION =====
const TMDB_API_KEY = '9c22f7f7a8fb71c5dfbcd2db1ea6a4ca';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';
const CINEVERSE_API = 'https://moviebox.davidcyril.name.ng/api';
const CINEVERSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://cineverse.name.ng/',
  'Origin': 'https://cineverse.name.ng',
  'Accept': 'application/json'
};
const VERSION = Date.now();
const MYLIST_KEY = 'zynflix-mylist-v1';
const INTRO_KEY = 'zynflix-intro-seen';

// ===== STATE =====
let heroRotationTimer = null;
let heroMovies = [];
let heroIndex = 0;
let currentMovie = null;
let currentSeason = 1;
let currentEpisode = 1;
let mylist = loadMyList();
let isSearchOpen = false;
let playerActive = false;
let currentSubtitles = [];
let activeSubtitleLang = '';

// ===== DOM ELEMENTS =====
const $ = id => document.getElementById(id);
const intro = $('intro');
const app = $('app');
const navbar = $('navbar');
const heroBackdrop = $('heroBackdrop');
const heroTitle = $('heroTitle');
const heroOverview = $('heroOverview');
const heroMeta = $('heroMeta');
const heroBadge = $('heroBadge');
const heroPlay = $('heroPlay');
const heroInfo = $('heroInfo');
const heroAddList = $('heroAddList');
const rowsContainer = $('rowsContainer');
const searchResults = $('searchResults');
const searchInput = $('searchInput');
const searchToggle = $('searchToggle');
const searchBox = $('searchBox');
const searchClose = $('searchClose');
const modalOverlay = $('modalOverlay');
const movieModal = $('movieModal');
const modalClose = $('modalClose');
const modalBackdrop = $('modalBackdrop');
const modalTitle = $('modalTitle');
const modalPlay = $('modalPlay');
const modalAddList = $('modalAddList');
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
const installBtn = $('installBtn');
const logoHome = $('logoHome');
const mylistResults = $('mylistResults');
const qualityOverlay = $('qualityOverlay');
const qualityClose = $('qualityClose');
const qualityMovieName = $('qualityMovieName');
const qualityOptions = $('qualityOptions');
const qualityLoading = $('qualityLoading');

// ===== UTILITY =====
function getYear(d) { return d ? d.split('-')[0] : ''; }
function formatRuntime(m) {
  if (!m) return '';
  return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
}

// ===== LOCAL STORAGE =====
function loadMyList() {
  try { return JSON.parse(localStorage.getItem(MYLIST_KEY)) || []; } catch { return []; }
}
function saveMyList() { try { localStorage.setItem(MYLIST_KEY, JSON.stringify(mylist)); } catch {} }
function isInMyList(id) { return mylist.some(m => String(m.id) === String(id)); }

function toggleMyList(item) {
  const idx = mylist.findIndex(m => String(m.id) === String(item.id));
  if (idx >= 0) mylist.splice(idx, 1);
  else mylist.push({ id: item.id, title: item.title, poster: item.poster_path, media_type: item.media_type || 'movie' });
  saveMyList();
  updateAllListButtons();
}

function updateAllListButtons() {
  document.querySelectorAll('[data-list-id]').forEach(btn => {
    const id = btn.dataset.listId;
    const inList = isInMyList(id);
    btn.classList.toggle('in-list', inList);
    if (btn.querySelector('svg')) {
      btn.querySelector('svg').innerHTML = inList
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<path d="M12 5v14"/><path d="M5 12h14"/>';
    }
  });
}

// ===== API =====
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) { console.warn('TMDB error:', e); return null; }
}

async function fetchTrending() { return (await tmdbFetch('/trending/all/week'))?.results || []; }
async function fetchMoviesByGenre(id) { return (await tmdbFetch('/discover/movie', { with_genres: id, sort_by: 'popularity.desc' }))?.results || []; }
async function fetchTVByGenre(id) { return ((await tmdbFetch('/discover/tv', { with_genres: id, sort_by: 'popularity.desc' }))?.results || []).map(m => ({ ...m, media_type: 'tv' })); }
async function fetchPopularMovies() { return ((await tmdbFetch('/movie/popular'))?.results || []).map(m => ({ ...m, media_type: 'movie' })); }
async function fetchTopRatedMovies() { return ((await tmdbFetch('/movie/top_rated'))?.results || []).map(m => ({ ...m, media_type: 'movie' })); }
async function fetchPopularTV() { return ((await tmdbFetch('/tv/popular'))?.results || []).map(m => ({ ...m, media_type: 'tv' })); }
async function fetchNetflixOriginals() { return ((await tmdbFetch('/discover/tv', { with_networks: '213' }))?.results || []).map(m => ({ ...m, media_type: 'tv' })); }
async function searchMulti(q) { return ((await tmdbFetch('/search/multi', { query: q }))?.results || []).filter(m => m.media_type !== 'person'); }
async function fetchDetails(id, type) { return await tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,similar,videos,external_ids' }); }
async function fetchSeasonDetails(tvId, s) { return await tmdbFetch(`/tv/${tvId}/season/${s}`); }

async function fetchNewAndPopular() {
  const [m, t] = await Promise.all([tmdbFetch('/movie/now_playing'), tmdbFetch('/tv/on_the_air')]);
  return [...(m?.results||[]).map(i=>({...i,media_type:'movie'})), ...(t?.results||[]).map(i=>({...i,media_type:'tv'}))].sort((a,b)=>(b.popularity||0)-(a.popularity||0));
}

// Cineverse for video
async function fetchVideoSource(tmdbId, type, season, episode) {
  try {
    const sr = await fetch(`${CINEVERSE_API}/search/${encodeURIComponent(tmdbId)}`, { headers: CINEVERSE_HEADERS });
    if (!sr.ok) return null;
    const items = (await sr.json())?.data?.items || [];
    if (!items.length) return null;
    const sid = items[0].subjectId;
    let u = `${CINEVERSE_API}/sources/${sid}`;
    if (type === 'tv' && season && episode) u += `?season=${season}&episode=${episode}`;
    const r = await fetch(u, { headers: CINEVERSE_HEADERS });
    if (!r.ok) return null;
    const d = (await r.json())?.data || {};
    let url = null;
    if (Array.isArray(d.processedSources) && d.processedSources[0]) url = d.processedSources[0].downloadUrl || d.processedSources[0].directUrl;
    else if (Array.isArray(d.downloads) && d.downloads[0]) url = d.downloads[0].url;
    else if (d.url) url = d.url;
    const subs = [];
    if (Array.isArray(d.subtitles)) d.subtitles.forEach((s,i) => { const u=s.url||s.src||''; if(u) subs.push({label:s.label||s.language||`Sub ${i+1}`,language:s.language||s.label||`s${i}`,url:u}); });
    if (Array.isArray(d.captions)) d.captions.forEach((c,i) => { const u=c.url||c.src||''; if(u) subs.push({label:c.label||`Cap ${i+1}`,language:c.language||`c${i}`,url:u}); });
    return { videoUrl: url, subtitles: subs, qualities: d.processedSources || d.downloads || [] };
  } catch { return null; }
}

async function fetchVideoByTitle(title, year, type, season, episode) {
  try {
    const sr = await fetch(`${CINEVERSE_API}/search/${encodeURIComponent(title)}`, { headers: CINEVERSE_HEADERS });
    if (!sr.ok) return null;
    const items = (await sr.json())?.data?.items || [];
    if (!items.length) return null;
    const sid = items[0].subjectId;
    let u = `${CINEVERSE_API}/sources/${sid}`;
    if (type === 'tv' && season && episode) u += `?season=${season}&episode=${episode}`;
    const r = await fetch(u, { headers: CINEVERSE_HEADERS });
    if (!r.ok) return null;
    const d = (await r.json())?.data || {};
    let url = null;
    if (Array.isArray(d.processedSources) && d.processedSources[0]) url = d.processedSources[0].downloadUrl || d.processedSources[0].directUrl;
    else if (Array.isArray(d.downloads) && d.downloads[0]) url = d.downloads[0].url;
    else if (d.url) url = d.url;
    const subs = [];
    if (Array.isArray(d.subtitles)) d.subtitles.forEach((s,i) => { const u=s.url||s.src||''; if(u) subs.push({label:s.label||s.language||`Sub ${i+1}`,language:s.language||s.label||`s${i}`,url:u}); });
    return { videoUrl: url, subtitles: subs, qualities: d.processedSources || d.downloads || [] };
  } catch { return null; }
}

// ===== IMAGE HELPERS =====
const genreMap = {};
async function loadGenreMap() {
  const [m, t] = await Promise.all([tmdbFetch('/genre/movie/list'), tmdbFetch('/genre/tv/list')]);
  (m?.genres||[]).forEach(g => { genreMap[g.id] = g.name; });
  (t?.genres||[]).forEach(g => { genreMap[g.id] = g.name; });
}

function posterUrl(p, size='w342') {
  if (!p) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="%23222"><rect width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="%23555" font-size="16">No Image</text></svg>';
  return `${TMDB_IMG}/${size}${p}`;
}
function backdropUrl(p, size='w1280') { return p ? `${TMDB_IMG}/${size}${p}` : ''; }

// ===== INTRO =====
function playIntro() {
  // Only show intro once per session
  if (sessionStorage.getItem(INTRO_KEY)) {
    intro.style.display = 'none';
    app.style.display = 'block';
    return;
  }
  sessionStorage.setItem(INTRO_KEY, '1');
  setTimeout(() => {
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      app.style.display = 'block';
    }, 600);
  }, 2500);
}

// ===== NAVBAR SCROLL =====
function handleScroll() { navbar?.classList.toggle('scrolled', window.scrollY > 40); }

// ===== SEARCH =====
function toggleSearch() {
  isSearchOpen = !isSearchOpen;
  searchBox?.classList.toggle('active', isSearchOpen);
  if (isSearchOpen) { searchInput?.focus(); }
  else { searchInput.value = ''; searchResults.classList.add('hidden'); rowsContainer.style.display = ''; mylistResults.classList.add('hidden'); }
}

let searchTimeout = null;
function handleSearchInput() {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();
  if (!q) { searchResults.classList.add('hidden'); rowsContainer.style.display = ''; return; }
  searchTimeout = setTimeout(async () => {
    const results = await searchMulti(q);
    rowsContainer.style.display = 'none'; mylistResults.classList.add('hidden'); searchResults.classList.remove('hidden');
    const filtered = results.filter(m => m.poster_path);
    searchResults.innerHTML = filtered.length ? `<h2>Search Results</h2><div class="search-grid">${filtered.map(m => buildPosterCard(m)).join('')}</div>` : '<h2>Search Results</h2><div class="no-results">No results found.</div>';
    bindPosterClicks(searchResults);
  }, 400);
}

// ===== POSTER CARD =====
function buildPosterCard(item, isBig = false) {
  const type = item.media_type || 'movie';
  const title = item.title || item.name || 'Untitled';
  const year = getYear(item.release_date || item.first_air_date);
  const vote = item.vote_average ? Math.round(item.vote_average * 10) + '%' : '';
  const inList = isInMyList(item.id);
  const genreNames = (item.genre_ids || []).slice(0, 2).map(id => genreMap[id] || '').filter(Boolean).join(', ');
  return `
    <div class="poster-card${isBig ? ' big' : ''}" data-id="${item.id}" data-type="${type}">
      <img src="${posterUrl(item.poster_path)}" alt="${title}" loading="lazy" />
      <div class="poster-overlay">
        <div class="poster-title">${title}</div>
        <div class="poster-meta">
          ${vote ? `<span class="match">${vote} Match</span>` : ''}
          ${year ? `<span class="year">${year}</span>` : ''}
          <span class="rating-badge">${type === 'tv' ? 'TV' : 'PG'}</span>
        </div>
        ${genreNames ? `<div class="poster-genres">${genreNames}</div>` : ''}
        <div class="poster-actions">
          <button class="poster-action-btn play-btn" data-play-id="${item.id}" data-play-type="${type}" title="Play">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="poster-action-btn ${inList ? 'in-list' : ''}" data-list-id="${item.id}" title="My List">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${inList ? '<polyline points="20 6 9 17 4 12"/>' : '<path d="M12 5v14"/><path d="M5 12h14"/>'}
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

function buildRow(title, items, isBig = false) {
  if (!items.length) return '';
  return `<section class="movie-row">
    <h2 class="row-title">${title}</h2>
    <div class="row-slider">
      <button class="slider-arrow left" data-dir="-1">&#8249;</button>
      <div class="row-posters">${items.map(i => buildPosterCard(i, isBig)).join('')}</div>
      <button class="slider-arrow right" data-dir="1">&#8250;</button>
    </div>
  </section>`;
}

function setupSliderArrows() {
  document.querySelectorAll('.slider-arrow').forEach(a => {
    a.onclick = () => {
      const p = a.closest('.row-slider').querySelector('.row-posters');
      p.scrollBy({ left: parseInt(a.dataset.dir) * p.clientWidth * 0.75, behavior: 'smooth' });
    };
  });
}

function bindPosterClicks(container) {
  container.querySelectorAll('.poster-card').forEach(card => {
    card.addEventListener('click', e => { if (!e.target.closest('.poster-action-btn')) openModal(card.dataset.id, card.dataset.type || 'movie'); });
  });
  container.querySelectorAll('[data-play-id]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); showQualityPicker(btn.dataset.playId, btn.dataset.playType || 'movie'); });
  });
  container.querySelectorAll('[data-list-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = btn.closest('.poster-card');
      toggleMyList({ id: btn.dataset.listId, title: card?.querySelector('.poster-title')?.textContent || '', poster_path: (card?.querySelector('img')?.src || '').replace(TMDB_IMG+'/w342',''), media_type: card?.dataset.type || 'movie' });
    });
  });
}

// ===== HERO BANNER =====
async function loadHero() {
  try {
    const trending = await fetchTrending();
    heroMovies = trending.filter(m => m.backdrop_path).slice(0, 12);
    if (!heroMovies.length) return;
    heroIndex = 0;
    showHeroMovie(heroMovies[0]);
    startHeroRotation();
  } catch (e) { console.warn('Hero load error:', e); }
}

function showHeroMovie(movie) {
  const title = movie.title || movie.name || '';
  const overview = movie.overview || '';
  const year = getYear(movie.release_date || movie.first_air_date);
  const vote = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const type = movie.media_type || 'movie';
  const genres = (movie.genre_ids || []).slice(0, 3).map(id => genreMap[id]).filter(Boolean);

  heroBackdrop.style.backgroundImage = `url(${backdropUrl(movie.backdrop_path)})`;
  heroTitle.textContent = title;
  heroOverview.textContent = overview;
  heroBadge.textContent = type === 'tv' ? 'Series' : 'Film';
  heroMeta.innerHTML = `${vote ? `<span class="meta-imdb">★ ${vote}</span>` : ''}${year ? `<span class="meta-year">${year}</span>` : ''}${genres.length ? `<span class="meta-genre">${genres.join(' · ')}</span>` : ''}`;

  heroPlay.onclick = () => showQualityPicker(movie.id, type);
  heroInfo.onclick = () => openModal(movie.id, type);
  heroAddList.onclick = () => { toggleMyList({ id: movie.id, title, poster_path: movie.poster_path, media_type: type }); heroAddList.classList.toggle('in-list', isInMyList(movie.id)); };
  heroAddList.classList.toggle('in-list', isInMyList(movie.id));
  heroAddList.dataset.listId = movie.id;
}

function startHeroRotation() {
  stopHeroRotation();
  if (heroMovies.length <= 1) return;
  heroRotationTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroMovies.length;
    const hero = document.querySelector('.hero');
    hero.style.transition = 'opacity 0.6s ease';
    hero.style.opacity = '0.6';
    setTimeout(() => {
      showHeroMovie(heroMovies[heroIndex]);
      hero.style.opacity = '1';
    }, 400);
  }, 5000);
}

function stopHeroRotation() {
  if (heroRotationTimer) { clearInterval(heroRotationTimer); heroRotationTimer = null; }
}

// ===== HOME ROWS (12+ genres) =====
async function loadHomeRows() {
  rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';

  const results = await Promise.allSettled([
    fetchNetflixOriginals(),     // 0
    fetchTrending(),             // 1
    fetchPopularMovies(),        // 2
    fetchTopRatedMovies(),       // 3
    fetchPopularTV(),            // 4
    fetchMoviesByGenre(28),      // 5 Action
    fetchMoviesByGenre(878),     // 6 Sci-Fi
    fetchMoviesByGenre(27),      // 7 Horror
    fetchMoviesByGenre(10749),   // 8 Romance
    fetchMoviesByGenre(35),      // 9 Comedy
    fetchMoviesByGenre(16),      // 10 Animation
    fetchMoviesByGenre(99),      // 11 Documentary
    fetchMoviesByGenre(53),      // 12 Thriller
    fetchMoviesByGenre(12),      // 13 Adventure
    fetchMoviesByGenre(80),      // 14 Crime
    fetchMoviesByGenre(18),      // 15 Drama
    fetchMoviesByGenre(14),      // 16 Fantasy
    fetchMoviesByGenre(36),      // 17 History
  ]);

  const r = results.map(x => x.status === 'fulfilled' ? x.value : []);
  const rows = [];
  if (r[0].length)  rows.push({ title: 'ZYNIFLIX Originals', items: r[0], big: true });
  if (r[1].length)  rows.push({ title: 'Trending Now', items: r[1].map(m=>({...m,media_type:m.media_type||'movie'})) });
  if (r[2].length)  rows.push({ title: 'Popular Movies', items: r[2] });
  if (r[3].length)  rows.push({ title: 'Top Rated', items: r[3] });
  if (r[4].length)  rows.push({ title: 'Popular TV Shows', items: r[4] });
  if (r[5].length)  rows.push({ title: 'Action & Adventure', items: r[5] });
  if (r[6].length)  rows.push({ title: 'Sci-Fi & Fantasy', items: r[6] });
  if (r[7].length)  rows.push({ title: 'Horror', items: r[7] });
  if (r[8].length)  rows.push({ title: 'Romance', items: r[8] });
  if (r[9].length)  rows.push({ title: 'Comedy', items: r[9] });
  if (r[10].length) rows.push({ title: 'Animation', items: r[10] });
  if (r[11].length) rows.push({ title: 'Documentaries', items: r[11] });
  if (r[12].length) rows.push({ title: 'Thrillers', items: r[12] });
  if (r[13].length) rows.push({ title: 'Adventure', items: r[13] });
  if (r[14].length) rows.push({ title: 'Crime', items: r[14] });
  if (r[15].length) rows.push({ title: 'Drama', items: r[15] });
  if (r[16].length) rows.push({ title: 'Fantasy', items: r[16] });
  if (r[17].length) rows.push({ title: 'History', items: r[17] });

  rowsContainer.innerHTML = rows.map(row => buildRow(row.title, row.items, row.big)).join('');
  setupSliderArrows();
  bindPosterClicks(rowsContainer);
}

// ===== CATEGORY PAGES =====
async function loadCategory(cat) {
  stopHeroRotation();
  searchResults.classList.add('hidden');
  mylistResults.classList.add('hidden');
  rowsContainer.style.display = '';
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.category === cat));

  if (cat === 'home') { await loadHero(); await loadHomeRows(); return; }
  if (cat === 'mylist') { rowsContainer.style.display = 'none'; mylistResults.classList.remove('hidden'); renderMyList(); return; }

  rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';

  if (cat === 'tv') {
    const res = await Promise.allSettled([fetchPopularTV(), fetchNetflixOriginals(), fetchTVByGenre(10759), fetchTVByGenre(18), fetchTVByGenre(35), fetchTVByGenre(10765), fetchTVByGenre(9648), fetchTVByGenre(16)]);
    const r = res.map(x => x.status === 'fulfilled' ? x.value : []);
    const rows = [];
    if (r[0].length) rows.push({ title: 'Popular TV Shows', items: r[0] });
    if (r[1].length) rows.push({ title: 'ZYNIFLIX Originals', items: r[1], big: true });
    if (r[2].length) rows.push({ title: 'Action & Adventure', items: r[2] });
    if (r[3].length) rows.push({ title: 'TV Dramas', items: r[3] });
    if (r[4].length) rows.push({ title: 'TV Comedies', items: r[4] });
    if (r[5].length) rows.push({ title: 'Sci-Fi & Fantasy', items: r[5] });
    if (r[6].length) rows.push({ title: 'Mystery', items: r[6] });
    if (r[7].length) rows.push({ title: 'Animation', items: r[7] });
    rowsContainer.innerHTML = rows.map(row => buildRow(row.title, row.items, row.big)).join('');
    setupSliderArrows(); bindPosterClicks(rowsContainer); return;
  }

  if (cat === 'movies') {
    const res = await Promise.allSettled([fetchPopularMovies(), fetchTopRatedMovies(), fetchMoviesByGenre(28), fetchMoviesByGenre(12), fetchMoviesByGenre(878), fetchMoviesByGenre(53), fetchMoviesByGenre(10749), fetchMoviesByGenre(27), fetchMoviesByGenre(35), fetchMoviesByGenre(16)]);
    const r = res.map(x => x.status === 'fulfilled' ? x.value : []);
    const rows = [];
    if (r[0].length) rows.push({ title: 'Popular Movies', items: r[0] });
    if (r[1].length) rows.push({ title: 'Top Rated', items: r[1] });
    if (r[2].length) rows.push({ title: 'Action', items: r[2] });
    if (r[3].length) rows.push({ title: 'Adventure', items: r[3] });
    if (r[4].length) rows.push({ title: 'Sci-Fi', items: r[4] });
    if (r[5].length) rows.push({ title: 'Thriller', items: r[5] });
    if (r[6].length) rows.push({ title: 'Romance', items: r[6] });
    if (r[7].length) rows.push({ title: 'Horror', items: r[7] });
    if (r[8].length) rows.push({ title: 'Comedy', items: r[8] });
    if (r[9].length) rows.push({ title: 'Animation', items: r[9] });
    rowsContainer.innerHTML = rows.map(row => buildRow(row.title, row.items)).join('');
    setupSliderArrows(); bindPosterClicks(rowsContainer); return;
  }

  if (cat === 'new') {
    const items = await fetchNewAndPopular();
    rowsContainer.innerHTML = buildRow('New & Popular', items);
    setupSliderArrows(); bindPosterClicks(rowsContainer); return;
  }
}

// ===== MY LIST =====
function renderMyList() {
  if (!mylist.length) { mylistResults.innerHTML = '<h2>My List</h2><div class="no-results">Your list is empty.</div>'; return; }
  mylistResults.innerHTML = `<h2>My List</h2><div class="search-grid">${mylist.map(m => `
    <div class="poster-card" data-id="${m.id}" data-type="${m.media_type||'movie'}">
      <img src="${posterUrl(m.poster||'')}" alt="${m.title}" loading="lazy" />
      <div class="poster-overlay">
        <div class="poster-title">${m.title}</div>
        <div class="poster-actions">
          <button class="poster-action-btn play-btn" data-play-id="${m.id}" data-play-type="${m.media_type||'movie'}" title="Play"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></button>
          <button class="poster-action-btn in-list" data-list-id="${m.id}" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>
        </div>
      </div>
    </div>`).join('')}</div>`;
  bindPosterClicks(mylistResults);
}

// ===== MOVIE MODAL =====
async function openModal(id, type = 'movie') {
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modalBackdrop.style.backgroundImage = '';
  modalTitle.textContent = 'Loading...';
  modalDescription.textContent = ''; modalMatch.textContent = ''; modalYear.textContent = ''; modalDuration.textContent = ''; modalRating.textContent = ''; modalCast.textContent = ''; modalGenres.textContent = ''; modalTags.textContent = '';
  modalEpisodes.classList.add('hidden'); similarGrid.innerHTML = '';

  const details = await fetchDetails(id, type);
  if (!details) { modalTitle.textContent = 'Details unavailable'; return; }

  currentMovie = { ...details, media_type: type, id };
  const title = details.title || details.name || '';
  const year = getYear(details.release_date || details.first_air_date);
  const runtime = type === 'movie' ? formatRuntime(details.runtime) : formatRuntime(details.episode_run_time?.[0]);
  const vote = details.vote_average;
  const genres = (details.genres || []).map(g => g.name);
  const cast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);

  modalBackdrop.style.backgroundImage = `url(${backdropUrl(details.backdrop_path)})`;
  modalTitle.textContent = title;
  modalDescription.textContent = details.overview || '';
  modalMatch.textContent = vote ? `${Math.round(vote * 10)}% Match` : '';
  modalYear.textContent = year; modalDuration.textContent = runtime;
  modalRating.textContent = vote ? `★ ${vote.toFixed(1)}` : '';
  modalCast.textContent = cast.join(', ') || 'N/A';
  modalGenres.textContent = genres.join(', ') || 'N/A';
  modalTags.textContent = genres.slice(0, 2).join(', ') || 'N/A';

  modalPlay.onclick = () => showQualityPicker(id, type);
  modalAddList.dataset.listId = id;
  modalAddList.classList.toggle('in-list', isInMyList(id));
  modalAddList.onclick = () => { toggleMyList({ id, title, poster_path: details.poster_path, media_type: type }); modalAddList.classList.toggle('in-list', isInMyList(id)); };

  if (type === 'tv' && details.seasons?.length) { modalEpisodes.classList.remove('hidden'); loadSeasons(id, details.seasons); }

  const similar = (details.similar?.results || []).slice(0, 6);
  if (similar.length) { similarGrid.innerHTML = similar.map(m => buildPosterCard({ ...m, media_type: type })).join(''); bindPosterClicks(similarGrid); }
}

async function loadSeasons(tvId, seasons) {
  seasonSelect.innerHTML = '';
  const valid = seasons.filter(s => s.season_number > 0);
  valid.forEach(s => { const o = document.createElement('option'); o.value = s.season_number; o.textContent = `Season ${s.season_number}`; seasonSelect.appendChild(o); });
  if (valid.length) { currentSeason = valid[0].season_number; seasonSelect.value = currentSeason; await loadEpisodes(tvId, currentSeason); }
  seasonSelect.onchange = async () => { currentSeason = parseInt(seasonSelect.value); currentEpisode = 1; await loadEpisodes(tvId, currentSeason); };
}

async function loadEpisodes(tvId, sn) {
  episodeList.innerHTML = '<div style="padding:20px;text-align:center;"><div class="loading-spinner"></div></div>';
  const data = await fetchSeasonDetails(tvId, sn);
  if (!data?.episodes?.length) { episodeList.innerHTML = '<div class="no-results">No episodes available.</div>'; return; }
  episodeList.innerHTML = data.episodes.map(ep => `
    <div class="episode-item" data-episode="${ep.episode_number}">
      <div class="episode-number">${ep.episode_number}</div>
      <div class="episode-thumb" style="position:relative;">
        ${ep.still_path ? `<img src="${posterUrl(ep.still_path,'w300')}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />` : ''}
        <div class="episode-play-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg></div>
      </div>
      <div class="episode-details"><h4>${ep.name||`Episode ${ep.episode_number}`}</h4><p>${ep.overview||'No description.'}</p>${ep.runtime?`<div class="episode-duration">${ep.runtime}m</div>`:''}</div>
    </div>`).join('');
  episodeList.querySelectorAll('.episode-item').forEach(item => {
    item.addEventListener('click', () => { currentEpisode = parseInt(item.dataset.episode); showQualityPicker(tvId, 'tv'); });
  });
}

function closeModal() { modalOverlay.classList.add('hidden'); document.body.style.overflow = ''; currentMovie = null; }

// ===== QUALITY PICKER =====
let pendingPlayId = null, pendingPlayType = null, fetchedSource = null;

function showQualityPicker(id, type) {
  pendingPlayId = id; pendingPlayType = type; fetchedSource = null;
  let title = 'Loading...';
  if (currentMovie && String(currentMovie.id) === String(id)) title = currentMovie.title || currentMovie.name || '';
  qualityMovieName.textContent = title || 'Fetching details...';
  qualityOverlay.classList.remove('hidden');
  qualityOptions.classList.remove('hidden');
  qualityLoading.classList.add('hidden');

  if (!title || title === 'Loading...') {
    fetchDetails(id, type).then(d => { if (d) qualityMovieName.textContent = d.title || d.name || ''; });
  }
  fetchSourceForQuality(id, type);
}

async function fetchSourceForQuality(id, type) {
  const season = type === 'tv' ? currentSeason : null;
  const episode = type === 'tv' ? currentEpisode : null;
  let source = await fetchVideoSource(id, type, season, episode);
  if (!source?.videoUrl && currentMovie) {
    source = await fetchVideoByTitle(currentMovie.title || currentMovie.name, getYear(currentMovie.release_date || currentMovie.first_air_date), type, season, episode);
  }
  fetchedSource = source;
  return source;
}

function closeQualityPicker() { qualityOverlay.classList.add('hidden'); pendingPlayId = null; pendingPlayType = null; }

qualityClose?.addEventListener('click', closeQualityPicker);
qualityOverlay?.addEventListener('click', e => { if (e.target === qualityOverlay) closeQualityPicker(); });

qualityOptions?.querySelectorAll('.quality-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const quality = btn.dataset.quality;
    if (!pendingPlayId) return;
    qualityOptions.classList.add('hidden');
    qualityLoading.classList.remove('hidden');
    let source = fetchedSource;
    if (!source) source = await fetchSourceForQuality(pendingPlayId, pendingPlayType);
    closeQualityPicker();
    if (!source?.videoUrl) { playerOverlay.classList.remove('hidden'); playerNotReady.classList.remove('hidden'); notReadyMsg.textContent = 'This title is not available for streaming. Try another.'; return; }
    await startPlayback(source, quality);
  });
});

async function startPlayback(source, quality) {
  playerOverlay.classList.remove('hidden');
  playerNotReady.classList.remove('hidden');
  notReadyMsg.textContent = `Starting ${quality}p...`;
  videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoPlayer.load();
  clearSubtitleTracks();
  playerActive = true; currentSubtitles = source.subtitles || []; activeSubtitleLang = '';

  let videoUrl = source.videoUrl;
  if (source.qualities?.length) {
    const q = parseInt(quality);
    const matched = source.qualities.find(sq => { const l = (sq.quality||sq.label||sq.resolution||'').toLowerCase(); return l.includes(String(q)); });
    if (matched) videoUrl = matched.downloadUrl || matched.directUrl || matched.url || videoUrl;
  }

  let title = currentMovie ? (currentMovie.title || currentMovie.name || 'Now Playing') : 'Now Playing';
  if (pendingPlayType === 'tv') title += ` S${currentSeason}E${currentEpisode}`;
  title += ` (${quality}p)`;
  playerTitle.textContent = title;

  videoPlayer.src = videoUrl; videoPlayer.load();
  setupSubtitleMenu();
  playerNotReady.classList.add('hidden');

  try { await videoPlayer.play(); } catch {}
  try {
    const c = playerOverlay;
    if (c.requestFullscreen) await c.requestFullscreen();
    else if (c.webkitRequestFullscreen) c.webkitRequestFullscreen();
  } catch {}
}

// ===== SUBTITLES =====
function setupSubtitleMenu() {
  subtitleControls?.classList.remove('hidden');
  subtitleMenu.innerHTML = '';
  const off = document.createElement('button');
  off.className = 'subtitle-option' + (activeSubtitleLang === '' ? ' active' : '');
  off.textContent = 'Off'; off.onclick = () => selectSubtitle('');
  subtitleMenu.appendChild(off);
  currentSubtitles.forEach(sub => {
    const b = document.createElement('button');
    b.className = 'subtitle-option' + (activeSubtitleLang === sub.language ? ' active' : '');
    b.textContent = sub.label; b.onclick = () => selectSubtitle(sub.language);
    subtitleMenu.appendChild(b);
  });
  subtitleLabel.textContent = activeSubtitleLang ? (currentSubtitles.find(s => s.language === activeSubtitleLang)?.label || 'On') : 'Off';
}

function selectSubtitle(lang) {
  activeSubtitleLang = lang; clearSubtitleTracks();
  if (lang) {
    const sub = currentSubtitles.find(s => s.language === lang);
    if (sub?.url) {
      const track = document.createElement('track');
      track.kind = 'subtitles'; track.label = sub.label; track.srclang = (sub.language||'en').slice(0,2); track.src = sub.url; track.default = true;
      videoPlayer.appendChild(track);
      setTimeout(() => { Array.from(videoPlayer.textTracks||[]).forEach(t => { t.mode = (t.label === sub.label || t.language === track.srclang) ? 'showing' : 'disabled'; }); }, 200);
    }
  }
  setupSubtitleMenu();
}

function clearSubtitleTracks() {
  Array.from(videoPlayer.querySelectorAll('track')).forEach(t => t.remove());
  Array.from(videoPlayer.textTracks||[]).forEach(t => { t.mode = 'disabled'; });
}

function closePlayer() {
  playerActive = false; videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoPlayer.load();
  clearSubtitleTracks();
  playerOverlay.classList.add('hidden'); subtitleControls?.classList.add('hidden'); subtitleMenu?.classList.add('hidden');
}

// ===== EVENT LISTENERS =====
window.addEventListener('scroll', handleScroll);
searchToggle?.addEventListener('click', toggleSearch);
searchClose?.addEventListener('click', toggleSearch);
searchInput?.addEventListener('input', handleSearchInput);
searchInput?.addEventListener('keydown', e => { if (e.key === 'Escape') toggleSearch(); });
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
playerBack?.addEventListener('click', closePlayer);
videoPlayer?.addEventListener('click', () => { if (videoPlayer.paused) videoPlayer.play().catch(()=>{}); });
subtitleBtn?.addEventListener('click', () => subtitleMenu?.classList.toggle('hidden'));
document.addEventListener('click', e => { if (!e.target.closest('.player-subtitle-controls')) subtitleMenu?.classList.add('hidden'); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (playerActive) closePlayer();
    else if (!qualityOverlay.classList.contains('hidden')) closeQualityPicker();
    else if (!modalOverlay.classList.contains('hidden')) closeModal();
  }
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => { e.preventDefault(); loadCategory(link.dataset.category); });
});

logoHome?.addEventListener('click', e => { e.preventDefault(); if (isSearchOpen) toggleSearch(); loadCategory('home'); });

// PWA
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; installBtn?.classList.remove('hidden'); });
installBtn?.addEventListener('click', async () => { if (!deferredPrompt) return; installBtn.classList.add('hidden'); deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; });

// Service Worker (no auto-reload loop)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js?v=' + VERSION).catch(e => console.warn('SW fail:', e));
  });
}

// ===== INIT =====
async function init() {
  playIntro();
  try { await loadGenreMap(); } catch {}
  try { await loadHero(); } catch {}
  try { await loadHomeRows(); } catch {}
  handleScroll();
}

init().catch(e => console.error('Init error:', e));
