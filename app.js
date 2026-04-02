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
const WATCH_KEY = 'zynflix-watch-v1';

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
const pageLoading = $('pageLoading');

// ===== UTILITY FUNCTIONS =====
function getYear(dateStr) {
  if (!dateStr) return '';
  return dateStr.split('-')[0];
}

function formatRuntime(mins) {
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatVote(vote) {
  if (!vote) return '';
  return (typeof vote === 'number' ? vote.toFixed(1) : vote) + '/10';
}

// ===== LOCAL STORAGE =====
function loadMyList() {
  try {
    return JSON.parse(localStorage.getItem(MYLIST_KEY)) || [];
  } catch { return []; }
}

function saveMyList() {
  try { localStorage.setItem(MYLIST_KEY, JSON.stringify(mylist)); } catch {}
}

function isInMyList(id) {
  return mylist.some(m => String(m.id) === String(id));
}

function toggleMyList(item) {
  const idx = mylist.findIndex(m => String(m.id) === String(item.id));
  if (idx >= 0) {
    mylist.splice(idx, 1);
  } else {
    mylist.push({ id: item.id, title: item.title, poster: item.poster_path, media_type: item.media_type || 'movie' });
  }
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

// ===== API CALLS =====
async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('TMDB fetch error:', err);
    return null;
  }
}

async function fetchTrending() {
  const data = await tmdbFetch('/trending/all/week');
  return data?.results || [];
}

async function fetchMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch('/discover/movie', { with_genres: genreId, page, sort_by: 'popularity.desc' });
  return data?.results || [];
}

async function fetchTVByGenre(genreId, page = 1) {
  const data = await tmdbFetch('/discover/tv', { with_genres: genreId, page, sort_by: 'popularity.desc' });
  return (data?.results || []).map(m => ({ ...m, media_type: 'tv' }));
}

async function fetchPopularMovies() {
  const data = await tmdbFetch('/movie/popular');
  return (data?.results || []).map(m => ({ ...m, media_type: 'movie' }));
}

async function fetchTopRatedMovies() {
  const data = await tmdbFetch('/movie/top_rated');
  return (data?.results || []).map(m => ({ ...m, media_type: 'movie' }));
}

async function fetchPopularTV() {
  const data = await tmdbFetch('/tv/popular');
  return (data?.results || []).map(m => ({ ...m, media_type: 'tv' }));
}

async function fetchNetflixOriginals() {
  const data = await tmdbFetch('/discover/tv', { with_networks: '213' });
  return (data?.results || []).map(m => ({ ...m, media_type: 'tv' }));
}

