// Using ExchangeRate-API which is more reliable
const BASE_URL = "https://api.exchangerate-api.com/v4/latest";

console.log('Currency Converter Pro - Initializing...');
console.log('API Base URL:', BASE_URL);

// DOM Elements
const dropdowns = document.querySelectorAll(".currency-select");
const btn = document.querySelector(".convert-btn");
const fromCurr = document.querySelector('select[name="from"]');
const toCurr = document.querySelector('select[name="to"]');
const resultCard = document.querySelector(".result-card");
const resultText = document.querySelector(".result-text");
const rateTime = document.querySelector(".rate-time");
const rateChange = document.querySelector(".rate-change");
const loadingState = document.querySelector(".loading-state");
const errorState = document.querySelector(".error-state");
const swapBtn = document.querySelector(".swap-btn");
const amountInput = document.querySelector("#amount");
const quickBtns = document.querySelectorAll(".quick-btn");
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const toastContainer = document.querySelector("#toastContainer");

console.log('DOM Elements found:', {
  dropdowns: dropdowns.length,
  quickBtns: quickBtns.length,
  tabBtns: tabBtns.length,
  tabPanels: tabPanels.length,
  hasConvertBtn: !!btn,
  hasSwapBtn: !!swapBtn,
  hasAmountInput: !!amountInput
});

// History and favorites storage
let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
let favoritePairs = JSON.parse(localStorage.getItem('favoritePairs') || '["USD-INR", "EUR-USD"]');

console.log('Local Storage Data:', {
  historyCount: conversionHistory.length,
  favoritePairs: favoritePairs,
  lastConversion: conversionHistory[0] || 'None'
});

// Populate dropdowns with all currencies
console.log('Populating currency dropdowns...');
for (let select of dropdowns) {
  // Clear existing options first
  select.innerHTML = '';
  
  let optionCount = 0;
  for (currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
      console.log('Default FROM currency set:', currCode);
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
      console.log('Default TO currency set:', currCode);
    }
    select.append(newOption);
    optionCount++;
  }
  
  console.log(`${select.name.toUpperCase()} dropdown populated with ${optionCount} currencies`);

  select.addEventListener("change", (evt) => {
    console.log(`Currency changed: ${evt.target.name} = ${evt.target.value}`);
    updateFlag(evt.target);
    updateExchangeRate();
  });
}

// Quick amount button handlers
console.log('Setting up quick amount buttons...');
quickBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const amount = btn.dataset.amount;
    console.log(`Quick amount selected: ${amount}`);
    
    // Remove active class from all buttons
    quickBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');
    // Set amount
    amountInput.value = amount;
    updateExchangeRate();
  });
});

// Tab functionality
console.log('Setting up tab functionality...');
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    console.log(`Tab switched to: ${tabId}`);
    
    // Remove active class from all tabs and panels
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding panel
    btn.classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
    
    // Load content based on tab
    if (tabId === 'history') {
      console.log('Loading history content...');
      loadHistoryContent();
    } else if (tabId === 'favorites') {
      console.log('Loading favorites content...');
      loadFavoritesContent();
    }
  });
});

// Show loading state
const showLoading = () => {
  console.log('Showing loading state...');
  loadingState.style.display = "flex";
  resultCard.style.display = "none";
  errorState.style.display = "none";
  btn.disabled = true;
};

// Hide loading state
const hideLoading = () => {
  console.log('Hiding loading state...');
  loadingState.style.display = "none";
  resultCard.style.display = "block";
  btn.disabled = false;
};

// Show error message
const showError = (message) => {
  console.error('Error displayed:', message);
  errorState.querySelector('.error-text').textContent = message;
  errorState.style.display = "flex";
  resultCard.style.display = "none";
  loadingState.style.display = "none";
  btn.disabled = false;
};

// Show toast notification
const showToast = (message, type = 'info') => {
  console.log(`Toast notification: [${type.toUpperCase()}] ${message}`);
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
    console.log('Toast notification removed');
  }, 3000);
};

