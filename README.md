# Shah Saab (د کچو تجارت اپ)

Offline-first rice business app (single-page HTML + Firebase) packaged as an
Android app with **Capacitor**.

## How the app is structured

- `index.html` — the whole web app (UI, logic, Firebase config).
- `vendor/` — Firebase SDK and Vazirmatn font, bundled locally so the app
  starts without an internet connection.
- `scripts/build-web.js` — copies `index.html` + `vendor/` into `www/`.
- `capacitor.config.json` — Android app id/name and web directory.
- `.github/workflows/android.yml` — builds a debug APK on every push to `main`.

## Build the APK (GitHub Actions)

1. Push to `main` (or run the workflow manually from the **Actions** tab).
2. Open **Actions → Build Android APK → latest run**.
3. Download the artifact **`shah-saab-debug-apk`**.
4. Unzip it, copy `shah-saab-debug.apk` to your phone, and install it.
   Android will ask you to allow installation from unknown sources.

Every successful build is also published as a **GitHub Release**:

- `shah-saab-debug.apk` — installable APK.
- `www.zip` — the web bundle (used later for silent over-the-air updates).
- `latest.json` — version manifest (used later by the in-app updater).

## Updates

The app checks for updates on launch and when it resumes (at most every 15
minutes). It reads a small manifest from the `updates` branch:

```
https://raw.githubusercontent.com/khalilgemini214-boop/shahji-business/updates/latest.json
```

- **Code-only changes (HTML/CSS/JS)** — the app downloads `www.zip` in the
  background, applies it with the Live Update plugin, and reloads silently.
  No APK reinstall.
- **Native changes (new plugin, permission, icon, Capacitor upgrade)** — bump
  `native-version.json` (`versionName`) in the same commit. The app shows a
  modal and opens the APK download link. Install the new APK once; future
  code-only updates remain silent.

The workflow publishes `www.zip`, the APK, and `latest.json` to a GitHub
Release, then force-updates the `updates` branch with `latest.json`. The raw
GitHub URL is used because it allows CORS; the release APK/zip URLs are used
for the actual downloads.

### One-time step for the OTA-enabled build

The previous APK (1.0.2) does not contain the update plugin. Install the
**1.0.3** APK once. From then on, code-only pushes update silently.

### Testing an OTA update

1. Make a small visible change in `index.html`.
2. Commit and push to `main`.
3. Wait for the Actions build to finish.
4. Open the app. It should update and reload silently.

If you want to force a check, close and reopen the app.

## Stable signing

The first build generates `signing/debug.keystore` and commits it back to the
repository. This gives every APK the **same signing key**, so Android can
install a new build over the previous one (updates keep working).

This is a **debug** key. It is fine for personal sideloading, but it must not
be used for Play Store distribution. For Play Store, create a release keystore
and store it in GitHub Secrets instead.

## Branches and roles

The app now stores every branch's data in its own Firestore subtree:

```
appData/shahji_business/branches/{branchId}/{collection}/{recordId}
appData/shahji_business/branches/{branchId}/settings/main
appData/shahji_business/branchUsers/{firebaseUid}
```

- **Main account** — any email that is not listed in the branches collection.
  It can view every branch (with All/branch chips), manage branches, and change
  per-branch settings, but cannot add/edit/delete accounts or transactions.
- **Branch user (`admin`)** — read/write/edit/delete everything in its own
  branch.
- **Viewer (`viewer`)** — read-only access to its own branch.

Branch logins are real Firebase Auth users. Creating a branch in
**Settings → څانګي** creates the Firebase user with the entered password and
writes the UID → branch mapping used for secure lookups. The password itself is
never stored in Firestore. Editing a branch with a new password sends a
Firebase password-reset email.

Branches can be **deactivated** (login blocked, data kept) or **deleted**.
Deletion is refused while the branch still contains accounts, stock/money
transactions, balances, or transaction history.

### Deploy the Firestore rules

`firestore.rules` is included in the repository. Before deploying, replace
`MAIN_EMAIL_HERE` with the email of the main account:

```bash
firebase deploy --only firestore:rules
```

The rules are what actually enforce branch isolation. UI hiding alone is not
security. The app also clears old un-scoped local data on first launch after
this schema change.

## Firebase notes

Capacitor serves the app from `https://localhost`. In the Firebase Console:

- **Authentication → Settings → Authorized domains**: add `localhost`.
- Make sure your Firestore security rules allow your signed-in user.

The Firebase API key in `index.html` is a public web key. Security is enforced
by Firestore rules, not by hiding the key.

## Local preview

Just open `index.html` in a browser. The app works without Node or Android
tooling; the APK is built in CI.

## Backups

Settings → Export writes a JSON backup. On Android it opens the native share
sheet so you can save it to Files, Drive, etc. Import uses the system file
picker.

## Package details

- App name: **Shah Saab**
- Android package: `com.paiwandsoftwares.shahsaab`
- Native version: `native-version.json` (currently `1.0.3`)
- Build number: auto-incremented by CI (`versionCode`)
