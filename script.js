console.log("Investable Dashboard is connected!");

// 🔑 API Keys
const FINNHUB_KEY = "d40g571r01qqo3qhs74gd40g571r01qqo3qhs750";
const NEWS_KEY = "b6cLSbSqdzwpoiX8IX0chVOki8ZaiqrPodq6eyC4";

let activeChart = null;

// 📊 Fetch top active US tickers
async function fetchActiveTickers() {
  const tbody = document.getElementById("stockTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const symbolRes = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_KEY}`);
    const symbols = await symbolRes.json();
    const topSymbols = symbols.slice(0, 50); // Sample slice

    const rows = [];
    for (const stock of topSymbols) {
      const [quoteRes, profileRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${stock.symbol}&token=${FINNHUB_KEY}`)
      ]);
      const quote = await quoteRes.json();
      const profile = await profileRes.json();

      if (!quote || !quote.c || !profile.name) continue;

      rows.push({
        symbol: stock.symbol,
        name: profile.name,
        price: quote.c.toFixed(2),
        change: quote.dp.toFixed(2),
        sector: profile.finnhubIndustry || "N/A",
        volume: quote.v
      });

      if (rows.length >= 10) break;
    }

    tbody.innerHTML = rows.map(row => `
      <tr data-symbol="${row.symbol}">
        <td>${row.symbol}</td>
        <td>${row.name}</td>
        <td>$${row.price}</td>
        <td style="color:${row.change >= 0 ? "green" : "red"}">${row.change}%</td>
        <td>${row.sector}</td>
      </tr>
    `).join("");

    attachRowClickHandlers();
  } catch (err) {
    console.error("Error fetching active tickers:", err);
    tbody.innerHTML = "<tr><td colspan='5'>Failed to load data.</td></tr>";
  }
}

// 📈 Fetch candles
async function fetchCandles(symbol, days = 30) {
  const now = Math.floor(Date.now() / 1000);
  const past = now - days * 86400;
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${past}&to=${now}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.c && data.c.length > 1 ? data : null;
}

// 📈 Render chart
function renderChart(symbol, candles) {
  const ctx = document.getElementById("priceChart").getContext("2d");
  const labels = candles.t.map(ts => new Date(ts * 1000).toLocaleDateString());
  const prices = candles.c;

  if (activeChart) activeChart.destroy();
  activeChart = new Chart(ctx, {
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
function renderIndicators(symbol, quote) {
  const list = document.getElementById("indicatorList");
  list.innerHTML = `
    <li><strong>Price:</strong> $${quote.c.toFixed(2)}</li>
    <li><strong>Change (1D):</strong> ${quote.dp.toFixed(2)}%</li>
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

// 🖱 Row click handler
function attachRowClickHandlers() {
  document.querySelectorAll("#stockTableBody tr").forEach(row => {
    row.addEventListener("click", async () => {
      const symbol = row.dataset.symbol;
      await loadTickerData(symbol);
    });
  });
}

// 🔍 Search handler
document.getElementById("searchButton").addEventListener("click", async () => {
  const symbol = document.getElementById("searchInput").value.toUpperCase();
  if (!symbol) return;
  await loadTickerData(symbol);
});

// 📦 Load full ticker data
async function loadTickerData(symbol) {
  try {
    const [quoteRes, profileRes, candles] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r => r.json()),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`).then(r => r.json()),
      fetchCandles(symbol)
    ]);

    if (!quoteRes || !quoteRes.c || !candles) {
      alert(`No data available for ${symbol}`);
      return;
    }

    document.getElementById("stockTableBody").innerHTML = `
      <tr data-symbol="${symbol}">
        <td>${symbol}</td>
        <td>${profileRes.name || symbol}</td>
        <td>$${quoteRes.c.toFixed(2)}</td>
        <td style="color:${quoteRes.dp >= 0 ? "green" : "red"}">${quoteRes.dp.toFixed(2)}%</td>
        <td>${profileRes.finnhubIndustry || "N/A"}</td>
      </tr>
    `;

    attachRowClickHandlers();
    renderChart(symbol, candles);
    renderIndicators(symbol, quoteRes);
    fetchNews(symbol);
  } catch (err) {
    console.error("Error loading ticker:", err);
  }
}

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

// 🚀 Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchActiveTickers();
});
