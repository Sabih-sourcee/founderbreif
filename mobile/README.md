# FounderBrief Mobile (Expo)

Native Android/iOS app — same product as the web app.

## Run

**Terminal 1 — API (project root):**
```bash
cd ..
npm run dev
```
Runs at `http://localhost:3000`

**Terminal 2 — Mobile:**
```bash
npm install
npm run start -- --clear
```

## Phone setup

In `.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3000
```

The mobile app calls `POST /api/generate-brief` on the same Express server as the web app.
