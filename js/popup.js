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

    if (!article.html || article.html.trim().length < 100) {
      alert('Unable to extract readable content from this page. Try a different page or article.');
      document.body.classList.remove('reader-mode-active');
      return;
    }

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

    // Prevent body scroll when reader is active
    document.body.style.overflow = 'hidden';

    document.getElementById('reader-close').addEventListener('click', () => {
      document.body.classList.remove('reader-mode-active');
      document.body.style.overflow = '';
      readerContainer.remove();
    });

    applyReaderSettings(settings);

    // Ensure container is scrollable
    readerContainer.scrollTop = 0;
  } else {
    const container = document.getElementById('reader-mode-container');
    if (container) {
      document.body.style.overflow = '';
      container.remove();
    }
  }
}

function extractMainContent() {
  // Try to find the main article content
  const contentSelectors = [
    'article[class*="article"]',
    'article',
    '[class*="article-body"]',
    '[class*="article-content"]',
    '[class*="post-content"]',
    '[class*="entry-content"]',
    '[role="main"] article',
    'main article',
    '[role="main"]',
    'main',
    '#article',
    '.article',
    '#content article',
    '.content article'
  ];

  let mainContent = null;
  let bestScore = 0;

  // Score each potential content container
  for (const selector of contentSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const text = element.textContent || '';
      const textLength = text.trim().length;
      const paragraphs = element.querySelectorAll('p').length;

      // Score based on text length and number of paragraphs
      const score = textLength + (paragraphs * 100);

      if (score > bestScore) {
        bestScore = score;
        mainContent = element;
      }
    });
    if (mainContent && bestScore > 1000) break;
  }

  // Fallback: find the element with the most paragraph text
  if (!mainContent || bestScore < 500) {
    const allElements = document.querySelectorAll('div, section, article');
    allElements.forEach(element => {
      const text = element.textContent || '';
      const textLength = text.trim().length;
      const paragraphs = element.querySelectorAll('p').length;
      const score = textLength + (paragraphs * 100);

      if (score > bestScore && textLength > 500) {
        bestScore = score;
        mainContent = element;
      }
    });
  }

  if (!mainContent) {
    return { title: document.title, html: '' };
  }

  const clone = mainContent.cloneNode(true);

  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'iframe', 'nav', 'header', 'footer',
    'aside', '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
    '.ad', '.ads', '.advertisement', '[class*="ad-"]', '[id*="ad-"]',
    '.social-share', '.share-buttons', '[class*="share"]',
    '.comments', '.comment-section', '[class*="comment"]',
    '.related-posts', '.recommended', '[class*="related"]',
    '.sidebar', '.widget', '[class*="sidebar"]',
    'button', 'form', 'input', 'select', 'textarea',
    '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]',
    '[aria-hidden="true"]', '[style*="display: none"]', '[style*="visibility: hidden"]'
  ];

  unwantedSelectors.forEach(selector => {
    try {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Remove empty elements
  clone.querySelectorAll('div, span, section').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img')) {
      el.remove();
    }
  });

  // Get title - try multiple methods
  const title =
    document.querySelector('h1[class*="title"]')?.textContent ||
    document.querySelector('h1[class*="headline"]')?.textContent ||
    document.querySelector('h1')?.textContent ||
    document.querySelector('[property="og:title"]')?.getAttribute('content') ||
    document.querySelector('[name="twitter:title"]')?.getAttribute('content') ||
    document.title.split(' - ')[0].split(' | ')[0];

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
