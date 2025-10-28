console.log("Investable Dashboard is connected!");

// 🔑 API Keys
const FINNHUB_KEY = "d40g571r01qqo3qhs74gd40g571r01qqo3qhs750";
const NEWS_KEY = "b6cLSbSqdzwpoiX8IX0chVOki8ZaiqrPodq6eyC4";

// 🧠 Utility: Format change
function formatChange(change) {
  const value = parseFloat(change);
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// 📊 Fetch most active stocks from Finnhub
async function fetchStockData() {
  const tbody = document.getElementById("stockTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
    const res = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_KEY}`);
    const symbols = await res.json();

    const activeSymbols = symbols.slice(0, 5); // Top 5 for demo
    const rows = await Promise.all(activeSymbols.map(async stock => {
      const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`);
      const quote = await quoteRes.json();

      if (!quote || !quote.c) {
        return `<tr><td colspan="5">${stock.symbol} data unavailable</td></tr>`;
      }

      const price = quote.c.toFixed(2);
      const change = formatChange(quote.dp);
      const color = change.startsWith("+") ? "green" : "red";

      return `
        <tr>
          <td>${stock.symbol}</td>
          <td>${stock.description || stock.symbol}</td>
          <td>$${price}</td>
          <td style="color:${color}">${change}</td>
          <td>${stock.type || "Equity"}</td>
        </tr>
      `;
    }));

    tbody.innerHTML = rows.join("");
  } catch (err) {
    console.error("Error fetching stock data:", err);
    tbody.innerHTML = "<tr><td colspan='5'>Failed to load stock data.</td></tr>";
  }
}

// 📈 Render Chart.js graph for top stock
async function renderChart(symbol = "AAPL") {
  try {
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=5&token=${FINNHUB_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.c || data.c.length === 0) {
      console.warn("Chart data unavailable");
      return;
    }

    const labels = data.t.map(ts => new Date(ts * 1000).toLocaleDateString());
    const prices = data.c;

    const ctx = document.getElementById("priceChart").getContext("2d");
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
  } catch (err) {
    console.error("Chart fetch failed:", err);
  }
}

// 📰 Fetch financial news from Marketaux
async function fetchNews() {
  const list = document.getElementById("news-list");
  list.innerHTML = "<li>Loading news...</li>";

  try {
    const url = `https://api.marketaux.com/v1/news/all?language=en&api_token=${NEWS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      list.innerHTML = "<li>No news available at this time.</li>";
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

// 🔍 Search + sector filter
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const sectorFilter = document.getElementById("sectorFilter");

  function filterRows() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSector = sectorFilter.value;
    const rows = document.querySelectorAll("#stockTableBody tr");

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const sector = row.cells[4]?.textContent.trim();
      const matchesSearch = text.includes(searchTerm);
      const matchesSector = selectedSector === "all" || sector === selectedSector;
      row.style.display = matchesSearch && matchesSector ? "" : "none";
    });
  }

  searchInput.addEventListener("keyup", filterRows);
  sectorFilter.addEventListener("change", filterRows);
});

// 🌙 Dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
});

// 🧭 Tab switching
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      contents.forEach(content => {
        content.style.display = content.id === tab ? "block" : "none";
      });
    });
  });
});

// 📌 Highlight active nav link
document.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});

// 🚀 Initialize dashboard
document.addEventListener("DOMContentLoaded", async () => {
  await fetchStockData();
  await renderChart(); // Default to AAPL or top stock
  await fetchNews();
});
