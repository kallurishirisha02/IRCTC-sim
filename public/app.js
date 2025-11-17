// app.js
const api = (path, opts) => fetch(path, opts).then(r => r.json());

let token = localStorage.getItem('token');
let userId = token;

const el = id => document.getElementById(id);

function show(msg, elId='authMsg') { document.getElementById(elId).innerText = msg || ''; }

async function refreshUser() {
  if(!userId) return;
  const data = await api(`/api/user/${userId}`);
  if(data.error) { logout(); return; }
  el('userLabel').innerText = `Logged in: ${data.email}`;
  el('profileName').value = data.name || data.profile.name || '';
  el('phone').value = data.profile.phone || '';
  const pl = el('passengerList'); pl.innerHTML = '';
  (data.passengers || []).forEach(p => {
    const li = document.createElement('li');
    li.innerText = `${p.name} (${p.age}) ${p.gender}`;
    pl.appendChild(li);
  });
  const bl = el('bookingsList'); bl.innerHTML = '';
  (data.bookings || []).forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${b.trainName}</b> | ${b.className} | ${b.date} | ${b.status} | ₹${b.amount}
    <button data-id="${b.id}" class="cancelBtn">Cancel</button>`;
    bl.appendChild(li);
  });
  Array.from(document.getElementsByClassName('cancelBtn')).forEach(btn => {
    btn.onclick = async () => {
      const bid = btn.dataset.id;
      await api(`/api/user/${userId}/cancel`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bookingId: bid })});
      refreshUser();
    };
  });
}

function showApp(showIt) {
  el('appArea').style.display = showIt ? 'block' : 'none';
  el('auth').style.display = showIt ? 'none' : 'block';
}

el('signupBtn').onclick = async () => {
  const email = el('email').value.trim(), password = el('password').value, name = el('name').value;
  const res = await api('/api/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, name })});
  if(res.error) show(res.error);
  else show('Signup success. Now login.');
};

el('loginBtn').onclick = async () => {
  const email = el('email').value.trim(), password = el('password').value;
  const res = await api('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
  if(res.error) return show(res.error);
  token = res.token; userId = token;
  localStorage.setItem('token', token);
  showApp(true);
  refreshUser();
};

el('logoutBtn').onclick = () => { logout(); };
function logout() { token = null; userId = null; localStorage.removeItem('token'); showApp(false); }

el('saveProfile').onclick = async () => {
  const name = el('profileName').value, phone = el('phone').value;
  await api(`/api/user/${userId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, profile:{ phone }})});
  show('Profile saved', 'authMsg');
  refreshUser();
};

el('savePayment').onclick = async () => {
  const payment = { card: el('card').value || 'mock' };
  await api(`/api/user/${userId}/payment`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payment })});
  show('Payment saved', 'paymentMsg');
};

el('addPassenger').onclick = async () => {
  const p = { name: el('pName').value, age: el('pAge').value, gender: el('pGender').value };
  await api(`/api/user/${userId}/passenger`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p)});
  el('pName').value=''; el('pAge').value='';
  refreshUser();
};

el('searchBtn').onclick = async () => {
  const source = el('sSource').value.trim(), dest = el('sDest').value.trim(), date = el('sDate').value;
  const q = new URLSearchParams();
  if(source) q.set('source', source);
  if(dest) q.set('dest', dest);
  const trains = await api(`/api/trains?${q.toString()}`);
  const r = el('trainResults'); r.innerHTML = '';
  trains.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${t.name}</b> ${t.source} → ${t.destination} | ${t.duration}
      <div>Seats: sleeper ${t.availability.sleeper}, ac ${t.availability.ac}, seater ${t.availability.seater}</div>
      <button data-id="${t.id}" data-class="sleeper">Book Sleeper</button>
      <button data-id="${t.id}" data-class="ac">Book AC</button>
      <button data-id="${t.id}" data-class="seater">Book Seater</button>`;
    r.appendChild(li);
  });
  Array.from(r.querySelectorAll('button')).forEach(btn => {
    btn.onclick = async () => {
      const trainId = btn.dataset.id, className = btn.dataset.class;
      const count = parseInt(prompt('How many passengers to book? (Enter number)'), 10);
      if(!count || count <= 0) return alert('invalid number');
      const passengers = [];
      for(let i=0;i<count;i++){
        const name = prompt(`Passenger ${i+1} name`);
        const age = prompt('Age');
        const gender = prompt('Gender (M/F/O)');
        const berth = prompt('Berth preference (Lower/Upper/No pref)');
        passengers.push({ name, age, gender, berth });
      }
      const res = await api(`/api/user/${userId}/book`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ trainId, className, passengers, date: el('sDate').value || (new Date()).toISOString().slice(0,10) })});
      if(res.error) alert('Booking failed: ' + res.error);
      else { alert('Booked! Booking id: ' + res.booking.id); refreshUser(); }
    };
  });
};

el('addTrainBtn').onclick = async () => {
  const name = el('aName').value, src = el('aSrc').value, dest = el('aDest').value, dur = el('aDur').value;
  const res = await api(`/api/admin/train`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, source: src, destination: dest, duration: dur })});
  el('adminMsg').innerText = res.message || JSON.stringify(res);
};

if(userId) { showApp(true); refreshUser(); }
