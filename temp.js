
let CONTAINERS = [
  {id:'about',   port:3000, state:'running'},
  {id:'skills',  port:3001, state:'running'},
  {id:'projects',port:3002, state:'running'},
  {id:'achievements',port:3003, state:'running'},
  {id:'certs',   port:3004, state:'running'},
  {id:'contact', port:3005, state:'running'},
];

let activeContainer = 'about';
let muted = false;
let termOpen = false;
let ctxTarget = null;
let uptimeSeconds = 847*86400 + 3*3600 + 22*60 + 43;
let termHistory = [], termHistIdx = -1;

// ── AUDIO ──
const AC = new (window.AudioContext||window.webkitAudioContext)();
function beep(freq=800,dur=0.03,vol=0.08,type='square'){
  if(muted||AC.state==='suspended') return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  o.frequency.value=freq; o.type=type;
  g.gain.setValueAtTime(vol,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
  o.start(); o.stop(AC.currentTime+dur);
}
function clickSound(){beep(700,.025,.06);}
function startSound(){beep(440,.08,.07);setTimeout(()=>beep(660,.08,.07),90);}
function hoverSound(){beep(900,.015,.04);}
function successSound(){[440,550,660].forEach((f,i)=>setTimeout(()=>beep(f,.1,.06),i*80));}
function toggleMute(){muted=!muted;document.getElementById('sound-icon').style.opacity=muted?.3:1;}

// ── UPTIME ──
function fmtUptime(s){
  const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sec=s%60;
  return `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
setInterval(()=>{
  uptimeSeconds++;
  document.getElementById('stat-uptime').textContent=fmtUptime(uptimeSeconds);
  document.getElementById('stat-cpu').textContent=(3+Math.random()*.8-.4).toFixed(1);
  document.getElementById('stat-ram').textContent=(310+Math.random()*20).toFixed(1);
  document.getElementById('stat-net').textContent=(0.7+Math.random()*.8).toFixed(1);
},1000);

let activeView = 'containers';

function switchView(view) {
  if (activeView === view) return;
  activeView = view;
  clickSound();
  
  document.querySelectorAll('.rail-item').forEach(el => {
    if (el.querySelector('.rail-tooltip')?.textContent.toLowerCase() === view) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  renderSidebar(document.getElementById('sb-search-input').value);
  if (view === 'containers') {
    renderTabs();
    navigateTo(activeContainer);
  } else {
    document.getElementById('nav-tabs').innerHTML = '';
    document.getElementById('bc-active').textContent = view;
    renderPageForView(view);
  }
}

function renderPageForView(view) {
  const area = document.getElementById('content-area');
  area.style.opacity='0';
  area.style.transform='translateX(-8px)';
  
  setTimeout(() => {
    if (view === 'images') {
      area.innerHTML = `
        <div class="container-header"><span class="dot" style="background:#8b949e;box-shadow:none;"></span><span>VIEW: <strong>images</strong></span></div>
        <div style="color:var(--text-primary);font-family:var(--font-mono);font-size:13px;padding:20px;">
          <table style="width:100%;text-align:left;border-collapse:collapse;">
            <tr style="color:var(--text-dim);border-bottom:1px solid var(--border);"><th style="padding:8px 0;font-weight:600">REPOSITORY</th><th style="font-weight:600">TAG</th><th style="font-weight:600">IMAGE ID</th><th style="font-weight:600">SIZE</th></tr>
            <tr style="border-bottom:1px solid var(--border);"><td style="padding:12px 0;color:var(--blue);cursor:pointer;" onmouseenter="hoverSound()">divvyansh/portfolio</td><td>latest</td><td>a1b2c3d4e5f6</td><td>412 MB</td></tr>
            <tr style="border-bottom:1px solid var(--border);"><td style="padding:12px 0;">node</td><td>18</td><td>b2c3d4e5f6a1</td><td>980 MB</td></tr>
            <tr style="border-bottom:1px solid var(--border);"><td style="padding:12px 0;">postgres</td><td>15</td><td>c3d4e5f6a1b2</td><td>379 MB</td></tr>
            <tr><td style="padding:12px 0;">nginx</td><td>latest</td><td>d4e5f6a1b2c3</td><td>142 MB</td></tr>
          </table>
        </div>
      `;
    } else if (view === 'volumes') {
      area.innerHTML = `
        <div class="container-header"><span class="dot" style="background:#8b949e;box-shadow:none;"></span><span>VIEW: <strong>volumes</strong></span></div>
        <div style="color:var(--text-primary);font-family:var(--font-mono);font-size:13px;padding:20px;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
            <div class="stat-card"><div class="num blue">3</div><div class="lbl">Total Volumes</div></div>
            <div class="stat-card"><div class="num amber">2.4 GB</div><div class="lbl">Total Size</div></div>
            <div class="stat-card"><div class="num green">1</div><div class="lbl">In Use</div></div>
          </div>
          <div style="margin-top:24px;border:1px solid var(--border);border-radius:6px;overflow:hidden;">
            <div style="padding:10px 14px;background:#1e2227;border-bottom:1px solid var(--border);color:var(--text-white);font-weight:600;">db_data</div>
            <div style="padding:10px 14px;color:var(--text-secondary);font-size:12px;">Mount: /var/lib/docker/volumes/db_data/_data</div>
          </div>
          <div style="margin-top:12px;border:1px solid var(--border);border-radius:6px;overflow:hidden;">
            <div style="padding:10px 14px;background:#1e2227;border-bottom:1px solid var(--border);color:var(--text-white);font-weight:600;">app_cache</div>
            <div style="padding:10px 14px;color:var(--text-secondary);font-size:12px;">Mount: /var/lib/docker/volumes/app_cache/_data</div>
          </div>
          <div style="margin-top:12px;border:1px solid var(--border);border-radius:6px;overflow:hidden;">
            <div style="padding:10px 14px;background:#1e2227;border-bottom:1px solid var(--border);color:var(--text-white);font-weight:600;">nginx_config</div>
            <div style="padding:10px 14px;color:var(--text-secondary);font-size:12px;">Mount: /var/lib/docker/volumes/nginx_config/_data</div>
          </div>
        </div>
      `;
    }
    area.style.transition='opacity .25s,transform .25s';
    area.style.opacity='1';
    area.style.transform='translateX(0)';
  }, 100);
}

// ── SIDEBAR ──
function renderSidebar(filter=''){
  const list=document.getElementById('container-list');
  const sbLabel=document.querySelector('.sb-label');
  list.innerHTML='';
  
  if (activeView === 'containers') {
    sbLabel.textContent = 'Containers';
    CONTAINERS.filter(c=>c.id.includes(filter.toLowerCase())).forEach(c=>{
      const isRunning = c.state === 'running';
      const dotColor = isRunning ? 'var(--green)' : '#8b949e';
      const dotShadow = isRunning ? 'box-shadow:0 0 5px rgba(63,185,80,.5);' : 'box-shadow:none;';
      const nameColor = isRunning ? (c.id === activeContainer ? '#fff' : 'var(--text-primary)') : '#8b949e';
      const badgeBg = isRunning ? '#1a2e1a' : '#2d3139';
      const badgeColor = isRunning ? '#3fb950' : '#8b949e';
      const badgeBorder = isRunning ? '#1a4d2e' : '#363b45';

      const row=document.createElement('div');
      row.className='c-row'+(c.id===activeContainer?' active':'');
      row.dataset.id=c.id;
      row.innerHTML=`
        <span class="c-dot" style="background:${dotColor}; ${dotShadow}"></span>
        <span class="c-name" style="color:${nameColor}">${c.id}</span>
        <span class="c-badge" style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder}">${c.state}</span>
        <span class="c-port">:${c.port}</span>
        <div class="c-actions">
          <button class="c-act-btn" title="${isRunning ? 'Open' : 'Start'}" onclick="event.stopPropagation();if(${isRunning}) navigateTo('${c.id}'); else ctxAction('restart', '${c.id}')">
            ${isRunning ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}
          </button>
          <button class="c-act-btn" title="Stop" onclick="event.stopPropagation();ctxAction('stop', '${c.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
          </button>
          <button class="c-act-btn" title="Delete" onclick="event.stopPropagation();ctxAction('delete', '${c.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>`;
      row.addEventListener('click',()=>{
        if (c.state === 'running') navigateTo(c.id);
        else beep(200,.15,.07);
      });
      row.addEventListener('contextmenu',e=>{e.preventDefault();ctxTarget=c.id;showCtxMenu(e.clientX,e.clientY);});
      row.addEventListener('mouseenter',hoverSound);
      list.appendChild(row);
    });
  } else if (activeView === 'images') {
    sbLabel.textContent = 'Images';
    const images = ['divvyansh/portfolio:latest', 'node:18', 'postgres:15', 'nginx:latest'];
    images.filter(i => i.includes(filter.toLowerCase())).forEach(img => {
      list.innerHTML += `<div class="c-row" style="cursor:default;" onmouseenter="hoverSound()"><span class="c-dot" style="background:#8b949e;box-shadow:none;"></span><span class="c-name" style="color:var(--text-primary)">${img}</span></div>`;
    });
  } else if (activeView === 'volumes') {
    sbLabel.textContent = 'Volumes';
    const vols = ['db_data', 'app_cache', 'nginx_config'];
    vols.filter(v => v.includes(filter.toLowerCase())).forEach(v => {
      list.innerHTML += `<div class="c-row" style="cursor:default;" onmouseenter="hoverSound()"><span class="c-dot" style="background:#8b949e;box-shadow:none;"></span><span class="c-name" style="color:var(--text-primary)">${v}</span></div>`;
    });
  }
}
function filterContainers(v){renderSidebar(v);}
function showSidebar(){/* handled by switchView now */}

