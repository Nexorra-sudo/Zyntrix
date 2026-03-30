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
  { title: 'Drama Picks', filter: movie => movie.genre.toLowerCase().includes('drama') },
  { title: 'Horror Hits', filter: movie => movie.genre.toLowerCase().includes('horror') },
  { title: 'Animated Adventures', filter: movie => movie.genre.toLowerCase().includes('animation') }
];

let deferredPrompt = null;

function getImageUrl(item) {
  const query = (item.query || item.title || 'photo').trim().replace(/\s+/g, ',');
  return item.imageUrl || `https://loremflickr.com/600/900/${encodeURIComponent(query)}?lock=${item.id}`;
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
const brandTitle = document.querySelector('.brand h1');
const brandSubtitle = document.querySelector('.brand p');
const searchLabel = document.querySelector('.search-label');
const movieModal = document.getElementById('movieModal');
const moviePlayer = document.getElementById('moviePlayer');
const movieModalTitle = document.getElementById('movieModalTitle');
const movieModalGenre = document.getElementById('movieModalGenre');
const movieModalDesc = document.getElementById('movieModalDesc');
const movieDownloadButton = document.getElementById('movieDownloadButton');
const movieOpenButton = document.getElementById('movieOpenButton');
const movieModalClose = document.getElementById('movieModalClose');
const movieModalCloseBtn = document.getElementById('movieModalCloseBtn');
const moviePlayButton = document.getElementById('moviePlayButton');

let activeItem = null;
let activeMovie = null;
let currentMode = 'images';
let movieModalRequestId = 0;

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

function setMovieModalState(message, state = 'loading') {
  movieModalDesc.textContent = message;
  moviePlayButton.disabled = true;
  movieDownloadButton.disabled = true;
  movieModal.dataset.state = state;
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

async function applyMovieSource(movie, source, { autoplay = false } = {}) {
  if (!movie || !source) return;

  movie.videoSrc = source;
  moviePlayer.src = source;
  moviePlayer.load();
  moviePlayButton.disabled = false;
  movieDownloadButton.disabled = false;
  movieModal.dataset.state = 'ready';

  if (autoplay) {
    const played = await startMoviePlayback();
    if (!played) {
      movieModalDesc.textContent = `${movie.description}\n\nTap Play or tap the video area to start the movie.`;
    }
  }
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
  const apiUrl = `https://darkvibe314-silent-movies-api.hf.space/api/search?query=${encodeURIComponent(normalized)}`;
  try {
    const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Movie API returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.results)) return [];

    return data.results
      .filter(item => item.hasResource === true)
      .map((item, index) => ({
        id: item.subjectId || `api-${index}`,
        title: item.title || 'Untitled',
        year: item.releaseDate ? item.releaseDate.split('-')[0] : 'Unknown',
        genre: item.genre || 'Unknown',
        description: item.description || item.postTitle || 'No description available.',
        poster: item.cover?.url || item.thumbnail || 'https://via.placeholder.com/320x480?text=No+Image',
        videoSrc: '',
        detailUrl: item.detailPath ? `https://moviebox.ph/detail/${item.detailPath}` : 'https://moviebox.ph',
        category: item.subjectType === 2 ? 'Series' : 'Movie',
        hasResource: true
      }));
  } catch (err) {
    console.warn('Movie API error', err);
    return [];
  }
}

