// Get DOM elements
const txtInput = document.getElementById("txtInput");
const searchBtn = document.getElementById("searchBtn");
const countryDisplay = document.getElementById("country");
const suggestionsList = document.getElementById("suggestions");
const historyContainer = document.getElementById("history-container");
const favoritesContainer = document.getElementById("favorites-container");

// Storage keys
const HISTORY_KEY = "countrySearchHistory";
const FAVORITES_KEY = "countryFavorites";

// Initialize
let currentCountry = null;
let searchHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

// Event listeners
searchBtn.addEventListener("click", searchCountry);
txtInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchCountry();
    }
});

// Real-time search suggestions
txtInput.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value.length > 1) {
        fetch("https://restcountries.com/v3.1/name/" + value)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                const suggestions = data.slice(0, 5).map(c => c.name.common);
                displaySuggestions(suggestions);
            })
            .catch(() => suggestionsList.innerHTML = "");
    } else {
        suggestionsList.innerHTML = "";
    }
});

function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = suggestions
        .map(s => `<div class="suggestion-item" onclick="selectSuggestion('${s}')">${s}</div>`)
        .join("");
}

function selectSuggestion(country) {
    txtInput.value = country;
    suggestionsList.innerHTML = "";
    searchCountry();
}

function searchCountry() {
    const countryName = txtInput.value.trim();
    
    if (!countryName) {
        countryDisplay.innerHTML = '<p class="error">Please enter a country name</p>';
        return;
    }

    countryDisplay.innerHTML = '<p class="loading">Searching...</p>';
    searchBtn.disabled = true;
    searchBtn.textContent = "🔍 Searching...";

    fetch("https://restcountries.com/v3.1/name/" + countryName)
        .then(res => {
            if (!res.ok) throw new Error("Country not found");
            return res.json();
        })
        .then(data => {
            const country = data[0];
            currentCountry = country;
            
            // Add to history
            addToHistory(country.name.common);
            updateHistoryDisplay();
            
            displayCountryCard(country);
        })
        .catch(error => {
            countryDisplay.innerHTML = `<p class="error">❌ ${error.message}. Try again!</p>`;
        })
        .finally(() => {
            searchBtn.disabled = false;
            searchBtn.textContent = "🔍 Search";
        });
}

function displayCountryCard(country) {
    const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A";
    const currencies = country.currencies ? Object.values(country.currencies).map(curr => curr.name).join(", ") : "N/A";
    const currencySymbols = country.currencies ? Object.values(country.currencies).map(curr => curr.symbol).join(", ") : "N/A";
    const borders = country.borders ? country.borders.join(", ") : "N/A";
    const isFavorite = favorites.includes(country.name.common);
    const gdp = country.population && country.area ? (country.population / country.area).toFixed(0) : "N/A";
    
    countryDisplay.innerHTML = `
        <div class="country-card">
            <div class="card-header">
                <h1>${country.name.common}</h1>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${country.name.common}')">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            
            <div class="flag-container">
                <img class="flag" src="${country.flags.png}" alt="Flag of ${country.name.common}">
                ${country.coatOfArms.png ? `<img class="coat-of-arms" src="${country.coatOfArms.png}" alt="Coat of Arms">` : ''}
            </div>

            <div class="quick-stats">
                <div class="stat">
                    <span class="stat-number">${country.population.toLocaleString()}</span>
                    <span class="stat-label">Population</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${country.area ? country.area.toLocaleString() : 'N/A'}</span>
                    <span class="stat-label">Area (km²)</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${gdp}</span>
                    <span class="stat-label">Pop Density</span>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <label>🏛️ Capital:</label>
                    <p>${country.capital?.[0] || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label>🗺️ Region:</label>
                    <p>${country.region}</p>
                </div>
                <div class="info-item">
                    <label>📍 Subregion:</label>
                    <p>${country.subregion || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label>🗣️ Languages:</label>
                    <p>${languages}</p>
                </div>
                <div class="info-item">
                    <label>💱 Currency:</label>
                    <p>${currencies}</p>
                </div>
                <div class="info-item">
                    <label>💲 Symbol:</label>
                    <p>${currencySymbols}</p>
                </div>
                <div class="info-item">
                    <label>🕐 Timezones:</label>
                    <p>${country.timezones.join(", ")}</p>
                </div>
                <div class="info-item">
                    <label>📅 Start of Week:</label>
                    <p>${country.startOfWeek || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label>🛂 Border Countries:</label>
                    <p>${borders}</p>
                </div>
                <div class="info-item">
                    <label>☎️ Country Code:</label>
                    <p>${country.cca2 || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label>🌐 Top Level Domain:</label>
                    <p>${country.tld ? country.tld.join(", ") : 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label>☎️ Calling Code:</label>
                    <p>${country.idd?.root}${country.idd?.suffixes?.[0] || 'N/A'}</p>
                </div>
            </div>

            <div class="action-buttons">
                <button class="action-btn" onclick="getMoreInfo()">📖 Learn More</button>
                <button class="action-btn" onclick="shareCountry()">📤 Share</button>
                <button class="action-btn" onclick="downloadInfo()">⬇️ Download</button>
            </div>
        </div>
    `;
}

