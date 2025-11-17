// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const DB_FILE = path.join(__dirname, 'db.json');
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const makeId = () => Math.random().toString(36).slice(2, 9);

// --- Auth (very simple)
app.post('/api/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const db = readDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'email exists' });
  const user = { id: makeId(), email, password, name: name || '', profile: {}, payment: {}, passengers: [], bookings: [] };
  db.users.push(user);
  writeDB(db);
  res.json({ message: 'signed up', userId: user.id });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  res.json({ message: 'ok', token: user.id });
});

app.get('/api/user/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json({ id: user.id, email: user.email, name: user.name, profile: user.profile, payment: user.payment, passengers: user.passengers, bookings: user.bookings });
});

app.put('/api/user/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (req.body.profile) Object.assign(user.profile, req.body.profile);
  if (req.body.name) user.name = req.body.name;
  writeDB(db);
  res.json({ message: 'updated' });
});

app.post('/api/user/:id/payment', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  user.payment = req.body.payment || {};
  writeDB(db);
  res.json({ message: 'payment saved' });
});

app.post('/api/user/:id/passenger', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const p = { id: makeId(), ...req.body };
  user.passengers.push(p);
  writeDB(db);
  res.json({ message: 'passenger added', passenger: p });
});

app.get('/api/trains', (req, res) => {
  const db = readDB();
  let trains = db.trains;
  const { source, dest } = req.query;
  if (source) trains = trains.filter(t => t.source.toLowerCase() === source.toLowerCase());
  if (dest) trains = trains.filter(t => t.destination.toLowerCase() === dest.toLowerCase());
  res.json(trains);
});

app.post('/api/admin/train', (req, res) => {
  const db = readDB();
  const t = { id: makeId(), ...req.body };
  t.availability = t.availability || { sleeper: 50, ac: 20, seater: 60 };
  db.trains.push(t);
  writeDB(db);
  res.json({ message: 'train added', train: t });
});

app.get('/api/train/:id/availability', (req, res) => {
  const db = readDB();
  const train = db.trains.find(t => t.id === req.params.id);
  if (!train) return res.status(404).json({ error: 'train not found' });
  res.json({ availability: train.availability });
});

app.post('/api/user/:id/book', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const { trainId, className, passengers, date } = req.body;
  const train = db.trains.find(t => t.id === trainId);
  if (!train) return res.status(404).json({ error: 'train not found' });
  const seatsLeft = train.availability[className] || 0;
  if (seatsLeft < passengers.length) return res.status(400).json({ error: 'not enough seats' });
  train.availability[className] = seatsLeft - passengers.length;
  const booking = {
    id: makeId(),
    trainId,
    trainName: train.name,
    className,
    passengers,
    date,
    status: 'CONFIRMED',
    amount: (passengers.length * (className === 'ac' ? 800 : className === 'sleeper' ? 300 : 200))
  };
  user.bookings.push(booking);
  writeDB(db);
  res.json({ message: 'booked', booking });
});

app.post('/api/user/:id/cancel', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const { bookingId } = req.body;
  const booking = user.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: 'booking not found' });
  if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'already cancelled' });
  const train = db.trains.find(t => t.id === booking.trainId);
  if (train) train.availability[booking.className] += booking.passengers.length;
  booking.status = 'CANCELLED';
  writeDB(db);
  res.json({ message: 'cancelled', booking });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
