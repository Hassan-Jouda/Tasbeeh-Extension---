// ترجمة التنبيهات
const messages = {
  ar: {
    reminderTitle: "🕌 وقت الذكر",
    reminderMessage: "لا تنسَ أن تذكر الله 🌿"
  },
  en: {
    reminderTitle: "Time to Remember Allah",
    reminderMessage: "Don't forget your daily Tasbeeh 🌿"
  }
};

// إنشاء التنبيه عند التثبيت
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('zekrReminder', { periodInMinutes: 60 });
  chrome.storage.local.set({
    counter: 0,
    dailyCount: 0,
    totalCount: 0,
    dailyGoal: 100,
    language: 'ar',
    darkMode: false
  });
});

// إظهار التنبيه عند حلول الوقت
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'zekrReminder') {
    chrome.storage.local.get(['language'], (res) => {
      const lang = res.language || 'ar';
      chrome.notifications.create('', {
        title: messages[lang].reminderTitle,
        message: messages[lang].reminderMessage,
        iconUrl: 'icons/icon128.png',
        type: 'basic'
      });
    });
  }
});

// إعادة تعيين العداد اليومي عند منتصف الليل
function resetDailyCounter() {
  chrome.storage.local.get(['dailyCount', 'totalCount'], (res) => {
    const totalCount = (res.totalCount || 0) + (res.dailyCount || 0);
    chrome.storage.local.set({
      dailyCount: 0,
      totalCount: totalCount
    });
  });
}

// التحقق من الوقت كل دقيقة
function checkForMidnight() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    resetDailyCounter();
  }
}

// بدء التحقق من الوقت
setInterval(checkForMidnight, 60000);