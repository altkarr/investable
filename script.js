console.log("Investable Dashboard is connected!");

// 🔑 API Keys
const FINNHUB_KEY = "d40g571r01qqo3qhs74gd40g571r01qqo3qhs750";
const NEWS_KEY = "b6cLSbSqdzwpoiX8IX0chVOki8ZaiqrPodq6eyC4";

// 📊 Fetch quote and profile
async function fetchStockInfo(symbol) {
  try {
    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const profileRes = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const quote = await quoteRes.json();
    const profile = await profileRes.json();
    return { quote, profile };
  } catch (err) {
    console.error("Error fetching stock info:", err);
    return null;
  }
}

// 📈 Fetch historical candles
async function fetchCandles(symbol, days = 30) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const past = now - days * 86400;
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${past}&to=${now}&token=${FINNHUB_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data.c || data.c.length < 2) return null;
    return data;
  } catch (err) {
    console.error("Error fetching candles:", err);
    return null;
  }
}

// 🧠 Calculate performance
function calculatePerformance(candles) {
  const close = candles.c;
  const len = close.length;
  const pct = (a, b) => (((b - a) / a) * 100).toFixed(2);
  return {
    "1D": pct(close[len - 2], close[len - 1]),
    "7D": len >= 8 ? pct(close[len - 8], close[len - 1]) : "N/A",
    "1M": len >= 22 ? pct(close[len - 22], close[len - 1]) : "N/A"
  };
}

// 📈 Render chart
function renderChart(symbol, candles) {
  const ctx = document.getElementById("priceChart").getContext("2d");
  const labels = candles.t.map(ts => new Date(ts * 1000).toLocaleDateString());
  const prices = candles.c;

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${symbol} Price`,
        data: prices,
        borderColor: "#0077cc",
        backgroundColor: "rgba(0, 119, 204, 0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { display: true },
        y: { display: true }
      }
    }
  });
}

// 📋 Render indicators
function renderIndicators(symbol, quote, performance) {
  const list = document.getElementById("indicatorList");
  list.innerHTML = `
    <li><strong>Price:</strong> $${quote.c.toFixed(2)}</li>
    <li><strong>Change (1D):</strong> ${performance["1D"]}%</li>
    <li><strong>Change (7D):</strong> ${performance["7D"]}%</li>
    <li><strong>Change (1M):</strong> ${performance["1M"]}%</li>
    <li><strong>Volume:</strong> ${quote.v.toLocaleString()}</li>
    <li><strong>Momentum:</strong> ${quote.dp >= 0 ? "Positive" : "Negative"}</li>
  `;
}

// 📰 Fetch news
async function fetchNews(symbol) {
  const list = document.getElementById("news-list");
  list.innerHTML = "<li>Loading news...</li>";
  try {
    const url = `https://api.marketaux.com/v1/news/all?symbols=${symbol}&language=en&api_token=${NEWS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      list.innerHTML = "<li>No news available.</li>";
      return;
    }
    const items = data.data.slice(0, 5).map(article => {
      return `<li><a href="${article.url}" target="_blank">${article.title}</a> <span class="source">${article.source}</span></li>`;
    });
    list.innerHTML = items.join("");
  } catch (err) {
    console.error("News fetch failed:", err);
    list.innerHTML = "<li>Failed to load news.</li>";
  }
}

// 🔍 Search handler
document.getElementById("searchButton").addEventListener("click", async () => {
  const symbol = document.getElementById("searchInput").value.toUpperCase();
  if (!symbol) return;

  const info = await fetchStockInfo(symbol);
  const candles = await fetchCandles(symbol);

  if (!info || !candles) {
    document.getElementById("stockTableBody").innerHTML = `
      <tr><td>${symbol}</td><td colspan="4">Data unavailable</td></tr>
    `;
    return;
  }

  const { quote, profile } = info;
  const performance = calculatePerformance(candles);

  document.getElementById("stockTableBody").innerHTML = `
    <tr>
      <td>${symbol}</td>
      <td>${profile.name || symbol}</td>
      <td>$${quote.c.toFixed(2)}</td>
      <td style="color:${quote.dp >= 0 ? "green" : "red"}">${quote.dp.toFixed(2)}%</td>
      <td>${profile.finnhubIndustry || "N/A"}</td>
    </tr>
  `;

  renderChart(symbol, candles);
  renderIndicators(symbol, quote, performance);
  fetchNews(symbol);
});

// 🌙 Dark mode toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// 🧭 Tab switching
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(content => {
      content.style.display = content.id === tab ? "block" : "none";
    });
  });
});

// 📌 Nav highlight
document.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute("id");
  });
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) link.classList.add("active");
  });
});
