# GST Billing — Mobile App (React Native / Expo)

The company-facing mobile app for the GST Billing backend. Companies log in,
add customers (parties), create bills (with or without GST), record payments,
and share invoice PDFs — all from a phone.

> Backend lives in `../Bed` (FastAPI + MySQL). Start it first.

---

## What's inside

| Screen | What it does |
|--------|--------------|
| **Login / Register** | Company sign-in and self sign-up (creates company + admin). |
| **Dashboard** | Admin panel: total billed / received / outstanding, paid·partial·pending counts, subscription status, and "Create New Bill". |
| **Invoices** | List with status filters; tap an invoice for details. |
| **Invoice detail** | Items, totals, GST breakup, **record payment**, **share/download PDF**, delete. |
| **Create Bill** | Pick a party, toggle GST, add line items, see live totals, save. |
| **Parties** | Add / edit / search customers. |
| **Settings** | Company profile, bank & UPI details, invoice prefix, default note, and **branding uploads** (logo, signature, stamp, payment QR), plus logout. |

Tech: Expo SDK 57, React Navigation 7, axios (JWT + auto refresh), Expo
SecureStore (token storage), Expo Sharing + FileSystem (PDF), Expo ImagePicker.

---

## Run it

### 1. Start the backend (in another terminal)
```bash
cd ../Bed
source .venv/bin/activate
# IMPORTANT: bind to 0.0.0.0 so your phone can reach it over Wi-Fi
uvicorn src.app:app --host 0.0.0.0 --port 8000
```

### 2. Start the app
```bash
cd mobile
npm install        # first time only
npx expo start
```

### 3. Open it
- Install **Expo Go** on your phone (App Store / Play Store).
- Make sure the **phone and Mac are on the same Wi-Fi**.
- Scan the QR code shown in the terminal with Expo Go (Android) or the Camera app (iOS).

The app auto-detects your Mac's IP from the Expo bundler and calls the API at
`http://<your-mac-ip>:8000/api` — no editing needed in most cases.

---

## If the app can't reach the backend

This is almost always a network/address issue, not the code.

1. **Backend must bind to `0.0.0.0`** (see step 1) — `localhost` only works for a simulator, not a real phone.
2. **Same Wi-Fi** for phone and computer.
3. **macOS firewall** may block Python — allow incoming connections for it
   (System Settings → Network → Firewall).
4. **Force the address manually:** open [src/api/config.ts](src/api/config.ts) and set
   ```ts
   const API_BASE_URL_OVERRIDE = 'http://192.168.1.5:8000/api'; // your Mac's LAN IP
   ```
   Find your IP with `ipconfig getifaddr en0`.

Test the API from the phone's browser: visiting `http://<mac-ip>:8000/health`
should show `{"status":"ok"}`.

---

## Notes
- A company can create bills only while its **subscription is active** (managed by
  the super admin on the backend). If it's expired, the app shows the status on
  the Dashboard and the backend returns a clear message.
- GST is **optional**: it only appears when the company has a GSTIN set
  (Settings). Toggle it per bill on the Create Bill screen.
- Simulators: `npx expo start` then press `i` (iOS, needs Xcode) or `a`
  (Android, needs Android Studio).

## Project structure
```
mobile/
├── App.tsx                 # providers + navigation root
└── src/
    ├── api/                # config (auto base URL), axios client, endpoints
    ├── auth/AuthContext.tsx
    ├── components/ui.tsx    # Button, Input, Card, Badge, Screen...
    ├── navigation/         # auth stack + bottom tabs + detail screens
    ├── screens/            # all screens
    ├── theme.ts
    └── types.ts            # types mirroring the backend
```
