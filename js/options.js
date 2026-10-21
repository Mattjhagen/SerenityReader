const defaults = {
  fontSize: 18,
  fontFamily: "Georgia, 'Times New Roman', serif",
  lineHeight: 1.6,
  maxWidth: 700,
  theme: 'light'
};

const fontSizeInput = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamilySelect = document.getElementById('fontFamily');
const lineHeightInput = document.getElementById('lineHeight');
const lineHeightValue = document.getElementById('lineHeightValue');
const maxWidthInput = document.getElementById('maxWidth');
const maxWidthValue = document.getElementById('maxWidthValue');
const themeOptions = document.querySelectorAll('.theme-option');
const saveBtn = document.getElementById('save');
const resetBtn = document.getElementById('reset');
const statusDiv = document.getElementById('status');

let currentSettings = { ...defaults };

function showStatus(message, duration = 3000) {
  statusDiv.textContent = message;
  statusDiv.className = 'status success show';
  setTimeout(() => {
    statusDiv.className = 'status';
  }, duration);
}

function loadSettings() {
  chrome.storage.sync.get('readerSettings', (data) => {
    if (data.readerSettings) {
      currentSettings = { ...defaults, ...data.readerSettings };
    }
    updateUI();
  });
}

function updateUI() {
  fontSizeInput.value = currentSettings.fontSize;
  fontSizeValue.textContent = currentSettings.fontSize + 'px';

  fontFamilySelect.value = currentSettings.fontFamily;

  lineHeightInput.value = currentSettings.lineHeight;
  lineHeightValue.textContent = currentSettings.lineHeight;

  maxWidthInput.value = currentSettings.maxWidth;
  maxWidthValue.textContent = currentSettings.maxWidth + 'px';

  themeOptions.forEach(option => {
    if (option.dataset.theme === currentSettings.theme) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

fontSizeInput.addEventListener('input', (e) => {
  fontSizeValue.textContent = e.target.value + 'px';
  currentSettings.fontSize = parseInt(e.target.value);
});

fontFamilySelect.addEventListener('change', (e) => {
  currentSettings.fontFamily = e.target.value;
});

lineHeightInput.addEventListener('input', (e) => {
  lineHeightValue.textContent = parseFloat(e.target.value).toFixed(1);
  currentSettings.lineHeight = parseFloat(e.target.value);
});

maxWidthInput.addEventListener('input', (e) => {
  maxWidthValue.textContent = e.target.value + 'px';
  currentSettings.maxWidth = parseInt(e.target.value);
});

themeOptions.forEach(option => {
  option.addEventListener('click', () => {
    themeOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    currentSettings.theme = option.dataset.theme;
  });
});

saveBtn.addEventListener('click', () => {
  chrome.storage.sync.set({ readerSettings: currentSettings }, () => {
    showStatus('✓ Settings saved successfully!');
  });
});

resetBtn.addEventListener('click', () => {
  currentSettings = { ...defaults };
  updateUI();
  chrome.storage.sync.set({ readerSettings: currentSettings }, () => {
    showStatus('✓ Settings reset to defaults');
  });
});

loadSettings();
