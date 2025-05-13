// العناصر
const counterElement = document.getElementById('counter');
const totalCounterElement = document.getElementById('totalCounter');
const incrementBtn = document.getElementById('increment');
const resetBtn = document.getElementById('reset');
const zekrElement = document.getElementById('zekr');
const dailyCounter = document.getElementById('dailyCounter');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const lastUpdated = document.getElementById('lastUpdated');
const toggleThemeBtn = document.getElementById('toggleTheme');

// المتغيرات
let count = 0;
let dailyCount = 0;
let totalCount = 0;
let dailyGoal = 100;
let azkar = [
  {ar: "سبحان الله", en: "Glory be to Allah"},
  {ar: "الحمد لله", en: "Praise be to Allah"},
  {ar: "لا إله إلا الله", en: "There is no god but Allah"},
  {ar: "الله أكبر", en: "Allah is the Greatest"},
  {ar: "سبحان الله وبحمده", en: "Glory be to Allah and His praise"},
  {ar: "سبحان الله العظيم", en: "Glory be to Allah the Almighty"},
  {ar: "لا حول ولا قوة إلا بالله", en: "There is no power nor strength except by Allah"}
];
let currentIndex = 0;
let language = 'ar';
let darkMode = false;

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  await loadSettings();
  updateUI();
  setupEventListeners();
  updateLastUpdated();
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['counter', 'dailyCount', 'totalCount', 'darkMode', 'language', 'customAzkar', 'dailyGoal'], (res) => {
      count = res.counter || 0;
      dailyCount = res.dailyCount || 0;
      totalCount = res.totalCount || 0;
      dailyGoal = res.dailyGoal || 100;
      language = res.language || 'ar';
      darkMode = res.darkMode || false;

      if (res.customAzkar && res.customAzkar.length > 0) {
        azkar = res.customAzkar.map(item => ({
          ar: item,
          en: azkar.find(a => a.ar === item)?.en || item
        }));
      }

      if (darkMode) {
        document.body.classList.add('dark');
        toggleThemeBtn.textContent = '☀️';
      } else {
        toggleThemeBtn.textContent = '🌙';
      }

      resolve();
    });
  });
}

function updateUI() {
  counterElement.textContent = count;
  dailyCounter.textContent = dailyCount;
  totalCounterElement.textContent = totalCount;
  
  // تحديث الذكر
  const currentZekr = azkar[currentIndex][language];
  zekrElement.textContent = currentZekr;
  
  // تحديث شريط التقدم
  const progress = Math.min(100, (dailyCount / dailyGoal) * 100);
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${Math.round(progress)}%`;
  
  // تحديث اتجاه النص
  document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // تحديث النصوص المترجمة
  translatePage();
}

function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[language][key] || el.textContent;
  });
}

const translations = {
  ar: {
    appTitle: "🕌 مسبحة إلكترونية",
    countBtn: "تسبيح",
    resetBtn: "تصفير",
    today: "اليوم:",
    total: "المجموع:",
    settings: "⚙️ إعدادات"
  },
  en: {
    appTitle: "🕌 Tasbeeh Counter",
    countBtn: "Count",
    resetBtn: "Reset",
    today: "Today:",
    total: "Total:",
    settings: "⚙️ Settings"
  }
};

function updateZekr() {
  currentIndex = (currentIndex + 1) % azkar.length;
  zekrElement.textContent = azkar[currentIndex][language];
}

function saveToStorage() {
  chrome.storage.local.set({
    counter: count,
    dailyCount: dailyCount,
    totalCount: totalCount,
    lastUpdated: new Date().toISOString()
  });
}

function updateLastUpdated() {
  chrome.storage.local.get(['lastUpdated'], (res) => {
    if (res.lastUpdated) {
      const date = new Date(res.lastUpdated);
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      lastUpdated.textContent = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', options).format(date);
    }
  });
}

function setupEventListeners() {
  incrementBtn.addEventListener('click', () => {
    count++;
    dailyCount++;
    totalCount++;
    updateZekr();
    updateUI();
    saveToStorage();
    animateButton(incrementBtn);
  });

  resetBtn.addEventListener('click', () => {
    count = 0;
    updateUI();
    saveToStorage();
  });

  toggleThemeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark');
    toggleThemeBtn.textContent = darkMode ? '☀️' : '🌙';
    chrome.storage.local.set({ darkMode });
  });
}

function animateButton(button) {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);
}

// تحديث العداد عند فتح الصفحة
chrome.storage.onChanged.addListener((changes) => {
  if (changes.counter) count = changes.counter.newValue;
  if (changes.dailyCount) dailyCount = changes.dailyCount.newValue;
  if (changes.totalCount) totalCount = changes.totalCount.newValue;
  if (changes.language) {
    language = changes.language.newValue;
    translatePage();
  }
  updateUI();
});