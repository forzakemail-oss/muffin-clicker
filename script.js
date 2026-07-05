const STORAGE_KEY = "moon-crumb-clicker-save";

const buildingDefinitions = [
  { id: "whisk", name: "Tiny Whisk", description: "A little helper gives you a tiny stream of muffins.", baseCost: 15, cps: 0.1, icon: "🥄" },
  { id: "baker", name: "Sleepy Baker", description: "A moody baker keeps the tray coming in steady bursts.", baseCost: 100, cps: 1, icon: "🧑‍🍳" },
  { id: "oven", name: "Pocket Oven", description: "A small oven chills in the corner and bakes nonstop.", baseCost: 550, cps: 8, icon: "🔥" },
  { id: "mixer", name: "Moon Mixer", description: "A strange contraption folds magic into every batch.", baseCost: 1400, cps: 20, icon: "⚙️" },
  { id: "bakery", name: "Haunted Bakery", description: "A full little bakery runs by itself at midnight.", baseCost: 8000, cps: 80, icon: "🏪" },
  { id: "conveyor", name: "Midnight Conveyor", description: "A long ribbon of ovens keeps the trays rolling.", baseCost: 22000, cps: 220, icon: "🧱" },
  { id: "kiln", name: "Moon Kiln", description: "A giant kiln of silver flame bakes in endless waves.", baseCost: 65000, cps: 650, icon: "🌙" },
  { id: "starbakery", name: "Star Bakery", description: "A bakery in the sky, fueled by comet sugar and dreams.", baseCost: 180000, cps: 1800, icon: "✨" },
];

const upgradeDefinitions = [
  { id: "frosting", name: "Ghostly Frosting", description: "Adds a little extra magic to every click.", baseCost: 50, clickPower: 1, cps: 0, icon: "🫧" },
  { id: "lantern", name: "Lantern Glow", description: "Keeps the kitchen bright and productive.", baseCost: 200, clickPower: 0, cps: 2, icon: "🏮" },
  { id: "shadow", name: "Shadow Sprinkles", description: "Turns your taps into more delicious chaos.", baseCost: 600, clickPower: 2, cps: 0, icon: "🌑" },
  { id: "recipe", name: "Moon Recipe", description: "A secret recipe boosts the entire bakery.", baseCost: 1800, clickPower: 0, cps: 10, icon: "📜" },
  { id: "drizzle", name: "Sugar Drizzle", description: "A glittering glaze stacks extra click power.", baseCost: 5000, clickPower: 4, cps: 0, icon: "🍬" },
  { id: "cursedwhisk", name: "Cursed Whisk", description: "The whisk hums with a tiny haunted rhythm.", baseCost: 14000, clickPower: 3, cps: 15, icon: "🪄" },
  { id: "midnightglaze", name: "Midnight Glaze", description: "A glossy layer that turns every muffin into a jackpot.", baseCost: 40000, clickPower: 8, cps: 35, icon: "🕯️" },
  { id: "bakerychoir", name: "Bakery Choir", description: "The whole kitchen sings in perfect sugary harmony.", baseCost: 90000, clickPower: 12, cps: 80, icon: "🎵" },
];

const achievementDefinitions = [
  { id: "first", name: "First Crumb", description: "Bake your first muffin.", check: (state) => state.totalMuffins >= 1 },
  { id: "cozy", name: "Cozy Corner", description: "Reach 100 muffins.", check: (state) => state.totalMuffins >= 100 },
  { id: "bliss", name: "Bakery Bliss", description: "Reach 10 muffins per second.", check: (state) => state.cps >= 10 },
  { id: "legend", name: "Legendary Crumb", description: "Bake 10,000 muffins.", check: (state) => state.totalMuffins >= 10000 },
  { id: "midnight", name: "Midnight Marathon", description: "Reach 1,000 total clicks.", check: (state) => state.clicks >= 1000 },
  { id: "storm", name: "Sugar Storm", description: "Own 10 buildings.", check: (state) => getTotalOwnedBuildings(state) >= 10 },
  { id: "empire", name: "Moonlit Empire", description: "Reach 100,000 total muffins.", check: (state) => state.totalMuffins >= 100000 },
];