async function fetchNewAndPopular() {
  const [movies, tv] = await Promise.all([
    tmdbFetch('/movie/now_playing'),
    tmdbFetch('/tv/on_the_air')
  ]);
  const m = (movies?.results || []).map(i => ({ ...i, media_type: 'movie' }));
  const t = (tv?.results || []).map(i => ({ ...i, media_type: 'tv' }));
  return [...m, ...t].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

async function searchMulti(query) {
  const data = await tmdbFetch('/search/multi', { query });
  return (data?.results || []).filter(m => m.media_type === 'person' ? false : true);
}

async function fetchDetails(id, type = 'movie') {
  return await tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,similar,videos,external_ids' });
}

async function fetchSeasonDetails(tvId, seasonNum) {
  return await tmdbFetch(`/tv/${tvId}/season/${seasonNum}`);
}

// Cineverse API for video sources
async function fetchVideoSource(tmdbId, type = 'movie', season, episode) {
  try {
    const searchTerm = `${tmdbId}`;
    const searchRes = await fetch(`${CINEVERSE_API}/search/${encodeURIComponent(searchTerm)}`, { headers: CINEVERSE_HEADERS });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const items = searchData?.data?.items || [];
    if (!items.length) return null;

    const subjectId = items[0].subjectId;
    let sourceUrl = `${CINEVERSE_API}/sources/${subjectId}`;
    if (type === 'tv' && season && episode) {
      sourceUrl += `?season=${season}&episode=${episode}`;
    }

    const srcRes = await fetch(sourceUrl, { headers: CINEVERSE_HEADERS });
    if (!srcRes.ok) return null;
    const srcData = await srcRes.json();
    const data = srcData?.data || srcData;

    let videoUrl = null;
    if (Array.isArray(data.processedSources) && data.processedSources[0]) {
      videoUrl = data.processedSources[0].downloadUrl || data.processedSources[0].directUrl;
    } else if (Array.isArray(data.downloads) && data.downloads[0]) {
      videoUrl = data.downloads[0].url;
    } else if (data.url) {
      videoUrl = data.url;
    }

    let subtitles = [];
    if (Array.isArray(data.subtitles)) {
      subtitles = data.subtitles.map((s, i) => ({
        label: s.label || s.language || `Subtitle ${i + 1}`,
        language: s.language || s.label || `sub-${i}`,
        url: s.url || s.src || ''
      })).filter(s => s.url);
    }
    if (Array.isArray(data.captions)) {
      data.captions.forEach((c, i) => {
        const url = c.url || c.src || '';
        if (url) subtitles.push({ label: c.label || `Caption ${i + 1}`, language: c.language || `cap-${i}`, url });
      });
    }

    return { videoUrl, subtitles, qualities: data.processedSources || data.downloads || [] };
  } catch (err) {
    console.warn('Video source fetch error:', err);
    return null;
  }
}

// Fallback: search Cineverse by movie title
async function fetchVideoByTitle(title, year, type, season, episode) {
  try {
    const searchRes = await fetch(`${CINEVERSE_API}/search/${encodeURIComponent(title)}`, { headers: CINEVERSE_HEADERS });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const items = searchData?.data?.items || [];
    if (!items.length) return null;

    const match = items[0];
    const subjectId = match.subjectId;
    let sourceUrl = `${CINEVERSE_API}/sources/${subjectId}`;
    if (type === 'tv' && season && episode) {
      sourceUrl += `?season=${season}&episode=${episode}`;
    }

    const srcRes = await fetch(sourceUrl, { headers: CINEVERSE_HEADERS });
    if (!srcRes.ok) return null;
    const srcData = await srcRes.json();
    const data = srcData?.data || srcData;

    let videoUrl = null;
    if (Array.isArray(data.processedSources) && data.processedSources[0]) {
      videoUrl = data.processedSources[0].downloadUrl || data.processedSources[0].directUrl;
    } else if (Array.isArray(data.downloads) && data.downloads[0]) {
      videoUrl = data.downloads[0].url;
    } else if (data.url) videoUrl = data.url;

    let subtitles = [];
    if (Array.isArray(data.subtitles)) {
      subtitles = data.subtitles.map((s, i) => ({
        label: s.label || s.language || `Subtitle ${i + 1}`,
        language: s.language || s.label || `sub-${i}`,
        url: s.url || s.src || ''
      })).filter(s => s.url);
    }

    return { videoUrl, subtitles, qualities: data.processedSources || data.downloads || [] };
  } catch (err) {
    return null;
  }
}

// ===== IMAGE HELPERS =====
function posterUrl(path, size = 'w342') {
  if (!path) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="%23222"><rect width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="%23555" font-size="18">No Image</text></svg>';
  return `${TMDB_IMG}/${size}${path}`;
}

function backdropUrl(path, size = 'w1280') {
  if (!path) return '';
  return `${TMDB_IMG}/${size}${path}`;
}

// ===== INTRO ANIMATION =====
function playIntro() {
  setTimeout(() => {
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      app.style.display = 'block';
    }, 700);
  }, 2800);
}

// ===== NAVBAR SCROLL =====
function handleScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

// ===== SEARCH =====
function toggleSearch() {
  isSearchOpen = !isSearchOpen;
  searchBox.classList.toggle('active', isSearchOpen);
  if (isSearchOpen) {
    searchInput.focus();
  } else {
    searchInput.value = '';
    searchResults.classList.add('hidden');
    rowsContainer.style.display = '';
    mylistResults.classList.add('hidden');
  }
}

let searchTimeout = null;
function handleSearchInput() {
  clearTimeout(searchTimeout);
  const q = searchInput.value.trim();
  if (!q) {
    searchResults.classList.add('hidden');
    rowsContainer.style.display = '';
    return;
  }
  searchTimeout = setTimeout(async () => {
    const results = await searchMulti(q);
    renderSearchResults(results);
  }, 400);
}

