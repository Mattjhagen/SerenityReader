chrome.storage.sync.get('readerSettings', (data) => {
  if (data.readerSettings) {
    localStorage.setItem('readerSettings', JSON.stringify(data.readerSettings));
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.readerSettings) {
    localStorage.setItem('readerSettings', JSON.stringify(changes.readerSettings.newValue));

    if (document.body.classList.contains('reader-mode-active')) {
      const applySettingsScript = document.createElement('script');
      applySettingsScript.textContent = `
        (function() {
          const settings = ${JSON.stringify(changes.readerSettings.newValue)};
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
        })();
      `;
      document.documentElement.appendChild(applySettingsScript);
      applySettingsScript.remove();
    }
  }
});