const state = loadState();

const muffinButton = document.getElementById("muffin-button");
const muffinCountEl = document.getElementById("muffin-count");
const perSecondEl = document.getElementById("per-second");
const clickPowerEl = document.getElementById("click-power");
const vibeTextEl = document.getElementById("vibe-text");
const comboFillEl = document.getElementById("combo-fill");
const comboValueEl = document.getElementById("combo-value");
const statusMessageEl = document.getElementById("status-message");
const buildingListEl = document.getElementById("building-list");
const upgradeListEl = document.getElementById("upgrade-list");
const achievementListEl = document.getElementById("achievement-list");
const totalClicksEl = document.getElementById("total-clicks");
const totalBakedEl = document.getElementById("total-baked");
const buildingCountEl = document.getElementById("building-count");
const upgradeCountEl = document.getElementById("upgrade-count");
const buyAllButtonEl = document.getElementById("buy-all-button");
const musicToggleEl = document.getElementById("music-toggle");
const soundToggleEl = document.getElementById("sound-toggle");
const autoBuyToggleEl = document.getElementById("auto-buy-toggle");
const prestigeButtonEl = document.getElementById("prestige-button");
const milestoneListEl = document.getElementById("milestone-list");
const stardustCountEl = document.getElementById("stardust-count");
const prestigeCountEl = document.getElementById("prestige-count");
const bestCpsEl = document.getElementById("best-cps");
const bestClickPowerEl = document.getElementById("best-click-power");
const musicLyricsEl = document.getElementById("music-lyrics");
const notificationAreaEl = document.getElementById("notification-area");

let audioContext = null;
let masterGain = null;
let musicEnabled = true;
let soundEnabled = true;
let musicLoopId = null;
let musicBeat = 0;
let goldenMuffinTimer = 0;
const lyricLines = [
  "Muffin rise, moonlight shine, let the sweet bass roll.",
  "Hands up, bake it bold, let the midnight glow.",
  "Step by step we spin through the sugar rain.",
  "Little bakery, big heart, we never lose the flame.",
];

muffinButton.addEventListener("click", onMuffinClick);
buyAllButtonEl.addEventListener("click", buyBestAffordable);
musicToggleEl.addEventListener("click", toggleMusic);
soundToggleEl.addEventListener("click", toggleSound);
autoBuyToggleEl.addEventListener("click", toggleAutoBuy);
prestigeButtonEl.addEventListener("click", prestige);
window.addEventListener("beforeunload", saveState);

setInterval(tick, 1000);
setInterval(saveState, 4000);
checkAchievements();
updateUI();
initAudio();

function onMuffinClick() {
  ensureAudio();
  const gained = state.clickPower * state.buffMultiplier;
  state.muffins += gained;
  state.totalMuffins += gained;
  state.clicks += 1;
  state.comboMeter += 8;
  state.lastAction = Date.now();
  state.bestClickPower = Math.max(state.bestClickPower, state.clickPower * state.buffMultiplier);
  playSfx("click");

  if (state.comboMeter >= 100) {
    state.comboMeter = 0;
    state.buffMultiplier = 2;
    state.buffTimer = 6;
    statusMessageEl.textContent = "Frosting rush! The muffin glows and doubles your output for six sweet seconds.";
    playSfx("combo");
  }

  goldenMuffinTimer += 1;
  if (goldenMuffinTimer >= 12) {
    goldenMuffinTimer = 0;
    triggerGoldenMuffin();
  }

  createParticles();
  updateUI();
}

function tick() {
  if (state.buffTimer > 0) {
    state.buffTimer -= 1;
    if (state.buffTimer === 0) {
      state.buffMultiplier = 1;
      statusMessageEl.textContent = "The frosting rush faded. The bakery hums on.";
    }
  }

  if (state.eventCooldown > 0) {
    state.eventCooldown -= 1;
  } else if (state.buffTimer === 0) {
    state.buffMultiplier = 2;
    state.buffTimer = 6;
    state.eventCooldown = 18;
    statusMessageEl.textContent = "Moonlight rush! A sweet breeze doubles your bakery output.";
  }

  const income = state.cps * state.buffMultiplier;
  state.muffins += income;
  state.totalMuffins += income;
  state.bestCps = Math.max(state.bestCps, state.cps * state.buffMultiplier);
  state.lastAction = Date.now();
  if (state.autoBuyEnabled) {
    buyBestAffordable();
  }
  checkAchievements();
  updateUI();
}

