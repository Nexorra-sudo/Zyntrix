const intro = document.getElementById('intro');
const appShell = document.getElementById('appShell');
const installBtn = document.getElementById('installBtn');

const images = [
  { id: 1, title: 'Boardwalk Sunset', query: 'sunset boardwalk', tags: 'sunset, beach, calm' },
  { id: 2, title: 'Forest Dream', query: 'forest path', tags: 'trees, journey, green' },
  { id: 3, title: 'City Nights', query: 'city skyline night', tags: 'urban, neon, modern' },
  { id: 4, title: 'Ocean Escape', query: 'beach sunset', tags: 'ocean, sand, warm' },
  { id: 5, title: 'Mountain Summit', query: 'snowy mountain peak', tags: 'adventure, peak, crisp' },
  { id: 6, title: 'Desert Light', query: 'desert dunes sunset', tags: 'sand, travel, warm' },
  { id: 7, title: 'Cozy Living', query: 'cozy interior design', tags: 'home, decor, warm' },
  { id: 8, title: 'Spring Meadow', query: 'wildflower meadow', tags: 'flowers, spring, color' },
  { id: 9, title: 'Aerial Panorama', query: 'aerial landscape view', tags: 'drone, panorama, vast' },
  { id: 10, title: 'Artful Abstract', query: 'abstract art photography', tags: 'color, modern, creative' },
  { id: 11, title: 'Winter Silence', query: 'winter morning landscape', tags: 'snow, calm, crisp' },
  { id: 12, title: 'Golden Glow', query: 'golden hour sunset', tags: 'sunset, warm, vibrant' }
];

let movies = [
  {
    id: 101,
    title: 'War Machine',
    year: '2026',
    genre: 'Action, Sci-Fi, Thriller',
    description: 'A rogue mercenary races to stop a shadow network before it destroys the world.',
    poster: 'https://loremflickr.com/320/480/movie,war?lock=101',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/war-machine-YS6GdKiYyz9',
    category: 'Trending'
  },
  {
    id: 102,
    title: 'Hoppers',
    year: '2026',
    genre: 'Animation, Adventure, Comedy',
    description: 'A lively animated adventure full of heart, humor, and impossible stunts.',
    poster: 'https://loremflickr.com/320/480/movie,animation?lock=102',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/hoppers-ahkQsEPhCI2',
    category: 'Trending'
  },
  {
    id: 103,
    title: 'Avatar: Fire and Ash',
    year: '2026',
    genre: 'Sci-Fi, Adventure, Fantasy',
    description: 'An epic journey across worlds as ancient powers collide with modern firepower.',
    poster: 'https://loremflickr.com/320/480/movie,avatar?lock=103',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/avatar-fire-and-ash-ixOH9eSiw5',
    category: 'Trending'
  },
  {
    id: 104,
    title: 'GOAT',
    year: '2024',
    genre: 'Sports, Drama',
    description: 'A true underdog story of a champion fighting to reclaim the crown.',
    poster: 'https://loremflickr.com/320/480/movie,sports?lock=104',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/goat-u1jZhR4CnV4',
    category: 'Action'
  },
  {
    id: 105,
    title: 'Wuthering Heights',
    year: '2025',
    genre: 'Drama, Romance',
    description: 'An intense love story that refuses to let the stormy past go silent.',
    poster: 'https://loremflickr.com/320/480/movie,drama?lock=105',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/wuthering-heights-QoJ5YQ0N0R5',
    category: 'Drama'
  },
  {
    id: 106,
    title: 'Send Help',
    year: '2025',
    genre: 'Horror, Mystery',
    description: 'A chilling thriller where every message could be the last one received.',
    poster: 'https://loremflickr.com/320/480/movie,horror?lock=106',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/send-help-2ZQb3kKUaT2',
    category: 'Horror'
  },
  {
    id: 107,
    title: 'Pretty Lethal',
    year: '2025',
    genre: 'Action, Thriller',
    description: 'A sensational strike team goes dark to pull off the impossible mission.',
    poster: 'https://loremflickr.com/320/480/movie,spy?lock=107',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/pretty-lethal-OdivMHNRrz9',
    category: 'Action'
  },
  {
    id: 108,
    title: 'Scream 7',
    year: '2026',
    genre: 'Horror, Thriller',
    description: 'The streets are haunted once again by the most iconic mask in horror.',
    poster: 'https://loremflickr.com/320/480/movie,terror?lock=108',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/scream-7-mpxfSgbRWL2',
    category: 'Horror'
  },
  {
    id: 109,
    title: 'The Old Guard 2',
    year: '2025',
    genre: 'Action, Adventure',
    description: 'Immortal warriors return with new enemies and higher stakes.',
    poster: 'https://loremflickr.com/320/480/movie,guard?lock=109',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph/detail/the-old-guard-2-Cd1topaO9p3',
    category: 'Action'
  },
  {
    id: 110,
    title: 'One Piece',
    year: '2025',
    genre: 'Animation, Adventure',
    description: 'A legendary journey of pirates, treasure, and impossible dreams.',
    poster: 'https://loremflickr.com/320/480/movie,pirate?lock=110',
    videoSrc: '',
    detailUrl: 'https://moviebox.ph',
    category: 'Animation'
  }
];

const movieCategories = [
  { title: 'Trending Now', filter: movie => movie.category === 'Trending' },
  { title: 'Action Movies', filter: movie => movie.genre.toLowerCase().includes('action') },
  { title: 'Horror Collection', filter: movie => movie.genre.toLowerCase().includes('horror') },
  { title: 'Drama Picks', filter: movie => movie.genre.toLowerCase().includes('drama') },
  { title: 'Comedy Tonight', filter: movie => movie.genre.toLowerCase().includes('comedy') },
  { title: 'Animated Adventures', filter: movie => movie.genre.toLowerCase().includes('animation') },
  { title: 'Romance Stories', filter: movie => movie.genre.toLowerCase().includes('romance') },
  { title: 'Adventure Run', filter: movie => movie.genre.toLowerCase().includes('adventure') }
];

let deferredPrompt = null;
let railObserver = null;
let featuredMovie = null;
let featuredHeroTimer = null;
let featuredHeroItems = [];
let featuredHeroIndex = 0;

// Cineverse API Configuration
const cineverseApiHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Referer': 'https://cineverse.name.ng/',
  'Origin': 'https://cineverse.name.ng',
  'Accept': 'application/json'
};

const cineverseVideoHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Accept': '*/*',
  'Connection': 'keep-alive'
};

const CINEVERSE_API_BASE = 'https://moviebox.davidcyril.name.ng/api';

function getImageUrl(item) {
  const query = (item.query || item.title || 'photo').trim().replace(/\s+/g, ',');
  return item.imageUrl || `https://loremflickr.com/600/900/${encodeURIComponent(query)}?lock=${item.id}`;
}

function buildTrailerUrl(movie) {
  if (!movie) return 'https://www.youtube.com/';
  return movie.trailerUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.year || ''} official trailer`)}`;
}

function showIntro() {
  setTimeout(() => {
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      appShell.style.display = 'block';
      appShell.style.opacity = '0';
      requestAnimationFrame(() => {
        appShell.style.transition = 'opacity 0.3s ease';
        appShell.style.opacity = '1';
      });
    }, 850);
  }, 2000);
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.classList.add('hidden');
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  console.log(`Install choice: ${choice.outcome}`);
});

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const emptyState = document.getElementById('emptyState');
const previewModal = document.getElementById('previewModal');
const modalClose = document.getElementById('modalClose');
const closeModal = document.getElementById('closeModal');
const previewImage = document.getElementById('previewImage');
const modalTitle = document.getElementById('modalTitle');
const modalTags = document.getElementById('modalTags');
const downloadButton = document.getElementById('downloadButton');
const openButton = document.getElementById('openButton');

const viewSelect = document.getElementById('viewSelect');
const selectPictures = document.getElementById('selectPictures');
const selectCinema = document.getElementById('selectCinema');
const changeModeBtn = document.getElementById('changeModeBtn');
const imageView = document.getElementById('imageView');
const cinemaView = document.getElementById('cinemaView');
const topbar = document.querySelector('.topbar');
const cinemaRows = document.getElementById('cinemaRows');
const movieResults = document.getElementById('movieResults');
const emptyCinemaState = document.getElementById('emptyCinemaState');
const homeCinemaSection = document.querySelector('.home-cinema-section');
const brandTitle = document.querySelector('.brand h1');
const brandSubtitle = document.querySelector('.brand p');
const searchLabel = document.querySelector('.search-label');
const featuredHero = document.getElementById('featuredHero');
const featuredHeroBackdrop = document.getElementById('featuredHeroBackdrop');
const featuredHeroPoster = document.getElementById('featuredHeroPoster');
const featuredHeroTitle = document.getElementById('featuredHeroTitle');
const featuredHeroGenres = document.getElementById('featuredHeroGenres');
const featuredHeroDescription = document.getElementById('featuredHeroDescription');
const featuredPlayButton = document.getElementById('featuredPlayButton');
const featuredTrailerButton = document.getElementById('featuredTrailerButton');
const featuredDownloadButton = document.getElementById('featuredDownloadButton');
const movieModal = document.getElementById('movieModal');
const movieDetailBackdrop = document.getElementById('movieDetailBackdrop');
const movieDetailPoster = document.getElementById('movieDetailPoster');
const movieDetailPreview = document.querySelector('.movie-detail-preview');
const moviePlayer = document.getElementById('moviePlayer');
const movieSubtitleToggle = document.getElementById('movieSubtitleToggle');
const movieSettingsButton = document.getElementById('movieSettingsButton');
const movieSettingsPanel = document.getElementById('movieSettingsPanel');
const movieQualitySelect = document.getElementById('movieQualitySelect');
const movieSubtitleLanguage = document.getElementById('movieSubtitleLanguage');
const episodePanel = document.getElementById('episodePanel');
const seasonSelect = document.getElementById('seasonSelect');
const episodeList = document.getElementById('episodeList');
const movieModalType = document.getElementById('movieModalType');
const movieModalTitle = document.getElementById('movieModalTitle');
const movieModalRating = document.getElementById('movieModalRating');
const movieModalDate = document.getElementById('movieModalDate');
const movieModalCaptionStatus = document.getElementById('movieModalCaptionStatus');
const movieModalGenre = document.getElementById('movieModalGenre');
const movieModalDesc = document.getElementById('movieModalDesc');
const moviePlaybackNote = document.getElementById('moviePlaybackNote');
const movieDownloadButton = document.getElementById('movieDownloadButton');
const movieModalClose = document.getElementById('movieModalClose');
const movieModalCloseBtn = document.getElementById('movieModalCloseBtn');
const moviePlayButton = document.getElementById('moviePlayButton');

let activeItem = null;
let activeMovie = null;
let currentMode = 'images';
let movieModalRequestId = 0;
let currentPlaybackBundle = null;
let selectedSeason = 1;
let selectedEpisode = 1;
let subtitlesEnabled = false;
let lastSavedPlaybackMark = '';
const movieApiBasePath = '/api';
const WATCH_HISTORY_KEY = 'zyntrix-watch-history-v1';

function extractMovieSource(data) {
  if (!data || typeof data !== 'object') return null;

  const directCandidates = [
    data.download_url,
    data.video_url,
    data.stream_url,
    data.url,
    data.play_url,
    data.file
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  const collectionCandidates = [
    data.sources,
    data.links,
    data.playlist,
    data.playlists,
    data.videos,
    data.files
  ];

  for (const collection of collectionCandidates) {
    if (!Array.isArray(collection)) continue;
    for (const entry of collection) {
      if (!entry || typeof entry !== 'object') continue;
      const nestedCandidates = [
        entry.url,
        entry.file,
        entry.src,
        entry.download_url,
        entry.stream_url,
        entry.play_url
      ];

      for (const candidate of nestedCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      }
    }
  }

  return null;
}

function getDefaultSeasonCount(movie) {
  if (!movie || movie.subjectType !== 2) return 1;
  return Number(movie.seasonCount || movie.totalSeasons || 4);
}

function getDefaultEpisodeCount(movie) {
  if (!movie || movie.subjectType !== 2) return 1;
  return Number(movie.episodeCount || movie.totalEpisodes || 12);
}

function createEpisodeTitle(episodeNumber) {
  return `Episode ${episodeNumber}`;
}

function getSourceCacheKey(season, episode) {
  return `s${season}e${episode}`;
}

function normalizeSourceBundle(data) {
  const bundle = {
    url: null,
    qualities: [],
    subtitles: []
  };

  const sources = [];
  if (Array.isArray(data?.processedSources)) {
    data.processedSources.forEach((source, index) => {
      if (!source) return;
      sources.push({
        label: source.quality || source.label || source.resolution || `Source ${index + 1}`,
        url: source.downloadUrl || source.directUrl || source.url || ''
      });
    });
  }

  if (Array.isArray(data?.downloads)) {
    data.downloads.forEach((source, index) => {
      if (!source) return;
      sources.push({
        label: source.quality || source.label || source.resolution || `Download ${index + 1}`,
        url: source.url || source.downloadUrl || ''
      });
    });
  }

  if (!sources.length) {
    const directUrl = extractMovieSource(data);
    if (directUrl) {
      sources.push({ label: 'Auto', url: directUrl });
    }
  }

  bundle.qualities = sources.filter(source => source.url);
  bundle.url = bundle.qualities[0]?.url || null;

  const subtitles = [];
  if (typeof data?.subtitle_url === 'string' && data.subtitle_url) {
    subtitles.push({ label: 'Default', language: 'Default', url: data.subtitle_url });
  }

  if (Array.isArray(data?.subtitles)) {
    data.subtitles.forEach((item, index) => {
      const url = item?.url || item?.src || item?.file || '';
      if (!url) return;
      subtitles.push({
        label: item.label || item.language || `Subtitle ${index + 1}`,
        language: item.language || item.label || `Subtitle ${index + 1}`,
        url
      });
    });
  }

  if (Array.isArray(data?.captions)) {
    data.captions.forEach((item, index) => {
      const url = item?.url || item?.src || '';
      if (!url) return;
      subtitles.push({
        label: item.label || item.language || `Caption ${index + 1}`,
        language: item.language || item.label || `Caption ${index + 1}`,
        url
      });
    });
  }

  bundle.subtitles = subtitles;
  return bundle;
}

function loadWatchHistory() {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Watch history load error', error);
    return [];
  }
}

function saveWatchHistory(items) {
  try {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(items.slice(0, 24)));
  } catch (error) {
    console.warn('Watch history save error', error);
  }
}

function buildPlaybackHistoryKey(movie, season = 1, episode = 1) {
  return `${movie?.id || 'movie'}:${season}:${episode}`;
}

function getStoredPlaybackState(movie) {
  if (!movie) return null;
  const history = loadWatchHistory();
  return history.find(item => String(item.movieId) === String(movie.id)) || null;
}

function persistWatchState(movie, { completed = false } = {}) {
  if (!movie || !moviePlayer) return;

  const duration = Number.isFinite(moviePlayer.duration) ? moviePlayer.duration : 0;
  const progress = Number.isFinite(moviePlayer.currentTime) ? moviePlayer.currentTime : 0;
  if (!duration && !progress) return;

  const history = loadWatchHistory();
  const entryKey = buildPlaybackHistoryKey(movie, selectedSeason, selectedEpisode);
  const filtered = history.filter(item => item.key !== entryKey);
  const progressPercent = duration > 0 ? Math.min(100, Math.round((progress / duration) * 100)) : 0;

  filtered.unshift({
    key: entryKey,
    movieId: movie.id,
    title: movie.title,
    poster: movie.poster,
    genre: movie.genre,
    year: movie.year,
    category: movie.category,
    subjectType: movie.subjectType,
    season: selectedSeason,
    episode: selectedEpisode,
    progress,
    duration,
    progressPercent: completed ? 100 : progressPercent,
    completed,
    updatedAt: Date.now()
  });

  saveWatchHistory(filtered);
}

function getContinueWatchingItems(items = movies) {
  const history = loadWatchHistory()
    .filter(item => !item.completed && item.progressPercent >= 5 && item.progressPercent < 98)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return history.map(entry => {
    const liveMovie = items.find(movie => String(movie.id) === String(entry.movieId));
    if (!liveMovie) return null;

    return {
      ...liveMovie,
      progressPercent: entry.progressPercent,
      continueLabel: liveMovie.subjectType === 2
        ? `Continue S${entry.season} E${entry.episode}`
        : `Continue from ${entry.progressPercent}%`
    };
  }).filter(Boolean);
}

function getBecauseYouWatchedConfig(items = movies) {
  const history = loadWatchHistory()
    .filter(item => item.progressPercent >= 10)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const seed = history[0];
  if (!seed) return null;

  const watchedIds = new Set(history.map(item => String(item.movieId)));
  const seedGenres = String(seed.genre || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  const recommendations = items.filter(movie => {
    if (watchedIds.has(String(movie.id))) return false;
    const movieGenres = String(movie.genre || '').toLowerCase();
    if (seedGenres.some(genre => movieGenres.includes(genre))) return true;
    return seed.category && movie.category === seed.category;
  }).slice(0, 12);

  if (!recommendations.length) return null;

  const label = seedGenres[0]
    ? `${seedGenres[0].charAt(0).toUpperCase()}${seedGenres[0].slice(1)}`
    : (seed.category || 'this');

  return {
    title: `Because You Watched ${seed.title}`,
    description: `More ${label} picks based on what you played recently.`,
    items: recommendations
  };
}

function renderPersonalizedRows(items = movies) {
  if (!cinemaRows) return;

  cinemaRows.querySelectorAll('[data-personalized-row="true"]').forEach(node => node.remove());

  const continueWatching = getContinueWatchingItems(items);
  if (continueWatching.length) {
    const row = buildMovieRow(
      'Continue Watching',
      continueWatching,
      'Jump back into what you started right after the hero banner.'
    );
    row.dataset.personalizedRow = 'true';
    row.classList.add('personalized-row');
    cinemaRows.prepend(row);
  }

  const becauseYouWatched = getBecauseYouWatchedConfig(items);
  if (becauseYouWatched?.items?.length) {
    const row = buildMovieRow(
      becauseYouWatched.title,
      becauseYouWatched.items,
      becauseYouWatched.description
    );
    row.dataset.personalizedRow = 'true';
    row.classList.add('personalized-row');
    cinemaRows.insertBefore(row, cinemaRows.children[continueWatching.length ? 1 : 0] || null);
  }
}

function formatMovieRating(movie) {
  const rawRating = movie?.rating ?? movie?.score ?? movie?.voteAverage ?? movie?.imdbRating ?? movie?.imdb_score;
  const rating = Number(rawRating);
  if (Number.isFinite(rating) && rating > 0) {
    return `Rating ${rating.toFixed(rating >= 10 ? 0 : 1)}/10`;
  }
  if (typeof rawRating === 'string' && rawRating.trim()) {
    return `Rating ${rawRating.trim()}`;
  }
  return 'Rating N/A';
}

function formatMovieDate(movie) {
  if (movie?.releaseDate) return movie.releaseDate;
  if (movie?.year) return String(movie.year);
  return 'Date unavailable';
}

function updateCaptionStatus() {
  const hasCaptions = !movieSubtitleLanguage?.disabled && (currentPlaybackBundle?.subtitles?.length || 0) > 0;
  const label = hasCaptions
    ? (subtitlesEnabled && movieSubtitleLanguage.value ? `Captions: ${movieSubtitleLanguage.value}` : 'Captions Off')
    : 'Captions unavailable';

  if (movieModalCaptionStatus) {
    movieModalCaptionStatus.textContent = label;
  }

  if (movieSubtitleToggle) {
    movieSubtitleToggle.textContent = hasCaptions && subtitlesEnabled ? 'Captions On' : 'Captions Off';
  }
}

function setMovieModalState(message, state = 'loading') {
  if (moviePlaybackNote) {
    moviePlaybackNote.textContent = message;
  }
  moviePlayButton.disabled = true;
  movieDownloadButton.disabled = true;
  movieSubtitleToggle.disabled = true;
  movieSettingsButton.disabled = true;
  movieModal.dataset.state = state;
}

function syncActiveWatchState({ completed = false, force = false } = {}) {
  if (!activeMovie || !moviePlayer) return;

  const currentSecond = Math.floor(Number.isFinite(moviePlayer.currentTime) ? moviePlayer.currentTime : 0);
  const mark = `${activeMovie.id}:${selectedSeason}:${selectedEpisode}:${currentSecond}:${completed}`;
  if (!force && mark === lastSavedPlaybackMark) return;

  persistWatchState(activeMovie, { completed });
  lastSavedPlaybackMark = mark;

  if (currentMode === 'cinema' && movieResults.classList.contains('hidden')) {
    renderPersonalizedRows(movies);
  }
}

async function startMoviePlayback() {
  if (!moviePlayer || !moviePlayer.src) return false;

  try {
    await moviePlayer.play();
    return true;
  } catch (err) {
    console.warn('Playback error', err);
    return false;
  }
}

async function applyMovieSource(movie, source, { autoplay = false, resumeAt = 0 } = {}) {
  if (!movie || !source) return;

  movie.videoSrc = source;
  moviePlayer.src = source;
  moviePlayer.load();

  if (resumeAt > 0) {
    moviePlayer.addEventListener('loadedmetadata', () => {
      try {
        moviePlayer.currentTime = Math.min(resumeAt, Math.max(0, (moviePlayer.duration || resumeAt) - 1));
      } catch (err) {
        console.warn('Resume seek error', err);
      }
    }, { once: true });
  }

  moviePlayButton.disabled = false;
  movieDownloadButton.disabled = false;
  movieSettingsButton.disabled = false;
  movieModal.dataset.state = 'ready';
  if (moviePlaybackNote) {
    moviePlaybackNote.textContent = autoplay ? '' : 'Ready to play in fullscreen.';
  }

  if (autoplay) {
    const played = await startMoviePlayback();
    if (!played) {
      if (moviePlaybackNote) {
        moviePlaybackNote.textContent = 'Tap Play again if the movie did not start automatically.';
      }
    }
  }
}

function clearSubtitleTracks() {
  Array.from(moviePlayer.querySelectorAll('track')).forEach(track => track.remove());
}

function resetPlayerSurface() {
  movieDetailPreview?.classList.add('hidden');
  movieSettingsPanel?.classList.add('hidden');
  clearSubtitleTracks();
  currentPlaybackBundle = null;
  moviePlayer.pause();
  moviePlayer.removeAttribute('src');
  moviePlayer.load();
  movieQualitySelect.innerHTML = '';
  movieSubtitleLanguage.innerHTML = '';
  movieSubtitleToggle.textContent = 'Captions Off';
  movieSubtitleToggle.disabled = true;
  movieQualitySelect.disabled = true;
  movieSubtitleLanguage.disabled = true;
  movieSettingsButton.disabled = true;
  updateCaptionStatus();
}

function revealPlayerSurface() {
  movieDetailPreview?.classList.remove('hidden');
}

function applySubtitleSelection() {
  clearSubtitleTracks();
  if (!currentPlaybackBundle || !subtitlesEnabled || !movieSubtitleLanguage.value) {
    updateCaptionStatus();
    return;
  }

  const selected = currentPlaybackBundle.subtitles.find(item => item.language === movieSubtitleLanguage.value) || currentPlaybackBundle.subtitles[0];
  if (!selected?.url) {
    updateCaptionStatus();
    return;
  }

  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.label = selected.label || selected.language || 'Subtitle';
  track.srclang = (selected.language || 'en').slice(0, 2).toLowerCase();
  track.src = selected.url;
  track.default = true;
  moviePlayer.appendChild(track);
  track.addEventListener('load', () => {
    Array.from(moviePlayer.textTracks || []).forEach(textTrack => {
      textTrack.mode = textTrack.language === track.srclang || textTrack.label === track.label ? 'showing' : 'disabled';
    });
  });
  Array.from(moviePlayer.textTracks || []).forEach(textTrack => {
    textTrack.mode = 'disabled';
  });
  updateCaptionStatus();
}

function renderPlaybackSettings(bundle) {
  currentPlaybackBundle = bundle;

  movieQualitySelect.innerHTML = '';
  bundle?.qualities?.forEach((quality, index) => {
    const option = document.createElement('option');
    option.value = quality.url;
    option.textContent = quality.label || `Quality ${index + 1}`;
    movieQualitySelect.appendChild(option);
  });

  movieSubtitleLanguage.innerHTML = '';
  const offOption = document.createElement('option');
  offOption.value = '';
  offOption.textContent = 'Off';
  movieSubtitleLanguage.appendChild(offOption);

  bundle?.subtitles?.forEach((subtitle, index) => {
    const option = document.createElement('option');
    option.value = subtitle.language || `subtitle-${index + 1}`;
    option.textContent = subtitle.label || subtitle.language || `Subtitle ${index + 1}`;
    movieSubtitleLanguage.appendChild(option);
  });

  movieSubtitleLanguage.value = '';
  subtitlesEnabled = false;

  if (bundle?.subtitles?.length) {
    movieSubtitleLanguage.disabled = false;
    movieSubtitleToggle.disabled = false;
  } else {
    movieSubtitleLanguage.disabled = true;
    subtitlesEnabled = false;
    movieSubtitleToggle.disabled = true;
  }

  if (bundle?.qualities?.length) {
    movieQualitySelect.disabled = false;
    movieQualitySelect.value = bundle.qualities[0].url;
  } else {
    movieQualitySelect.disabled = true;
  }

  movieSettingsButton.disabled = false;
  applySubtitleSelection();
}

function renderEpisodeSelector(movie) {
  if (!episodePanel || !seasonSelect || !episodeList) return;

  if (movie.subjectType !== 2) {
    episodePanel.classList.add('hidden');
    return;
  }

  episodePanel.classList.remove('hidden');
  const seasonCount = getDefaultSeasonCount(movie);
  const episodeCount = getDefaultEpisodeCount(movie);

  seasonSelect.innerHTML = '';
  for (let season = 1; season <= seasonCount; season += 1) {
    const option = document.createElement('option');
    option.value = String(season);
    option.textContent = `Season ${season}`;
    seasonSelect.appendChild(option);
  }
  seasonSelect.value = String(selectedSeason);

  episodeList.innerHTML = '';
  for (let episode = 1; episode <= episodeCount; episode += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `episode-btn${episode === selectedEpisode ? ' active' : ''}`;
    button.dataset.episode = String(episode);
    button.innerHTML = `<strong>E${episode}</strong><span>${createEpisodeTitle(episode)}</span>`;
    button.addEventListener('click', async () => {
      selectedEpisode = episode;
      renderEpisodeSelector(movie);
      setMovieModalState(`Loading Season ${selectedSeason}, Episode ${selectedEpisode}...`);
      await loadSelectedPlayback(movie);
    });
    episodeList.appendChild(button);
  }
}

async function loadSelectedPlayback(movie, { autoplay = false } = {}) {
  const bundle = await fetchPlaybackBundle(movie, { season: selectedSeason, episode: selectedEpisode });
  if (!bundle?.url) {
    setMovieModalState(
      'This episode is not available right now. Try another episode or download instead.',
      'error'
    );
    return;
  }

  renderPlaybackSettings(bundle);
  await applyMovieSource(movie, bundle.url, { autoplay });
}

function renderGallery(items) {
  gallery.innerHTML = '';
  if (!items.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    const imageUrl = getImageUrl(item);

    card.innerHTML = `
      <img src="${imageUrl}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x900?text=Image+not+available';" />
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-tags">${item.tags}</p>
        <div class="card-actions">
          <button type="button">Preview</button>
          <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => openPreview(item));
    gallery.appendChild(card);
  });
}

function filterImages(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return images;
  return images.filter(item =>
    item.title.toLowerCase().includes(normalized) ||
    item.tags.toLowerCase().includes(normalized) ||
    item.query.toLowerCase().includes(normalized)
  );
}

function buildSearchGallery(query) {
  const normalized = query.trim();
  if (!normalized) return images;

  const titleBase = normalized
    .split(/\s+/)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');

  return Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    title: `${titleBase} ${index + 1}`,
    query: normalized,
    tags: `${normalized}, photo, search`,
    imageUrl: `https://loremflickr.com/600/900/${encodeURIComponent(normalized.replace(/\s+/g, ','))}?lock=${index + 1}`
  }));
}

async function fetchMovieData(query = 'popular') {
  const normalized = query.trim() || 'popular';
  const apiUrl = `${CINEVERSE_API_BASE}/search/${encodeURIComponent(normalized)}`;
  try {
    const res = await fetch(apiUrl, { headers: cineverseApiHeaders });
    if (!res.ok) throw new Error(`Cineverse API returned ${res.status}`);
    const data = await res.json();
    const items = data.data?.items || [];

    return items.map((item, index) => ({
      id: item.subjectId || `api-${index}`,
      title: item.title || 'Untitled',
      year: item.releaseDate ? item.releaseDate.split('-')[0] : 'Unknown',
      releaseDate: item.releaseDate || '',
      genre: item.genres?.join(', ') || 'Unknown',
      description: item.description || 'No description available.',
      poster: item.cover?.url || item.thumbnail || 'https://via.placeholder.com/320x480?text=No+Image',
      rating: item.rating || item.score || item.voteAverage || item.imdbRating || '',
      videoSrc: '',
      detailUrl: `https://cineverse.name.ng/${item.subjectType === 1 ? 'movie' : 'tv'}/${item.subjectId}`,
      category: item.subjectType === 2 ? 'Series' : 'Movie',
      hasResource: true,
      subjectId: item.subjectId,
      subjectType: item.subjectType,
      seasonCount: item.seasonCount || item.totalSeasons || item.seasons?.length || (item.subjectType === 2 ? 4 : 1),
      episodeCount: item.episodeCount || item.totalEpisodes || 12
    }));
  } catch (err) {
    console.warn('Cineverse API error', err);
    return [];
  }
}

async function fetchPlaybackBundle(movie, { season = 1, episode = 1 } = {}) {
  if (!movie || !movie.id) return null;

  const cacheKey = getSourceCacheKey(season, episode);
  movie.sourceCache = movie.sourceCache || {};
  if (movie.sourceCache[cacheKey]) {
    return movie.sourceCache[cacheKey];
  }

  try {
    const subjectId = movie.subjectId || movie.id;
    const isTv = movie.subjectType === 2;
    let sourceUrl = `${CINEVERSE_API_BASE}/sources/${subjectId}`;

    if (isTv) {
      sourceUrl += `?season=${encodeURIComponent(season)}&episode=${encodeURIComponent(episode)}`;
    }

    const res = await fetch(sourceUrl, { headers: cineverseApiHeaders });
    if (!res.ok) throw new Error(`Source API returned ${res.status}`);
    const data = await res.json();
    const srcData = data.data || data;
    const bundle = normalizeSourceBundle(srcData);

    if (bundle.url) {
      movie.sourceCache[cacheKey] = bundle;
      movie.hasResource = true;
      movie.videoSrc = bundle.url;
      if (bundle.subtitles[0]?.url) {
        movie.subtitleUrl = bundle.subtitles[0].url;
      }
      return bundle;
    }
  } catch (err) {
    console.warn('Cineverse source fetch error', err);
  }

  movie.sourceChecked = true;
  movie.hasResource = false;
  return null;
}

async function getMovieSource(movie, options = {}) {
  const bundle = await fetchPlaybackBundle(movie, options);
  return bundle?.url || null;
}

async function searchMovies(query) {
  const normalized = query.trim();
  if (!normalized) return movies;

  const apiResults = await fetchMovieData(normalized);
  if (apiResults.length) {
    // Merge API results with existing movies, avoiding duplicates
    const existingIds = new Set(movies.map(m => String(m.id)));
    const newMovies = apiResults.filter(m => !existingIds.has(String(m.id)));
    movies = [...movies, ...newMovies];
    return apiResults;
  }

  return movies.filter(movie =>
    movie.title.toLowerCase().includes(normalized.toLowerCase()) ||
    movie.genre.toLowerCase().includes(normalized.toLowerCase()) ||
    movie.description.toLowerCase().includes(normalized.toLowerCase()) ||
    movie.category.toLowerCase().includes(normalized.toLowerCase())
  );
}

function getFeaturedMovie(items = movies) {
  if (!items.length) return null;
  return items.find(movie => movie.category === 'Trending') || items[0];
}

function prefersMotion() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function renderFeaturedHero(movie) {
  featuredMovie = movie || getFeaturedMovie();
  if (!featuredHero || !featuredMovie) return;

  featuredHero.classList.remove('hero-switching');
  void featuredHero.offsetWidth;
  featuredHero.classList.add('hero-switching');

  featuredHeroTitle.textContent = featuredMovie.title;
  featuredHeroDescription.textContent = featuredMovie.description;
  featuredHeroPoster.src = featuredMovie.poster;
  featuredHeroPoster.alt = `${featuredMovie.title} poster`;
  featuredHeroBackdrop.style.backgroundImage = `linear-gradient(90deg, rgba(8, 7, 21, 0.92), rgba(8, 7, 21, 0.5)), url("${featuredMovie.poster}")`;

  const chips = [`<span class="genre-chip">${featuredMovie.year || 'Now Showing'}</span>`]
    .concat((featuredMovie.genre || '').split(',').map(item => item.trim()).filter(Boolean).map(item => `<span class="genre-chip">${item}</span>`));

  featuredHeroGenres.innerHTML = chips.join('');
}

function stopFeaturedSlideshow() {
  if (!featuredHeroTimer) return;
  clearInterval(featuredHeroTimer);
  featuredHeroTimer = null;
}

function startFeaturedSlideshow(items = movies) {
  stopFeaturedSlideshow();

  featuredHeroItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (featuredHeroItems.length <= 1) {
    featuredHeroIndex = 0;
    renderFeaturedHero(getFeaturedMovie(featuredHeroItems));
    return;
  }

  const initialMovie = getFeaturedMovie(featuredHeroItems);
  featuredHeroIndex = Math.max(0, featuredHeroItems.findIndex(movie => String(movie.id) === String(initialMovie?.id)));
  renderFeaturedHero(featuredHeroItems[featuredHeroIndex]);

  if (!prefersMotion()) return;

  featuredHeroTimer = setInterval(() => {
    featuredHeroIndex = (featuredHeroIndex + 1) % featuredHeroItems.length;
    renderFeaturedHero(featuredHeroItems[featuredHeroIndex]);
  }, 5000);
}

function stopRailAutoScroll(rail) {
  if (!rail?.dataset.timerId) return;
  clearInterval(Number(rail.dataset.timerId));
  delete rail.dataset.timerId;
}

function prefersRailAutoScroll() {
  return prefersMotion();
}

function startRailAutoScroll(rail) {
  if (!rail || rail.dataset.timerId || rail.dataset.paused === 'true') return;
  if (!prefersRailAutoScroll()) return;
  if (rail.scrollWidth - rail.clientWidth <= 24) return;

  const isMobileRail = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const step = isMobileRail ? 0.75 : 0.55;
  const delay = isMobileRail ? 16 : 20;
  rail.dataset.direction = rail.dataset.direction || '1';
  const timerId = setInterval(() => {
    if (rail.dataset.visible !== 'true' || rail.dataset.paused === 'true') return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    let direction = Number(rail.dataset.direction || '1');
    rail.scrollLeft += direction * step;

    if (rail.scrollLeft >= maxScroll - 4) direction = -1;
    if (rail.scrollLeft <= 4) direction = 1;

    rail.dataset.direction = String(direction);
  }, delay);

  rail.dataset.timerId = String(timerId);
}

function setupRailAutoScroll(rail) {
  if (!rail) return;

  if (!prefersRailAutoScroll()) {
    rail.dataset.paused = 'true';
    stopRailAutoScroll(rail);
    return;
  }

  const pause = () => {
    rail.dataset.paused = 'true';
    stopRailAutoScroll(rail);
  };
  const resume = () => {
    rail.dataset.paused = 'false';
    if (rail.dataset.visible === 'true') startRailAutoScroll(rail);
  };

  rail.addEventListener('mouseenter', pause);
  rail.addEventListener('mouseleave', resume);
  rail.addEventListener('touchstart', pause, { passive: true });
  rail.addEventListener('touchend', resume, { passive: true });

  if (!railObserver) {
    railObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.dataset.visible = entry.isIntersecting ? 'true' : 'false';
        if (entry.isIntersecting) startRailAutoScroll(entry.target);
        else stopRailAutoScroll(entry.target);
      });
    }, { threshold: 0.35 });
  }

  railObserver.observe(rail);
}

function buildMovieCard(movie, compact = false) {
  const progressMarkup = Number.isFinite(movie.progressPercent) && movie.progressPercent > 0
    ? `
        <div class="movie-card-progress">
          <span>${movie.continueLabel || `${movie.progressPercent}% watched`}</span>
          <div class="movie-card-progress-track">
            <div class="movie-card-progress-bar" style="width: ${Math.min(100, movie.progressPercent)}%"></div>
          </div>
        </div>
      `
    : '';

  return `
    <article class="movie-card${compact ? ' compact' : ''}" data-movie-id="${movie.id}">
      <div class="movie-card-poster">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
        <div class="movie-card-overlay">
          <span>Play</span>
        </div>
      </div>
      <div class="movie-card-info">
        <h4>${movie.title}</h4>
        <p>${movie.genre}</p>
        <small>${movie.year || 'Now Showing'}</small>
        ${progressMarkup}
      </div>
    </article>
  `;
}

function buildMovieRow(title, entries, description = 'Curated movies for your next watch.', bindClicks = true) {
  const row = document.createElement('section');
  row.className = 'movie-row boxed-row';
  row.innerHTML = `
    <div class="row-header">
      <div>
        <p class="row-kicker">Movie Section</p>
        <h3>${title}</h3>
        <p class="row-description">${description}</p>
      </div>
      <span class="row-count">${entries.length} titles</span>
    </div>
    <div class="rail-shell">
      <div class="row-list" tabindex="0" aria-label="${title}">
        ${entries.map(movie => buildMovieCard(movie)).join('')}
      </div>
    </div>
  `;

  if (bindClicks) {
    row.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', () => openMovieModal(card.dataset.movieId));
    });
  }

  setupRailAutoScroll(row.querySelector('.row-list'));
  return row;
}

function dedupeMovies(items) {
  const seenIds = new Set();
  return items.filter(movie => {
    const key = String(movie.id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
}

async function renderCinemaHome() {
  cinemaRows.innerHTML = '';
  movieResults.innerHTML = '';
  movieResults.classList.add('hidden');
  emptyCinemaState.classList.add('hidden');
  cinemaRows.classList.remove('hidden');

  const sections = [
    { title: 'Trending Now', query: 'trending', description: 'What viewers are watching right now.' },
    { title: 'Action Blast', query: 'action', description: 'Explosive missions and high-stakes momentum.' },
    { title: 'Horror Nights', query: 'horror', description: 'Dark suspense, fear, and midnight thrills.' },
    { title: 'Drama Stories', query: 'drama', description: 'Emotional stories with stronger character depth.' },
    { title: 'Comedy Room', query: 'comedy', description: 'Easy laughs and feel-good movie time.' },
    { title: 'Animation World', query: 'animation', description: 'Imaginative adventures for every mood.' },
    { title: 'Nollywood Picks', query: 'nollywood', description: 'Popular African titles in one clean row.' },
    { title: 'Bollywood Hits', query: 'bollywood', description: 'Stylish spectacle, music, and drama.' },
    { title: 'K-Drama Spotlight', query: 'kdrama', description: 'Compelling Korean stories and favorites.' },
    { title: 'Anime Favorites', query: 'anime', description: 'Action, fantasy, and fan-loved animation.' },
    { title: 'Romance Lounge', query: 'romance', description: 'Chemistry, longing, and heartfelt moments.' },
    { title: 'Adventure Run', query: 'adventure', description: 'Quest-driven titles built for binge sessions.' }
  ];

  const results = await Promise.all(
    sections.map(async section => ({
      ...section,
      items: await fetchMovieData(section.query)
    }))
  );

  const liveSections = results
    .map(section => ({
      ...section,
      items: dedupeMovies(section.items.filter(movie => movie.hasResource !== false)).slice(0, 14)
    }))
    .filter(section => section.items.length);

  if (!liveSections.length) {
    cinemaRows.innerHTML = '<p class="loading-text">Unable to load live movies. Showing offline selection.</p>';
    movieCategories.forEach(category => {
      const entries = movies.filter(category.filter);
      if (!entries.length) return;
      cinemaRows.appendChild(buildMovieRow(category.title, entries.slice(0, 12), 'Offline picks curated for this genre.'));
    });
    startFeaturedSlideshow(movies);
    renderPersonalizedRows(movies);
    return;
  }

  movies = dedupeMovies(liveSections.flatMap(section => section.items));
  startFeaturedSlideshow(movies);
  renderPersonalizedRows(movies);

  liveSections.forEach(section => {
    cinemaRows.appendChild(buildMovieRow(section.title, section.items, section.description));
  });
}

function renderMovieResults(items) {
  cinemaRows.classList.add('hidden');
  movieResults.innerHTML = '';
  movieResults.classList.remove('hidden');
  emptyCinemaState.classList.add('hidden');

  const playable = items.filter(movie => movie.hasResource !== false);
  if (!playable.length) {
    movieResults.classList.add('hidden');
    emptyCinemaState.classList.remove('hidden');
    return;
  }

  const section = buildMovieRow(`Found ${playable.length} movies`, playable, 'Search results displayed in a clean horizontal rail.');
  movieResults.appendChild(section);
  startFeaturedSlideshow(playable);
}



function closeMovieModal() {
  movieModalRequestId += 1;
  if (movieModal) {
    movieModal.classList.add('hidden');
    delete movieModal.dataset.state;
  }
  if (moviePlayer) {
    moviePlayer.pause();
    moviePlayer.currentTime = 0;
    moviePlayer.removeAttribute('src');
    moviePlayer.load();
  }
  activeMovie = null;
}

function playMovie() {
  if (moviePlayer && moviePlayer.src) {
    startMoviePlayback().then(played => {
      if (played) return;
      setMovieModalState(
        `${activeMovie?.description || 'Unable to start playback.'}\n\nThe video could not start in this player. Try downloading it instead.`,
        'error'
      );
    });
  }
}

async function downloadFromUrl(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    window.open(url, '_blank', 'noopener');
  }
}

async function downloadMovie(targetMovie = activeMovie) {
  if (!targetMovie) return;

  const source = targetMovie.videoSrc || await getMovieSource(targetMovie);
  if (!source) {
    window.open(targetMovie.detailUrl || buildTrailerUrl(targetMovie), '_blank', 'noopener');
    return;
  }

  const filename = `${targetMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`;
  await downloadFromUrl(source, filename);
}

function showSelection() {
  topbar?.classList.add('hidden');
  viewSelect.classList.remove('hidden');
  imageView.classList.add('hidden');
  cinemaView.classList.add('hidden');
  changeModeBtn.classList.add('hidden');
  homeCinemaSection?.classList.remove('hidden');
  document.title = 'ZYNTRIX - 2 in 1 Assistant';
  brandTitle.textContent = 'ZYNTRIX';
  brandSubtitle.textContent = 'The 2 in 1 cinematic + photo genic assistant.';
  searchLabel.textContent = 'Search after you choose a mode';
}

function enterMode(mode) {
  currentMode = mode;
  topbar?.classList.remove('hidden');
  viewSelect.classList.add('hidden');
  changeModeBtn.classList.remove('hidden');
  homeCinemaSection?.classList.add('hidden');
  searchInput.value = '';

  if (mode === 'cinema') {
    imageView.classList.add('hidden');
    cinemaView.classList.remove('hidden');
    document.title = 'ZYNTRIX - 2 in 1 Assistant';
    brandTitle.textContent = 'ZYNTRIX';
    brandSubtitle.textContent = 'The 2 in 1 cinematic + photo genic assistant.';
    searchLabel.textContent = 'Search movies';
    selectPictures.classList.remove('active');
    selectCinema.classList.add('active');
    renderCinemaHome();
  } else {
    cinemaView.classList.add('hidden');
    imageView.classList.remove('hidden');
    document.title = 'ZYNTRIX - 2 in 1 Assistant';
    brandTitle.textContent = 'ZYNTRIX';
    brandSubtitle.textContent = 'The 2 in 1 cinematic + photo genic assistant.';
    searchLabel.textContent = 'Search images';
    selectCinema.classList.remove('active');
    selectPictures.classList.add('active');
    renderGallery(images);
  }
}

async function handleSearch() {
  const query = searchInput.value;
  if (currentMode === 'cinema') {
    if (!query.trim()) {
      await renderCinemaHome();
      return;
    }
    const results = await searchMovies(query);
    renderMovieResults(results);
  } else {
    renderGallery(buildSearchGallery(query));
  }
}

function openPreview(item) {
  activeItem = item;
  const url = getImageUrl(item);
  previewImage.src = url;
  previewImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalTags.textContent = item.tags;
  openButton.href = url;
  previewModal.classList.remove('hidden');
}

async function downloadImage() {
  if (!activeItem) return;
  const url = getImageUrl(activeItem);
  const filename = `${activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
  await downloadFromUrl(url, filename);
}

function closePreview() {
  previewModal.classList.add('hidden');
  activeItem = null;
}

function playFeaturedMovie() {
  if (!featuredMovie) return;
  openMovieModal(featuredMovie.id);
}

function openFeaturedTrailer() {
  if (!featuredMovie) return;
  window.open(buildTrailerUrl(featuredMovie), '_blank', 'noopener');
}

async function downloadFeaturedMovie() {
  if (!featuredMovie) return;
  await downloadMovie(featuredMovie);
}

async function openMovieModal(movieId) {
  const movie = movies.find(item => String(item.id) === String(movieId));
  if (!movie) return;

  const requestId = ++movieModalRequestId;
  const savedState = getStoredPlaybackState(movie);
  lastSavedPlaybackMark = '';
  activeMovie = movie;
  selectedSeason = savedState?.season || 1;
  selectedEpisode = savedState?.episode || 1;
  subtitlesEnabled = false;
  resetPlayerSurface();
  moviePlayer.poster = movie.poster;

  if (movieDetailPoster) {
    movieDetailPoster.src = movie.poster;
    movieDetailPoster.alt = `${movie.title} poster`;
  }

  if (movieDetailBackdrop) {
    movieDetailBackdrop.style.backgroundImage = `url("${movie.poster}")`;
  }

  if (movieModalType) {
    movieModalType.textContent = movie.subjectType === 2 ? 'Series Details' : 'Movie Details';
  }
  movieModalTitle.textContent = movie.title;
  if (movieModalRating) {
    movieModalRating.textContent = formatMovieRating(movie);
  }
  if (movieModalDate) {
    movieModalDate.textContent = formatMovieDate(movie);
  }
  movieModalGenre.textContent = movie.genre;
  movieModalDesc.textContent = movie.description;
  if (moviePlaybackNote) {
    moviePlaybackNote.textContent = '';
  }
  renderEpisodeSelector(movie);
  movieModal.classList.remove('hidden');
  setMovieModalState('Preparing the player...');

  const bundle = await fetchPlaybackBundle(movie, {
    season: selectedSeason,
    episode: selectedEpisode
  });

  if (requestId !== movieModalRequestId || activeMovie?.id !== movie.id) return;

  if (!bundle?.url) {
    setMovieModalState(
      'This title is not ready for direct playback right now. Try downloading it instead.',
      'error'
    );
    return;
  }

  renderPlaybackSettings(bundle);
  await applyMovieSource(movie, bundle.url, {
    autoplay: false,
    resumeAt: savedState?.completed ? 0 : (savedState?.progress || 0)
  });
}

function closeMovieModal() {
  syncActiveWatchState({ force: true });
  movieModalRequestId += 1;
  movieModal.classList.add('hidden');
  resetPlayerSurface();
  moviePlayer.currentTime = 0;
  lastSavedPlaybackMark = '';
  activeMovie = null;
}

async function requestMovieFullscreen() {
  if (!moviePlayer) return;

  try {
    if (moviePlayer.requestFullscreen) {
      await moviePlayer.requestFullscreen();
      return;
    }
  } catch (error) {
    console.warn('Standard fullscreen failed', error);
  }

  try {
    if (typeof moviePlayer.webkitEnterFullscreen === 'function') {
      moviePlayer.webkitEnterFullscreen();
    }
  } catch (error) {
    console.warn('WebKit fullscreen failed', error);
  }
}

function playMovie() {
  if (!activeMovie) return;

  const start = async () => {
    if (!moviePlayer.src) {
      setMovieModalState('Preparing the player...');
      await loadSelectedPlayback(activeMovie);
      if (!moviePlayer.src) return;
    }

    revealPlayerSurface();
    const played = await startMoviePlayback();
    if (played) {
      await requestMovieFullscreen();
      return;
    }
    setMovieModalState(
      'The video could not start in this player. Try downloading it instead.',
      'error'
    );
  };

  start();
}

async function downloadMovie(targetMovie = activeMovie) {
  if (!targetMovie) return;

  const source = targetMovie.videoSrc || await getMovieSource(targetMovie, {
    season: selectedSeason,
    episode: selectedEpisode
  });

  if (!source) {
    window.open(targetMovie.detailUrl || buildTrailerUrl(targetMovie), '_blank', 'noopener');
    return;
  }

  const filenameBase = targetMovie.subjectType === 2
    ? `${targetMovie.title}-season-${selectedSeason}-episode-${selectedEpisode}`
    : targetMovie.title;
  const filename = `${filenameBase.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`;
  await downloadFromUrl(source, filename);
}

modalClose.addEventListener('click', closePreview);
closeModal.addEventListener('click', closePreview);
downloadButton.addEventListener('click', downloadImage);

movieModalClose?.addEventListener('click', closeMovieModal);
movieModalCloseBtn?.addEventListener('click', closeMovieModal);
moviePlayButton?.addEventListener('click', playMovie);
movieDownloadButton?.addEventListener('click', () => downloadMovie());
moviePlayer?.addEventListener('click', playMovie);
moviePlayer?.addEventListener('timeupdate', () => syncActiveWatchState());
moviePlayer?.addEventListener('pause', () => syncActiveWatchState({ force: true }));
moviePlayer?.addEventListener('ended', () => syncActiveWatchState({ completed: true, force: true }));
featuredPlayButton?.addEventListener('click', playFeaturedMovie);
featuredTrailerButton?.addEventListener('click', openFeaturedTrailer);
featuredDownloadButton?.addEventListener('click', downloadFeaturedMovie);
movieSettingsButton?.addEventListener('click', () => {
  if (movieSettingsButton.disabled) return;
  movieSettingsPanel.classList.toggle('hidden');
});
movieSubtitleToggle?.addEventListener('click', () => {
  if (movieSubtitleLanguage.disabled) return;
  subtitlesEnabled = !subtitlesEnabled;
  if (subtitlesEnabled && !movieSubtitleLanguage.value) {
    const firstSubtitle = currentPlaybackBundle?.subtitles?.[0];
    movieSubtitleLanguage.value = firstSubtitle?.language || '';
  }
  applySubtitleSelection();
});
movieSubtitleLanguage?.addEventListener('change', () => {
  subtitlesEnabled = movieSubtitleLanguage.value !== '';
  applySubtitleSelection();
});
movieQualitySelect?.addEventListener('change', async () => {
  const source = movieQualitySelect.value;
  if (!activeMovie || !source) return;

  const resumeAt = Number.isFinite(moviePlayer.currentTime) ? moviePlayer.currentTime : 0;
  const shouldContinuePlaying = !!moviePlayer.src && !moviePlayer.paused && !moviePlayer.ended;
  const wasPreviewVisible = !movieDetailPreview?.classList.contains('hidden');
  if (wasPreviewVisible || shouldContinuePlaying) {
    revealPlayerSurface();
  }

  await applyMovieSource(activeMovie, source, {
    autoplay: shouldContinuePlaying,
    resumeAt
  });

  applySubtitleSelection();
});
seasonSelect?.addEventListener('change', async () => {
  if (!activeMovie) return;
  selectedSeason = Number(seasonSelect.value || 1);
  selectedEpisode = 1;
  renderEpisodeSelector(activeMovie);
  setMovieModalState(`Loading Season ${selectedSeason}, Episode ${selectedEpisode}...`);
  await loadSelectedPlayback(activeMovie);
});

selectPictures.addEventListener('click', () => enterMode('images'));
selectCinema.addEventListener('click', () => enterMode('cinema'));
changeModeBtn.addEventListener('click', showSelection);

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleSearch();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !previewModal.classList.contains('hidden')) closePreview();
  if (event.key === 'Escape' && !movieModal.classList.contains('hidden')) closeMovieModal();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('service-worker.js');
    } catch (err) {
      console.warn('Service worker registration failed', err);
    }
  });
}

showIntro();
showSelection();

// Load trending movies on home page
async function loadHomeCinema() {
  const homeCinemaRows = document.getElementById('homeCinemaRows');
  if (!homeCinemaRows) return;
  
  homeCinemaRows.innerHTML = '<p class="loading-text">Loading trending movies...</p>';
  
  try {
    const trendingMovies = await fetchMovieData('trending');
    
    if (trendingMovies.length === 0) {
      homeCinemaRows.innerHTML = '<p class="loading-text">No movies available at the moment.</p>';
      return;
    }
    
    // Create a horizontal scrollable row of movies
    const row = document.createElement('div');
    row.className = 'home-cinema-row';
    
    trendingMovies.slice(0, 10).forEach(movie => {
      const card = document.createElement('article');
      card.className = 'home-movie-card';
      card.dataset.movieId = movie.id;
      card.innerHTML = `
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
        <div class="home-movie-overlay">
          <span>▶ Play</span>
        </div>
        <div class="home-movie-info">
          <h4>${movie.title}</h4>
          <p>${movie.year}</p>
        </div>
      `;
      
      card.addEventListener('click', () => {
        enterMode('cinema');
        setTimeout(() => openMovieModal(movie.id), 300);
      });
      
      row.appendChild(card);
    });
    
    homeCinemaRows.innerHTML = '';
    homeCinemaRows.appendChild(row);
    
  } catch (err) {
    console.error('Home cinema error:', err);
    homeCinemaRows.innerHTML = '<p class="loading-text">Unable to load movies. Please try again later.</p>';
  }
}

// Load home cinema when page loads
loadHomeCinema();

async function enhanceHomeCinema() {
  const homeCinemaRows = document.getElementById('homeCinemaRows');
  if (!homeCinemaRows) return;

  try {
    const trendingMovies = await fetchMovieData('trending');
    const displayMovies = trendingMovies.length ? trendingMovies.slice(0, 12) : movies.slice(0, 12);
    if (!displayMovies.length) return;

    const row = buildMovieRow('Fresh releases in motion', displayMovies, 'Horizontal cards with a cleaner, more professional layout.', false);
    row.classList.add('home-showcase');

    row.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', () => {
        const movieId = card.dataset.movieId;
        const selected = displayMovies.find(movie => String(movie.id) === String(movieId));
        if (!selected) return;

        if (!movies.some(movie => String(movie.id) === String(selected.id))) {
          movies = dedupeMovies([selected, ...movies]);
        }

        enterMode('cinema');
        setTimeout(() => openMovieModal(selected.id), 220);
      });
    });

    homeCinemaRows.innerHTML = '';
    homeCinemaRows.appendChild(row);
  } catch (err) {
    console.error('Enhanced home cinema error:', err);
  }
}

enhanceHomeCinema();
