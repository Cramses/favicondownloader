// Content script to detect favicons from the current page
(function() {
  function findFavicons() {
    const favicons = [];

    // Get all link tags that could be favicons
    const linkTags = document.querySelectorAll('link[rel*="icon"]');

    linkTags.forEach(link => {
      const rel = link.getAttribute('rel');
      const href = link.getAttribute('href');
      const sizes = link.getAttribute('sizes') || '';
      const type = link.getAttribute('type') || '';

      if (href) {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, window.location.href).href;

        favicons.push({
          url: absoluteUrl,
          rel: rel,
          sizes: sizes,
          type: type,
          source: 'html'
        });
      }
    });

    // Add common favicon paths if not already in list
    const commonPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png'
    ];

    const existingUrls = favicons.map(f => f.url);
    commonPaths.forEach(path => {
      const url = new URL(path, window.location.origin).href;
      if (!existingUrls.includes(url)) {
        favicons.push({
          url: url,
          rel: 'icon',
          sizes: '',
          type: '',
          source: 'common'
        });
      }
    });

    return favicons;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getFavicons') {
      const favicons = findFavicons();
      sendResponse({
        favicons: favicons,
        pageTitle: document.title,
        pageUrl: window.location.href
      });
    }
    return true;
  });
})();
