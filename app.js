/* ============================================
   ZYNIFLIX - Netflix-Style Streaming App
   ============================================ */

// ===== CONFIG =====
const CV_API = '/api/cv';
const CV_HEADERS = { 'Accept': 'application/json' };
const MYLIST_KEY = 'zynflix-list-v2';
const INTRO_KEY = 'zynflix-intro';
const SEARCH_KEY = 'zynflix-search-v1';
const DOWNLOADS_KEY = 'zynflix-downloads-v1';
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
        showQualityPicker(item.id, item.type || 'movie', pendingItem);
      }
    };
  });
  downloadsGrid.querySelectorAll('[data-download-open]').forEach(btn => {
    btn.onclick = () => openModal(btn.dataset.downloadOpen, btn.dataset.downloadType || 'movie');
  });
  downloadsGrid.querySelectorAll('[data-download-remove]').forEach(btn => {
    btn.onclick = () => {
      downloads = downloads.filter(d => d.key !== btn.dataset.downloadRemove);
      saveDownloads();
      renderDownloads();
    };
  });
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

  // Directly use David's API for streaming
  try {
    const davidRes = await fetch(`${DAVID_API}/watch/${id}`, { 
      headers: { 'Accept': 'application/json' } 
    });
    const davidData = await davidRes.json();
    
    if (davidData?.data?.streams && davidData.data.streams.length > 0) {
      videoUrl = davidData.data.streams[0].url;
      qualities = davidData.data.streams.map(s => ({
        quality: s.quality || 'Auto',
        url: s.url
      }));
    }
    
    // Get IMDb ID for subtitles
    const imdbId = davidData?.data?.imdb_id;
    if (imdbId) {
      const subData = await fetchSubtitles(imdbId);
      if (subData.length) subtitles = subData;
    }
  } catch (e) { console.warn('David API error:', e); }

  // Fallback to CV_API if David fails
  if (!videoUrl) {
    try {
      let sourceUrl = `${CV_API}/sources/${id}`;
      if (type === 'tv') sourceUrl += `?season=${s}&episode=${e}`;
      const srcRes = await cvFetch(sourceUrl);
      const srcData = srcRes?.data || srcRes;
      if (srcData) {
        if (srcData.processedSources?.[0]) {
          videoUrl = srcData.processedSources[0].streamUrl || srcData.processedSources[0].directUrl;
          qualities = srcData.processedSources.map(s => ({
            quality: s.quality || 'Auto',
            url: s.streamUrl || s.directUrl || s.downloadUrl
          }));
        } else if (srcData.downloads?.[0]) {
          videoUrl = srcData.downloads[0].url;
          qualities = srcData.downloads.map(d => ({
            quality: d.resolution || d.quality || 'Auto',
            url: d.url
          }));
        } else if (srcData.url) {
          videoUrl = srcData.url;
        }
        if (srcData.captions?.length) {
          subtitles = srcData.captions.map((st, i) => ({
            label: st.lanName || st.lan || `Sub ${i+1}`,
            language: st.lan || `s${i}`,
            url: st.url || ''
          }));
        }
      }
    } catch (e) { console.warn('CV API error:', e); }
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
  if (autoplaySeconds) autoplaySeconds.textContent = '5';
  if (autoplayProgress) {
    autoplayProgress.style.animation = 'none';
    autoplayProgress.offsetHeight;
    autoplayProgress.style.animation = 'countdownSpin 5s linear forwards';
  }
  if (autoplayModal) {
    console.log('Showing autoplay modal');
    autoplayModal.classList.remove('hidden');
  }
  
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
if (intro) {
  setTimeout(() => playIntro(), 2200);
} else {
  if (app) app.style.display = 'block';
  init().catch(() => {});
}
