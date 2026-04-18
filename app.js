/* ============================================
   ZYNIFLIX - Netflix-Style Streaming App
   ============================================ */

// ===== CONFIG =====
const CV_API = '/api/cv';
const CV_HEADERS = { 'Accept': 'application/json' };
const DAVID_API = 'https://moviebox.davidcyril.name.ng/api';
const MYLIST_KEY = 'zynflix-list-v2';
const INTRO_KEY = 'zynflix-intro';
const SEARCH_KEY = 'zynflix-search-v1';
const DOWNLOADS_KEY = 'zynflix-downloads-v1';
const VERSION = Date.now();

// ===== DAVID API HELPERS =====
async function fetchDavidHome() {
  try {
    const res = await fetch(`${DAVID_API}/homepage`, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (e) { console.warn('David Home API error:', e); return null; }
}

async function fetchDavidTrending() {
  try {
    const res = await fetch(`${DAVID_API}/trending`, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (e) { console.warn('David Trending API error:', e); return null; }
}

async function fetchDavidInfo(id) {
  try {
    const res = await fetch(`${DAVID_API}/info/${id}`, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (e) { console.warn('David Info API error:', e); return null; }
}

async function fetchDavidSources(id) {
  try {
    const res = await fetch(`${DAVID_API}/sources/${id}`, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (e) { console.warn('David Sources API error:', e); return null; }
}

async function fetchDavidSearch(query) {
  try {
    const res = await fetch(`${DAVID_API}/search/${encodeURIComponent(query)}`, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (e) { console.warn('David Search API error:', e); return null; }
}

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
let currentQuality = 'auto';
let currentPlaybackSpeed = 1;
let controlsHideTimer = null;
let hasInitialized = false;
let allMovies = [];
let allSeries = [];
let allTrending = [];
let autoplayTimer = null;
let autoplayCountdown = 5;
let nextEpisodeData = null;

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
const playerTopBar = document.querySelector('.player-top-bar');
const subtitleBtn = $('playerSubtitleBtn');
const subtitleMenu = $('subtitleMenu');
const subtitleLabel = $('subtitleLabel');
const settingsMenu = $('settingsMenu');
const settingsBtn = $('playerSettingsBtn');
const fullscreenBtn = $('fullscreenBtn');
const fullscreenIcon = $('fullscreenIcon');
const fullscreenLabel = $('fullscreenLabel');
const speedOptions = $('speedOptions');
const qualityMenuOptions = $('qualityMenuOptions');
const playPauseBtn = $('playPauseBtn');
const playPauseIcon = $('playPauseIcon');
const rewindBtn = $('rewindBtn');
const forwardBtn = $('forwardBtn');
const playerSeek = $('playerSeek');
const currentTimeEl = $('currentTime');
const durationTimeEl = $('durationTime');
const playerControls = $('playerControls');
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
const downloadsGrid = $('downloadsGrid');
const downloadsNote = $('downloadsNote');
const mylistResults = $('myListResults');
const installPrompt = $('installPrompt');
const installDismiss = $('installDismiss');
const autoplayModal = $('autoplayModal');
const autoplayTitle = $('autoplayTitle');
const autoplayProgress = $('autoplayProgress');
const autoplaySeconds = $('autoplaySeconds');
const autoplayPlayBtn = $('autoplayPlayBtn');
const autoplayCancelBtn = $('autoplayCancelBtn');
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
function loadDownloads() { try { return JSON.parse(localStorage.getItem(DOWNLOADS_KEY)) || []; } catch { return []; } }
function saveDownloads() { try { localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads)); } catch {} }
let downloads = loadDownloads();

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

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hrs > 0
    ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${mins}:${String(secs).padStart(2, '0')}`;
}

function proxiedVideoUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return `/video-proxy/${encodeURIComponent(url)}`;
  return url;
}

function saveDownloadedItem(item, selectedQuality, url) {
  const entry = {
    key: [item.subjectId || item.id, item.subjectType === 2 ? 'tv' : 'movie', currentSeason, currentEpisode, selectedQuality].join(':'),
    id: item.subjectId || item.id,
    title: item.title || item.name || 'Unknown',
    poster: item.poster || item.thumbnail || item.cover?.url || '',
    type: item.subjectType === 2 || item.type === 'tv' ? 'tv' : 'movie',
    quality: selectedQuality,
    season: currentSeason,
    episode: currentEpisode,
    url: url || '',
    addedAt: Date.now()
  };
  downloads = downloads.filter(d => d.key !== entry.key);
  downloads.unshift(entry);
  saveDownloads();
  renderDownloads();
  return entry;
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
  const data = await fetchDavidSearch(query);
  return data?.data?.results || data?.data?.items || [];
}

async function cvPopular() {
  const data = await fetchDavidTrending();
  return data?.data || data?.results || [];
}

async function cvInfo(subjectId) {
  const data = await fetchDavidInfo(subjectId);
  return data?.data || null;
}

async function cvSources(subjectId, season, episode) {
  const data = await fetchDavidSources(subjectId);
  return data?.data || null;
}

// ===== IMAGE HELPERS =====
function thumbUrl(item) {
  return item.thumbnail || item.cover?.url || item.poster || '';
}

function backdropUrl(item) {
  return item.cover?.url || item.thumbnail || item.backdrop || '';
}

// ===== INIT =====
playIntro = function() {
  if (intro) {
    intro.classList.add('fade-out');
    setTimeout(() => { intro.style.display = 'none'; }, 600);
  }
  if (app) app.style.display = 'block';
  init().catch(() => {});
}

function initIntro() {
  const loaderBar = document.querySelector('.intro-loader-bar');
  if (loaderBar) {
    loaderBar.addEventListener('animationend', () => {
      playIntro();
    }, { once: true });
  }
}

// Auto-start
if (intro) {
  initIntro();
} else {
  if (app) app.style.display = 'block';
  init().catch(() => {});
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

  // Use ONLY David's API for movie info
  const davidData = await fetchDavidInfo(id);
  let details = null;
  
  if (davidData?.data) {
    details = davidData.data;
  }

  if (!details) {
    modalTitle.textContent = 'Details unavailable';
    return;
  }

  currentMovie = { ...details, id };
  const title = details.title || 'Unknown';
  const year = details.year || getYear(details.releaseDate);
  const rating = details.rating || details.imdb_rating || details.score || '';
  const isSeries = type === 'tv' || details.type === 'tv' || details.subjectType === 2;
  const desc = details.description || details.overview || details.synopsis || '';
  const genres = details.genres || details.category || [];
  const duration = details.runtime || details.duration || details.runtime_minutes || '';
  const cast = details.cast || details.actors || details.credits || [];
  const bg = details.poster || details.thumbnail || details.cover?.url || details.image || '';

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

  // Watchlist
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
  qualityOptions.classList.add('hidden');
  qualityLoading.classList.remove('hidden');
  fetchSource(id, type).then(source => {
    fetchedSource = source;
    qualityLoading.classList.add('hidden');
    qualityOptions.classList.remove('hidden');
    renderQualityOptions(source);
  });
}

function showDownloadPicker(id, type, item) {
  isDownloadMode = true;
  pendingId = id; pendingType = type; pendingItem = item; fetchedSource = null;
  qualityMovieName.textContent = `Download: ${item?.title || item?.name || 'Loading...'}`;
  qualityOverlay.classList.remove('hidden');
  qualityOptions.classList.add('hidden');
  qualityLoading.classList.remove('hidden');
  fetchSource(id, type).then(source => {
    fetchedSource = source;
    qualityLoading.classList.add('hidden');
    qualityOptions.classList.remove('hidden');
    renderQualityOptions(source);
  });
}

async function fetchSource(id, type) {
  const s = type === 'tv' ? currentSeason : 1;
  const e = type === 'tv' ? currentEpisode : 1;

  let videoUrl = null;
  let subtitles = [];
  let qualities = [];

  // Use ONLY David's API for streaming
  const davidData = await fetchDavidSources(id);
  if (davidData?.data) {
    const d = davidData.data;
    if (d.processedSources?.[0]) {
      videoUrl = d.processedSources[0].downloadUrl || d.processedSources[0].directUrl;
      qualities = d.processedSources.map(s => ({
        quality: s.quality || 'Auto',
        url: s.downloadUrl || s.directUrl
      }));
    } else if (d.downloads?.[0]) {
      videoUrl = d.downloads[0].url;
      qualities = d.downloads.map(dl => ({
        quality: dl.quality || 'Auto',
        url: dl.url
      }));
    } else if (d.url) {
      videoUrl = d.url;
    }
  }

  // NO FALLBACK - Only David API
  if (!videoUrl) {
    console.warn('No streaming source found for ID:', id);
  }

  return { videoUrl, subtitles, qualities };
}

function renderQualityOptions(source) {
  const options = source?.qualities?.length ? source.qualities : (source?.videoUrl ? [{ quality: 'Auto', url: source.videoUrl, downloadUrl: source.videoUrl }] : []);
  if (!options.length) {
    qualityOptions.innerHTML = '<div class="no-results">This title is not available right now.</div>';
    return;
  }
  qualityOptions.innerHTML = options.map((option, index) => {
    const match = String(option.quality || '').match(/(\d{3,4})/);
    const value = match ? match[1] : 'auto';
    const label = match ? `${match[1]}p` : (option.quality || 'Auto');
    const desc = match
      ? (parseInt(match[1], 10) >= 1080 ? 'Full HD' : parseInt(match[1], 10) >= 720 ? 'High Definition' : 'Standard')
      : 'Adaptive stream';
    return `<button class="quality-btn ${index === 0 ? 'recommended' : ''}" data-quality="${value}">
      <div class="quality-info">
        <span class="quality-label">${label}</span>
        <span class="quality-desc">${desc}</span>
      </div>
      <span class="quality-badge">${isDownloadMode ? 'Save' : 'Play'}</span>
    </button>`;
  }).join('');

  qualityOptions.querySelectorAll('.quality-btn').forEach(btn => {
    btn.onclick = async () => {
      const quality = btn.dataset.quality || 'auto';
      if (!pendingId) return;
      if (!fetchedSource?.videoUrl) await fetchSource(pendingId, pendingType);
      if (isDownloadMode) {
        const match = fetchedSource?.qualities?.find(q => String(q.quality || '').includes(quality)) || fetchedSource?.qualities?.[0];
        const url = match?.downloadUrl || match?.url || fetchedSource?.videoUrl;
        if (!url) {
          alert('Download link not available.');
          return;
        }
        const saved = saveDownloadedItem(pendingItem || {}, quality, url);
        qualityOverlay.classList.add('hidden');
        pendingId = null;
        isDownloadMode = false;
        window.open(url, '_blank');
        if (downloadsPage && !downloadsPage.classList.contains('hidden')) renderDownloads();
        return saved;
      }
      closeQualityPicker(false);
      if (!fetchedSource?.videoUrl) {
        playerOverlay.classList.remove('hidden');
        playerNotReady.classList.remove('hidden');
        notReadyMsg.textContent = 'This title is not available for streaming right now.';
        return;
      }
      await startPlayback(fetchedSource, quality);
    };
  });
}

function closeQualityPicker(clearSelection = true) {
  qualityOverlay.classList.add('hidden');
  qualityLoading.classList.add('hidden');
  qualityOptions.classList.remove('hidden');
  if (clearSelection) {
    pendingId = null;
    pendingType = null;
    fetchedSource = null;
    isDownloadMode = false;
  }
}

qualityClose?.addEventListener('click', () => closeQualityPicker(true));
qualityOverlay?.addEventListener('click', e => { if (e.target === qualityOverlay) closeQualityPicker(true); });

async function startPlayback(source, quality) {
  playerOverlay.classList.remove('hidden');
  playerNotReady.classList.add('hidden');
  videoPlayer.pause(); videoPlayer.removeAttribute('src'); videoPlayer.load();
  clearSubs();
  playerActive = true; currentSubtitles = source.subtitles || []; activeSubLang = ''; currentQuality = quality || 'auto';

  let url = source.videoUrl;
  if (source.qualities?.length) {
    const q = parseInt(quality);
    const m = source.qualities.find(sq => {
      const l = (sq.quality || sq.label || sq.resolution || '').toLowerCase();
      return l.includes(String(q));
    });
    if (m) url = m.url || m.directUrl || m.downloadUrl || url;
  }

  if (!url) {
    playerNotReady.classList.remove('hidden');
    notReadyMsg.textContent = 'No video source available';
    return;
  }

  let title = pendingItem?.title || 'Now Playing';
  if (pendingType === 'tv') title += ` S${currentSeason}E${currentEpisode}`;
  title += quality && quality !== 'auto' ? ` (${quality}p)` : '';
  playerTitle.textContent = title;

  videoPlayer.controls = false;
  videoPlayer.playbackRate = currentPlaybackSpeed;
  videoPlayer.src = proxiedVideoUrl(url);
  videoPlayer.load();
  setupSubs();
  renderPlayerSettings(source);
  updateFullscreenButton();
  resetControlsTimer();
  updatePlayPauseIcon();

  videoPlayer.play().catch(e => {});
}

// ===== SUBTITLES =====
function setupSubs() {
  subtitleMenu.innerHTML = '';
  const off = document.createElement('button');
  off.className = 'subtitle-option' + (activeSubLang === '' ? ' active' : '');
  off.textContent = 'Off'; off.onclick = () => selectSub('');
  subtitleMenu.appendChild(off);
  if (!currentSubtitles.length) {
    const empty = document.createElement('button');
    empty.className = 'subtitle-option';
    empty.textContent = 'No subtitles available';
    empty.disabled = true;
    subtitleMenu.appendChild(empty);
  }
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
  subtitleMenu?.classList.add('hidden');
  settingsMenu?.classList.add('hidden');
  if (playerControls) playerControls.classList.remove('hidden-ui');
  if (playerTopBar) playerTopBar.classList.remove('hidden-ui');
  cancelAutoplay();
}

function showAutoplayModal(title, nextData) {
  console.log('showAutoplayModal called:', title, nextData);
  if (!autoplayModal) {
    console.error('autoplayModal is null!');
    return;
  }
  nextEpisodeData = nextData;
  autoplayCountdown = 5;
  if (autoplayTitle) {
    autoplayTitle.textContent = title;
  }
  if (autoplaySeconds) autoplaySeconds.textContent = '5';
  if (autoplayProgress) {
    autoplayProgress.style.animation = 'none';
    autoplayProgress.offsetHeight;
    autoplayProgress.style.animation = 'countdownSpin 5s linear forwards';
  }
  autoplayModal.classList.remove('hidden');
  console.log('Autoplay modal shown successfully');
  
  clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    autoplayCountdown--;
    if (autoplaySeconds) autoplaySeconds.textContent = String(autoplayCountdown);
    if (autoplayCountdown <= 0) {
      clearInterval(autoplayTimer);
      playNextEpisode();
    }
  }, 1000);
}

function cancelAutoplay() {
  clearInterval(autoplayTimer);
  autoplayTimer = null;
  nextEpisodeData = null;
  autoplayModal.classList.add('hidden');
}

function playNextEpisode() {
  if (!nextEpisodeData) return;
  const { id, season, episode } = nextEpisodeData;
  currentSeason = season;
  currentEpisode = episode;
  cancelAutoplay();
  showQualityPicker(id, 'tv', currentMovie);
}

function updateFullscreenButton() {
  const isFullscreen = document.fullscreenElement === playerOverlay || document.webkitFullscreenElement === playerOverlay;
  if (fullscreenLabel) fullscreenLabel.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
  if (fullscreenIcon) {
    fullscreenIcon.innerHTML = isFullscreen
      ? '<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>'
      : '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
  }
}

async function toggleFullscreenMode() {
  try {
    const isFullscreen = document.fullscreenElement === playerOverlay || document.webkitFullscreenElement === playerOverlay;
    if (isFullscreen) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else if (playerOverlay) {
      if (playerOverlay.requestFullscreen) await playerOverlay.requestFullscreen();
      else if (playerOverlay.webkitRequestFullscreen) playerOverlay.webkitRequestFullscreen();
    }
  } catch {}
  updateFullscreenButton();
  resetControlsTimer();
}

function updatePlayPauseIcon() {
  if (!playPauseIcon) return;
  playPauseIcon.innerHTML = videoPlayer.paused
    ? '<polygon points="5,3 19,12 5,21"></polygon>'
    : '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
}

function renderPlayerSettings(source) {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  if (speedOptions) {
    speedOptions.innerHTML = speeds.map(speed => `<button class="player-settings-option ${speed === currentPlaybackSpeed ? 'active' : ''}" data-speed="${speed}">${speed}x</button>`).join('');
    speedOptions.querySelectorAll('[data-speed]').forEach(btn => {
      btn.onclick = () => {
        currentPlaybackSpeed = parseFloat(btn.dataset.speed);
        videoPlayer.playbackRate = currentPlaybackSpeed;
        renderPlayerSettings(source);
      };
    });
  }

  if (qualityMenuOptions) {
    const qualities = source?.qualities?.length ? source.qualities : [{ quality: 'auto', url: source?.videoUrl, downloadUrl: source?.videoUrl }];
    qualityMenuOptions.innerHTML = qualities.map(q => {
      const match = String(q.quality || '').match(/(\d{3,4})/);
      const value = match ? match[1] : 'auto';
      const label = match ? `${match[1]}p` : (q.quality || 'Auto');
      return `<button class="player-settings-option ${String(currentQuality) === String(value) ? 'active' : ''}" data-player-quality="${value}">${label}</button>`;
    }).join('');
    qualityMenuOptions.querySelectorAll('[data-player-quality]').forEach(btn => {
      btn.onclick = async () => {
        const nextQuality = btn.dataset.playerQuality || 'auto';
        const currentTime = videoPlayer.currentTime || 0;
        const paused = videoPlayer.paused;
        const previousSub = activeSubLang;
        await startPlayback(source, nextQuality);
        const restore = () => {
          videoPlayer.currentTime = currentTime;
          if (previousSub) selectSub(previousSub);
          if (paused) videoPlayer.pause();
          videoPlayer.removeEventListener('loadedmetadata', restore);
        };
        videoPlayer.addEventListener('loadedmetadata', restore);
      };
    });
  }
}

function resetControlsTimer() {
  if (!playerControls) return;
  playerControls.classList.remove('hidden-ui');
  if (playerTopBar) playerTopBar.classList.remove('hidden-ui');
  clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(() => {
    if (!videoPlayer.paused && (!subtitleMenu?.classList.contains('hidden') || !settingsMenu?.classList.contains('hidden'))) return;
    if (!videoPlayer.paused) {
      playerControls.classList.add('hidden-ui');
      if (playerTopBar) playerTopBar.classList.add('hidden-ui');
    }
  }, 2600);
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
    if (playerSeek) playerSeek.value = String((videoPlayer.currentTime / videoPlayer.duration) * 100);
    if (currentTimeEl) currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
    if (durationTimeEl) durationTimeEl.textContent = formatTime(videoPlayer.duration);
  }
});
videoPlayer?.addEventListener('play', () => { updatePlayPauseIcon(); resetControlsTimer(); });
videoPlayer?.addEventListener('pause', () => { updatePlayPauseIcon(); if (playerControls) playerControls.classList.remove('hidden-ui'); });
videoPlayer?.addEventListener('loadedmetadata', () => {
  if (durationTimeEl) durationTimeEl.textContent = formatTime(videoPlayer.duration);
  if (currentTimeEl) currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
});
videoPlayer?.addEventListener('ended', () => {
  if (pendingType === 'tv') {
    const nextEp = currentEpisode + 1;
    const title = `Playing ${pendingItem?.title || 'Episode'} Season ${currentSeason} Episode ${nextEp}`;
    showAutoplayModal(title, { id: pendingId, season: currentSeason, episode: nextEp });
  }
});
autoplayPlayBtn?.addEventListener('click', playNextEpisode);
autoplayCancelBtn?.addEventListener('click', cancelAutoplay);
playPauseBtn?.addEventListener('click', () => {
  if (videoPlayer.paused) videoPlayer.play().catch(() => {});
  else videoPlayer.pause();
  resetControlsTimer();
});
rewindBtn?.addEventListener('click', () => {
  videoPlayer.currentTime = Math.max(0, (videoPlayer.currentTime || 0) - 10);
  resetControlsTimer();
});
forwardBtn?.addEventListener('click', () => {
  videoPlayer.currentTime = Math.min(videoPlayer.duration || Infinity, (videoPlayer.currentTime || 0) + 10);
  resetControlsTimer();
});
playerSeek?.addEventListener('input', () => {
  if (!videoPlayer.duration) return;
  videoPlayer.currentTime = (parseFloat(playerSeek.value) / 100) * videoPlayer.duration;
});
subtitleBtn?.addEventListener('click', () => {
  settingsMenu?.classList.add('hidden');
  subtitleMenu?.classList.toggle('hidden');
  resetControlsTimer();
});
settingsBtn?.addEventListener('click', () => {
  subtitleMenu?.classList.add('hidden');
  settingsMenu?.classList.toggle('hidden');
  resetControlsTimer();
});
fullscreenBtn?.addEventListener('click', () => {
  toggleFullscreenMode();
});
playerOverlay?.addEventListener('mousemove', resetControlsTimer);
playerOverlay?.addEventListener('touchstart', resetControlsTimer, { passive: true });
playerOverlay?.addEventListener('pointermove', resetControlsTimer);
playerOverlay?.addEventListener('click', e => {
  if (e.target === playerOverlay || e.target === videoPlayer) resetControlsTimer();
});
playerOverlay?.addEventListener('keydown', resetControlsTimer);
document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
document.addEventListener('click', e => {
  if (!e.target.closest('.player-control') && !e.target.closest('.player-menu')) {
    subtitleMenu?.classList.add('hidden');
    settingsMenu?.classList.add('hidden');
  }
});

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
  if (hasInitialized) return;
  hasInitialized = true;
  renderDownloads();
  try { await loadHero(); } catch {}
  try { await loadHome(); } catch {}
}

// Auto-start
if (app) app.style.display = 'block';
init().catch(() => {});

// ===== HERO BANNER =====
async function loadHero() {
  try {
    const homeData = await fetchDavidHome();
    const data = homeData?.data || {};
    let items = data.trending || data.featured || data.popular || [];
    
    if (items.length) {
      heroItems = items.slice(0, 5);
      updateHero();
    }
  } catch (e) { console.warn('Hero error:', e); }
}

function updateHero() {
  if (!heroItems.length) return;
  const item = heroItems[heroIdx];
  const id = item.subjectId || item.id;
  const type = item.subjectType === 2 ? 'tv' : (item.type || 'movie');
  if (heroBackdrop) heroBackdrop.style.backgroundImage = `url(${item.backdrop || item.thumbnail || item.poster || ''})`;
  if (heroTitle) heroTitle.textContent = item.title || '';
  if (heroOverview) heroOverview.textContent = item.overview || item.description || '';
  if (heroBadge) heroBadge.textContent = item.genre || item.category?.[0] || 'Featured';
  if (heroMeta) heroMeta.innerHTML = item.rating ? `<span class="meta-imdb">★ ${item.rating}</span>` : '';
  if (heroPlay) heroPlay.onclick = () => showQualityPicker(id, type, item);
  if (heroInfo) heroInfo.onclick = () => openModal(id, type);
}

function startHeroRotation() {
  stopHeroRotation();
  heroTimer = setInterval(() => {
    heroIdx = (heroIdx + 1) % heroItems.length;
    updateHero();
  }, 6000);
}

function stopHeroRotation() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
}

// ===== BUILD POSTER CARD =====
function buildCard(item) {
  const id = item.subjectId || item.id;
  const title = item.title || 'Unknown';
  const poster = item.poster || item.thumbnail || item.image || item.cover?.url || '';
  const year = item.year || getYear(item.releaseDate);
  const rating = item.rating || item.score || item.imdb_rating || '';
  const type = item.subjectType === 2 ? 'tv' : (item.type || 'movie');
  const isSeries = type === 'tv';
  const inList = isInList(id);
  
  return `
    <div class="poster-card" data-id="${id}" data-type="${type}">
      <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22 fill=%22%23222%22%3E%3Crect width=%22300%22 height=%22450%22/%3E%3Ctext x=%22150%22 y=%22225%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
      <div class="poster-overlay">
        <div class="poster-title">${title}</div>
        <div class="poster-meta">
          ${rating ? `<span class="match">★ ${rating}</span>` : ''}
          ${year ? `<span class="year">${year}</span>` : ''}
          <span class="rating-badge">${isSeries ? 'TV' : 'Movie'}</span>
        </div>
        <div class="poster-actions">
          <button class="poster-action-btn play-btn" data-play-id="${id}" data-play-type="${type}" title="Play">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="poster-action-btn ${inList ? 'in-list' : ''}" data-list-id="${id}" data-list-title="${title}" data-list-poster="${poster}" data-list-type="${type}" title="My List">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${inList ? '<polyline points="20 6 9 17 4 12"/>' : '<path d="M12 5v14"/><path d="M5 12h14"/>'}
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

function buildRow(title, items, isContinue, isTop10) {
  if (!items.length) return '';
  const rowClass = isTop10 ? 'movie-row top-10-row' : (isContinue ? 'movie-row continue-row' : 'movie-row');
  let itemsHtml;
  if (isContinue) {
    itemsHtml = items.map(buildContinueCard).join('');
  } else if (isTop10) {
    itemsHtml = items.map((item, idx) => buildTop10Card(item, idx + 1)).join('');
  } else {
    itemsHtml = items.map(buildCard).join('');
  }
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
  const title = item.title || item.name || 'Unknown';
  const poster = item.poster || item.thumbnail || item.image || item.cover?.url || '';
  const type = item.subjectType === 2 ? 'tv' : (item.type || 'movie');
  return `<div class="poster-card top-10-card" data-id="${id}" data-type="${type}">
    <div class="top-10-rank">${rank}</div>
    <img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.background='#222'" />
    <div class="poster-overlay">
      <div class="poster-title">${title}</div>
    </div>
  </div>`;
}

function buildContinueCard(item) {
  const id = item.subjectId || item.id;
  const title = item.title || 'Unknown';
  const poster = item.poster || item.thumbnail || item.image || item.cover?.url || '';
  const progress = item.progress || 0;
  const type = item.subjectType === 2 ? 'tv' : (item.type || 'movie');
  const remaining = Math.round((100 - progress) / 100 * (item.duration || 0) / 60);

  return `
    <div class="continue-card" data-id="${id}" data-type="${type}">
      <div class="continue-card-media">
        <img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.background='#222'" />
        <div class="continue-play-overlay">
          <button class="continue-play-btn" data-play-id="${id}" data-play-type="${type}" title="Play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
        </div>
        <div class="continue-progress">
          <div class="continue-progress-bar" style="width:${progress}%"></div>
        </div>
      </div>
      <div class="continue-card-info">
        <div class="continue-card-title">${title}</div>
        <div class="continue-card-meta">
          ${remaining > 0 ? `${remaining}m left` : `${Math.round(progress)}% watched`}
        </div>
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
  container.querySelectorAll('.continue-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.continue-play-btn')) return;
      openModal(card.dataset.id, card.dataset.type || 'movie');
    };
  });
  container.querySelectorAll('.continue-play-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      showQualityPicker(btn.dataset.playId, btn.dataset.playType || 'movie', { id: btn.dataset.playId, title: btn.closest('.continue-card')?.querySelector('.continue-card-title')?.textContent || '' });
    };
  });
  container.querySelectorAll('[data-play-id]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      showQualityPicker(btn.dataset.playId, btn.dataset.playType || 'movie', { id: btn.dataset.playId, title: btn.closest('.poster-card')?.querySelector('.poster-title')?.textContent || '' });
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
    // Use homepage endpoint
    const homeData = await fetchDavidHome();
    const data = homeData?.data || {};
    
    const rows = [];
    
    // Get all movies from homepage data
    const allItems = [];
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (!allItems.find(i => i.subjectId === item.subjectId)) {
            allItems.push(item);
          }
        });
      }
    });
    
    // Trending/Top 10
    if (data.trending?.length) {
      rows.push({ title: 'Top 10', items: data.trending.slice(0, 10), isTop10: true });
    }
    
    // Continue Watching
    if (continueWatching.length) {
      const continueItems = continueWatching.filter(c => c.progress > 0 && c.progress < 95).slice(0, 6);
      if (continueItems.length) {
        rows.push({ title: 'Continue Watching', items: continueItems, isContinue: true });
      }
    }
    
    // Add categories from homepage
    Object.keys(data).forEach(key => {
      if (key !== 'trending' && Array.isArray(data[key]) && data[key].length > 0) {
        const title = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
        rows.push({ title, items: data[key].slice(0, 12) });
      }
    });
    
    if (rows.length) {
      rowsContainer.innerHTML = rows.map(r => buildRow(r.title, r.items, r.isContinue, r.isTop10)).join('');
      setupArrows();
      bindCards(rowsContainer);
      startHeroRotation();
    } else {
      rowsContainer.innerHTML = '<div class="no-results">No content available</div>';
    }
  } catch (e) {
    console.warn('Load home error:', e);
    rowsContainer.innerHTML = '<div class="no-results">Failed to load content</div>';
  }
}