// Fallback rates for demo purposes
const showFallbackRate = (amtVal) => {
  console.log('Using fallback rates for conversion...');
  const fallbackRates = {
    'USD-INR': 83.12, 'INR-USD': 0.012, 'USD-EUR': 0.85, 'EUR-USD': 1.18,
    'USD-GBP': 0.73, 'GBP-USD': 1.37, 'EUR-INR': 97.79, 'INR-EUR': 0.010,
    'GBP-INR': 113.89, 'INR-GBP': 0.009, 'USD-JPY': 110.25, 'JPY-USD': 0.009,
    'USD-AUD': 1.35, 'AUD-USD': 0.74, 'USD-CAD': 1.25, 'CAD-USD': 0.80
  };
  
  const key = `${fromCurr.value}-${toCurr.value}`;
  const reverseKey = `${toCurr.value}-${fromCurr.value}`;
  
  console.log('Looking for fallback rate:', { key, reverseKey });
  
  let rate = fallbackRates[key];
  if (!rate && fallbackRates[reverseKey]) {
    rate = 1 / fallbackRates[reverseKey];
    console.log('Using reverse rate calculation:', rate);
  }
  
  if (rate) {
    const finalAmount = amtVal * rate;
    console.log('Fallback conversion calculated:', {
      amount: amtVal,
      fromCurrency: fromCurr.value,
      toCurrency: toCurr.value,
      rate: rate,
      result: finalAmount
    });
    
    resultText.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(finalAmount)} ${toCurr.value} <small>(Demo Rate)</small>`;
    rateTime.textContent = 'Demo data';
    rateChange.textContent = '+0.12%';
    rateChange.className = 'rate-change positive';
    hideLoading();
    
    // Add to history
    addToHistory(amtVal, fromCurr.value, finalAmount, toCurr.value);
    showToast('Using demo exchange rates', 'info');
  } else {
    console.error('No fallback rate available for currency pair:', key);
    showError("Exchange rate not available for this currency pair.");
  }
};

// Format number with commas
const formatNumber = (num) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(num);
  console.log(`Number formatted: ${num} → ${formatted}`);
  return formatted;
};

// Debounce function for input
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      console.log(`Debounced function executed after ${wait}ms delay`);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add conversion to history
const addToHistory = (fromAmount, fromCurrency, toAmount, toCurrency) => {
  const conversion = {
    id: Date.now(),
    fromAmount,
    fromCurrency,
    toAmount,
    toCurrency,
    timestamp: new Date().toISOString()
  };
  
  console.log('Adding conversion to history:', conversion);
  
  conversionHistory.unshift(conversion);
  conversionHistory = conversionHistory.slice(0, 10); // Keep only last 10
  localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
  
  console.log(`History updated. Total entries: ${conversionHistory.length}`);
};

// Load history content
const loadHistoryContent = () => {
  console.log('Loading history content...');
  const historyList = document.querySelector('.history-list');
  if (!historyList) {
    console.warn('History list element not found');
    return;
  }
  
  if (conversionHistory.length === 0) {
    console.log('No conversion history available');
    historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No conversion history yet</p>';
    return;
  }
  
  console.log(`Rendering ${conversionHistory.length} history items`);
  historyList.innerHTML = conversionHistory.map((item, index) => {
    const timeAgo = getTimeAgo(new Date(item.timestamp));
    console.log(`History item ${index + 1}:`, { ...item, timeAgo });
    return `
      <div class="history-item">
        <div class="history-conversion">${formatNumber(item.fromAmount)} ${item.fromCurrency} → ${formatNumber(item.toAmount)} ${item.toCurrency}</div>
        <div class="history-time">${timeAgo}</div>
      </div>
    `;
  }).join('');
};

// Load favorites content
const loadFavoritesContent = () => {
  console.log('Loading favorites content...');
  const favoritesGrid = document.querySelector('.favorites-grid');
  if (!favoritesGrid) {
    console.warn('Favorites grid element not found');
    return;
  }
  
  console.log('Favorite pairs:', favoritePairs);
  favoritesGrid.innerHTML = favoritePairs.map(pair => {
    const [from, to] = pair.split('-');
    return `
      <div class="favorite-pair" data-pair="${pair}">
        <span class="pair-text">${from}/${to}</span>
        <span class="pair-rate">Loading...</span>
      </div>
    `;
  }).join('');
  
  // Load rates for favorite pairs
  favoritePairs.forEach(async (pair) => {
    const [from, to] = pair.split('-');
    console.log(`Fetching rate for favorite pair: ${pair}`);
    try {
      const response = await fetch(`${BASE_URL}/${from}`);
      const data = await response.json();
      const rate = data.rates[to];
      
      console.log(`Favorite pair rate loaded: ${pair} = ${rate}`);
      
      const pairElement = document.querySelector(`[data-pair="${pair}"] .pair-rate`);
      if (pairElement && rate) {
        pairElement.textContent = formatNumber(rate);
      }
    } catch (error) {
      console.error(`Error loading favorite pair rate for ${pair}:`, error);
    }
  });
};

// Get time ago string
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  let timeAgo;
  if (diffInSeconds < 60) timeAgo = 'Just now';
  else if (diffInSeconds < 3600) timeAgo = `${Math.floor(diffInSeconds / 60)} minutes ago`;
  else if (diffInSeconds < 86400) timeAgo = `${Math.floor(diffInSeconds / 3600)} hours ago`;
  else timeAgo = `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  console.log(`Time calculation: ${date} → ${timeAgo} (${diffInSeconds}s ago)`);
  return timeAgo;
};

