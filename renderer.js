// Inserisci qui l'URL DIRETTO dello stream audio (non l'indirizzo della pagina web).
// Esempio: const RADIO_STREAM_URL = "https://server.example/radio.mp3";
const RADIO_STREAM_URL = "http://stream.zeno.fm/y3y51xu8khruv";

const audio = document.getElementById('radioAudio');
const playBtn = document.getElementById('playBtn');
const radioMessage = document.getElementById('radioMessage');
const volume = document.getElementById('volume');
let playing = false;

function setPlayState(isPlaying) {
  playing = isPlaying;
  playBtn.textContent = isPlaying ? 'Ⅱ' : '▶';
}
async function toggleRadio() {
  if (!RADIO_STREAM_URL.trim()) {
    radioMessage.innerHTML = 'Il design è pronto. Per attivare Play, inserisci l’URL diretto dello stream in <code>renderer.js</code>. Il link del sito radio da solo potrebbe non essere un link audio.';
    return;
  }
  if (playing) {
    audio.pause();
    setPlayState(false);
  } else {
    try {
      if (!audio.src) audio.src = RADIO_STREAM_URL.trim();
      audio.volume = Number(volume.value);
      await audio.play();
      setPlayState(true);
      radioMessage.textContent = 'DJ GOKU 24 Radio è in riproduzione.';
    } catch (err) {
      radioMessage.textContent = 'Non riesco ad avviare lo stream. Verifica l’URL audio e la connessione.';
      setPlayState(false);
    }
  }
}
playBtn.addEventListener('click', toggleRadio);
document.getElementById('rightPlay').addEventListener('click', toggleRadio);
volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
document.getElementById('rightVolume').addEventListener('click', () => {
  volume.focus();
  volume.scrollIntoView({behavior:'smooth', block:'center'});
});
function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}
document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
document.getElementById('rightFullscreen').addEventListener('click', toggleFullscreen);
document.getElementById('refreshBtn').addEventListener('click', () => {
  if (playing) { audio.pause(); setPlayState(false); }
  if (RADIO_STREAM_URL.trim()) { audio.src = RADIO_STREAM_URL.trim(); toggleRadio(); }
  const frame = document.getElementById('twitchPlayer');
  frame.src = frame.src;
});
document.getElementById('openTwitch').addEventListener('click', () => showPage('twitch'));
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(name + 'Page') || document.getElementById('radioPage');
  page.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === name));
}
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
  document.getElementById('clock').textContent = time;
  document.getElementById('bigClock').textContent = time;
  document.getElementById('dateText').textContent = now.toLocaleDateString('it-IT', {day:'2-digit', month:'long', year:'numeric'});
}
updateClock();
setInterval(updateClock, 1000);
const bars = document.getElementById('bars');
for (let i=0; i<48; i++) {
  const bar = document.createElement('span');
  bar.className = 'bar';
  bar.style.setProperty('--h', `${18 + Math.random()*78}%`);
  bar.style.setProperty('--dur', `${.35 + Math.random()*.8}s`);
  bar.style.setProperty('--delay', `${Math.random()*.7}s`);
  bars.appendChild(bar);
}
if (RADIO_STREAM_URL.trim()) radioMessage.textContent = 'Premi Play per ascoltare la radio.';

// ===== TITOLO DEL BRANO IN ONDA SU ZENO =====
(() => {
  const metadataUrl =
    "https://api.zeno.fm/mounts/metadata/subscribe/y3y51xu8khruv";

  const mainTitle = document.getElementById("currentTrack");
  const sideTitle = document.getElementById("rightCurrentTrack");

  if (!mainTitle && !sideTitle) return;

  function showTrack(text) {
    if (mainTitle) mainTitle.textContent = text;
    if (sideTitle) sideTitle.textContent = text;
  }

  let receivedTitle = false;
  let connection;

  try {
    connection = new EventSource(metadataUrl);
  } catch (error) {
    showTrack("Titolo del brano non disponibile");
    console.error("Impossibile avviare i metadati Zeno:", error);
    return;
  }

  connection.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      const title =
        typeof data.streamTitle === "string"
          ? data.streamTitle.trim()
          : "";

      if (!title) return;

      receivedTitle = true;
showTrack(title);
radioTrackHistory.add(title);
    } catch (error) {
      console.warn("Messaggio metadati Zeno non riconosciuto:", error);
    }
  };

  connection.onerror = () => {
    if (!receivedTitle) {
      showTrack("In attesa del titolo del brano…");
    }

    // EventSource tenta automaticamente la riconnessione.
    // Non creiamo nuove connessioni qui.
  };

  const waitingTimer = window.setTimeout(() => {
    if (!receivedTitle) {
      showTrack("Titolo del brano non disponibile");
    }
  }, 15000);

  window.addEventListener(
    "beforeunload",
    () => {
      window.clearTimeout(waitingTimer);
      connection.close();
    },
    { once: true }
  );
})();

