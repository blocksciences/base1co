import { useEffect } from 'react';
import { useMobileCapabilities } from '@/hooks/useMobileCapabilities';

interface MobileOptimizedProps {
  children: React.ReactNode;
}

export const MobileOptimized = ({ children }: MobileOptimizedProps) => {
  const { isNative, platform } = useMobileCapabilities();

  useEffect(() => {
    if (isNative) {
      // Add platform-specific classes to body
      document.body.classList.add('mobile-native', `platform-${platform}`);
      
      // Disable text selection on mobile for better UX
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      
      // Prevent overscroll bounce on iOS
      document.body.style.overscrollBehavior = 'none';
    }

    return () => {
      document.body.classList.remove('mobile-native', `platform-${platform}`);
    };
  }, [isNative, platform]);

  return <>{children}</>;
};