async function getMovieSource(movie) {
  if (!movie || !movie.id) return null;
  if (movie.videoSrc && !movie.videoSrc.includes('loremflickr.com')) return movie.videoSrc;
  if (movie.sourceChecked && !movie.videoSrc) return null;

  try {
    const downloadUrl = `https://darkvibe314-silent-movies-api.hf.space/api/download?movie_id=${encodeURIComponent(movie.id)}`;
    const res = await fetch(downloadUrl, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Source API returned ${res.status}`);
    const data = await res.json();
    const source = extractMovieSource(data);
    if (source) {
      movie.videoSrc = source;
      movie.subtitleUrl = data.subtitle_url || '';
      movie.hasResource = true;
      return movie.videoSrc;
    }
  } catch (err) {
    console.warn('Source fetch error', err);
  }
  movie.sourceChecked = true;
  movie.hasResource = false;
  return movie.videoSrc || null;
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

function buildMovieRow(title, entries) {
  const row = document.createElement('section');
  row.className = 'movie-row';
  row.innerHTML = `
    <div class="row-header">
      <h3>${title}</h3>
    </div>
    <div class="row-list">
      ${entries.map(movie => `
        <article class="movie-card" data-movie-id="${movie.id}">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
          <div class="movie-card-overlay">
            <span>Play</span>
          </div>
          <div class="movie-card-info">
            <h4>${movie.title}</h4>
            <p>${movie.genre}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;

  row.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => openMovieModal(card.dataset.movieId));
  });

  return row;
}

async function renderCinemaHome() {
  cinemaRows.innerHTML = '';
  movieResults.innerHTML = '';
  movieResults.classList.add('hidden');
  emptyCinemaState.classList.add('hidden');
  cinemaRows.classList.remove('hidden');

  const sections = [
    { title: 'Trending', query: 'trending' },
    { title: 'For You', query: 'popular' },
    { title: 'Top 10', query: 'top 10' },
    { title: 'Action', query: 'action' },
    { title: 'Drama', query: 'drama' },
    { title: 'Nollywood', query: 'nollywood' },
    { title: 'Bollywood', query: 'bollywood' },
    { title: 'K-Drama', query: 'kdrama' },
    { title: 'Anime', query: 'anime' },
    { title: 'Comedy', query: 'comedy' },
    { title: 'Hollywood', query: 'hollywood' }
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
      items: section.items.filter(movie => movie.hasResource !== false)
    }))
    .filter(section => section.items.length);

  if (!liveSections.length) {
    cinemaRows.innerHTML = '<p class="loading-text">Unable to load live movies. Showing offline selection.</p>';
    movieCategories.forEach(category => {
      const entries = movies.filter(category.filter);
      if (!entries.length) return;
      cinemaRows.appendChild(buildMovieRow(category.title, entries));
    });
    return;
  }

  const seenIds = new Set();
  movies = liveSections.flatMap(section =>
    section.items.filter(movie => {
      const key = String(movie.id);
      if (seenIds.has(key)) return false;
      seenIds.add(key);
      return true;
    })
  );

  liveSections.forEach(section => {
    cinemaRows.appendChild(buildMovieRow(section.title, section.items.slice(0, 12)));
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

  playable.forEach(movie => {
    const card = document.createElement('article');
    card.className = 'movie-card search-result';
    card.dataset.movieId = movie.id;
    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}" loading="lazy" />
      <div class="movie-card-overlay">
        <span>Play</span>
      </div>
      <div class="movie-card-info">
        <h4>${movie.title}</h4>
        <p>${movie.genre}</p>
      </div>
    `;

    card.addEventListener('click', () => openMovieModal(movie.id));
    movieResults.appendChild(card);
  });
}

async function openMovieModal(movieId) {
  const movie = movies.find(item => String(item.id) === String(movieId));
  if (!movie) return;

  const requestId = ++movieModalRequestId;
  activeMovie = movie;
  moviePlayer.pause();
  moviePlayer.removeAttribute('src');
  moviePlayer.load();
  moviePlayer.poster = movie.poster;
  movieModalTitle.textContent = movie.title;
  movieModalGenre.textContent = `${movie.genre} • ${movie.year}`;
  movieModalDesc.textContent = movie.description;
  movieOpenButton.href = movie.detailUrl;
  movieModal.classList.remove('hidden');
  moviePlayButton.disabled = true;
  movieDownloadButton.disabled = true;

  if (movie.videoSrc) {
    await applyMovieSource(movie, movie.videoSrc, { autoplay: true });
    return;
  }

  setMovieModalState(`${movie.description}\n\nPreparing the player...`);

  const source = await getMovieSource(movie);
  if (requestId !== movieModalRequestId || activeMovie?.id !== movie.id) return;

  if (source) {
    await applyMovieSource(movie, source, { autoplay: true });
  } else {
    setMovieModalState(
      `${movie.description}\n\nThis title is not ready for direct playback right now. Use the detail link to continue.`,
      'error'
    );
  }
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
        `${activeMovie?.description || 'Unable to start playback.'}\n\nThe video could not start in this player. Use the detail link to keep watching.`,
        'error'
      );
    });
  }
}

async function downloadMovie() {
  if (!activeMovie || !activeMovie.videoSrc) return;
  const url = activeMovie.videoSrc;
  const filename = `${activeMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`;

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
    window.open(url, '_blank');
  }
}

function showSelection() {
  topbar?.classList.add('hidden');
  viewSelect.classList.remove('hidden');
  imageView.classList.add('hidden');
  cinemaView.classList.add('hidden');
  changeModeBtn.classList.add('hidden');
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

  try {
    const res = await fetch(url, { mode: 'cors' });
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
    window.open(url, '_blank');
  }
}

function closePreview() {
  previewModal.classList.add('hidden');
  activeItem = null;
}

modalClose.addEventListener('click', closePreview);
closeModal.addEventListener('click', closePreview);
downloadButton.addEventListener('click', downloadImage);

movieModalClose?.addEventListener('click', closeMovieModal);
movieModalCloseBtn?.addEventListener('click', closeMovieModal);
moviePlayButton?.addEventListener('click', playMovie);
movieDownloadButton?.addEventListener('click', downloadMovie);
moviePlayer?.addEventListener('click', playMovie);

selectPictures.addEventListener('click', () => enterMode('images'));
selectCinema.addEventListener('click', () => enterMode('cinema'));
changeModeBtn.addEventListener('click', showSelection);

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') handleSearch();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !previewModal.classList.contains('hidden')) closePreview();
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
