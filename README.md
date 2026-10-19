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

- **Web/code-only changes** will be delivered silently in a future update
  (live-update plugin + `www.zip`), without reinstalling the APK.
- **Native changes** (new plugin, permission, icon, Capacitor upgrade) require
  a new APK. The app will show a modal with a download link.
- The workflow already publishes the release assets and `latest.json`, so the
  in-app updater can be added without changing the CI pipeline.

## Stable signing

The first build generates `signing/debug.keystore` and commits it back to the
repository. This gives every APK the **same signing key**, so Android can
install a new build over the previous one (updates keep working).

This is a **debug** key. It is fine for personal sideloading, but it must not
be used for Play Store distribution. For Play Store, create a release keystore
and store it in GitHub Secrets instead.

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
- Version: `1.0.<build number>` (auto-incremented by CI)
