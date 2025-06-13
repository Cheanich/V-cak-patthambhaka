// Tabs
const spinTab      = document.getElementById('spinTab'),
      groupTab     = document.getElementById('groupTab'),
      spinSection  = document.getElementById('spinSection'),
      groupSection = document.getElementById('groupSection');
spinTab.onclick = () => {
  spinTab.classList.add('active');
  groupTab.classList.remove('active');
  spinSection.classList.remove('hidden');
  groupSection.classList.add('hidden');
};
groupTab.onclick = () => {
  groupTab.classList.add('active');
  spinTab.classList.remove('active');
  groupSection.classList.remove('hidden');
  spinSection.classList.add('hidden');
};

// Audio elements
const spinSound   = document.getElementById('spinSound'),
      resultSound = document.getElementById('resultSound');

// Result panel & buttons (grab once)
const panel       = document.getElementById('resultPanel'),
      btnAdd      = document.getElementById('btnAdd'),
      btnRemove   = document.getElementById('btnRemove'),
      btnClose    = document.getElementById('btnClose');

btnAdd.onclick = () => panel.classList.add('hidden');
btnRemove.onclick = () => {
  const idx = panel.dataset.current;
  names.splice(idx, 1);
  renderNamesTable();
  drawWheel();
  panel.classList.add('hidden');
};
btnClose.onclick = () => panel.classList.add('hidden');

// Spin Section Logic
const nameInput      = document.getElementById('nameInput'),
      importNames    = document.getElementById('importNames'),
      clearNames     = document.getElementById('clearNames'),
      namesTableBody = document.querySelector('#namesTable tbody');
let names = [];

importNames.onclick = () => {
  names = nameInput.value.split('\n').map(n => n.trim()).filter(n => n);
  renderNamesTable();
  drawWheel();
};
clearNames.onclick = () => { names = []; renderNamesTable(); drawWheel(); };

function renderNamesTable(){
  namesTableBody.innerHTML = '';
  names.forEach((n, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${n}</td>
      <td>
        <div class="table-buttons">
          <button onclick="addName(${i})">បន្ថែម</button>
          <button onclick="toggleName(${i})">បិទ</button>
        </div>
      </td>`;
    namesTableBody.appendChild(tr);
  });
}
function toggleName(i){ names.splice(i,1); renderNamesTable(); drawWheel(); }
function addName(i){ const d=names[i]; names.splice(i+1,0,d); renderNamesTable(); drawWheel(); }

const canvas       = document.getElementById('wheelCanvas'),
      ctx          = canvas.getContext('2d'),
      spinButton   = document.getElementById('spinButton');
let startAngle = 0, arc = 0;
const colors = [
  '#FBE89E','#F7B239','#ABA240','#2E591C',
  '#FBE89E','#F7B239','#ABA240','#2E591C'
];

function drawWheel(){
  const len = names.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!len) return;

  arc = 2 * Math.PI / len;
  const center = canvas.width/2,
        radius = center;
  ctx.font = '10px Khmer OS Battambang';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  names.forEach((n, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, angle, angle + arc);
    ctx.fill();

    ctx.save();
    ctx.translate(
      center + Math.cos(angle + arc/2) * (radius * 0.6),
      center + Math.sin(angle + arc/2) * (radius * 0.6)
    );
    ctx.rotate(angle + arc/2);
    ctx.fillStyle = '#000';
    ctx.fillText(n, 0, 0);
    ctx.restore();
  });
}

// Spin & audio control
spinButton.onclick = () => {
  if (!names.length) return;

  // Spin sound loops during animation
  spinSound.loop = true;
  spinSound.currentTime = 0;
  spinSound.play();

  const duration = 3000,
        maxSpeed = (Math.random()*10 + 10) * Math.PI/180,
        start    = performance.now();
  const easeOut = t => 1 - (1-t)*(1-t);

  panel.classList.add('hidden');

  function animate(now){
    const progress = Math.min((now - start)/duration, 1);
    startAngle = (easeOut(progress) * maxSpeed * duration) % (2 * Math.PI);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Stop spin sound
      spinSound.pause();
      spinSound.currentTime = 0;

      // Show result
      const idx = Math.floor(((2*Math.PI - startAngle)/arc) % names.length);
      document.getElementById('panelResult').textContent = names[idx];
      panel.dataset.current = idx;
      panel.classList.remove('hidden');

      // Play result sound for 2 seconds
      resultSound.currentTime = 0;
      resultSound.play();
      setTimeout(() => {
        resultSound.pause();
        resultSound.currentTime = 0;
      }, 2000);
    }
  }

  requestAnimationFrame(animate);
};

// Group Work Logic (unchanged) …
const groupNameInput   = document.getElementById('groupNameInput'),
      importGroupNames = document.getElementById('importGroupNames'),
      clearGroupNames  = document.getElementById('clearGroupNames'),
      groupCountInput  = document.getElementById('groupCount'),
      distributeBtn    = document.getElementById('distributeGroups'),
      groupsContainer  = document.getElementById('groupsContainer');
let groupNames = [];

function toKhmerDigits(num){
  const khMap = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  return String(num).split('').map(d=>khMap[parseInt(d)]||d).join('');
}

importGroupNames.onclick = () => {
  groupNames = groupNameInput.value.split('\n').map(n=>n.trim()).filter(n=>n);
  renderGroups([groupNames]);
};
clearGroupNames.onclick = () => {
  groupNames = []; groupNameInput.value = '';
  renderGroups([]);
};
distributeBtn.onclick = () => {
  const count = parseInt(groupCountInput.value,10);
  if (!count || count < 1) {
    alert('សូមបញ្ចូលចំនួនក្រុមដែលត្រឹមត្រូវ');
    return;
  }
  const buckets = Array.from({length:count},()=>[]);
  groupNames.forEach((n,i)=> buckets[i % count].push(n));
  renderGroups(buckets);
};

function renderGroups(buckets){
  groupsContainer.innerHTML = '';
  buckets.forEach((members, idx) => {
    const div = document.createElement('div');
    div.className = 'group';
    div.innerHTML = `
      <h4>ក្រុម ${toKhmerDigits(idx+1)}</h4>
      <ul>${members.map((m,j)=>`<li>${toKhmerDigits(j+1)}. ${m}</li>`).join('')}</ul>`;
    groupsContainer.appendChild(div);
  });
}

document.getElementById('saveImage').onclick = () =>
  html2canvas(groupsContainer).then(canvas => {
    const link = document.createElement('a');
    link.download = 'groups.png';
    link.href = canvas.toDataURL();
    link.click();
  });