function renderSearchResults(results) {
  rowsContainer.style.display = 'none';
  mylistResults.classList.add('hidden');
  searchResults.classList.remove('hidden');

  const filtered = results.filter(m => m.poster_path);
  if (!filtered.length) {
    searchResults.innerHTML = '<h2>Search Results</h2><div class="no-results">No results found.</div>';
    return;
  }

  searchResults.innerHTML = `
    <h2>Search Results</h2>
    <div class="search-grid">${filtered.map(m => buildPosterCard(m)).join('')}</div>
  `;
  bindPosterClicks(searchResults);
}

// ===== BUILD POSTER CARD =====
function buildPosterCard(item, isBig = false) {
  const type = item.media_type || 'movie';
  const title = item.title || item.name || 'Untitled';
  const year = getYear(item.release_date || item.first_air_date);
  const vote = item.vote_average ? item.vote_average.toFixed(0) + '%' : '';
  const inList = isInMyList(item.id);
  const genreNames = (item.genre_ids || []).slice(0, 2).map(id => genreMap[id] || '').filter(Boolean).join(', ');

  return `
    <div class="poster-card${isBig ? ' big' : ''}" data-id="${item.id}" data-type="${type}">
      <img src="${posterUrl(item.poster_path)}" alt="${title}" loading="lazy" />
      <div class="poster-overlay">
        <div class="poster-title">${title}</div>
        <div class="poster-meta">
          ${vote ? `<span class="match">${vote}% Match</span>` : ''}
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
    </div>
  `;
}

const genreMap = {};

async function loadGenreMap() {
  const [movieGenres, tvGenres] = await Promise.all([
    tmdbFetch('/genre/movie/list'),
    tmdbFetch('/genre/tv/list')
  ]);
  (movieGenres?.genres || []).forEach(g => { genreMap[g.id] = g.name; });
  (tvGenres?.genres || []).forEach(g => { genreMap[g.id] = g.name; });
}

// ===== BUILD ROW =====
function buildRow(title, items, isBig = false) {
  if (!items.length) return '';
  return `
    <section class="movie-row">
      <h2 class="row-title">${title} <span class="explore-all">Explore All ›</span></h2>
      <div class="row-slider">
        <button class="slider-arrow left" data-dir="-1">‹</button>
        <div class="row-posters">
          ${items.map(item => buildPosterCard(item, isBig)).join('')}
        </div>
        <button class="slider-arrow right" data-dir="1">›</button>
      </div>
    </section>
  `;
}

function setupSliderArrows() {
  document.querySelectorAll('.slider-arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const posters = arrow.closest('.row-slider').querySelector('.row-posters');
      const dir = parseInt(arrow.dataset.dir);
      const scrollAmount = posters.clientWidth * 0.75;
      posters.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    });
  });
}

function bindPosterClicks(container) {
  container.querySelectorAll('.poster-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.poster-action-btn')) return;
      const id = card.dataset.id;
      const type = card.dataset.type || 'movie';
      openModal(id, type);
    });
  });

  container.querySelectorAll('[data-play-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.playId;
      const type = btn.dataset.playType || 'movie';
      playDirectly(id, type);
    });
  });

  container.querySelectorAll('[data-list-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.listId;
      const card = btn.closest('.poster-card');
      const title = card?.querySelector('.poster-title')?.textContent || '';
      const poster = card?.querySelector('img')?.getAttribute('src') || '';
      const type = card?.dataset.type || 'movie';
      toggleMyList({ id, title, poster_path: poster.replace(TMDB_IMG + '/w342', ''), media_type: type });
    });
  });
}

// ===== HERO =====
async function loadHero() {
  const trending = await fetchTrending();
  heroMovies = trending.filter(m => m.backdrop_path).slice(0, 10);
  if (!heroMovies.length) return;

  heroIndex = 0;
  showHeroMovie(heroMovies[0]);
  startHeroRotation();
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

  heroMeta.innerHTML = `
    ${vote ? `<span class="meta-imdb">★ ${vote}</span>` : ''}
    ${year ? `<span class="meta-year">${year}</span>` : ''}
    ${genres.length ? `<span class="meta-genre">${genres.join(' · ')}</span>` : ''}
  `;

  // Update hero buttons
  heroPlay.onclick = () => playDirectly(movie.id, type);
  heroInfo.onclick = () => openModal(movie.id, type);
  heroAddList.onclick = () => {
    toggleMyList({ id: movie.id, title, poster_path: movie.poster_path, media_type: type });
    heroAddList.classList.toggle('in-list', isInMyList(movie.id));
  };
  heroAddList.classList.toggle('in-list', isInMyList(movie.id));
  heroAddList.dataset.listId = movie.id;
}