function toggleFavorite(countryName) {
    const index = favorites.indexOf(countryName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(countryName);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesDisplay();
    
    // Refresh current card if same country
    if (currentCountry && currentCountry.name.common === countryName) {
        displayCountryCard(currentCountry);
    }
}

function addToHistory(countryName) {
    // Remove if exists and re-add to top
    searchHistory = searchHistory.filter(c => c !== countryName);
    searchHistory.unshift(countryName);
    // Keep only last 10
    searchHistory = searchHistory.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
}

function updateHistoryDisplay() {
    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">No search history yet</p>';
        return;
    }
    historyContainer.innerHTML = '<div class="history-chips">' + 
        searchHistory.map(c => `
            <button class="chip" onclick="selectFromHistory('${c}')">${c}</button>
        `).join("") + 
        '</div>' +
        '<button class="clear-btn" onclick="clearHistory()">Clear History</button>';
}

function updateFavoritesDisplay() {
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p class="empty-message">No favorites yet</p>';
        return;
    }
    favoritesContainer.innerHTML = '<div class="favorites-chips">' + 
        favorites.map(c => `
            <button class="chip favorite-chip" onclick="selectFromHistory('${c}')">${c}</button>
        `).join("") + 
        '</div>' +
        '<button class="clear-btn" onclick="clearFavorites()">Clear Favorites</button>';
}

function selectFromHistory(countryName) {
    txtInput.value = countryName;
    searchCountry();
}

function clearHistory() {
    if (confirm("Clear all search history?")) {
        searchHistory = [];
        localStorage.removeItem(HISTORY_KEY);
        updateHistoryDisplay();
    }
}

function clearFavorites() {
    if (confirm("Clear all favorites?")) {
        favorites = [];
        localStorage.removeItem(FAVORITES_KEY);
        updateFavoritesDisplay();
        if (currentCountry) displayCountryCard(currentCountry);
    }
}

function getMoreInfo() {
    if (currentCountry) {
        const wikiUrl = `https://en.wikipedia.org/wiki/${currentCountry.name.common}`;
        window.open(wikiUrl, '_blank');
    }
}

function shareCountry() {
    if (currentCountry) {
        const text = `🌍 Check out ${currentCountry.name.common}! Population: ${currentCountry.population.toLocaleString()}, Capital: ${currentCountry.capital?.[0] || 'N/A'}`;
        if (navigator.share) {
            navigator.share({
                title: currentCountry.name.common,
                text: text
            });
        } else {
            alert(text);
        }
    }
}

function downloadInfo() {
    if (currentCountry) {
        const info = `
Country: ${currentCountry.name.common}
Capital: ${currentCountry.capital?.[0] || 'N/A'}
Region: ${currentCountry.region}
Population: ${currentCountry.population.toLocaleString()}
Area: ${currentCountry.area ? currentCountry.area.toLocaleString() : 'N/A'} km²
Languages: ${currentCountry.languages ? Object.values(currentCountry.languages).join(", ") : 'N/A'}
Currency: ${currentCountry.currencies ? Object.values(currentCountry.currencies).map(c => c.name).join(", ") : 'N/A'}
        `;
        const blob = new Blob([info], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentCountry.name.common}.txt`;
        a.click();
    }
}

// Initialize displays
updateHistoryDisplay();
updateFavoritesDisplay();