// ===== ELENCO DEGLI ULTIMI BRANI RILEVATI =====
// ===== CRONOLOGIA ZENO: ULTIMI BRANI + PLAYLIST =====
const radioTrackHistory = (() => {
  // Mantiene la chiave precedente per recuperare i brani già salvati.
  const STORAGE_KEY = "djgoku24.trackHistory.v1";

  const MAX_TRACKS = 50;
  const RECENT_TRACKS = 8;

  let tracks = [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (Array.isArray(saved)) {
      tracks = saved
        .filter((item) => {
          return (
            item &&
            typeof item.title === "string" &&
            item.title.trim() &&
            Number.isFinite(item.timestamp) &&
            !Number.isNaN(new Date(item.timestamp).getTime())
          );
        })
        .map((item) => ({
          title: item.title.trim(),
          timestamp: item.timestamp
        }))
        .slice(0, MAX_TRACKS);
    }
  } catch (error) {
    console.warn("Lettura cronologia Zeno non riuscita:", error);
  }

  function createEmptyMessage() {
    const empty = document.createElement("div");
    empty.className = "recent-empty";

    const icon = document.createElement("span");
    icon.textContent = "♫";
    icon.setAttribute("aria-hidden", "true");

    const message = document.createElement("div");
    message.textContent =
      "In attesa del primo titolo dalla radio…";

    empty.append(icon, message);

    return empty;
  }

  function createTrackRow(track, playlistMode) {
    const date = new Date(track.timestamp);

    const row = document.createElement("div");
    row.className = playlistMode
      ? "playlist-track-row"
      : "recent-track-row";

    const icon = document.createElement("span");
    icon.className = "recent-track-icon";
    icon.textContent = "♫";
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement("span");
    title.className = playlistMode
      ? "playlist-track-title"
      : "recent-track-title";

    title.textContent = track.title;
    title.title = track.title;

    const time = document.createElement("time");
    time.className = playlistMode
      ? "playlist-track-time"
      : "recent-track-time";

    time.dateTime = date.toISOString();

    time.textContent = playlistMode
      ? date.toLocaleString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      : date.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit"
        });

    time.title =
      "Titolo rilevato il " + date.toLocaleString("it-IT");

    row.append(icon, title, time);

    return row;
  }

  function renderList(containerId, limit, playlistMode) {
    const container = document.getElementById(containerId);

    if (!container) return;

    // Conserva la posizione se l'utente sta leggendo la lista.
    const oldScrollTop = container.scrollTop;

    const fragment = document.createDocumentFragment();
    const visibleTracks = tracks.slice(0, limit);

    if (visibleTracks.length === 0) {
      fragment.append(createEmptyMessage());
    } else {
      visibleTracks.forEach((track) => {
        fragment.append(createTrackRow(track, playlistMode));
      });
    }

    container.replaceChildren(fragment);
    container.scrollTop = oldScrollTop;
  }

  function render() {
    renderList("recentTracks", RECENT_TRACKS, false);
    renderList("playlistTracks", MAX_TRACKS, true);
  }

  function add(rawTitle) {
    if (typeof rawTitle !== "string") return;

    const title = rawTitle.replace(/\s+/g, " ").trim();

    if (!title) return;

    // Non duplica lo stesso titolo a ogni aggiornamento.
    if (tracks[0]?.title === title) return;

    tracks.unshift({
      title,
      timestamp: Date.now()
    });

    tracks = tracks.slice(0, MAX_TRACKS);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tracks)
      );
    } catch (error) {
      console.warn(
        "Salvataggio cronologia Zeno non riuscito:",
        error
      );
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, {
      once: true
    });
  } else {
    render();
  }

  return { add };
})();

// ===== PROSSIMI ARTISTI DA LAUT.FM =====
(() => {
  const API_URL =
    "https://api.laut.fm/station/djgoku24/next_artists";

  const REFRESH_MS = 60000;

  let timer = null;
  let controller = null;
  let stopped = false;

  function getArtistName(item) {
    if (typeof item === "string") {
      return item.trim();
    }

    if (!item || typeof item !== "object") {
      return "";
    }

    if (typeof item.name === "string") {
      return item.name.trim();
    }

    if (typeof item.artist === "string") {
      return item.artist.trim();
    }

    if (typeof item.artist?.name === "string") {
      return item.artist.name.trim();
    }

    return "";
  }

  async function updateNextArtists() {
    const target = document.getElementById("nextArtists");

    if (!target || stopped) return;

    controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller?.abort();
    }, 10000);

    try {
      const response = await fetch(API_URL, {
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          `API laut.fm: HTTP ${response.status}`
        );
      }

      const data = await response.json();

      // Accetta un elenco diretto o un elenco in next_artists.
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.next_artists)
          ? data.next_artists
          : null;

      if (!items) {
        throw new Error("Formato dei dati laut.fm non riconosciuto");
      }

      const artists = [
        ...new Set(
          items
            .map(getArtistName)
            .filter(Boolean)
        )
      ].slice(0, 3);

      if (items.length > 0 && artists.length === 0) {
        throw new Error("Nomi degli artisti non riconosciuti");
      }

      if (stopped) return;

      target.textContent = artists.length
        ? artists.join(" • ")
        : "Nessuna anticipazione disponibile";

      target.title = target.textContent;
    } catch (error) {
      if (stopped) return;

      target.textContent = "Artisti al momento non disponibili";
      target.removeAttribute("title");

      console.warn(
        "Aggiornamento prossimi artisti laut.fm:",
        error
      );
    } finally {
      window.clearTimeout(timeout);
      controller = null;

      if (!stopped) {
        timer = window.setTimeout(
          updateNextArtists,
          REFRESH_MS
        );
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      updateNextArtists,
      { once: true }
    );
  } else {
    updateNextArtists();
  }

  window.addEventListener(
    "beforeunload",
    () => {
      stopped = true;
      window.clearTimeout(timer);
      controller?.abort();
    },
    { once: true }
  );
})();