function startHeroRotation() {
  stopHeroRotation();
  if (heroMovies.length <= 1) return;
  heroRotationTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroMovies.length;
    const heroSection = document.querySelector('.hero');
    heroSection.style.transition = 'opacity 0.5s ease';
    heroSection.style.opacity = '0.7';
    setTimeout(() => {
      showHeroMovie(heroMovies[heroIndex]);
      heroSection.style.opacity = '1';
    }, 300);
  }, 8000);
}

function stopHeroRotation() {
  if (heroRotationTimer) {
    clearInterval(heroRotationTimer);
    heroRotationTimer = null;
  }
}

// ===== LOAD HOME ROWS =====
async function loadHomeRows() {
  rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';

  const results = await Promise.allSettled([
    fetchNetflixOriginals(),
    fetchTrending(),
    fetchPopularMovies(),
    fetchTopRatedMovies(),
    fetchPopularTV(),
    fetchMoviesByGenre(28),   // Action
    fetchMoviesByGenre(27),   // Horror
    fetchMoviesByGenre(10749), // Romance
    fetchMoviesByGenre(35),   // Comedy
    fetchMoviesByGenre(16, 1), // Animation
    fetchMoviesByGenre(99),   // Documentary
  ]);

  const rows = [];
  const [orig, trend, pop, top, tv, action, horror, romance, comedy, anim, doc] = results.map(r => r.status === 'fulfilled' ? r.value : []);

  if (orig.length) rows.push({ title: 'ZYNIFLIX Originals', items: orig, big: true });
  if (trend.length) rows.push({ title: 'Trending Now', items: trend.map(m => ({ ...m, media_type: m.media_type || 'movie' })) });
  if (pop.length) rows.push({ title: 'Popular Movies', items: pop });
  if (top.length) rows.push({ title: 'Top Rated Movies', items: top });
  if (tv.length) rows.push({ title: 'Popular TV Shows', items: tv });
  if (action.length) rows.push({ title: 'Action & Adventure', items: action });
  if (horror.length) rows.push({ title: 'Horror', items: horror });
  if (romance.length) rows.push({ title: 'Romance', items: romance });
  if (comedy.length) rows.push({ title: 'Comedy', items: comedy });
  if (anim.length) rows.push({ title: 'Animation', items: anim });
  if (doc.length) rows.push({ title: 'Documentaries', items: doc });

  rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items, r.big)).join('');
  setupSliderArrows();
  bindPosterClicks(rowsContainer);
}

