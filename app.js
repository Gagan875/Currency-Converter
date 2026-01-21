// Using ExchangeRate-API which is more reliable
const BASE_URL = "https://api.exchangerate-api.com/v4/latest";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const loading = document.querySelector(".loading");
const error = document.querySelector(".error");
const swapBtn = document.querySelector(".swap-btn");
const amountInput = document.querySelector(".amount input");

// Populate dropdowns with all currencies
for (let select of dropdowns) {
  for (currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
    updateExchangeRate();
  });
}

// Show loading state
const showLoading = () => {
  loading.style.display = "block";
  msg.style.display = "none";
  error.style.display = "none";
  btn.disabled = true;
};

// Hide loading state
const hideLoading = () => {
  loading.style.display = "none";
  msg.style.display = "block";
  btn.disabled = false;
};

// Show error message
const showError = (message) => {
  error.textContent = message;
  error.style.display = "block";
  msg.style.display = "none";
  loading.style.display = "none";
  btn.disabled = false;
};

// Fallback rates for demo purposes
const showFallbackRate = (amtVal) => {
  const fallbackRates = {
    'USD-INR': 83.12, 'INR-USD': 0.012, 'USD-EUR': 0.85, 'EUR-USD': 1.18,
    'USD-GBP': 0.73, 'GBP-USD': 1.37, 'EUR-INR': 97.79, 'INR-EUR': 0.010,
    'GBP-INR': 113.89, 'INR-GBP': 0.009, 'USD-JPY': 110.25, 'JPY-USD': 0.009,
    'USD-AUD': 1.35, 'AUD-USD': 0.74, 'USD-CAD': 1.25, 'CAD-USD': 0.80
  };
  
  const key = `${fromCurr.value}-${toCurr.value}`;
  const reverseKey = `${toCurr.value}-${fromCurr.value}`;
  
  let rate = fallbackRates[key];
  if (!rate && fallbackRates[reverseKey]) {
    rate = 1 / fallbackRates[reverseKey];
  }
  
  if (rate) {
    const finalAmount = amtVal * rate;
    msg.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(finalAmount)} ${toCurr.value} <small>(Demo Rate)</small>`;
    hideLoading();
  } else {
    showError("Exchange rate not available for this currency pair.");
  }
};

// Format number with commas
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(num);
};

// Debounce function for input
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const updateExchangeRate = async () => {
  let amtVal = amountInput.value;
  
  // Validate input
  if (amtVal === "" || isNaN(amtVal) || amtVal <= 0) {
    amtVal = 1;
    amountInput.value = "1";
  }

  // Don't fetch if same currencies
  if (fromCurr.value === toCurr.value) {
    msg.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(amtVal)} ${toCurr.value}`;
    return;
  }

  showLoading();

  try {
    // Using ExchangeRate-API format
    const URL = `${BASE_URL}/${fromCurr.value}`;
    const response = await fetch(URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates[toCurr.value];
    
    if (!rate) {
      throw new Error("Exchange rate not available");
    }

    const finalAmount = amtVal * rate;
    msg.innerHTML = `${formatNumber(amtVal)} ${fromCurr.value} = ${formatNumber(finalAmount)} ${toCurr.value}`;
    
    hideLoading();
  } catch (err) {
    console.error("Error fetching exchange rate:", err);
    // Fallback to mock data if API fails
    showFallbackRate(amtVal);
  }
};

// Debounced version for input changes
const debouncedUpdate = debounce(updateExchangeRate, 500);

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
  img.onerror = () => {
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='32' y='36' text-anchor='middle' font-size='12' fill='%23666'%3E" + currCode + "%3C/text%3E%3C/svg%3E";
  };
};

// Swap currencies
const swapCurrencies = () => {
  const fromValue = fromCurr.value;
  const toValue = toCurr.value;
  
  fromCurr.value = toValue;
  toCurr.value = fromValue;
  
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
};

// Event listeners
btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

swapBtn.addEventListener("click", swapCurrencies);

amountInput.addEventListener("input", debouncedUpdate);

// Keyboard shortcuts
document.addEventListener("keydown", (evt) => {
  if (evt.ctrlKey && evt.key === "Enter") {
    evt.preventDefault();
    updateExchangeRate();
  }
  if (evt.ctrlKey && evt.key === "s") {
    evt.preventDefault();
    swapCurrencies();
  }
});

// Initialize on load
window.addEventListener("load", () => {
  updateExchangeRate();
});