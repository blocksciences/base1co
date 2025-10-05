# Mobile App Setup Guide

Your LaunchBase ICO Platform is now configured for mobile deployment using **Capacitor**!

## 🚀 Quick Start

The project is already configured with Capacitor. To run on mobile devices:

### 1. Export to GitHub
First, export your project to GitHub using the "Export to GitHub" button in Lovable.

### 2. Clone & Setup Locally
```bash
git clone <your-repo-url>
cd <your-project>
npm install
```

### 3. Add Mobile Platforms

**For iOS:**
```bash
npx cap add ios
npx cap update ios
```

**For Android:**
```bash
npx cap add android  
npx cap update android
```

### 4. Build the Web App
```bash
npm run build
```

### 5. Sync to Native Platforms
```bash
npx cap sync
```

### 6. Run on Device/Emulator

**iOS (requires Mac + Xcode):**
```bash
npx cap run ios
```

**Android (requires Android Studio):**
```bash
npx cap run android
```

## 📱 Features Enabled

✅ **Native Capabilities:**
- Status bar styling (dark theme matching app)
- Haptic feedback for interactions
- Keyboard management
- Back button handling (Android)
- App state detection

✅ **Mobile Optimizations:**
- Platform detection (iOS/Android/Web)
- Touch-optimized UI
- Overscroll bounce prevention
- Responsive layouts

✅ **Hot Reload:**
- While developing, the app loads from your Lovable preview URL
- See changes instantly without rebuilding
- Perfect for rapid iteration

## 🔧 Configuration

The Capacitor config is in `capacitor.config.ts`:

```typescript
{
  appId: 'app.lovable.1bbe8255bf4e414f989d601283f9ff0b',
  appName: 'base1co',
  webDir: 'dist',
  server: {
    // Hot reload from Lovable sandbox
    url: 'https://1bbe8255-bf4e-414f-989d-601283f9ff0b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
}
```

## 🎨 Mobile-Specific Features

### Haptic Feedback
```typescript
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';

const { triggerHaptic } = useMobileCapabilities();

// Trigger haptic on button press
onClick={() => {
  triggerHaptic();
  handleAction();
}}
```

### Platform Detection
```typescript
const { isNative, platform } = useMobileCapabilities();

if (isNative) {
  // Show mobile-specific UI
}

if (platform === 'ios') {
  // iOS-specific logic
}
```

### Hide Keyboard
```typescript
const { hideKeyboard } = useMobileCapabilities();

onSubmit={() => {
  hideKeyboard();
  handleSubmit();
}}
```

## 📦 Production Build

For production deployment, update `capacitor.config.ts`:

```typescript
server: {
  // Comment out for production builds
  // url: 'https://...',
  // cleartext: true
}
```

Then rebuild:
```bash
npm run build
npx cap sync
npx cap run ios --prod
npx cap run android --prod
```

## 🎯 App Store Deployment

### iOS (App Store)
1. Open `ios/App/App.xcworkspace` in Xcode
2. Configure signing & certificates
3. Update bundle identifier
4. Archive and upload to App Store Connect

### Android (Google Play)
1. Open `android` folder in Android Studio
2. Generate signed APK/AAB
3. Configure app signing
4. Upload to Google Play Console

## 🔗 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Development Blog](https://lovable.dev/blogs/mobile-development)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

## ⚡ Tips

- **Always run `npx cap sync`** after pulling code changes
- Use `npx cap open ios` or `npx cap open android` to open in IDEs
- Test on real devices for accurate performance
- Enable developer mode on physical devices
- Use Chrome DevTools for debugging Android
- Use Safari Web Inspector for debugging iOS

## 🐛 Troubleshooting

**Build fails?**
- Make sure you have latest Xcode (iOS) or Android Studio
- Run `npx cap sync` after any dependency changes
- Clear build cache: `npx cap sync --inline`

**App doesn't connect?**
- Check your Lovable preview URL is accessible
- Ensure `cleartext: true` is set for development
- Check device is on same network

**Changes not showing?**
- Run `npm run build && npx cap sync`
- Force reload the app
- Clear app data/cache on device

---

**Ready to ship? 🚀** Your ICO platform now works on iOS and Android!