// ===== LOAD CATEGORY =====
async function loadCategory(category) {
  stopHeroRotation();
  searchResults.classList.add('hidden');
  mylistResults.classList.add('hidden');
  rowsContainer.style.display = '';

  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.category === category));

  if (category === 'home') {
    await loadHero();
    await loadHomeRows();
    return;
  }

  if (category === 'mylist') {
    rowsContainer.style.display = 'none';
    mylistResults.classList.remove('hidden');
    renderMyList();
    return;
  }

  rowsContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:60px 0;"><div class="loading-spinner large"></div></div>';

  if (category === 'tv') {
    const results = await Promise.allSettled([
      fetchPopularTV(),
      fetchNetflixOriginals(),
      fetchTVByGenre(10759), // Action & Adventure
      fetchTVByGenre(18),    // Drama
      fetchTVByGenre(35),    // Comedy
      fetchTVByGenre(10765), // Sci-Fi & Fantasy
      fetchTVByGenre(9648),  // Mystery
      fetchTVByGenre(16),    // Animation
    ]);
    const [pop, orig, action, drama, comedy, scifi, mystery, anim] = results.map(r => r.status === 'fulfilled' ? r.value : []);
    const rows = [];
    if (pop.length) rows.push({ title: 'Popular TV Shows', items: pop });
    if (orig.length) rows.push({ title: 'ZYNIFLIX Originals', items: orig, big: true });
    if (action.length) rows.push({ title: 'Action & Adventure', items: action });
    if (drama.length) rows.push({ title: 'TV Dramas', items: drama });
    if (comedy.length) rows.push({ title: 'TV Comedies', items: comedy });
    if (scifi.length) rows.push({ title: 'Sci-Fi & Fantasy', items: scifi });
    if (mystery.length) rows.push({ title: 'Mystery', items: mystery });
    if (anim.length) rows.push({ title: 'Animation', items: anim });
    rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items, r.big)).join('');
    setupSliderArrows();
    bindPosterClicks(rowsContainer);
    return;
  }

  if (category === 'movies') {
    const results = await Promise.allSettled([
      fetchPopularMovies(),
      fetchTopRatedMovies(),
      fetchMoviesByGenre(28),
      fetchMoviesByGenre(12),
      fetchMoviesByGenre(878),
      fetchMoviesByGenre(53),
      fetchMoviesByGenre(10749),
      fetchMoviesByGenre(27),
      fetchMoviesByGenre(35),
      fetchMoviesByGenre(16),
    ]);
    const [pop, top, action, adv, scifi, thriller, romance, horror, comedy, anim] = results.map(r => r.status === 'fulfilled' ? r.value : []);
    const rows = [];
    if (pop.length) rows.push({ title: 'Popular Movies', items: pop });
    if (top.length) rows.push({ title: 'Top Rated', items: top });
    if (action.length) rows.push({ title: 'Action Movies', items: action });
    if (adv.length) rows.push({ title: 'Adventure', items: adv });
    if (scifi.length) rows.push({ title: 'Sci-Fi', items: scifi });
    if (thriller.length) rows.push({ title: 'Thrillers', items: thriller });
    if (romance.length) rows.push({ title: 'Romance', items: romance });
    if (horror.length) rows.push({ title: 'Horror', items: horror });
    if (comedy.length) rows.push({ title: 'Comedy', items: comedy });
    if (anim.length) rows.push({ title: 'Animation', items: anim });
    rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items)).join('');
    setupSliderArrows();
    bindPosterClicks(rowsContainer);
    return;
  }

  if (category === 'new') {
    const items = await fetchNewAndPopular();
    rowsContainer.innerHTML = buildRow('New & Popular', items);
    setupSliderArrows();
    bindPosterClicks(rowsContainer);
    return;
  }
}

// ===== MY LIST =====
function renderMyList() {
  if (!mylist.length) {
    mylistResults.innerHTML = '<h2>My List</h2><div class="no-results">Your list is empty. Add shows and movies to your list.</div>';
    return;
  }
  mylistResults.innerHTML = `
    <h2>My List</h2>
    <div class="search-grid">${mylist.map(m => {
      const posterPath = m.poster || '';
      return `<div class="poster-card" data-id="${m.id}" data-type="${m.media_type || 'movie'}">
        <img src="${posterUrl(posterPath)}" alt="${m.title}" loading="lazy" />
        <div class="poster-overlay">
          <div class="poster-title">${m.title}</div>
          <div class="poster-actions">
            <button class="poster-action-btn play-btn" data-play-id="${m.id}" data-play-type="${m.media_type || 'movie'}" title="Play">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <button class="poster-action-btn in-list" data-list-id="${m.id}" title="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>
      </div>`;
    }).join('')}</div>
  `;
  bindPosterClicks(mylistResults);
}

