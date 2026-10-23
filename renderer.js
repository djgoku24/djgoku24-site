// ===== CONFIGURAZIONE RADIO =====
const RADIO_STREAM_URL = "http://stream.zeno.fm/y3y51xu8khruv";

const audio = document.getElementById("radioAudio");
const playBtn = document.getElementById("playBtn");
const radioMessage = document.getElementById("radioMessage");
const volume = document.getElementById("volume");

let playing = false;
let starting = false;

function setRadioMessage(text) {
  if (radioMessage) {
    radioMessage.textContent = text;
  }
}

function setPlayState(isPlaying) {
  playing = isPlaying;

  if (playBtn) {
    playBtn.textContent = isPlaying ? "Ⅱ" : "▶";

    playBtn.setAttribute(
      "aria-label",
      isPlaying ? "Pausa radio" : "Riproduci radio"
    );
  }

  // Aggiorna soltanto l'icona, mantenendo il testo del pulsante.
  const rightPlayIcon = document.querySelector("#rightPlay > span");

  if (rightPlayIcon) {
    rightPlayIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  }
}

// ===== PLAY / PAUSA =====
async function toggleRadio() {
  if (!audio || starting) return;

  if (!RADIO_STREAM_URL.trim()) {
    setRadioMessage(
      "Inserisci l'indirizzo diretto dello stream in renderer.js."
    );
    return;
  }

  if (!audio.paused) {
    audio.pause();
    setPlayState(false);
    setRadioMessage("Radio in pausa.");
    return;
  }

  starting = true;

  try {
    if (!audio.getAttribute("src")) {
      audio.src = RADIO_STREAM_URL.trim();
    }

    if (volume) {
      audio.volume = Number(volume.value);
    }

    setRadioMessage("Connessione alla radio…");

    await audio.play();

    setPlayState(!audio.paused);

    if (!audio.paused) {
      setRadioMessage("DJ GOKU 24 Radio è in riproduzione.");
    }
  } catch (error) {
    console.error("Avvio radio non riuscito:", error);

    setPlayState(false);

    setRadioMessage(
      "Non riesco ad avviare lo stream. Verifica la connessione e l'indirizzo audio."
    );
  } finally {
    starting = false;
  }
}

playBtn?.addEventListener("click", toggleRadio);

document.getElementById("rightPlay")?.addEventListener(
  "click",
  toggleRadio
);

audio?.addEventListener("play", () => {
  setPlayState(true);
});

audio?.addEventListener("pause", () => {
  setPlayState(false);
});

audio?.addEventListener("ended", () => {
  setPlayState(false);
});

audio?.addEventListener("error", () => {
  setPlayState(false);
  setRadioMessage("Errore durante il caricamento dello stream.");
});

// ===== VOLUME DEL PLAYER CENTRALE =====
volume?.addEventListener("input", () => {
  if (audio) {
    audio.volume = Number(volume.value);
  }
});

// Il pulsante destro non è più presente.
// Il collegamento resta facoltativo.
document.getElementById("rightVolume")?.addEventListener(
  "click",
  () => {
    volume?.focus();
  }
);

// ===== SCHERMO INTERO =====
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch (error) {
    console.warn("Schermo intero non disponibile:", error);
  }
}

document.getElementById("fullscreenBtn")?.addEventListener(
  "click",
  toggleFullscreen
);

document.getElementById("rightFullscreen")?.addEventListener(
  "click",
  toggleFullscreen
);

// ===== AGGIORNA PLAYER =====
document.getElementById("refreshBtn")?.addEventListener(
  "click",
  async () => {
    if (audio && !starting && RADIO_STREAM_URL.trim()) {
      audio.pause();
      setPlayState(false);

      audio.src = RADIO_STREAM_URL.trim();
      audio.load();

      await toggleRadio();
    }

    const frame = document.getElementById("twitchPlayer");
    const frameSrc = frame?.getAttribute("src");

    if (frame && frameSrc) {
      frame.src = frameSrc;
    }
  }
);

// ===== NAVIGAZIONE PAGINE =====
function showPage(name) {
  const requestedPage = document.getElementById(name + "Page");

  const page =
    requestedPage || document.getElementById("radioPage");

  if (!page) return;

  const activeName = requestedPage ? name : "radio";

  document.querySelectorAll(".page").forEach((section) => {
    section.classList.toggle("active", section === page);
  });

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === activeName
    );
  });
}

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

// Il pulsante destro Twitch è stato rimosso.
// Twitch rimane accessibile dal menu sinistro.
document.getElementById("openTwitch")?.addEventListener(
  "click",
  () => showPage("twitch")
);

// ===== OROLOGIO E DATA =====
function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const smallClock = document.getElementById("clock");
  const bigClock = document.getElementById("bigClock");
  const dateText = document.getElementById("dateText");

  if (smallClock) smallClock.textContent = time;
  if (bigClock) bigClock.textContent = time;

  if (dateText) {
    dateText.textContent = now.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }
}

updateClock();
setInterval(updateClock, 1000);

// ===== EQUALIZZATORE =====
const bars = document.getElementById("bars");

if (bars) {
  bars.replaceChildren();

  for (let i = 0; i < 48; i++) {
    const bar = document.createElement("span");

    bar.className = "bar";

    bar.style.setProperty(
      "--h",
      `${18 + Math.random() * 78}%`
    );

    bar.style.setProperty(
      "--dur",
      `${0.35 + Math.random() * 0.8}s`
    );

    bar.style.setProperty(
      "--delay",
      `${Math.random() * 0.7}s`
    );

    bars.appendChild(bar);
  }
}

setPlayState(false);

if (RADIO_STREAM_URL.trim()) {
  setRadioMessage("Premi Play per ascoltare la radio.");
}

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