// ── TABS ──
function renderTabs(){
  const tabBar=document.getElementById('nav-tabs');
  tabBar.innerHTML='';
  CONTAINERS.forEach(c=>{
    const t=document.createElement('div');
    t.className='nav-tab'+(c.id===activeContainer?' active':'');
    t.textContent=c.id;
    t.onclick=()=>navigateTo(c.id);
    tabBar.appendChild(t);
  });
}

// ── NAVIGATE ──
function navigateTo(id){
  if(id===activeContainer) return;
  clickSound();
  const area=document.getElementById('content-area');
  area.style.opacity='0';
  area.style.transform='translateX(-8px)';
  setTimeout(()=>{
    activeContainer=id;
    document.getElementById('bc-active').textContent=id;
    renderSidebar(document.getElementById('sb-search-input').value);
    renderTabs();
    const isRunning = CONTAINERS.find(c => c.id === id)?.state === 'running';
    if (!isRunning) {
        // Can't render a stopped container
        area.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-dim);font-family:var(--font-mono);flex-direction:column;gap:12px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><rect x="6" y="6" width="12" height="12" rx="1"/></svg><div>Container is stopped</div><button class="pc-btn primary" onclick="ctxAction('restart', '${id}')">Start Container</button></div>`;
    } else {
        renderPage(id);
    }
    area.style.transition='opacity .25s,transform .25s';
    area.style.opacity='1';
    area.style.transform='translateX(0)';
  },200);
}

// ── PAGES ──
function renderPage(id){
  const area=document.getElementById('content-area');
  const pages={about:pageAbout,skills:pageSkills,projects:pageProjects,achievements:pageAchievements,certs:pageCerts,contact:pageContact};
  area.innerHTML='<div class="page">'+(pages[id]?pages[id]():'<p style="color:var(--text-secondary)">Coming soon</p>')+'</div>';
  if(id==='contact') initContactTerm();
}

function pageAbout(){return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>about</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3000→3000</span></span></div>
<h1 class="hero-name">DIVVYANSH KUDESIAA</h1>
<div class="hero-title">AI/ML Engineer &amp; Multi-Agent Systems Architect</div>
<div class="hero-links">
  <span>📍 Ghaziabad, India</span>
  <a href="https://github.com/naakaarafr" target="_blank">⌥ github.com/naakaarafr</a>
  <a href="https://linkedin.com/in/divvyansh-kudesiaa" target="_blank">in divvyansh-kudesiaa</a>
  <a href="mailto:contact@divvyansh.dev">✉ contact@divvyansh.dev</a>
</div>
<div class="stats-grid">
  <div class="stat-card"><div class="num amber">9.2</div><div class="lbl">CGPA / 10.0</div></div>
  <div class="stat-card"><div class="num blue">5+</div><div class="lbl">Projects Deployed</div></div>
  <div class="stat-card"><div class="num green">2× 🏅</div><div class="lbl">Hackathons Won</div></div>
  <div class="stat-card"><div class="num cyan">4</div><div class="lbl">OCI Certifications</div></div>
</div>
<div class="whoami-card">
  <div class="wh-label">// WHOAMI</div>
  <p>B.Tech CSE student at <span class="hl">SRM Institute of Science and Technology</span> (Expected May 2028), maintaining a CGPA of <span class="green-hl">9.2/10</span>. I architect autonomous multi-agent AI systems and real-time ML pipelines — from disaster intelligence platforms that forecast displacement with <span class="green-hl">94% accuracy</span>, to climate-aware investing systems achieving <span class="green-hl">93–95% trading accuracy</span> across simulated paper trades. I live at the intersection of systems engineering, applied ML, and cloud infrastructure.</p>
</div>
<div class="edu-card">
  <div class="edu-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>EDUCATION</div>
  <h3>B.Tech, Computer Science Engineering</h3>
  <div class="edu-sub">SRM Institute of Science and Technology, Kattankulathur &nbsp;·&nbsp; Expected May 2028</div>
  <div class="course-tags">
    ${['DSA','Design & Analysis of Algorithms','OOPs','Operating Systems','DBMS','Embedded OS'].map(t=>`<span class="ctag">${t}</span>`).join('')}
  </div>
</div>`;}

function pageSkills(){
  const layers=[
    {num:'LAYER 1',name:'Languages',hash:'sha256:a1b2c3d',skills:['C++','Python','Java','C'],cat:'lang'},
    {num:'LAYER 2',name:'AI / ML',hash:'sha256:d4e5f6a',skills:['Scikit-learn','XGBoost','DBSCAN','OpenCV','NLP','NumPy','Pandas','NetworkX'],cat:'ai'},
    {num:'LAYER 3',name:'Agents & Tools',hash:'sha256:g7h8i9b',skills:['Multi-Agent Systems','CrewAI','Autogen','Google ADK','Leaflet.js','Jupyter'],cat:'agent'},
    {num:'LAYER 4',name:'Web & Frameworks',hash:'sha256:j1k2l3c',skills:['HTML','CSS','JavaScript ES6+','Flask','FastAPI'],cat:'web'},
    {num:'LAYER 5',name:'Databases',hash:'sha256:m4n5o6d',skills:['PostgreSQL','MySQL','SQLite3','Supabase','Firebase'],cat:'db'},
    {num:'LAYER 6',name:'Cloud & DevOps',hash:'sha256:p7q8r9e',skills:['AWS','Oracle Cloud','Docker','Git','Linux','Render','Vercel','Postman'],cat:'cloud'},
  ];
  const layerHtml=layers.map((l,i)=>`<div class="layer-row" style="animation-delay:${i*80}ms"><span class="layer-num">${l.num}</span><span class="layer-name">${l.name}</span><span class="layer-hash">${l.hash}...</span><span class="layer-skills">${l.skills.join(', ')}</span></div>`).join('');
  const allTags=layers.flatMap(l=>l.skills.map(s=>`<span class="skill-tag ${l.cat}" onmouseenter="hoverSound()">${s}</span>`)).join('');
  return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>skills</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3001→3001</span></span></div>
<div class="skill-section">
  <div class="skill-section-title">$ docker image inspect divvyansh/skills — layers</div>
  <div class="layer-list">${layerHtml}</div>
</div>
<div class="skill-section">
  <div class="skill-section-title">All skills — 35 total</div>
  <div class="skill-tags">${allTags}</div>
</div>`;}

function pageProjects(){
  function card(name,port,desc,stats,tags,logs,url,featured=false){
    const statsHtml=stats?`<div class="pc-stats">${stats.map(s=>`<div class="pc-stat"><div class="pcs-num">${s[0]}</div><div class="pcs-lbl">${s[1]}</div></div>`).join('')}</div>`:'';
    const logsHtml=logs?`<div class="logs-panel" id="logs-${name}">${logs.map(l=>`<div class="log-${l[0]}">[${l[0].toUpperCase()}] ${l[1]}</div>`).join('')}</div>`:'';
    return`<div class="project-card${featured?' featured':''}" onclick="window.open('${url}','_blank');beep(660,.12,.07)">
      <div class="pc-header"><span class="pc-dot"></span><span class="pc-name">${name}</span><span class="pc-badge">RUNNING</span><span class="pc-uptime">Up 14 days</span></div>
      <div class="pc-body">
        <div class="pc-desc">${desc}</div>
        ${statsHtml}
        <div class="pc-tags">${tags.map(t=>`<span class="pc-tag">${t}</span>`).join('')}</div>
        <div class="pc-actions">
          <button class="pc-btn primary" onclick="event.stopPropagation();window.open('${url}','_blank');beep(660,.12,.07)">EXEC → GitHub</button>
          ${logs?`<button class="pc-btn secondary" onclick="event.stopPropagation();toggleLogs('${name}')">LOGS</button>`:''}
        </div>
        ${logsHtml}
      </div>
    </div>`;}
  return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>projects</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3002→3002</span></span></div>
<div class="project-grid">
  ${card('Crisis Connect',8080,'Real-time disaster command center. 5 specialized ML pipelines across 5 datasets, achieving 94% displacement forecasting accuracy with XGBoost — enabling predictive resource allocation before crisis escalation.',[['94%','Accuracy'],['5','ML Pipelines'],['5','Datasets']],['Python 3.11','XGBoost','Scikit-learn','NetworkX','Leaflet.js','Docker','Flask']
  ,[['info','Loading XGBoost displacement model...'],['info','DBSCAN clustering: 847 hotspots identified'],['info','Route optimization complete: 23 paths computed'],['success','Emergency infrastructure mapped via OSM/Overpass API']],'https://github.com/naakaarafr/Crisis-Connect',true)}
  ${card('Sentinel-Climate-Aware-Autonomous-Investing-System',8081,'7-agent autonomous investment pipeline fusing ESG climate scores with quantitative financial analysis. Achieving 93–95% accuracy across simulated paper trades.',[['7','Agents'],['95%','Accuracy'],['10k','MC Simulations']],['FastAPI','PostgreSQL','NumPy','OpenClaw','ArmourIQ']
  ,[['info','Initializing 7-agent pipeline...'],['info','Climate Risk Agent: ESG scores loaded'],['info','Monte Carlo simulation: 10,000 iterations complete'],['success','Trade policy enforcement: ArmourIQ layer active']],'https://github.com/naakaarafr/Sentinel-Climate-Aware-Autonomous-Investing-System-1.0',true)}
  ${card('YSHY-Your-Smart-Healthcare-Yardstick',8082,'ML/DL analytics pipeline for women\\'s health insights with data quality monitoring.',null,['ML/DL','Python','Analytics'],null,'https://github.com/naakaarafr/YSHY-Your-Smart-Healthcare-Yardstick')}
  ${card('QR-Based-Event-Check-In-System',8083,'Real-time QR detection with OpenCV + SQLite. Reduced manual check-in effort by ~80%.',null,['OpenCV','SQLite3','Python'],null,'https://github.com/naakaarafr/QR-Based-Event-Check-In-System')}
  ${card('Storybook-Generator',8084,'Multi-agent system generating interactive storybooks from natural language prompts.',null,['Multi-Agent','NLP','Python'],null,'https://github.com/naakaarafr/Storybook-Generator')}
  ${card('Multi-Audio-Bridge',8085,'A sophisticated real-time multi-client audio streaming architecture supporting seamless bridging and latency optimization.',[['Real','Time'],['Zero','Drop'],['Multi','Client']],['WebRTC','Node.js','Socket.io','Audio'],null,'https://github.com/naakaarafr/Multi-Audio-Bridge')}
</div>`;}

function toggleLogs(name){
  const el=document.getElementById('logs-'+name);
  if(!el)return;
  el.classList.toggle('open');
  clickSound();
}

function pageAchievements(){return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>achievements</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3003→3003</span></span></div>
<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);margin-bottom:12px;">$ docker events --filter type=achievement</div>
<div class="ach-event-row"><span class="ach-ts">2026-03-15</span><span class="ach-type">ACHIEVEMENT</span><span class="ach-name">1st Place · SRM Hackathon 10.0</span><span class="ach-count">500+ teams</span><span class="ach-trophy">🥇</span></div>
<div class="ach-event-row"><span class="ach-ts">2025-11-20</span><span class="ach-type">ACHIEVEMENT</span><span class="ach-name">1st Place · Inn-Ing 2.0</span><span class="ach-count">250+ teams</span><span class="ach-trophy">🥇</span></div>
<div class="ach-event-row"><span class="ach-ts">2025-08-10</span><span class="ach-type">ACHIEVEMENT</span><span class="ach-name">2nd Place · Shaastra Aerial Robotics · IIT Madras</span><span class="ach-count">Top finalist</span><span class="ach-trophy">🥈</span></div>
<div class="trophy-grid">
  <div class="trophy-card" onmouseenter="successSound()"><span class="trophy-emoji">🥇</span><div class="trophy-name">SRM Hackathon 10.0</div><div class="trophy-sub">1st of 500+ competing teams</div><div class="trophy-year">2026</div></div>
  <div class="trophy-card" onmouseenter="successSound()"><span class="trophy-emoji">🥇</span><div class="trophy-name">Inn-Ing 2.0</div><div class="trophy-sub">1st of 250+ competing teams</div><div class="trophy-year">2025</div></div>
  <div class="trophy-card" onmouseenter="beep(550,.1,.06)"><span class="trophy-emoji">🥈</span><div class="trophy-name">Shaastra · IIT Madras</div><div class="trophy-sub">Aerial Robotics Challenge</div><div class="trophy-year">2025</div></div>
</div>`;}

function pageCerts(){
  function cert(name,issuer,date){
    const hash='sha256:'+Math.random().toString(16).slice(2,10)+'...';
    return`<div class="cert-card">
      <div class="cert-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>VERIFIED</div>
      <div class="cert-name">${name}</div>
      <div class="cert-meta"><span>${issuer}</span><span>·</span><span>${date}</span></div>
      <div class="cert-hash">${hash}</div>
    </div>`;}
  return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>certs</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3004→3004</span></span></div>
<div style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);margin-bottom:14px;">$ docker trust inspect --pretty divvyansh/certifications</div>
<div class="cert-grid">
  ${cert('Oracle Cloud Infrastructure 2025 Certified Foundations Associate','Oracle','Feb 2026')}
  ${cert('Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate','Oracle','Dec 2025')}
  ${cert('Oracle Fusion AI Agent Studio Certified Foundations Associate','Oracle','Dec 2025')}
  ${cert('YUVA AI For All','TCS iON','Feb 2026')}
</div>`;}

function pageContact(){return`
<div class="container-header"><span class="dot"></span><span>CONTAINER: <strong>contact</strong></span><span class="sep">|</span><span>STATUS: <span class="run-green">running</span></span><span class="sep">|</span><span>PORT: <span class="port-blue">3005→3005</span></span></div>
<div id="contact-term">
  <div class="ct-header"><div class="ct-dots"><div class="ct-dot" style="background:#ff5f57"></div><div class="ct-dot" style="background:#febc2e"></div><div class="ct-dot" style="background:#28c840"></div></div><span class="ct-title">bash — divvyansh@portfolio</span></div>
  <div id="ct-output"></div>
  <div id="ct-input-row"><span class="ct-prompt">divvyansh@portfolio:~$</span><input type="text" id="ct-input" placeholder="Type 'help' for commands..." autocomplete="off"/></div>
</div>
<div class="contact-socials">
  <a class="soc-btn" href="mailto:contact@divvyansh.dev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Email</a>
  <a class="soc-btn" href="https://github.com/naakaarafr" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>GitHub</a>
  <a class="soc-btn" href="https://linkedin.com/in/divvyansh-kudesiaa" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</a>
  <a class="soc-btn" href="tel:+91-XXXXXXXXXX"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+91-XXXXXXXXXX</a>
</div>`;}

// ── CONTACT TERMINAL ──
function initContactTerm(){
  const out=document.getElementById('ct-output');
  const inp=document.getElementById('ct-input');
  if(!out||!inp) return;
  const print=(text,cls='ct-line-white')=>{const d=document.createElement('div');d.className=cls;d.innerHTML=text;out.appendChild(d);out.scrollTop=out.scrollHeight;};
  print('Welcome to Divvyansh\'s contact terminal.','ct-line-green');
  print('Type <span style="color:#e3b341">help</span> to see available commands.','ct-line-dim');
  print('','ct-line-dim');
  const CMDS={
    help:()=>{print('Available commands:','ct-line-yellow');['email','github','linkedin','phone','hire me','whoami','ping','clear'].forEach(c=>print(`  <span style="color:#58a6ff">${c}</span>`,'ct-line-white'));},
    email:()=>print('contact@divvyansh.dev','ct-line-blue'),
    github:()=>{window.open('https://github.com/naakaarafr','_blank');print('Opening github.com/naakaarafr...','ct-line-green');},
    linkedin:()=>{window.open('https://linkedin.com/in/divvyansh-kudesiaa','_blank');print('Opening LinkedIn...','ct-line-green');},
    phone:()=>print('+91-XXXXXXXXXX','ct-line-blue'),
    ping:()=>print('PONG! Divvyansh is online. Latency: 0ms','ct-line-green'),
    whoami:()=>{print('Divvyansh Kudesiaa','ct-line-white');print('B.Tech CSE @ SRM · CGPA 9.2 · AI/ML Engineer','ct-line-dim');print('Hackathon Champion × 2 · OCI Certified × 4','ct-line-dim');},
    clear:()=>{out.innerHTML='';},
    'hire me':()=>{
      successSound();
      ['██╗  ██╗██╗██████╗ ███████╗','██║  ██║██║██╔══██╗██╔════╝','███████║██║██████╔╝█████╗  ','██╔══██║██║██╔══██╗██╔══╝  ','██║  ██║██║██║  ██║███████╗','╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝'].forEach((l,i)=>setTimeout(()=>print(l,'ct-line-ascii'),i*80));
      setTimeout(()=>print('INITIATING CONTACT PROTOCOL... ✓','ct-line-green'),700);
      setTimeout(()=>print('→ contact@divvyansh.dev','ct-line-blue'),900);
    },
  };
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const cmd=inp.value.trim().toLowerCase();
      if(!cmd) return;
      print(`$ ${cmd}`,'ct-line-dim');
      termHistory.unshift(cmd); termHistIdx=-1;
      if(CMDS[cmd]) CMDS[cmd]();
      else if(cmd==='sudo make me a sandwich') print('🥪 Here\'s your sandwich, root!','ct-line-yellow');
      else print(`command not found: ${cmd}. Type 'help'`,'ct-line-dim');
      inp.value='';
      clickSound();
    }
    if(e.key==='ArrowUp'){termHistIdx=Math.min(termHistIdx+1,termHistory.length-1);inp.value=termHistory[termHistIdx]||'';}
    if(e.key==='ArrowDown'){termHistIdx=Math.max(termHistIdx-1,-1);inp.value=termHistIdx===-1?'':termHistory[termHistIdx];}
    if(e.key==='Tab'){e.preventDefault();const partial=inp.value;const match=Object.keys(CMDS).find(k=>k.startsWith(partial));if(match)inp.value=match;}
  });
}

