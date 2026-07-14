import './style.css'

const demoServer = {
  id: '96l8db',
  hostname: 'NOVA DISTRICT RP | Serious Roleplay',
  projectDescription: 'Ein immersives Roleplay-Erlebnis mit eigener Wirtschaft, aktiver Community und stetigen Updates.',
  clients: 84,
  maxClients: 256,
  mapname: 'Los Santos',
  gametype: 'Roleplay',
  tags: ['roleplay', 'seriousrp', 'economy', 'german', 'custom-cars'],
  resources: 412,
  locale: 'de-DE',
  owner: 'NOVA Development',
  address: 'connect 96l8db',
  players: ['Lennox_Wagner', 'Mika_Schulte', 'Aylin_Kaya', 'Jonas_Brandt', 'Noah_Voss', 'Emilia_Roth'],
}

const app = document.querySelector('#app')
let currentCode = demoServer.id

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Nodewatch Startseite"><span class="brand-mark">N</span><span>NODE<span>WATCH</span></span></a>
    <div class="top-meta"><span class="live-dot"></span> PUBLIC SERVER INTELLIGENCE <span class="version">v0.4.2</span></div>
    <button class="icon-button" aria-label="Einstellungen">•••</button>
  </header>
  <main>
    <section class="hero-section">
      <div class="eyebrow"><span class="signal-bars">▮▮▮</span> FIVEM SERVER DIRECTORY</div>
      <h1>Know what is<br><em>running.</em></h1>
      <p class="hero-copy">Öffentliche Serverdaten. Echtzeit-Status.<br>Keine Geheimnisse zwischen dir und deinem nächsten Server.</p>
      <form class="search-form" id="search-form">
        <span class="search-icon">⌕</span>
        <input id="server-input" autocomplete="off" placeholder="cfx.re/join/96l8db" aria-label="FiveM Server Code oder Link" />
        <button type="submit" class="search-button"><span>SCAN SERVER</span><span class="button-arrow">↗</span></button>
      </form>
      <div class="search-hints"><span>TRY A CODE</span><button type="button" class="hint-code">96l8db</button><span class="hint-divider">•</span><span>OR PASTE A FULL CONNECT LINK</span></div>
      <div class="search-status" id="search-status" aria-live="polite"></div>
    </section>

    <section class="dashboard" id="dashboard" aria-live="polite">
      <div class="section-label"><span>01</span><span>SERVER SNAPSHOT</span><span class="label-line"></span><span class="label-time">UPDATED JUST NOW</span></div>
      <div class="server-heading">
        <div><div class="server-kicker"><span class="online-pill">ONLINE</span><span id="server-id">CFX / 96L8DB</span></div><h2 id="server-name">NOVA DISTRICT RP <span>| SERIOUS ROLEPLAY</span></h2><p id="server-description">Ein immersives Roleplay-Erlebnis mit eigener Wirtschaft, aktiver Community und stetigen Updates.</p></div>
        <button class="outline-button" id="copy-button" type="button">COPY CONNECT <span>↗</span></button>
      </div>
      <div class="stats-grid">
        <article class="stat-card accent-card"><span class="stat-label">PLAYERS ONLINE</span><strong id="players-count">84</strong><span class="stat-foot"><span class="mini-bar"><i></i></span><span id="player-percent">32.8% CAPACITY</span></span></article>
        <article class="stat-card"><span class="stat-label">MAX CAPACITY</span><strong id="max-players">256</strong><span class="stat-foot">SLOTS AVAILABLE</span></article>
        <article class="stat-card"><span class="stat-label">SERVER PING</span><strong>42<span class="unit">ms</span></strong><span class="stat-foot"><span class="ping-wave">〰</span> STABLE CONNECTION</span></article>
        <article class="stat-card"><span class="stat-label">UPTIME</span><strong>99.8<span class="unit">%</span></strong><span class="stat-foot">LAST 30 DAYS</span></article>
      </div>
      <div class="detail-grid">
        <article class="panel players-panel"><div class="panel-heading"><div><span class="panel-index">02 / LIVE FEED</span><h3>PLAYERS <span id="player-count-label">84 ONLINE</span></h3></div><span class="live-badge"><i></i> LIVE</span></div><div class="players-list" id="players-list"></div><button class="load-button" type="button" id="load-button">VIEW ALL PLAYERS <span>↓</span></button></article>
        <article class="panel info-panel"><div class="panel-heading"><div><span class="panel-index">03 / PUBLIC DATA</span><h3>SERVER DNA</h3></div><span class="radar-icon">◎</span></div><div class="info-list"><div><span>OWNER / STUDIO</span><strong id="server-owner">NOVA DEVELOPMENT</strong></div><div><span>LOCATION</span><strong><span class="flag">DE</span> FRANKFURT, DE</strong></div><div><span>MAP / MODE</span><strong id="server-mode">LOS SANTOS / ROLEPLAY</strong></div><div><span>RESOURCES</span><strong id="server-resources">412 ACTIVE</strong></div></div><div class="tag-list" id="tag-list"></div></article>
      </div>
    </section>
  </main>
  <footer><span>NODEWATCH / A PUBLIC DATA TOOL FOR THE FIVEM COMMUNITY</span><span>DATA IS PUBLIC. USE RESPONSIBLY.</span><span class="footer-signal">● SYSTEM NOMINAL</span></footer>
