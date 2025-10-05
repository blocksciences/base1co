import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1bbe8255bf4e414f989d601283f9ff0b',
  appName: 'base1co',
  webDir: 'dist',
  server: {
    url: 'https://1bbe8255-bf4e-414f-989d-601283f9ff0b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0A0F1C",
      showSpinner: true,
      spinnerColor: "#00D9FF"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#0A0F1C"
    }
  }
};

export default config;