// ── TERMINAL PANEL ──
function toggleTermPanel(){
  termOpen=!termOpen;
  document.getElementById('term-panel').classList.toggle('open',termOpen);
  if(termOpen){
    const out=document.getElementById('term-output');
    if(!out.innerHTML){
      out.innerHTML=`<div style="color:#58a6ff">$ docker exec -it ${activeContainer} /bin/sh</div>`;
    }
    document.getElementById('term-input').focus();
    clickSound();
  }
}
function showLogs(){
  termOpen=true;
  const panel=document.getElementById('term-panel');
  panel.classList.add('open');
  const out=document.getElementById('term-output');
  out.innerHTML='';
  const logs=['[INFO] Container logs for: '+activeContainer,'[INFO] Starting application server...','[INFO] Health check passed','[DEBUG] Memory usage: 42MB','[INFO] Ready on port '+(3000+CONTAINERS.findIndex(c=>c.id===activeContainer))];
  logs.forEach((l,i)=>setTimeout(()=>{const d=document.createElement('div');d.style.color=l.includes('INFO')?'#3fb950':l.includes('DEBUG')?'#e3b341':'#8b949e';d.textContent=l;out.appendChild(d);out.scrollTop=out.scrollHeight;},i*120));
  clickSound();
}
function showInspect(){
  termOpen=true;
  const panel=document.getElementById('term-panel');
  panel.classList.add('open');
  const out=document.getElementById('term-output');
  out.innerHTML=`<div style="color:#e3b341">[</div><div style="color:#8b949e">&nbsp;&nbsp;{</div><div style="color:#8b949e">&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#79c0ff">"Id"</span>: <span style="color:#a5d6ff">"${Math.random().toString(16).slice(2,14)}..."</span>,</div><div style="color:#8b949e">&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#79c0ff">"Name"</span>: <span style="color:#a5d6ff">"/${activeContainer}"</span>,</div><div style="color:#8b949e">&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#79c0ff">"State"</span>: { <span style="color:#79c0ff">"Status"</span>: <span style="color:#3fb950">"running"</span> },</div><div style="color:#8b949e">&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#79c0ff">"Image"</span>: <span style="color:#a5d6ff">"divvyansh/portfolio:latest"</span></div><div style="color:#8b949e">&nbsp;&nbsp;}</div><div style="color:#e3b341">]</div>`;
  clickSound();
}
function termPrint(text, cls='ct-line-white') {
  const out = document.getElementById('term-output');
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = text;
  out.appendChild(d);
  out.scrollTop = out.scrollHeight;
}

