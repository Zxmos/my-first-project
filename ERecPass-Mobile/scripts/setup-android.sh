#!/usr/bin/env bash
set -e
npm install
npm install @capacitor/android
npx cap add android
npx cap sync android
npx cap open android