function buyBuilding(buildingId) {
  const definition = buildingDefinitions.find((item) => item.id === buildingId);
  if (!definition) return;
  const owned = state.buildings[buildingId] || 0;
  const cost = getBuildingCost(definition, owned);
  if (state.muffins < cost) return;

  state.muffins -= cost;
  state.buildings[buildingId] = owned + 1;
  state.cps += definition.cps;
  state.lastAction = Date.now();
  playSfx("buy");
  checkAchievements();
  updateUI();
}

function buyUpgrade(upgradeId) {
  const definition = upgradeDefinitions.find((item) => item.id === upgradeId);
  if (!definition) return;
  const cost = getUpgradeCost(definition, state.upgrades[upgradeId] || 0);
  if (state.muffins < cost) return;

  state.muffins -= cost;
  state.upgrades[upgradeId] = (state.upgrades[upgradeId] || 0) + 1;
  state.clickPower += definition.clickPower;
  state.cps += definition.cps;
  state.lastAction = Date.now();
  playSfx("buy");
  checkAchievements();
  updateUI();
}

function getBuildingCost(definition, owned) {
  return Math.floor(definition.baseCost * Math.pow(1.15, owned));
}

function getUpgradeCost(definition, owned) {
  return Math.floor(definition.baseCost * Math.pow(1.2, owned));
}

function updateUI() {
  muffinCountEl.textContent = formatNumber(state.muffins);
  perSecondEl.textContent = formatNumber(state.cps * state.buffMultiplier);
  clickPowerEl.textContent = formatNumber(state.clickPower * state.buffMultiplier);
  vibeTextEl.textContent = describeVibe();
  comboValueEl.textContent = `${Math.min(100, state.comboMeter).toFixed(0)}%`;
  comboFillEl.style.width = `${Math.min(100, state.comboMeter)}%`;
  totalClicksEl.textContent = formatNumber(state.clicks);
  totalBakedEl.textContent = formatNumber(state.totalMuffins);
  buildingCountEl.textContent = formatNumber(getTotalOwnedBuildings());
  upgradeCountEl.textContent = formatNumber(getTotalOwnedUpgrades());
  stardustCountEl.textContent = formatNumber(state.stardust || 0);
  prestigeCountEl.textContent = formatNumber(state.prestigeCount || 0);
  bestCpsEl.textContent = formatNumber(state.bestCps || 0);
  bestClickPowerEl.textContent = formatNumber(state.bestClickPower || 1);
  prestigeButtonEl.disabled = state.totalMuffins < getPrestigeCost();
  prestigeButtonEl.textContent = `Rebirth for ${formatNumber(getPrestigeCost())} total`;
  autoBuyToggleEl.textContent = state.autoBuyEnabled ? "⚙️ Auto-buy: On" : "⚙️ Auto-buy: Off";
  renderBuildings();
  renderUpgrades();
  renderAchievements();
  renderMilestones();
}

function renderBuildings() {
  buildingListEl.innerHTML = "";
  buildingDefinitions.forEach((definition) => {
    const owned = state.buildings[definition.id] || 0;
    const cost = getBuildingCost(definition, owned);
    const canAfford = state.muffins >= cost;

    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="meta">
        <strong>${definition.icon} ${definition.name} ×${owned}</strong>
        <span>${definition.description}<br/>Produces ${formatNumber(definition.cps)} muffins/sec.</span>
      </div>
      <button ${canAfford ? "" : "disabled"} onclick="buyBuilding('${definition.id}')">Buy for ${formatNumber(cost)}</button>
    `;
    buildingListEl.appendChild(card);
  });
}

function renderUpgrades() {
  upgradeListEl.innerHTML = "";
  upgradeDefinitions.forEach((definition) => {
    const owned = state.upgrades[definition.id] || 0;
    const cost = getUpgradeCost(definition, owned);
    const canAfford = state.muffins >= cost;

    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="meta">
        <strong>${definition.icon} ${definition.name} ×${owned}</strong>
        <span>${definition.description}</span>
      </div>
      <button ${canAfford ? "" : "disabled"} onclick="buyUpgrade('${definition.id}')">Buy for ${formatNumber(cost)}</button>
    `;
    upgradeListEl.appendChild(card);
  });
}

