// AI Video Studio - Module Loader
// Tải và khởi tạo các sub-modules của studio

;(function() {
  // Import store definitions first
  const storesLoaded = () => typeof StudioStore !== 'undefined' && typeof QueueStore !== 'undefined'
  
  // Load stores if not present
  if (!storesLoaded()) {
    // Các store được định nghĩa trong inline script từ index.html
    console.warn('[Studio] Stores not found, ensure studio.store.js is loaded')
  }
  
  // Main studio is defined in studio-main.js
  console.log('[Studio] AI Video Studio module ready')
})()