`

const normalizeCode = (value) => value.trim().toLowerCase().replace(/^https?:\/\/[^/]+\/join\//, '').replace(/^cfx\.re\/join\//, '').replace(/[^a-z0-9]/g, '')
const renderServer = (server, isDemo = false) => {
  const code = server.id || 'unknown'
  currentCode = code
  const players = Array.isArray(server.players) ? server.players : []
  const max = server.maxClients || server.sv_maxclients || 0
  document.querySelector('#server-id').textContent = `CFX / ${code.toUpperCase()}`
  document.querySelector('#server-name').innerHTML = `${server.hostname || 'UNKNOWN SERVER'} <span>${server.gametype ? `| ${server.gametype.toUpperCase()}` : ''}</span>`
  document.querySelector('#server-description').textContent = server.projectDescription || 'Keine öffentliche Beschreibung verfügbar.'
  document.querySelector('#players-count').textContent = server.clients ?? players.length
  document.querySelector('#max-players').textContent = max || '—'
  document.querySelector('#player-percent').textContent = max ? `${((server.clients / max) * 100).toFixed(1)}% CAPACITY` : 'CAPACITY UNKNOWN'
  document.querySelector('#player-count-label').textContent = `${server.clients ?? players.length} ONLINE`
  document.querySelector('#server-owner').textContent = server.owner || 'PUBLIC LISTING'
  document.querySelector('#server-mode').textContent = `${server.mapname || 'UNKNOWN MAP'} / ${server.gametype || 'UNKNOWN MODE'}`.toUpperCase()
  document.querySelector('#server-resources').textContent = `${server.resources || '—'} ACTIVE`
  document.querySelector('#tag-list').innerHTML = (server.tags || []).slice(0, 6).map((tag) => `<span>${tag}</span>`).join('')
  document.querySelector('#players-list').innerHTML = players.slice(0, 6).map((player, index) => `<div class="player-row"><span class="player-index">${String(index + 1).padStart(2, '0')}</span><span class="avatar">${player.name ? player.name[0] : player[0]}</span><strong>${player.name || player}</strong><span class="player-state">● ONLINE</span></div>`).join('') || '<div class="empty-row">Player-Namen werden von diesem Server nicht veröffentlicht.</div>'
  document.querySelector('#search-status').textContent = isDemo ? 'DEMO DATA / LIVE ENDPOINT NOT REACHABLE' : 'LIVE DATA / PUBLIC ENDPOINT'
}

renderServer(demoServer, true)
document.querySelector('#search-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const code = normalizeCode(document.querySelector('#server-input').value || '96l8db')
  const status = document.querySelector('#search-status')
  status.textContent = 'SCANNING PUBLIC ENDPOINT...'
  try {
    const response = await fetch(`/api/server/${encodeURIComponent(code)}`, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error('Server not found')
    const data = await response.json()
    renderServer({ ...data.Data, id: code }, false)
  } catch {
    renderServer({ ...demoServer, id: code }, true)
    status.textContent = `NO LIVE RESPONSE FOR ${code.toUpperCase()} / SHOWING SAFE DEMO DATA`
  }
  document.querySelector('#dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' })
})
document.querySelector('.hint-code').addEventListener('click', () => { document.querySelector('#server-input').value = '96l8db'; document.querySelector('#search-form').requestSubmit() })
document.querySelector('#copy-button').addEventListener('click', async () => { await navigator.clipboard?.writeText(`cfx.re/join/${currentCode}`); document.querySelector('#copy-button').innerHTML = 'COPIED <span>✓</span>' })
