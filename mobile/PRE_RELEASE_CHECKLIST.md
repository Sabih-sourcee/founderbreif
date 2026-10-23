# FounderBrief — Pre-Release Checklist

Run this **before every** `eas build -p android --profile production` and again before uploading the `.aab` to Play Console.  
Tick every box. If one fails, **do not upload**.

## Automated check (preferred)

From PowerShell:

```powershell
cd C:\Users\PC\Documents\founderbreif\mobile
.\scripts\pre-release-check.ps1
```

If you know Play’s last version code (e.g. `3`):

```powershell
.\scripts\pre-release-check.ps1 -MinVersionCode 3
```

Exit code `0` = ready to build. Exit code `1` = fix FAIL lines first.

---

## 0. Account & project (do this first)

| Check | Expected | How to verify |
|---|---|---|
| □ Logged into the right Expo account | `sabih-source` (`bookspower218@gmail.com`) | `npx eas-cli whoami` |
| □ Expo project ID | `53e234a3-5c39-4a3f-9191-f0e6bdd480e6` | `mobile/app.json` → `extra.eas.projectId` |
| □ Expo project slug | `@sabih-source/founderbrief` | Expo dashboard |
| □ **Wrong** project ID (do not use) | ~~`c1d8b43a-3276-4987-ba7c-9f26836de165`~~ | If this appears, builds fail with “Entity Not Authorized” |

---

## 1. Package name (Play listing vs app)

Play rejects the upload if these do not match **exactly** (spelling included).

| Check | Expected | How to verify |
|---|---|---|
| □ Android package in `app.json` | `com.founderbreif.app` | `mobile/app.json` → `android.package` |
| □ Play Console package | `com.founderbreif.app` | Play Console → App dashboard (top) |
| □ **Common mistake** | ~~`com.founderbrief.app`~~ (extra **r**) | That is a *different* app to Google |

> iOS can stay `com.founderbrief.app` for now. Android must be `com.founderbreif.app`.

---

## 2. Upload signing key (must match Play)

| Check | Expected | How to verify |
|---|---|---|
| □ Local credentials file | `credentials.json` points at Play keystore | See below |
| □ Keystore file | `credentials/android/playstore_verified_keystore.jks` | File exists |
| □ Key alias | `5464264642eae9ad6b98a60fde71177c` | In `credentials.json` |
| □ Upload key SHA-1 | `4E:3C:CC:D2:23:43:A1:29:9C:F9:01:3E:5E:B5:9B:BF:FC:71:90:AF` | Matches Play Console |
| □ Upload key SHA-256 | `A7:DF:99:A4:56:A2:D6:61:5F:3D:C0:36:6C:EF:53:78:78:8D:05:4F:C5:01:DA:C8:3D:C2:A2:0F:6E:13:00:E8` | Matches Play Console |
| □ Production uses local creds | `"credentialsSource": "local"` | `eas.json` → `build.production.android` |
| □ **Wrong** key (do not use) | SHA-1 starting `73:3E:AA:C1…` | That was the Oct 12 key Play rejects |

### Verify keystore fingerprint (PowerShell)

```powershell
cd C:\Users\PC\Documents\founderbreif\mobile
$kt="C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\bin\keytool.exe"
$j = Get-Content .\credentials.json -Raw | ConvertFrom-Json
$k = $j.android.keystore
& $kt -list -v -keystore $k.keystorePath -storepass $k.keystorePassword -alias $k.keyAlias
```

Compare **SHA1** with Play Console → **Test and release → App integrity → App signing → Upload key certificate**.

### `credentials.json` must look like

```json
{
  "android": {
    "keystore": {
      "keystorePath": "credentials/android/playstore_verified_keystore.jks",
      "keystorePassword": "<from Expo / your saved copy>",
      "keyAlias": "5464264642eae9ad6b98a60fde71177c",
      "keyPassword": "<from Expo / your saved copy>"
    }
  }
}
```

Never commit `credentials.json` or `credentials/` (already in `.gitignore`).

---

## 3. Version code & version name (rollout / upgrade)

Play error: *“doesn't allow any existing users to upgrade”* = your new `versionCode` is **≤** the highest already on that track.

| Check | Expected | How to verify |
|---|---|---|
| □ New versionCode is higher | Greater than last closed/open/production release | Play → App bundle explorer / last release |
| □ App version name bumped | e.g. `1.0.1` → `1.0.2` when shipping a new release | `app.json` → `version` |
| □ After build, confirm in EAS | Build page shows `appBuildVersion` you expect | Expo build details |

> This project uses `"appVersionSource": "remote"` + `"autoIncrement": true`. Local `android.versionCode` in `app.json` is **ignored** by EAS. Trust the number EAS prints when the build starts (“Incrementing versionCode from X to Y”).

**Before building:** open Play Console → last closed testing release → note the highest version code → make sure the next EAS increment will be above it. If needed, ask Expo remote versions to jump higher, or bump via a no-op build until the number clears.

---

## 4. API / backend (production build env)

