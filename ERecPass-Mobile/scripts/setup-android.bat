@echo off
npm install
npm install @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
