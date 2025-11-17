# IRCTC Booking Simulation

Live demo: https://irctc-sim.onrender.com  
GitHub repo: https://github.com/kallurishirisha02/IRCTC-sim

## How to run locally
1. `git clone https://github.com/kallurishirisha02/IRCTC-sim.git`
2. `cd IRCTC-sim`
3. `npm install`
4. `npm start` (server runs on http://localhost:4000)
   or for dev:
   `npx nodemon server.js`

## Environment variables (for hosted deployment)
- `ADMIN_SECRET` — admin secret to access debug/admin endpoints (set this in hosting dashboard)

## What this project implements
- User signup / login (mock auth)
- Profile management
- Passenger master list (save passengers)
- Search trains (source, destination, date)
- Check availability, book seats (sleeper, AC, seater)
- Payment (mock)
- Booking confirmation & cancellation
- Admin: add train routes

## How to view stored backend data
- Live backend (on Render) stores data in `db.json`. For quick admin view use:
  `https://irctc-sim.onrender.com/admin`  (requires `ADMIN_SECRET`)