| Check | Expected | How to verify |
|---|---|---|
| □ Production API URL | `https://founderbreif.vercel.app` | `eas.json` → `build.production.env.EXPO_PUBLIC_API_URL` |
| □ Not localhost in production | ~~`http://localhost:3000`~~ | Must not appear in production profile env |
| □ Backend health | Returns OK | Open `https://founderbreif.vercel.app/api/health` |
| □ `app.json` `extra.apiUrl` | Can stay localhost for local dev | Production builds use `eas.json` env, not this |

---

## 5. RevenueCat (paywall / Pro)

Expo Go only runs a **preview** mode. Real purchases need a **production / preview APK or AAB** install.

| Check | Expected | How to verify |
|---|---|---|
| □ Android public SDK key | `goog_qZzNIGNlYjRSlaVgkQtcPrZyaYC` | `EXPO_PUBLIC_RC_ANDROID_KEY` or fallback in `services/revenuecat.ts` |
| □ Offering identifier | `FounderBreif Pro Plans` | RevenueCat dashboard → Offerings → Current |
| □ Offering is current | `is_current: true` | Same place |
| □ Entitlements exist | `pro`, `Pro Plan Full Year`, `Pro Plan 1 Month` | RevenueCat → Entitlements |
| □ Paywall attached | e.g. `pw161ff1e8882f4f42` | RevenueCat → Paywalls |
| □ Play products linked | Same product IDs as Play Console subscriptions | RC Products ↔ Play Console |
| □ Package name in RC | App package = `com.founderbreif.app` | RevenueCat → Project → Apps |
| □ Test purchase on real build | Open paywall on device build, buy sandbox/test | Not Expo Go |
| □ Restore purchases | Profile → Help → Restore | Works on signed build |

**Known false alarm:** logs like `Running inside Expo Go — native store preview fallback` are expected in Expo Go. They are **not** a production failure.

---

## 6. Secrets & git safety

| Check | Expected |
|---|---|
| □ `credentials.json` not staged | `git status` must not list it |
| □ `credentials/` not staged | Same |
| □ No `.aab` / `.apk` committed | `.gitignore` covers `*.aab` / `*.apk` |
| □ `.env` not committed | Only `.env.example` is ok |

---

## 7. Smoke test on a real device build (before Play rollout)

Install a **preview APK** or the production AAB via internal testing first:

| Check | Pass criteria |
|---|---|
| □ App opens | No red screen / crash on launch |
| □ Home / Record / Library / Profile | Tabs and raised nav work |
| □ Record → generate document | Uses live API, document appears |
| □ Export Word / PDF / TXT | Share sheet opens |
| □ Read aloud | Voice list + player work |
| □ Paywall | Opens native RC paywall (not “needs installed app” toast only) |
| □ Free limit | After free quota, paywall / upgrade path shows |
| □ Mic permission | Recording works |

---

## 8. Build command (only after sections 0–6 pass)

```powershell
cd C:\Users\PC\Documents\founderbreif\mobile
npx eas-cli whoami
npx eas-cli build -p android --profile production
```

Confirm in the CLI output:

1. `Using local Android credentials (credentials.json)`
2. Version code incremented to a number **higher** than Play’s last release
3. Build URL opens and status becomes **Finished**

---

## 9. Play Console upload (after build finishes)

| Check | Action |
|---|---|
| □ Download the **new** `.aab` from the Expo build page | Do not reuse old files in the repo |
| □ Discard failed draft releases | Or remove previous bundles from the draft |
| □ Upload only the new `.aab` | One bundle, correct package + version |
| □ Errors cleared | No package-name / signing / upgrade errors |
| □ Warnings reviewed | Read the 2 warnings before rolling out |
| □ Roll out to closed testing first | Confirm testers can install/upgrade |
| □ Then promote | Open testing / production when ready |

---

## Quick “red flag” table (problems we already hit)

| Symptom | Likely cause | Fix |
|---|---|---|
| Wrong upload key / SHA mismatch | EAS signed with Oct 12 key (`73:3E…`) | Local `credentialsSource` + Play-verified `.jks` |
| Package must be `com.founderbreif.app` | Built as `com.founderbrief.app` | Fix `android.package` |
| Existing users cannot upgrade | `versionCode` too low | Higher version than last Play release |
| Entity Not Authorized | Wrong Expo `projectId` | Use `53e234a3-…` under `sabih-source` |
| RC only works in preview | Testing in Expo Go | Test on EAS-built APK/AAB |
| API fails on device | Production still pointing at localhost | Set `EXPO_PUBLIC_API_URL` in `eas.json` production |

---

## One-line preflight (copy/paste)

Before every production build, confirm all five:

1. **Account** `sabih-source`  
2. **Project** `53e234a3-5c39-4a3f-9191-f0e6bdd480e6`  
3. **Package** `com.founderbreif.app`  
4. **Upload SHA-1** `4E:3C:CC:D2:…:90:AF` via local keystore  
5. **versionCode** higher than Play’s latest  

Then build. Then upload only that new `.aab`.