const updateExchangeRate = async () => {
  console.log('Starting exchange rate update...');
  let amtVal = amountInput.value;
  
  console.log('Input validation:', {
    originalValue: amtVal,
    isEmpty: amtVal === "",
    isNaN: isNaN(amtVal),
    isLessOrEqualZero: amtVal <= 0
  });
  
  // Validate input
  if (amtVal === "" || isNaN(amtVal) || amtVal <= 0) {
    console.log('Invalid input detected, setting to 1');
    amtVal = 1;
    amountInput.value = "1";
  }

  console.log('Conversion request:', {
    amount: amtVal,
    from: fromCurr.value,
    to: toCurr.value
  });

  // Don't fetch if same currencies
  if (fromCurr.value === toCurr.value) {
    console.log('Same currency detected, showing 1:1 conversion');
    resultText.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(amtVal)} ${toCurr.value}`;
    rateTime.textContent = 'Same currency';
    rateChange.textContent = '0.00%';
    rateChange.className = 'rate-change';
    return;
  }

  showLoading();

  try {
    // Using ExchangeRate-API format
    const URL = `${BASE_URL}/${fromCurr.value}`;
    console.log('Making API request to:', URL);
    
    const startTime = performance.now();
    const response = await fetch(URL);
    const endTime = performance.now();
    
    console.log(`API response time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log('API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', {
      base: data.base,
      date: data.date,
      ratesCount: Object.keys(data.rates || {}).length,
      targetRate: data.rates?.[toCurr.value]
    });
    
    const rate = data.rates[toCurr.value];
    
    if (!rate) {
      console.error('Target currency rate not found in API response');
      throw new Error("Exchange rate not available");
    }

    const finalAmount = amtVal * rate;
    console.log('Conversion successful:', {
      amount: amtVal,
      rate: rate,
      result: finalAmount,
      fromCurrency: fromCurr.value,
      toCurrency: toCurr.value
    });
    
    resultText.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(finalAmount)} ${toCurr.value}`;
    rateTime.textContent = 'Updated just now';
    
    // Simulate rate change (in real app, you'd compare with previous rate)
    const changePercent = (Math.random() - 0.5) * 2; // Random between -1 and 1
    console.log('Simulated rate change:', `${changePercent.toFixed(2)}%`);
    rateChange.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
    rateChange.className = `rate-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
    
    hideLoading();
    
    // Add to history
    addToHistory(amtVal, fromCurr.value, finalAmount, toCurr.value);
    showToast('Exchange rate updated successfully', 'success');
    
  } catch (err) {
    console.error("Error fetching exchange rate:", err);
    console.log('Falling back to demo rates...');
    // Fallback to mock data if API fails
    showFallbackRate(amtVal);
  }
};

// Debounced version for input changes
const debouncedUpdate = debounce(updateExchangeRate, 500);
console.log('Debounced update function created with 500ms delay');

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  
  console.log('Updating flag:', {
    currency: currCode,
    country: countryCode,
    flagUrl: newSrc
  });
  
  let img = element.closest('.currency-selector').querySelector('.flag-img');
  
  if (img) {
    img.src = newSrc;
    img.alt = `${currCode} Flag`;
    img.onerror = () => {
      console.warn('Flag image failed to load, using fallback for:', currCode);
      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='24' viewBox='0 0 32 24'%3E%3Crect width='32' height='24' fill='%23f0f0f0'/%3E%3Ctext x='16' y='14' text-anchor='middle' font-size='8' fill='%23666'%3E" + currCode + "%3C/text%3E%3C/svg%3E";
    };
  } else {
    console.error('Flag image element not found for currency:', currCode);
  }
};

