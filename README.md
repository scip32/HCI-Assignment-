# LaunderSmart — HCI Prototype

High-fidelity React/Vite prototype of a smart campus laundry app used for the TFB2033 HCI project (Jan 2026). The UI demonstrates biometric/SSO login, NFC wash start, live campus map, wallet top-up, and contextual machine reporting.

## Tech Stack
- React 19 + Vite 7
- Tailwind CSS + tailwindcss-animate
- lucide-react icon set

## Prerequisites
- Node.js **18+** (recommended) and npm.

## Installation & Local Run
```bash
# install dependencies
npm install

# start dev server (default: http://localhost:5173)
npm run dev

# build for production
npm run build

# preview the production build
npm run preview
```

## Demo Pointers
- Click the RM balance pill to simulate a low-balance state (turns red) and jump to the Wallet tab.
- Try the Home → NFC wash flow, Rooms map/list, Wallet top-up, and Profile reporting to show key interactions.

## How to Publish on GitHub
1) Create a new empty repo on GitHub (do **not** add a starter README/LICENCE/ignore).  
2) In this folder run:
```bash
git init
git add .
git commit -m "Initial commit: LaunderSmart prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
If you already have a repo, just update the `remote add` line with your URL.

## Notes
- `node_modules/` and `dist/` are ignored via `.gitignore`.
- The prototype is front-end only; NFC/payment/map behaviors are simulated for demo purposes.