// ===== MOVIE MODAL =====
async function openModal(id, type = 'movie') {
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Reset modal
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

  const details = await fetchDetails(id, type);
  if (!details) {
    modalTitle.textContent = 'Details unavailable';
    return;
  }

  currentMovie = { ...details, media_type: type, id };
  const title = details.title || details.name || '';
  const year = getYear(details.release_date || details.first_air_date);
  const runtime = type === 'movie' ? formatRuntime(details.runtime) : formatRuntime(details.episode_run_time?.[0]);
  const vote = details.vote_average;
  const overview = details.overview || '';
  const genres = (details.genres || []).map(g => g.name);
  const cast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);
  const inList = isInMyList(id);

  modalBackdrop.style.backgroundImage = `url(${backdropUrl(details.backdrop_path)})`;
  modalTitle.textContent = title;
  modalDescription.textContent = overview;
  modalMatch.textContent = vote ? `${Math.round(vote * 10)}% Match` : '';
  modalYear.textContent = year;
  modalDuration.textContent = runtime;
  modalRating.textContent = details.vote_average ? `★ ${details.vote_average.toFixed(1)}` : '';
  modalCast.textContent = cast.join(', ') || 'N/A';
  modalGenres.textContent = genres.join(', ') || 'N/A';
  modalTags.textContent = genres.slice(0, 2).join(', ') || 'N/A';

  // Play button
  modalPlay.onclick = () => playDirectly(id, type);

  // My List button
  modalAddList.dataset.listId = id;
  modalAddList.classList.toggle('in-list', inList);
  modalAddList.onclick = () => {
    toggleMyList({ id, title, poster_path: details.poster_path, media_type: type });
    modalAddList.classList.toggle('in-list', isInMyList(id));
  };

  // Episodes for TV shows
  if (type === 'tv' && details.seasons?.length) {
    modalEpisodes.classList.remove('hidden');
    loadSeasons(id, details.seasons);
  }

  // Similar titles
  const similar = (details.similar?.results || []).slice(0, 6);
  if (similar.length) {
    similarGrid.innerHTML = similar.map(m => buildPosterCard({ ...m, media_type: type })).join('');
    bindPosterClicks(similarGrid);
  }
}

async function loadSeasons(tvId, seasons) {
  seasonSelect.innerHTML = '';
  const validSeasons = seasons.filter(s => s.season_number > 0);
  validSeasons.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.season_number;
    opt.textContent = `Season ${s.season_number}`;
    seasonSelect.appendChild(opt);
  });

  if (validSeasons.length) {
    currentSeason = validSeasons[0].season_number;
    seasonSelect.value = currentSeason;
    await loadEpisodes(tvId, currentSeason);
  }

  seasonSelect.onchange = async () => {
    currentSeason = parseInt(seasonSelect.value);
    currentEpisode = 1;
    await loadEpisodes(tvId, currentSeason);
  };
}