const TERM_CMDS = {
  help: () => {
    termPrint('Available commands:', 'ct-line-yellow');
    ['ls', 'pwd', 'cat', 'echo', 'docker ps', 'docker images', 'clear', 'date', 'whoami'].forEach(c => termPrint(`  <span style="color:#58a6ff">${c}</span>`, 'ct-line-white'));
  },
  ls: () => {
    termPrint('about.html  skills.json  projects.md  certs.pem  contact.txt', 'ct-line-blue');
  },
  pwd: () => termPrint('/var/www/portfolio', 'ct-line-white'),
  date: () => termPrint(new Date().toString(), 'ct-line-white'),
  whoami: () => termPrint('divvyansh', 'ct-line-white'),
  clear: () => { document.getElementById('term-output').innerHTML = ''; },
  'docker ps': () => {
    termPrint('CONTAINER ID   IMAGE                        COMMAND   CREATED        STATUS          PORTS                    NAMES', 'ct-line-dim');
    CONTAINERS.forEach((c,i) => {
      termPrint(`${Math.random().toString(16).slice(2,14)}   divvyansh/portfolio:latest   "node server.js"   ${i*2+1} days ago   ${c.state === 'running' ? 'Up '+(i*2+1)+' days' : 'Exited (0)'}   0.0.0.0:${c.port}->${c.port}/tcp   ${c.id}`, 'ct-line-white');
    });
  },
  'docker images': () => {
    termPrint('REPOSITORY              TAG       IMAGE ID       CREATED        SIZE', 'ct-line-dim');
    termPrint('divvyansh/portfolio     latest    a1b2c3d4e5f6   2 weeks ago    412MB', 'ct-line-white');
    termPrint('node                    18        b2c3d4e5f6a1   4 weeks ago    980MB', 'ct-line-white');
  }
};