function renderAchievements() {
  achievementListEl.innerHTML = "";
  achievementDefinitions.forEach((achievement) => {
    const unlocked = Boolean(state.achievements?.[achievement.id]) || achievement.check(state);
    const item = document.createElement("li");
    item.textContent = unlocked ? `✓ ${achievement.name} — ${achievement.description}` : `○ ${achievement.name}`;
    if (unlocked) {
      item.style.color = "#ffe08c";
    }
    achievementListEl.appendChild(item);
  });
}

function renderMilestones() {
  milestoneListEl.innerHTML = "";
  const milestones = [
    { label: "First crumb", detail: "Bake your first muffin", reached: state.totalMuffins >= 1 },
    { label: "Tiny empire", detail: "Own 5 buildings", reached: getTotalOwnedBuildings() >= 5 },
    { label: "Moonlit rush", detail: "Reach 100 clicks", reached: state.clicks >= 100 },
    { label: "Sugar storm", detail: "Hit 10,000 total muffins", reached: state.totalMuffins >= 10000 },
    { label: "Star baker", detail: "Unlock 3 stardust through rebirths", reached: (state.stardust || 0) >= 3 },
  ];

  milestones.forEach((milestone) => {
    const card = document.createElement("div");
    card.className = "milestone-card";
    card.innerHTML = `<strong>${milestone.reached ? "✓" : "○"} ${milestone.label}</strong><span>${milestone.detail}</span>`;
    milestoneListEl.appendChild(card);
  });
}

function checkAchievements() {
  achievementDefinitions.forEach((achievement) => {
    if (!state.achievements || !state.achievements[achievement.id]) {
      if (achievement.check(state)) {
        state.achievements = state.achievements || {};
        state.achievements[achievement.id] = true;
        showNotification(achievement.name, achievement.description);
        playSfx("achievement");
      }
    }
  });
}

function showNotification(title, message) {
  const toast = document.createElement("div");
  toast.className = "notification-toast";
  toast.innerHTML = `<strong>${title}</strong>${message}`;
  notificationAreaEl.appendChild(toast);
  while (notificationAreaEl.children.length > 5) {
    notificationAreaEl.firstChild.remove();
  }
  setTimeout(() => toast.remove(), 2400);
}

function triggerGoldenMuffin() {
  const bonus = Math.max(50, Math.floor(state.clickPower * 8));
  state.muffins += bonus;
  state.totalMuffins += bonus;
  showNotification("Golden Muffin", `A cursed pastry showered you with ${formatNumber(bonus)} muffins.`);
  playSfx("golden");
  updateUI();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggleEl.textContent = soundEnabled ? "🔊 SFX: On" : "🔇 SFX: Off";
}

function toggleAutoBuy() {
  state.autoBuyEnabled = !state.autoBuyEnabled;
  autoBuyToggleEl.textContent = state.autoBuyEnabled ? "⚙️ Auto-buy: On" : "⚙️ Auto-buy: Off";
  if (state.autoBuyEnabled) {
    showNotification("Auto-buy", "The bakery now spends your muffins wisely.");
  }
}