async function loadEpisodes(tvId, seasonNum) {
  episodeList.innerHTML = '<div style="padding:20px;text-align:center;"><div class="loading-spinner"></div></div>';
  const data = await fetchSeasonDetails(tvId, seasonNum);
  if (!data || !data.episodes?.length) {
    episodeList.innerHTML = '<div class="no-results">No episodes available.</div>';
    return;
  }

  episodeList.innerHTML = data.episodes.map(ep => `
    <div class="episode-item" data-episode="${ep.episode_number}" data-tv-id="${tvId}">
      <div class="episode-number">${ep.episode_number}</div>
      <div class="episode-thumb" style="position:relative;">
        ${ep.still_path
          ? `<img src="${posterUrl(ep.still_path, 'w300')}" alt="Episode ${ep.episode_number}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />`
          : ''}
        <div class="episode-play-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      </div>
      <div class="episode-details">
        <h4>${ep.name || `Episode ${ep.episode_number}`}</h4>
        <p>${ep.overview || 'No description available.'}</p>
        ${ep.runtime ? `<div class="episode-duration">${ep.runtime}m</div>` : ''}
      </div>
    </div>
  `).join('');

  episodeList.querySelectorAll('.episode-item').forEach(item => {
    item.addEventListener('click', () => {
      currentEpisode = parseInt(item.dataset.episode);
      playDirectly(tvId, 'tv');
    });
  });
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  currentMovie = null;
}

// ===== QUALITY SELECTION =====
const qualityOverlay = $('qualityOverlay');
const qualityClose = $('qualityClose');
const qualityMovieName = $('qualityMovieName');
const qualityOptions = $('qualityOptions');
const qualityLoading = $('qualityLoading');

let pendingPlayId = null;
let pendingPlayType = null;
let fetchedSource = null;

function showQualityPicker(id, type) {
  pendingPlayId = id;
  pendingPlayType = type;
  fetchedSource = null;

  let title = 'Loading...';
  if (currentMovie && String(currentMovie.id) === String(id)) {
    title = currentMovie.title || currentMovie.name || '';
  }
  qualityMovieName.textContent = title || 'Fetching details...';

  qualityOverlay.classList.remove('hidden');
  qualityOptions.classList.remove('hidden');
  qualityLoading.classList.add('hidden');

  // Reset button states
  qualityOptions.querySelectorAll('.quality-btn').forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
  });

  // Fetch details if title not known
  if (!title || title === 'Loading...') {
    fetchDetails(id, type).then(details => {
      if (details) {
        qualityMovieName.textContent = details.title || details.name || '';
      }
    });
  }

  // Pre-fetch source in background
  fetchSourceForQuality(id, type);
}

async function fetchSourceForQuality(id, type) {
  const season = type === 'tv' ? currentSeason : null;
  const episode = type === 'tv' ? currentEpisode : null;

  let source = await fetchVideoSource(id, type, season, episode);
  if (!source?.videoUrl && currentMovie) {
    source = await fetchVideoByTitle(
      currentMovie.title || currentMovie.name,
      getYear(currentMovie.release_date || currentMovie.first_air_date),
      type, season, episode
    );
  }
  fetchedSource = source;
  return source;
}

function closeQualityPicker() {
  qualityOverlay.classList.add('hidden');
  pendingPlayId = null;
  pendingPlayType = null;
}

qualityClose?.addEventListener('click', closeQualityPicker);
qualityOverlay?.addEventListener('click', (e) => {
  if (e.target === qualityOverlay) closeQualityPicker();
});

// Quality button click handlers
qualityOptions?.querySelectorAll('.quality-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const quality = btn.dataset.quality;
    if (!pendingPlayId) return;

    // Show loading state
    qualityOptions.classList.add('hidden');
    qualityLoading.classList.remove('hidden');

    // Get source (use pre-fetched or fetch now)
    let source = fetchedSource;
    if (!source) {
      source = await fetchSourceForQuality(pendingPlayId, pendingPlayType);
    }

    closeQualityPicker();

    if (!source?.videoUrl) {
      // Show error in player
      playerOverlay.classList.remove('hidden');
      playerNotReady.classList.remove('hidden');
      notReadyMsg.textContent = 'This title is not available for streaming right now. Try another title.';
      return;
    }

    // Start playback with selected quality and auto-fullscreen
    await startPlayback(source, quality);
  });
});

async function startPlayback(source, quality) {
  playerOverlay.classList.remove('hidden');
  playerNotReady.classList.remove('hidden');
  notReadyMsg.textContent = `Starting ${quality}p playback...`;

  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  clearSubtitleTracks();
  playerActive = true;
  currentSubtitles = source.subtitles || [];
  activeSubtitleLang = '';

  // Find best URL matching the requested quality
  let videoUrl = source.videoUrl;

  // If qualities array exists, try to match quality
  if (source.qualities && source.qualities.length > 0) {
    const q = parseInt(quality);
    const matched = source.qualities.find(sq => {
      const label = (sq.quality || sq.label || sq.resolution || '').toLowerCase();
      return label.includes(String(q));
    });
    if (matched) {
      videoUrl = matched.downloadUrl || matched.directUrl || matched.url || videoUrl;
    }
  }

  // Set title
  let title = 'Now Playing';
  if (currentMovie) {
    title = currentMovie.title || currentMovie.name || title;
  }
  if (pendingPlayType === 'tv') {
    title += ` - S${currentSeason}E${currentEpisode}`;
  }
  title += ` (${quality}p)`;
  playerTitle.textContent = title;

  // Set video source
  videoPlayer.src = videoUrl;
  videoPlayer.load();

  // Setup subtitles
  setupSubtitleMenu();

  playerNotReady.classList.add('hidden');

  // Auto-play and enter fullscreen
  try {
    await videoPlayer.play();
  } catch (err) {
    console.warn('Autoplay failed, user interaction required');
  }

  // Request fullscreen
  try {
    const container = playerOverlay;
    if (container.requestFullscreen) {
      await container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  } catch (err) {
    console.warn('Fullscreen request failed:', err);
  }
}

// ===== VIDEO PLAYER (legacy - now redirects to quality picker) =====
async function playDirectly(id, type) {
  showQualityPicker(id, type);
}

function setupSubtitleMenu() {
  subtitleControls.classList.remove('hidden');
  subtitleMenu.innerHTML = '';

  const offBtn = document.createElement('button');
  offBtn.className = 'subtitle-option' + (activeSubtitleLang === '' ? ' active' : '');
  offBtn.textContent = 'Off';
  offBtn.onclick = () => selectSubtitle('');
  subtitleMenu.appendChild(offBtn);

  currentSubtitles.forEach(sub => {
    const btn = document.createElement('button');
    btn.className = 'subtitle-option' + (activeSubtitleLang === sub.language ? ' active' : '');
    btn.textContent = sub.label;
    btn.onclick = () => selectSubtitle(sub.language);
    subtitleMenu.appendChild(btn);
  });

  subtitleLabel.textContent = activeSubtitleLang ? (currentSubtitles.find(s => s.language === activeSubtitleLang)?.label || 'On') : 'Off';
}

function selectSubtitle(lang) {
  activeSubtitleLang = lang;
  clearSubtitleTracks();

  if (lang) {
    const sub = currentSubtitles.find(s => s.language === lang);
    if (sub?.url) {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = sub.label;
      track.srclang = (sub.language || 'en').slice(0, 2);
      track.src = sub.url;
      track.default = true;
      videoPlayer.appendChild(track);

      setTimeout(() => {
        Array.from(videoPlayer.textTracks || []).forEach(t => {
          t.mode = t.label === sub.label || t.language === track.srclang ? 'showing' : 'disabled';
        });
      }, 200);
    }
  }

  setupSubtitleMenu();
}

function clearSubtitleTracks() {
  Array.from(videoPlayer.querySelectorAll('track')).forEach(t => t.remove());
  Array.from(videoPlayer.textTracks || []).forEach(t => { t.mode = 'disabled'; });
}

function closePlayer() {
  playerActive = false;
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  clearSubtitleTracks();
  playerOverlay.classList.add('hidden');
  subtitleControls.classList.add('hidden');
  subtitleMenu.classList.add('hidden');
}

// ===== SUBTITLE TOGGLE =====
subtitleBtn?.addEventListener('click', () => {
  subtitleMenu.classList.toggle('hidden');
});

// Close subtitle menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.player-subtitle-controls')) {
    subtitleMenu?.classList.add('hidden');
  }
});

// ===== EVENT LISTENERS =====
// Scroll
window.addEventListener('scroll', handleScroll);

// Search
searchToggle?.addEventListener('click', toggleSearch);
searchClose?.addEventListener('click', toggleSearch);
searchInput?.addEventListener('input', handleSearchInput);
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleSearch();
});

// Modal
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Player
playerBack?.addEventListener('click', closePlayer);
videoPlayer?.addEventListener('click', () => {
  if (videoPlayer.paused) {
    videoPlayer.play().catch(() => {});
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (playerActive) closePlayer();
    else if (!qualityOverlay.classList.contains('hidden')) closeQualityPicker();
    else if (!modalOverlay.classList.contains('hidden')) closeModal();
  }
});

// Nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    loadCategory(link.dataset.category);
  });
});

// Logo home
logoHome?.addEventListener('click', (e) => {
  e.preventDefault();
  if (isSearchOpen) toggleSearch();
  loadCategory('home');
});

// PWA Install
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn?.classList.remove('hidden');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.classList.add('hidden');
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('service-worker.js?v=' + VERSION);
      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              window.location.reload();
            }
          });
        }
      });
    } catch (err) {
      console.warn('SW registration failed', err);
    }
  });
}

// ===== CACHE BUSTING =====
// Check for new version on visibility change (when user returns to tab)
let lastVersionCheck = 0;
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() - lastVersionCheck > 60000) {
    lastVersionCheck = Date.now();
    checkForUpdates();
  }
});

async function checkForUpdates() {
  try {
    const res = await fetch('/health?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) reg.update();
    }
  } catch {}
}

// ===== INIT =====
async function init() {
  playIntro();
  await loadGenreMap();
  await loadHero();
  await loadHomeRows();
  handleScroll();
}

// Start the app
init().catch(err => console.error('Init error:', err));