document.getElementById('term-input').addEventListener('keydown', e => {
  const inp = document.getElementById('term-input');
  if (e.key === 'Enter') {
    const cmdStr = inp.value.trim();
    if (!cmdStr) return;
    
    termPrint(`$ ${cmdStr}`, 'ct-line-dim');
    termHistory.unshift(cmdStr);
    termHistIdx = -1;
    
    const cmd = cmdStr.toLowerCase();
    if (TERM_CMDS[cmd]) {
      TERM_CMDS[cmd]();
    } else if (cmd.startsWith('echo ')) {
      termPrint(cmdStr.slice(5), 'ct-line-white');
    } else if (cmd.startsWith('cat ')) {
      const file = cmdStr.slice(4).trim();
      if (file === 'about.html') termPrint('&lt;h1&gt;Divvyansh Kudesiaa&lt;/h1&gt;', 'ct-line-white');
      else if (file === 'contact.txt') termPrint('contact@divvyansh.dev', 'ct-line-white');
      else termPrint(`cat: ${file}: No such file or directory`, 'ct-line-yellow');
    } else {
      termPrint(`command not found: ${cmdStr}. Type 'help'`, 'ct-line-dim');
    }
    inp.value = '';
    clickSound();
  }
  if (e.key === 'ArrowUp') {
    termHistIdx = Math.min(termHistIdx + 1, termHistory.length - 1);
    inp.value = termHistory[termHistIdx] || '';
  }
  if (e.key === 'ArrowDown') {
    termHistIdx = Math.max(termHistIdx - 1, -1);
    inp.value = termHistIdx === -1 ? '' : termHistory[termHistIdx];
  }
});