function prestige() {
  const cost = getPrestigeCost();
  if (state.totalMuffins < cost) return;
  const dustGain = Math.max(1, Math.floor(state.totalMuffins / 25000) + (state.prestigeCount || 0) + 1);
  state.stardust = (state.stardust || 0) + dustGain;
  state.prestigeCount = (state.prestigeCount || 0) + 1;
  state.muffins = 0;
  state.clickPower = 1;
  state.cps = 0;
  state.buildings = {};
  state.upgrades = {};
  state.comboMeter = 0;
  state.buffMultiplier = 1;
  state.buffTimer = 0;
  state.eventCooldown = 0;
  state.lastAction = Date.now();
  showNotification("Rebirth", `You shed the bakery and gained ${formatNumber(dustGain)} stardust.`);
  playSfx("achievement");
  updateUI();
}

function getPrestigeCost() {
  return Math.floor(100000 * Math.pow(1.25, state.prestigeCount || 0));
}

function playSfx(type) {
  if (!soundEnabled || !audioContext || !masterGain) return;
  const now = audioContext.currentTime;
  if (type === "click") {
    playTone(440 + state.clickPower * 10, 0.08, "square", 0.05, now, 0.94);
  } else if (type === "buy") {
    playTone(300, 0.12, "triangle", 0.06, now, 0.9);
  } else if (type === "combo") {
    playTone(660, 0.16, "sine", 0.08, now, 0.85);
  } else if (type === "achievement") {
    playTone(520, 0.16, "triangle", 0.07, now, 0.8);
    playTone(780, 0.16, "sine", 0.05, now + 0.04, 0.8);
  } else if (type === "golden") {
    playTone(980, 0.2, "sawtooth", 0.07, now, 0.7);
  }
}

function buyBestAffordable() {
  const buyCandidates = [];
  buildingDefinitions.forEach((definition) => {
    const owned = state.buildings[definition.id] || 0;
    const cost = getBuildingCost(definition, owned);
    if (state.muffins >= cost) {
      buyCandidates.push({ type: "building", definition, owned, cost });
    }
  });
  upgradeDefinitions.forEach((definition) => {
    const owned = state.upgrades[definition.id] || 0;
    const cost = getUpgradeCost(definition, owned);
    if (state.muffins >= cost) {
      buyCandidates.push({ type: "upgrade", definition, owned, cost });
    }
  });

  if (!buyCandidates.length) return;
  buyCandidates.sort((a, b) => a.cost - b.cost);
  const best = buyCandidates[0];
  if (best.type === "building") {
    buyBuilding(best.definition.id);
  } else {
    buyUpgrade(best.definition.id);
  }
}

function getTotalOwnedBuildings(stateObj = state) {
  return Object.values(stateObj.buildings || {}).reduce((sum, value) => sum + value, 0);
}

function getTotalOwnedUpgrades() {
  return Object.values(state.upgrades).reduce((sum, value) => sum + value, 0);
}

function describeVibe() {
  if (state.cps >= 80) return "A moonlit empire";
  if (state.cps >= 20) return "A bustling bakery";
  if (state.totalMuffins >= 100) return "A warm little hideaway";
  return "Cool and curious";
}

