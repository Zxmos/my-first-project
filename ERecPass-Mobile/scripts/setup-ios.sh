#!/usr/bin/env bash
set -e
npm install
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