// ── CONTEXT MENU ──
function showCtxMenu(x,y){
  const m=document.getElementById('ctx-menu');
  m.style.left=x+'px'; m.style.top=y+'px';
  m.classList.add('show');
}
function ctxAction(a, targetId){
  document.getElementById('ctx-menu').classList.remove('show');
  const target = targetId || ctxTarget;
  const c = CONTAINERS.find(x => x.id === target);
  if(!c) return;

  if(a==='browser') {
    if (c.state === 'running') navigateTo(target);
    else beep(200,.1,.06);
  }
  if(a==='terminal' || a==='logs') {
    if (c.state === 'running') {
      a === 'terminal' ? toggleTermPanel() : showLogs();
    } else beep(200,.1,.06);
  }
  if(a==='stop') {
    if (c.state === 'running') {
      c.state = 'exited';
      beep(300,.1,.06);
      if (activeContainer === target) {
         navigateTo(target); // Trigger the re-render to show "Stopped" screen
      }
      renderSidebar(document.getElementById('sb-search-input').value);
    }
  }
  if(a==='restart') {
    c.state = 'running';
    beep(600,.08,.06);
    if (activeContainer === target) {
      navigateTo(target);
    }
    renderSidebar(document.getElementById('sb-search-input').value);
  }
  if(a==='delete') {
    CONTAINERS = CONTAINERS.filter(x => x.id !== target);
    beep(200,.15,.07);
    if (activeContainer === target) {
         const firstRunning = CONTAINERS.find(x => x.state === 'running') || CONTAINERS[0];
         if (firstRunning) navigateTo(firstRunning.id);
         else {
            document.getElementById('content-area').innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--text-dim);font-family:var(--font-mono);">No containers available. Run docker compose up.</div>';
         }
    }
    renderSidebar(document.getElementById('sb-search-input').value);
    renderTabs();
  }
}
document.addEventListener('click',()=>document.getElementById('ctx-menu').classList.remove('show'));

