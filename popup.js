document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('download-btn');
  const copyUrlBtn = document.getElementById('copy-url-btn');
  const openTabBtn = document.getElementById('open-tab-btn');
  const statusDiv = document.getElementById('status');
  const previewDiv = document.getElementById('favicon-preview');
  const faviconUrlDiv = document.getElementById('favicon-url');
  const metaFormat = document.getElementById('meta-format');
  const metaDimensions = document.getElementById('meta-dimensions');
  const metaSize = document.getElementById('meta-size');

  let currentFaviconUrl = null;
  let pageTitle = '';
  let allFavicons = [];

  // Get favicons from the current page
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    const tab = tabs[0];

    try {
      // Inject content script to find favicons
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Ask content script for favicons
      chrome.tabs.sendMessage(tab.id, { action: 'getFavicons' }, function(response) {
        if (chrome.runtime.lastError || !response) {
          // Fallback: try common favicon paths
          handleFallback(tab);
          return;
        }

        allFavicons = response.favicons;
        pageTitle = response.pageTitle;

        // Find the first valid favicon
        findValidFavicon(allFavicons);
      });
    } catch (error) {
      console.error('Error injecting content script:', error);
      handleFallback(tab);
    }
  });

  function handleFallback(tab) {
    // Try common favicon paths as fallback
    const url = new URL(tab.url);
    const commonPaths = [
      `${url.origin}/favicon.ico`,
      `${url.origin}/favicon.png`
    ];

    pageTitle = tab.title;
    allFavicons = commonPaths.map(path => ({
      url: path,
      rel: 'icon',
      sizes: '',
      type: '',
      source: 'fallback'
    }));

    findValidFavicon(allFavicons);
  }

  async function findValidFavicon(favicons) {
    if (favicons.length === 0) {
      showStatus('No favicon found for this website', 'error');
      downloadBtn.disabled = true;
      copyUrlBtn.disabled = true;
      openTabBtn.disabled = true;
      return;
    }

    // Try each favicon URL until we find one that works
    for (const favicon of favicons) {
      try {
        const response = await fetch(favicon.url);
        if (response.ok) {
          currentFaviconUrl = favicon.url;
          displayFavicon(favicon.url);
          return;
        }
      } catch (error) {
        // Try next favicon
        continue;
      }
    }

    // If none worked, show error
    showStatus('No valid favicon found', 'error');
    downloadBtn.disabled = true;
    copyUrlBtn.disabled = true;
    openTabBtn.disabled = true;
  }

  function displayFavicon(url) {
    // Show preview of the favicon
    previewDiv.innerHTML = `
      <img src="${url}" alt="Favicon" onerror="handleImageError(this)">
    `;

    // Display favicon URL (shortened)
    try {
      const urlObj = new URL(url);
      const shortUrl = urlObj.pathname.split('/').pop() || 'favicon.ico';
      faviconUrlDiv.textContent = shortUrl;
      faviconUrlDiv.title = url;
    } catch (e) {
      faviconUrlDiv.textContent = url;
    }

    // Load metadata
    loadFaviconMetadata(url);

    // Enable buttons
    downloadBtn.addEventListener('click', handleDownload);
    copyUrlBtn.addEventListener('click', handleCopyUrl);
    openTabBtn.addEventListener('click', handleOpenTab);
  }

  function handleImageError(img) {
    img.style.display = 'none';
    previewDiv.innerHTML = `
      <div class="preview-placeholder">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
    `;
  }

  function loadFaviconMetadata(url) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        // File size
        const sizeKB = (blob.size / 1024).toFixed(2);
        metaSize.textContent = `${sizeKB} KB`;

        // Format
        const format = blob.type.split('/')[1]?.toUpperCase() || 'Unknown';
        metaFormat.textContent = format;

        // Load image to get dimensions
        const img = new Image();
        img.onload = function() {
          metaDimensions.textContent = `${img.width}×${img.height}`;
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(blob);
      })
      .catch(error => {
        console.error('Error loading metadata:', error);
        metaFormat.textContent = 'Error';
        metaDimensions.textContent = 'Error';
        metaSize.textContent = 'Error';
      });
  }

  function handleDownload() {
    const selectedFormats = Array.from(document.querySelectorAll('input[name="format"]:checked'))
      .map(checkbox => checkbox.value);

    if (selectedFormats.length === 0) {
      showStatus('Please select at least one format', 'error');
      return;
    }

    showStatus('Downloading...', 'loading');

    downloadFavicon(currentFaviconUrl, pageTitle, selectedFormats);
  }

  function downloadFavicon(url, title, formats) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);

        // Get file extension from URL or default to .ico
        let extension = '.ico';
        try {
          const urlPath = new URL(url).pathname;
          const match = urlPath.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i);
          if (match) {
            extension = match[0];
          }
        } catch (e) {
          extension = '.ico';
        }

        // Clean the page title for use as filename
        const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Download each selected format
        formats.forEach((format, index) => {
          setTimeout(() => {
            let filename;
            if (format === 'original') {
              filename = `favicon_${cleanTitle}${extension}`;
            } else if (format === 'svg') {
              filename = `favicon_${cleanTitle}.svg`;
            } else {
              filename = `favicon_${cleanTitle}_${format}x${format}${extension}`;
            }

            chrome.downloads.download({
              url: blobUrl,
              filename: filename,
              saveAs: false
            }, function(downloadId) {
              if (chrome.runtime.lastError) {
                showStatus('Download failed', 'error');
              } else {
                showStatus(`Downloaded ${formats.length} file(s)`, 'success');
                setTimeout(() => {
                  if (index === formats.length - 1) {
                    URL.revokeObjectURL(blobUrl);
                  }
                }, 100);
              }
            });
          }, index * 100);
        });
      })
      .catch(error => {
        console.error('Error downloading favicon:', error);
        showStatus('Error downloading favicon', 'error');
      });
  }

  function handleCopyUrl() {
    if (!currentFaviconUrl) return;

    navigator.clipboard.writeText(currentFaviconUrl)
      .then(() => {
        showStatus('URL copied to clipboard', 'success');
        setTimeout(() => {
          statusDiv.textContent = '';
          statusDiv.className = '';
        }, 2000);
      })
      .catch(error => {
        console.error('Error copying to clipboard:', error);
        showStatus('Failed to copy URL', 'error');
      });
  }

  function handleOpenTab() {
    if (!currentFaviconUrl) return;

    chrome.tabs.create({ url: currentFaviconUrl });
    showStatus('Opened in new tab', 'success');
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
  }

  // Make handleImageError global so it can be called from inline onerror
  window.handleImageError = handleImageError;
});
