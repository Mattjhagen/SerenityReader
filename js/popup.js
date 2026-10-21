const toggleReaderBtn = document.getElementById('toggleReader');
const removeAdsBtn = document.getElementById('removeAds');
const openSettingsBtn = document.getElementById('openSettings');
const statusDiv = document.getElementById('status');

function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 3000);
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function checkReaderStatus() {
  const tab = await getCurrentTab();
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.body.classList.contains('reader-mode-active');
      }
    });

    if (results && results[0].result) {
      toggleReaderBtn.textContent = 'Disable Reader View';
      toggleReaderBtn.classList.add('active');
    }
  } catch (error) {
    console.error('Error checking reader status:', error);
  }
}

toggleReaderBtn.addEventListener('click', async () => {
  const tab = await getCurrentTab();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleReaderMode
    });

    const isActive = toggleReaderBtn.classList.contains('active');
    if (isActive) {
      toggleReaderBtn.textContent = 'Enable Reader View';
      toggleReaderBtn.classList.remove('active');
      showStatus('Reader view disabled', 'info');
    } else {
      toggleReaderBtn.textContent = 'Disable Reader View';
      toggleReaderBtn.classList.add('active');
      showStatus('Reader view enabled');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'info');
  }
});

removeAdsBtn.addEventListener('click', async () => {
  const tab = await getCurrentTab();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: removeAds
    });
    showStatus('Ads removed');
  } catch (error) {
    showStatus('Error: ' + error.message, 'info');
  }
});

openSettingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

function toggleReaderMode() {
  const isActive = document.body.classList.toggle('reader-mode-active');

  if (isActive) {
    const settings = JSON.parse(localStorage.getItem('readerSettings') || '{}');

    const article = extractMainContent();
    const readerContainer = document.createElement('div');
    readerContainer.id = 'reader-mode-container';
    readerContainer.innerHTML = `
      <div class="reader-toolbar">
        <button id="reader-close">✕ Exit Reader</button>
      </div>
      <article class="reader-content">
        ${article.html}
      </article>
    `;

    document.body.appendChild(readerContainer);

    document.getElementById('reader-close').addEventListener('click', () => {
      document.body.classList.remove('reader-mode-active');
      readerContainer.remove();
    });

    applyReaderSettings(settings);
  } else {
    const container = document.getElementById('reader-mode-container');
    if (container) container.remove();
  }
}

function extractMainContent() {
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
    '.content'
  ];

  let mainContent = null;
  for (const selector of contentSelectors) {
    mainContent = document.querySelector(selector);
    if (mainContent) break;
  }

  if (!mainContent) {
    mainContent = document.body;
  }

  const clone = mainContent.cloneNode(true);

  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer',
    'aside', '.ad', '.ads', '.advertisement',
    '.social-share', '.comments', '.related-posts'
  ];

  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  const title = document.querySelector('h1')?.textContent || document.title;

  return {
    title,
    html: `<h1>${title}</h1>${clone.innerHTML}`
  };
}

function applyReaderSettings(settings) {
  const container = document.getElementById('reader-mode-container');
  if (!container) return;

  const content = container.querySelector('.reader-content');
  if (settings.fontSize) {
    content.style.fontSize = settings.fontSize + 'px';
  }
  if (settings.fontFamily) {
    content.style.fontFamily = settings.fontFamily;
  }
  if (settings.lineHeight) {
    content.style.lineHeight = settings.lineHeight;
  }
  if (settings.maxWidth) {
    content.style.maxWidth = settings.maxWidth + 'px';
  }
  if (settings.theme) {
    container.setAttribute('data-theme', settings.theme);
  }
}

function removeAds() {
  const adSelectors = [
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    '[class*="ad-"]',
    '[class*="ads-"]',
    '[id*="ad-"]',
    '[id*="ads-"]',
    '[class*="advertisement"]',
    '[id*="advertisement"]',
    '.ad',
    '.ads',
    '.advertisement',
    '.sponsored',
    '.sponsor',
    '[data-ad]',
    '[data-ads]',
    'div[id^="google_ads"]',
    'div[class^="google-ad"]',
    '[class*="adsbygoogle"]',
    '[aria-label*="dvertisement"]',
    '[aria-label*="Sponsored"]'
  ];

  let removedCount = 0;
  adSelectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          el.remove();
          removedCount++;
        }
      });
    } catch (e) {
      console.log('Skipping invalid selector:', selector);
    }
  });

  const allElements = document.querySelectorAll('div, aside, section');
  allElements.forEach(el => {
    const text = el.textContent.toLowerCase();
    const isSmall = el.offsetHeight < 300 && el.offsetWidth < 300;
    if (isSmall && (text.includes('advertisement') || text.includes('sponsored'))) {
      el.remove();
      removedCount++;
    }
  });

  console.log(`Removed ${removedCount} ad elements`);
}

checkReaderStatus();