// ── COMPOSE FLOAT ──
function runCompose(){
  const panel=document.getElementById('term-panel');
  termOpen=true; panel.classList.add('open');
  const out=document.getElementById('term-output');
  out.innerHTML='';
  const lines=[
    {t:'$ docker compose up --build',c:'#58a6ff'},
    {t:'[+] Building 2.3s (12/12) FINISHED',c:'#e3b341'},
    {t:'[+] Running 6/6',c:'#e3b341'},
    {t:' ✔ Container about        Started   0.4s',c:'#3fb950'},
    {t:' ✔ Container skills       Started   0.5s',c:'#3fb950'},
    {t:' ✔ Container projects     Started   0.6s',c:'#3fb950'},
    {t:' ✔ Container achievements Started   0.7s',c:'#3fb950'},
    {t:' ✔ Container certs        Started   0.8s',c:'#3fb950'},
    {t:' ✔ Container contact      Started   0.9s',c:'#3fb950'},
  ];
  lines.forEach((l,i)=>setTimeout(()=>{
    const d=document.createElement('div');
    d.style.cssText=`font-family:var(--font-mono);font-size:12px;color:${l.c};line-height:1.7`;
    d.textContent=l.t; out.appendChild(d); out.scrollTop=out.scrollHeight;
    beep(440+i*40,.04,.04);
  },i*180));
}

