// PWA Debug Utility for Development

export const debugPWA = () => {
  console.log('🔧 PWA Debug Information:');
  console.log('========================');
  
  // Check PWA support
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;
  
  console.log('PWA Support:');
  console.log('- Service Worker:', hasServiceWorker ? '✅ Supported' : '❌ Not Supported');
  console.log('- Push Manager:', hasPushManager ? '✅ Supported' : '❌ Not Supported');
  console.log('- Notifications:', hasNotification ? '✅ Supported' : '❌ Not Supported');
  
  // Check installation status
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isInstalled = isStandalone || isIOSStandalone;
  
  console.log('\nInstallation Status:');
  console.log('- Standalone Mode:', isStandalone ? '✅ Active' : '❌ Not Active');
  console.log('- iOS Standalone:', isIOSStandalone ? '✅ Active' : '❌ Not Active');
  console.log('- Overall Installed:', isInstalled ? '✅ Installed' : '❌ Not Installed');
  
  // Check network status
  console.log('\nNetwork Status:');
  console.log('- Online:', navigator.onLine ? '✅ Online' : '❌ Offline');
  
  // Check service worker registration
  if (hasServiceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('\nService Worker Registrations:');
      if (registrations.length === 0) {
        console.log('❌ No service workers registered');
      } else {
        registrations.forEach((registration, index) => {
          console.log(`- SW ${index + 1}:`, registration.scope);
          console.log(`  Active:`, registration.active ? '✅ Yes' : '❌ No');
          console.log(`  Installing:`, registration.installing ? '✅ Yes' : '❌ No');
          console.log(`  Waiting:`, registration.waiting ? '✅ Yes' : '❌ No');
        });
      }
    });
  }
  
  // Check manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log('\nManifest:');
    console.log('- Found:', '✅ Yes');
    console.log('- URL:', manifestLink.getAttribute('href'));
  } else {
    console.log('\nManifest: ❌ Not found');
  }
  
  // Check icons
  const icons = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
  console.log('\nIcons:');
  if (icons.length > 0) {
    icons.forEach((icon, index) => {
      console.log(`- Icon ${index + 1}:`, icon.getAttribute('href'));
    });
  } else {
    console.log('❌ No icons found');
  }
  
  // Check viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  console.log('\nViewport:');
  console.log('- Found:', viewport ? '✅ Yes' : '❌ No');
  if (viewport) {
    console.log('- Content:', viewport.getAttribute('content'));
  }
  
  // Check theme color
  const themeColor = document.querySelector('meta[name="theme-color"]');
  console.log('\nTheme Color:');
  console.log('- Found:', themeColor ? '✅ Yes' : '❌ No');
  if (themeColor) {
    console.log('- Color:', themeColor.getAttribute('content'));
  }
  
  // Check apple meta tags
  const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  
  console.log('\nApple Meta Tags:');
  console.log('- apple-mobile-web-app-capable:', appleCapable ? '✅ Found' : '❌ Missing');
  console.log('- apple-mobile-web-app-title:', appleTitle ? '✅ Found' : '❌ Missing');
  
  // Test install prompt
  console.log('\nInstall Prompt Test:');
  console.log('To test install prompt, you can:');
  console.log('1. Open Chrome DevTools');
  console.log('2. Go to Application tab');
  console.log('3. Click "Install" in the Manifest section');
  console.log('4. Or use the install button in the header');
  
  // Test notifications
  if (hasNotification) {
    console.log('\nNotification Test:');
    console.log('To test notifications, run:');
    console.log('Notification.requestPermission().then(console.log)');
  }
  
  console.log('\n========================');
  console.log('🔧 End of PWA Debug Info');
};

// Test install prompt manually
export const testInstallPrompt = () => {
  console.log('🧪 Testing Install Prompt...');
  
  // Simulate beforeinstallprompt event
  const event = new Event('beforeinstallprompt');
  Object.defineProperty(event, 'platforms', {
    value: ['web']
  });
  Object.defineProperty(event, 'userChoice', {
    value: Promise.resolve({ outcome: 'accepted', platform: 'web' })
  });
  Object.defineProperty(event, 'prompt', {
    value: () => Promise.resolve()
  });
  
  window.dispatchEvent(event);
  console.log('✅ Install prompt event dispatched');
};

// Test service worker
export const testServiceWorker = () => {
  console.log('🧪 Testing Service Worker...');
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log('✅ Service worker found');
        registrations.forEach((registration, index) => {
          console.log(`SW ${index + 1}:`, registration.scope);
        });
      } else {
        console.log('❌ No service workers found');
      }
    });
  } else {
    console.log('❌ Service worker not supported');
  }
};

// Test offline functionality
export const testOffline = () => {
  console.log('🧪 Testing Offline Functionality...');
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      console.log('✅ Service worker ready');
      
      // Test cache
      caches.keys().then(cacheNames => {
        console.log('Caches found:', cacheNames);
      });
    });
  }
};

// Export all debug functions
export default {
  debugPWA,
  testInstallPrompt,
  testServiceWorker,
  testOffline
}; 