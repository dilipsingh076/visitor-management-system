# VMS Mobile App (React Native CLI)

React Native mobile application for the Visitor Management System (Android-first, no Expo).

## Prerequisites

- Node.js >= 22.11.0
- React Native CLI
- Android Studio (for Android development)
- Java Development Kit (JDK)
- Android SDK

## Setup

1. Install dependencies:
```bash
npm install
```

2. For Android, ensure you have:
   - Android Studio installed
   - Android SDK configured
   - Android emulator or physical device connected

3. Start Metro bundler:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## iOS Setup & Running

1. Install iOS dependencies (CocoaPods):
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. If CocoaPods complains about UTF‑8 encoding, add this to your shell config (e.g. `~/.zshrc`) and restart the terminal:
   ```bash
   export LANG=en_US.UTF-8
   ```

3. Open the iOS workspace in Xcode:
   ```bash
   open ios/VisitorManagementApp.xcworkspace
   ```

4. Select a simulator (e.g. iPhone 15) and run the app from Xcode, or use the CLI:
   ```bash
   npm run ios
   ```

> Note: The `Podfile` is configured with `use_modular_headers!` so Firebase (`FirebaseCoreInternal` / `GoogleUtilities`) works correctly with static libraries.

## Web (Browser at localhost:8081)

Run the interactive Visitor Management UI in your browser:

```bash
npm run web
```

Then open **http://localhost:8081/** – you’ll see:
- Home with Check In, Invite Visitor, Dashboard
- Check-in flow with QR placeholder and OTP input
- Invite flow with name and phone
- Dashboard with activity stats

## Project Structure

```
mobile/VisitorManagementApp/
├── App.tsx                 # Main app entry point
├── src/
│   ├── config/             # Configuration
│   │   ├── api.ts         # API client
│   │   └── auth.ts        # Auth utilities
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   └── CheckInScreen.tsx
│   └── navigation/         # Navigation setup
│       └── AppNavigator.tsx
├── android/                # Android native code
├── ios/                    # iOS native code (if needed)
└── package.json
```

## Features

- QR code scanning for check-in
- OTP-based check-in
- Visitor invitation
- Dashboard for residents/guards
- Keycloak authentication integration

## Development

- Use TypeScript for all components
- Follow React Native best practices
- Use React Navigation for routing
- API calls via `src/config/api.ts`

## Notes

- Android emulator uses `10.0.2.2` instead of `localhost` for API calls
- For production, update API URLs in `src/config/api.ts` and `src/config/auth.ts`
- QR scanner requires camera permissions (configure in AndroidManifest.xml)
