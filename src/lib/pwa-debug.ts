// PWA Debug Utility
// Add this to your browser console to debug PWA issues

export function debugPWA() {
  console.log('🔍 PWA Debug Information:');
  
  // Check if service worker is supported
  console.log('Service Worker Support:', 'serviceWorker' in navigator);
  
  // Check if manifest exists
  const manifestLink = document.querySelector('link[rel="manifest"]');
  console.log('Manifest Link:', manifestLink?.href);
  
  // Check if icons exist
  const icon192 = fetch('/icons/icon-192.png').then(r => r.ok).catch(() => false);
  const icon512 = fetch('/icons/icon-512.png').then(r => r.ok).catch(() => false);
  
  Promise.all([icon192, icon512]).then(([has192, has512]) => {
    console.log('Icon 192x192 exists:', has192);
    console.log('Icon 512x512 exists:', has512);
  });
  
  // Check display mode
  console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
  
  // Check if already installed
  console.log('Already Installed:', window.matchMedia('(display-mode: standalone)').matches);
  
  // Check HTTPS
  console.log('HTTPS:', location.protocol === 'https:');
  
  // Check service worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log('Service Worker Registrations:', registrations.length);
      registrations.forEach((reg, i) => {
        console.log(`SW ${i}:`, reg.active ? 'Active' : 'Inactive');
      });
    });
  }
  
  // Check manifest content
  fetch('/manifest.json')
    .then(r => r.json())
    .then(manifest => {
      console.log('Manifest Content:', manifest);
    })
    .catch(err => {
      console.error('Manifest Error:', err);
    });
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugPWA = debugPWA;
} 