function createParticles() {
  for (let i = 0; i < 8; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${muffinButton.getBoundingClientRect().left + muffinButton.offsetWidth / 2}px`;
    particle.style.top = `${muffinButton.getBoundingClientRect().top + muffinButton.offsetHeight / 2}px`;
    particle.style.background = ["#ffe08c", "#ff7da8", "#7ee0ff"][i % 3];
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 170}px`);
    particle.style.setProperty("--dy", `${(Math.random() - 0.8) * 220}px`);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

function initAudio() {
  if (audioContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audioContext = new AudioCtx();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.06;
  masterGain.connect(audioContext.destination);
  startMusic();
}

function ensureAudio() {
  if (!audioContext) {
    initAudio();
    return;
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function startMusic() {
  if (!audioContext || !masterGain) return;
  if (musicLoopId) return;
  musicEnabled = true;
  musicToggleEl.textContent = "🎶 Music: On";
  musicLyricsEl.textContent = lyricLines[0];
  ensureAudio();
  musicLoopId = window.setInterval(playMusicLoop, 260);
}

function stopMusic() {
  musicEnabled = false;
  musicToggleEl.textContent = "🎶 Music: Off";
  if (musicLoopId) {
    window.clearInterval(musicLoopId);
    musicLoopId = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.suspend();
  }
}

function toggleMusic() {
  if (musicEnabled) {
    stopMusic();
  } else {
    startMusic();
  }
}

function playMusicLoop() {
  if (!audioContext || !masterGain || !musicEnabled) return;
  const now = audioContext.currentTime;
  const beat = musicBeat % 4;
  const bassFreq = 92 + beat * 8;
  const melodyFreq = [220, 260, 330, 392][beat];

  playTone(bassFreq, 0.16, "sawtooth", 0.04, now, 0.95);
  playTone(melodyFreq, 0.1, "triangle", 0.03, now + 0.02, 0.9);

  if (beat === 0 || beat === 2) {
    playKick(now);
  }
  if (beat === 1 || beat === 3) {
    playClap(now + 0.02);
  }

  musicLyricsEl.textContent = lyricLines[Math.floor(musicBeat / 2) % lyricLines.length];
  musicBeat += 1;
}

function playTone(frequency, duration, type, gainLevel, startTime, slide) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  osc.frequency.exponentialRampToValueAtTime(frequency * slide, startTime + duration);
  gain.gain.setValueAtTime(gainLevel, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playKick(startTime) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, startTime);
  osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.2);
  gain.gain.setValueAtTime(0.18, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + 0.2);
}

function playClap(startTime) {
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.12, audioContext.sampleRate);
  const channelData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < channelData.length; i += 1) {
    channelData[i] = (Math.random() * 2 - 1) * 0.8;
  }
  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  noise.buffer = noiseBuffer;
  gain.gain.setValueAtTime(0.1, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);
  noise.connect(gain);
  gain.connect(masterGain);
  noise.start(startTime);
  noise.stop(startTime + 0.12);
}

function formatNumber(value) {
  return Math.floor(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      muffins: 0,
      totalMuffins: 0,
      clicks: 0,
      clickPower: 1,
      cps: 0,
      buildings: {},
      upgrades: {},
      achievements: {},
      stardust: 0,
      prestigeCount: 0,
      bestCps: 0,
      bestClickPower: 1,
      autoBuyEnabled: false,
      comboMeter: 0,
      buffMultiplier: 1,
      buffTimer: 0,
      eventCooldown: 0,
      lastAction: Date.now(),
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const offlineSeconds = Math.min(21600, (Date.now() - (parsed.lastAction || Date.now())) / 1000);
    const offlineGain = offlineSeconds * (parsed.cps || 0);
    const nextState = {
      muffins: (parsed.muffins || 0) + offlineGain,
      totalMuffins: (parsed.totalMuffins || 0) + offlineGain,
      clicks: parsed.clicks || 0,
      clickPower: parsed.clickPower || 1,
      cps: parsed.cps || 0,
      buildings: parsed.buildings || {},
      upgrades: parsed.upgrades || {},
      achievements: parsed.achievements || {},
      stardust: parsed.stardust || 0,
      prestigeCount: parsed.prestigeCount || 0,
      bestCps: parsed.bestCps || 0,
      bestClickPower: parsed.bestClickPower || 1,
      autoBuyEnabled: parsed.autoBuyEnabled || false,
      comboMeter: parsed.comboMeter || 0,
      buffMultiplier: parsed.buffMultiplier || 1,
      buffTimer: parsed.buffTimer || 0,
      eventCooldown: parsed.eventCooldown || 0,
      lastAction: Date.now(),
    };
    return nextState;
  } catch (error) {
    console.warn("Could not load save data", error);
    return {
      muffins: 0,
      totalMuffins: 0,
      clicks: 0,
      clickPower: 1,
      cps: 0,
      buildings: {},
      upgrades: {},
      achievements: {},
      stardust: 0,
      prestigeCount: 0,
      bestCps: 0,
      bestClickPower: 1,
      autoBuyEnabled: false,
      comboMeter: 0,
      buffMultiplier: 1,
      buffTimer: 0,
      eventCooldown: 0,
      lastAction: Date.now(),
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

window.buyBuilding = buyBuilding;
window.buyUpgrade = buyUpgrade;
