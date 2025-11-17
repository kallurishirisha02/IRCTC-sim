# IRCTC-sim

Simple IRCTC booking simulation (Assignment/demo).

## Live demo
[https://irctc-sim.onrender.com/]

## Features
- User signup/login
- Profile management
- Mock payment (save UPI/credit)
- Passenger master (save & reuse passengers)
- Search trains by Source / Destination / Date
- Book seats (Sleeper / AC / Seater)
- Booking confirmation & cancellation
- Admin UI to add train routes

## Tech stack
- Node.js + Express
- HTML, CSS, JavaScript (frontend)
- db.json used as simple local store

## Run locally
1. Clone repo:
   `git clone https://github.com/kallurishirisha02/IRCTC-sim.git`
2. Install:
   `npm install`
3. Start server:
   `node server.js` or `npx nodemon server.js`
4. Open:
   `http://localhost:4000` (or port defined in server.js)

## Notes
- This is a demo app. Payment is mocked and data is stored in db.json for demonstration only.
- Remove `node_modules` before sharing repo or use `.gitignore` to avoid large push.

## Contact
Project author: kalluri shirisha (GitHub: kallurishirisha02)
