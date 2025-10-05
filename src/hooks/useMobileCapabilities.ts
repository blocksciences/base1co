import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';

export const useMobileCapabilities = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    const currentPlatform = Capacitor.getPlatform();
    
    setIsNative(native);
    setPlatform(currentPlatform as 'ios' | 'android' | 'web');

    if (native) {
      // Configure status bar
      StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
      StatusBar.setBackgroundColor({ color: '#0A0F1C' }).catch(console.error);

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // Handle keyboard events
      Keyboard.addListener('keyboardWillShow', info => {
        console.log('keyboard will show with height:', info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('keyboard will hide');
      });
    }

    return () => {
      if (native) {
        App.removeAllListeners();
        Keyboard.removeAllListeners();
      }
    };
  }, []);

  const triggerHaptic = (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      Haptics.impact({ style }).catch(console.error);
    }
  };

  const hideKeyboard = () => {
    if (isNative) {
      Keyboard.hide().catch(console.error);
    }
  };

  return {
    isNative,
    platform,
    triggerHaptic,
    hideKeyboard,
  };
};