// ── BOOT SEQUENCE ──
function boot(){
  const lines=[
    {t:'$ docker compose up --build',c:'#58a6ff',d:0},
    {t:'[+] Building divvyansh/portfolio...',c:'#8b949e',d:400},
    {t:'[+] Pulling base layers...',c:'#8b949e',d:900},
    {t:'████████████████░░░░ 82%',c:'#e3b341',d:1400},
    {t:'████████████████████ 100% — Done',c:'#3fb950',d:2000},
    {t:'[+] Running 6/6',c:'#e3b341',d:2500},
    {t:' ✔ Container about        Started',c:'#3fb950',d:2800},
    {t:' ✔ Container skills       Started',c:'#3fb950',d:3000},
    {t:' ✔ Container projects     Started',c:'#3fb950',d:3200},
    {t:' ✔ Container achievements Started',c:'#3fb950',d:3400},
    {t:' ✔ Container certs        Started',c:'#3fb950',d:3600},
    {t:' ✔ Container contact      Started',c:'#3fb950',d:3800},
    {t:'',c:'',d:4000},
    {t:'> Portfolio server started → http://localhost:3000',c:'#58a6ff',d:4200},
  ];
  const container=document.getElementById('boot-lines');
  lines.forEach(l=>{
    setTimeout(()=>{
      if(l.t){const d=document.createElement('div');d.style.cssText=`color:${l.c};font-size:13px;line-height:1.7;`;d.textContent=l.t;container.appendChild(d);}
      beep(600+Math.random()*200,.02,.03);
    },l.d);
  });
  setTimeout(()=>{
    document.getElementById('boot').classList.add('fade-out');
    setTimeout(()=>{
      document.getElementById('boot').style.display='none';
      document.getElementById('app').classList.add('visible');
      AC.resume();
      startSound();
    },600);
  },5000);
}

// ── INIT ──
renderSidebar();
renderTabs();
renderPage('about');
boot();
