# ERecPass Mobile (Capacitor)

This package contains the newly uploaded ERecPass web source (`www/index.html` + `www/script.js`) in a Capacitor/Vite project intended for VS Code, Android Studio, and Xcode.

## Requirements
- Node.js LTS and npm
- Android Studio + Android SDK for Android builds
- macOS + Xcode for iOS builds/signing

## Setup
```bash
npm install
npx cap sync android     # copies www/ into android/app/src/main/assets/public
npx cap open android     # opens the android/ folder in Android Studio
```
The web app in `www/` is served as-is (no bundling step). After editing anything in `www/`, run `npx cap sync android` again.

In Android Studio, open the **`android/`** folder (not the repo root). Build/run from Android Studio. To create an APK, use **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

For iOS, on a Mac:
```bash
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

## Supabase
The browser publishable configuration is in `www/supabase-config.js`. Publishable keys are designed for client-side use; do not add a secret/service_role key. Run `supabase/schema.sql` in your Supabase SQL Editor if you want the `patients` and `appointments` tables expected by some of this uploaded code.

## Important integration status
The uploaded app still uses localStorage as its main data store and contains demo/local account behavior. Its existing Supabase additions initialize a client, attempt Supabase Auth login, and provide patient/appointment helpers, but this does **not** mean every screen or every data type is cloud-backed. In particular, the appointment sync code expects fields/table behavior that must be reconciled with your live schema and authenticated user IDs. The SQL included here is a starting schema, not a verified migration of your existing project. Test with dummy data only.

Before real patient data is used, remove demo credentials and local password storage, enforce staff/admin roles server-side, review every RLS policy, and add audit/privacy safeguards. Do not use this school prototype for real clinical records.