// Swap currencies with animation
const swapCurrencies = () => {
  const fromValue = fromCurr.value;
  const toValue = toCurr.value;
  
  console.log('Swapping currencies:', {
    from: fromValue,
    to: toValue,
    newFrom: toValue,
    newTo: fromValue
  });
  
  // Add animation class
  swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
  
  setTimeout(() => {
    fromCurr.value = toValue;
    toCurr.value = fromValue;
    
    updateFlag(fromCurr);
    updateFlag(toCurr);
    updateExchangeRate();
    
    // Reset animation
    swapBtn.style.transform = '';
    showToast('Currencies swapped', 'success');
    console.log('Currency swap completed');
  }, 150);
};

// Event listeners
console.log('🎧 Setting up event listeners...');

btn.addEventListener("click", (evt) => {
  console.log('🖱️ Convert button clicked');
  evt.preventDefault();
  updateExchangeRate();
});

swapBtn.addEventListener("click", () => {
  console.log('🔄 Swap button clicked');
  swapCurrencies();
});

amountInput.addEventListener("input", (evt) => {
  console.log('⌨️ Amount input changed:', evt.target.value);
  debouncedUpdate();
});

// Keyboard shortcuts
document.addEventListener("keydown", (evt) => {
  if (evt.ctrlKey && evt.key === "Enter") {
    console.log('⌨️ Keyboard shortcut: Ctrl+Enter (Convert)');
    evt.preventDefault();
    updateExchangeRate();
  }
  if (evt.ctrlKey && evt.key === "s") {
    console.log('⌨️ Keyboard shortcut: Ctrl+S (Swap)');
    evt.preventDefault();
    swapCurrencies();
  }
});

// Header button functionality
console.log('🔗 Setting up header button functionality...');

document.getElementById('historyBtn')?.addEventListener('click', () => {
  console.log('📜 History button clicked');
  // Switch to history tab
  document.querySelector('[data-tab="history"]')?.click();
});

document.getElementById('favoritesBtn')?.addEventListener('click', () => {
  console.log('⭐ Favorites button clicked');
  // Switch to favorites tab
  document.querySelector('[data-tab="favorites"]')?.click();
});

document.getElementById('settingsBtn')?.addEventListener('click', () => {
  console.log('⚙️ Settings button clicked');
  showToast('Settings panel coming soon!', 'info');
});

// Performance monitoring
const logPerformance = () => {
  if (performance.getEntriesByType) {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      console.log('📊 Page Performance Metrics:', {
        domContentLoaded: `${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`,
        loadComplete: `${nav.loadEventEnd - nav.loadEventStart}ms`,
        totalLoadTime: `${nav.loadEventEnd - nav.fetchStart}ms`
      });
    }
  }
};

// Initialize on load
window.addEventListener("load", () => {
  console.log('🚀 Window loaded - Starting initialization...');
  
  const initStart = performance.now();
  
  updateExchangeRate();
  loadHistoryContent();
  loadFavoritesContent();
  
  // Set first quick amount as active
  if (quickBtns.length > 2) {
    quickBtns[2].classList.add('active'); // 100 button
    console.log('💰 Default quick amount set: 100');
  }
  
  const initEnd = performance.now();
  console.log(`✅ Initialization completed in ${(initEnd - initStart).toFixed(2)}ms`);
  
  // Log performance metrics
  setTimeout(logPerformance, 100);
  
  console.log('🎉 Currency Converter Pro is ready!');
  console.log('💡 Available keyboard shortcuts:');
  console.log('   - Ctrl+Enter: Convert currency');
  console.log('   - Ctrl+S: Swap currencies');
  console.log('📱 Features available:');
  console.log('   - Real-time exchange rates');
  console.log('   - Conversion history (last 10)');
  console.log('   - Favorite currency pairs');
  console.log('   - Quick amount selection');
  console.log('   - Responsive design');
  console.log('   - Toast notifications');
  console.log('   - Fallback demo rates');
});

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  showToast('An unexpected error occurred', 'error');
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Log browser and device info
console.log('🌐 Browser Information:', {
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  cookieEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  screen: {
    width: screen.width,
    height: screen.height,
    colorDepth: screen.colorDepth
  }
});

// Monitor network status
window.addEventListener('online', () => {
  console.log('🌐 Network: Back online');
  showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
  console.log('📴 Network: Gone offline');
  showToast('Connection lost - using demo rates', 'info');
});

console.log('📋 Console logging is now active for debugging and monitoring');