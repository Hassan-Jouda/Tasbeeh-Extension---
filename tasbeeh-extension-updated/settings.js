document.addEventListener('DOMContentLoaded', initSettings);

async function initSettings() {
  await loadSettings();
  setupEventListeners();
  translatePage();
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['darkMode', 'language', 'customAzkar', 'dailyGoal'], (res) => {
      document.getElementById('darkModeToggle').checked = res.darkMode || false;
      document.getElementById('languageSelect').value = res.language || 'ar';
      document.getElementById('dailyGoal').value = res.dailyGoal || 100;
      
      if (res.customAzkar) {
        document.getElementById('customAzkar').value = res.customAzkar.join('\n');
      }
      
      if (res.darkMode) {
        document.body.classList.add('dark');
        document.getElementById('toggleTheme').textContent = '☀️';
      } else {
        document.getElementById('toggleTheme').textContent = '🌙';
      }
      
      resolve();
    });
  });
}

function setupEventListeners() {
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  document.getElementById('toggleTheme').addEventListener('click', () => {
    const darkMode = !document.body.classList.toggle('dark');
    document.getElementById('toggleTheme').textContent = darkMode ? '☀️' : '🌙';
    document.getElementById('darkModeToggle').checked = darkMode;
  });
  
  document.getElementById('languageSelect').addEventListener('change', () => {
    translatePage();
  });
}

function saveSettings() {
  const darkMode = document.getElementById('darkModeToggle').checked;
  const language = document.getElementById('languageSelect').value;
  const dailyGoal = parseInt(document.getElementById('dailyGoal').value) || 100;
  const customAzkar = document.getElementById('customAzkar').value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  chrome.storage.local.set({
    darkMode,
    language,
    dailyGoal,
    customAzkar
  }, () => {
    alert(language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!');
    translatePage();
  });
}

function translatePage() {
  const language = document.getElementById('languageSelect').value;
  document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  
  const translations = {
    ar: {
      settingsTitle: "⚙️ الإعدادات",
      appearance: "المظهر",
      darkMode: "الوضع الليلي:",
      language: "اللغة:",
      goals: "الأهداف",
      dailyGoal: "الهدف اليومي:",
      customAzkar: "أذكار مخصصة",
      customAzkarDesc: "أدخل الأذكار (كل ذكر في سطر)",
      save: "💾 حفظ",
      back: "↩️ العودة"
    },
    en: {
      settingsTitle: "⚙️ Settings",
      appearance: "Appearance",
      darkMode: "Dark Mode:",
      language: "Language:",
      goals: "Goals",
      dailyGoal: "Daily Goal:",
      customAzkar: "Custom Azkar",
      customAzkarDesc: "Enter azkar (one per line)",
      save: "💾 Save",
      back: "↩️ Back"
    }
  };
  
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[language][key] || el.textContent;
  });
}