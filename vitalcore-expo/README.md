# VitaCore AI Mobile (Expo React Native)

This is the **Expo React Native Android/iOS mobile application** for VitaCore AI, built directly on top of the VitaCore AI Web Application features.

## 🚀 How to Run in Expo

### 1. Install Dependencies
Open a terminal in `d:\vitalcore-expo` and run:
```bash
npm install
```

### 2. Start Expo Development Server
Run:
```bash
npx expo start
```
Or directly on Android:
```bash
npx expo start --android
```

### 3. Open on Android Device / Emulator
* **Expo Go App**: Install **Expo Go** from Google Play Store on your Android phone, scan the QR code displayed in the terminal.
* **Android Emulator**: Start an Android Virtual Device (AVD) in Android Studio, then press **`a`** in the terminal running Expo.

## 📱 Features Included
* **100% Feature Parity** with VitaCore AI Web App (`/dashboard`, `/ai-coach`, `/scanner`, `/fitness`, `/nutrition`, `/sleep`, `/future-lab`, `/community`, `/challenges`, `/profile`, `/settings`).
* **Android Physical Back Button Support**: Navigates backwards through web history seamlessly.
* **Native Quick Navigation Toolbar**: Quick tab bar at the bottom for instant navigation between Home, AI Coach, Scanner, Nutrition, and Profile.
* **Offline Detection & Retry**: Shows clean error feedback if network connectivity is lost.
