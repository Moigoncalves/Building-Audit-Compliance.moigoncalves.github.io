</head>
<body>
  <canvas id="starfield"></canvas>

  <header>
    <div class="live-indicator">
      <div class="dot"></div>
      <div id="liveText">LIVE --</div>
    </div>
    <h1>Building Audit Tracker</h1>
    <button id="btnSave" class="save-btn">Save Changes</button>
  </header>

  <div class="container">
    <h2>Safety Audit Tracker</h2>
    <p class="lead">Monitor AO & TPS completion across all buildings and teams.</p>

    <div class="tab-container" id="buildingTabs"></div>

    <div style="text-align:center; margin-bottom:30px;">
      <button class="btn" id="btnHome">Home</button>
      <button class="btn" id="btnAddBuilding">Add Building</button>
      <button class="btn" id="btnShowBuildings">Show All Buildings</button>
    </div>

    <form id="managerForm" class="inline-form">
      <input type="text" name="name" placeholder="Manager Name" required>
      <input type="text" name="shift" placeholder="Shift" required>
      <button class="btn" type="submit">Add Manager</button>
    </form>

    <div class="manager-grid" id="managerTabs"></div>
  </div>

  <footer><p>© 2025 Audit Tracker</p></footer>

  <script>
    // Starfield
    const canvas = document.getElementById('starfield'),
          ctx    = canvas.getContext('2d');
    let w,h,stars = [];
    function initStars(){
      w=canvas.width=window.innerWidth;
      h=canvas.height=window.innerHeight;
      stars=[];
      for(let i=0;i<200;i++){
        stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2});
      }
    }
    function animStars(){
      ctx.clearRect(0,0,w,h);
      stars.forEach(s=>{
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,2*Math.PI);
        ctx.fillStyle='#fff'; ctx.fill();
        s.x+=0.15; if(s.x>w) s.x=0;
      });
      requestAnimationFrame(animStars);
    }
    window.onresize=initStars;
    initStars(); animStars();

    // Live clock
    function updateLive(){
      const now=new Date(),
            tz=Intl.DateTimeFormat().resolvedOptions().timeZone,
            ts=now.toLocaleTimeString();
      document.getElementById('liveText').textContent = `LIVE • ${tz} • ${ts}`;
    }
    setInterval(updateLive,1000);
    updateLive();

    // — your existing logic below unchanged —

    const shiftOrder=["FHD","FHN","BHD","RT","M-F"], 
          predefinedBuildings=[
            {name:"AVP9",password:"passwordAVP9"},{name:"AZA4",password:"passwordAZA4"},
            {name:"BDL6",password:"passwordBDL6"},{name:"BFI7",password:"passwordBFI7"},
            {name:"CLT6",password:"passwordCLT6"},{name:"DEN7",password:"passwordDEN7"},
            {name:"DTW3",password:"passwordDTW3"},{name:"FTW2",password:"passwordFTW2"},
            {name:"HGR2",password:"passwordHGR2"},{name:"HOU7",password:"passwordHOU7"},
            {name:"HSV2",password:"passwordHSV2"},{name:"LGB9",password:"passwordLGB9"},
            {name:"MCI3",password:"passwordMCI3"},{name:"MDW8",password:"passwordMDW8"},
            {name:"MEM8",password:"passwordMEM8"},{name:"MQJ2",password:"passwordMQJ2"},
            {name:"MSP6",password:"passwordMSP6"},{name:"PBI2",password:"passwordPBI2"},
            {name:"PDX6",password:"passwordPDX6"},{name:"RFD4",password:"passwordRFD4"},
            {name:"SAT6",password:"passwordSAT6"},{name:"SCK3",password:"passwordSCK3"},
            {name:"SLC3",password:"passwordSLC3"},{name:"SMF7",password:"passwordSMF7"},
            {name:"STL6",password:"passwordSTL6"},{name:"TPA6",password:"passwordTPA6"},
            {name:"TTN2",password:"passwordTTN2"},{name:"YGK1",password:"passwordYGK1"},
            {name:"YYC6",password:"passwordYYC6"}
          ];

    let currentBuilding = null;

    document.addEventListener('DOMContentLoaded',()=>{
      document.getElementById('btnShowBuildings').onclick = showBuildings;
      document.getElementById('btnAddBuilding').onclick   = addBuilding;
      document.getElementById('btnHome').onclick          = goHome;
      document.getElementById('btnSave').onclick          = saveChanges;
      document.getElementById('managerForm').onsubmit     = e=>{
        e.preventDefault();
        addManager(e.target.name.value.trim(),e.target.shift.value.trim());
        e.target.reset();
      };
      showBuildings();
    });

    function showBuildings(){
      goHome();
      const tabs = document.getElementById('buildingTabs');
      tabs.innerHTML = '';
      predefinedBuildings.forEach(b=>{
        const btn = document.createElement('button');
        btn.className = 'tab-button';
        btn.textContent = b.name;
        btn.onclick = ()=>openBuilding(b);
        tabs.appendChild(btn);
      });
    }
    function addBuilding(){
      const n=prompt('New building name:'); if(!n) return;
      const p=prompt(`Set password for ${n}:`); if(!p) return;
      predefinedBuildings.push({name:n,password:p});
      showBuildings();
    }
    function openBuilding(b){
      const pwd=prompt(`Password for ${b.name}:`);
      if(pwd!==b.password){ alert('Incorrect'); return; }
      currentBuilding=b.name;
      document.querySelectorAll('.tab-button').forEach(tb=>
        tb.classList.toggle('active', tb.textContent===b.name)
      );
      document.getElementById('managerForm').style.display='flex';
      renderManagers();
    }
    function goHome(){
      currentBuilding=null;
      document.getElementById('managerForm').style.display='none';
      document.getElementById('managerTabs').innerHTML='';
      document.querySelectorAll('.tab-button').forEach(tb=>tb.classList.remove('active'));
    }
    function renderManagers(){
      const grid=document.getElementById('managerTabs');
      grid.innerHTML='';
      const list=JSON.parse(localStorage.getItem(currentBuilding)||'[]');
      list.sort((a,b)=>shiftOrder.indexOf(a.shift)-shiftOrder.indexOf(b.shift));
      list.forEach(m=>{
        const c=document.createElement('div'); c.className='manager-card';
        if(m.ooto){
          c.innerHTML= `<h3>${m.name}</h3>
                        <div class="status"><span class="completed">OOTO</span></div>
                        <button class="ooto-button">Undo OOTO</button>`;
          c.querySelector('.ooto-button').onclick = ()=>toggleOOTO(m.name);
        } else {
          c.innerHTML= `<h3>${m.name}</h3>
                        <p>Shift: ${m.shift}</p>
                        <div class="status">
                          <span class="not-completed ao-status">AO: Not Completed</span>
                          <span class="not-completed tps-status">TPS: Not Completed</span>
                        </div>
                        <button class="ooto-button">OOTO</button>
                        <button class="delete-button">Delete</button>`;
          c.querySelector('.ao-status').onclick  = e=>toggleStatus(e.target,'ao');
          c.querySelector('.tps-status').onclick = e=>toggleStatus(e.target,'tps');
          c.querySelector('.ooto-button').onclick= ()=>toggleOOTO(m.name);
          c.querySelector('.delete-button').onclick=()=>deleteManager(m.name);
        }
        grid.appendChild(c);
      });
    }
    function addManager(n,s){
      if(!currentBuilding) return alert('Select a building');
      let arr = JSON.parse(localStorage.getItem(currentBuilding)||'[]');
      if(arr.some(x=>x.name===n)) return alert('Duplicate');
      arr.push({name:n,shift:s,ooto:false,ao:'Not Completed',tps:'Not Completed'});
      localStorage.setItem(currentBuilding,JSON.stringify(arr));
      renderManagers();
    }
    function deleteManager(n){
      let arr = JSON.parse(localStorage.getItem(currentBuilding)||'[]');
      arr = arr.filter(x=>x.name!==n);
      localStorage.setItem(currentBuilding,JSON.stringify(arr));
      renderManagers();
    }
    function toggleOOTO(n){
      let arr = JSON.parse(localStorage.getItem(currentBuilding)||'[]');
      arr = arr.map(x=>x.name===n?{...x,ooto:!x.ooto}:x);
      localStorage.setItem(currentBuilding,JSON.stringify(arr));
      renderManagers();
    }
    function toggleStatus(el,t){
      const nm=el.closest('.manager-card').querySelector('h3').textContent;
      let arr = JSON.parse(localStorage.getItem(currentBuilding)||'[]');
      arr = arr.map(x=>{
        if(x.name===nm){
          if(t==='ao') x.ao = x.ao!=='Completed'?'Completed':'Not Completed';
          else x.tps = x.tps==='2/2'?'Not Completed': x.tps==='1/2'?'2/2':'1/2';
        }
        return x;
      });
      localStorage.setItem(currentBuilding,JSON.stringify(arr));
      renderManagers();
    }
    function saveChanges(){
      if(!currentBuilding) return alert('Select a building');
      let updated=[];
      document.querySelectorAll('.manager-card').forEach(c=>{
        const name = c.querySelector('h3').textContent;
        const shiftText = c.querySelector('p')?.textContent.replace('Shift: ','')||'';
        const ao = c.querySelector('.ao-status')?.textContent.replace('AO: ','')||'Not Completed';
        const tps= c.querySelector('.tps-status')?.textContent.replace('TPS: ','')||'Not Completed';
        const ooto = c.querySelector('.ooto-button')?.textContent==='Undo OOTO';
        updated.push({name,shift:shiftText,ao,tps,ooto});
      });
      localStorage.setItem(currentBuilding,JSON.stringify(updated));
      alert('Changes saved!');
    }