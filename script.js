console.log("Investable Dashboard is connected!");

// 🔑 API Keys
const ALPHA_KEY = "21E4S2APHN5VZ3UJ";
const NEWS_KEY = "b6cLSbSqdzwpoiX8IX0chVOki8ZaiqrPodq6eyC4";

// 🔄 Stock symbols and metadata
const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" }
];

// 🧠 Utility: Format price and change
function formatChange(change) {
  const value = parseFloat(change);
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// 📊 Fetch stock data from Alpha Vantage
async function fetchStockData() {
  const tbody = document.getElementById("stockTableBody");
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  const rows = await Promise.all(stocks.map(async stock => {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${ALPHA_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const quote = data["Global Quote"];

    const price = parseFloat(quote["05. price"]).toFixed(2);
    const change = formatChange(quote["10. change percent"]);

    return `
      <tr>
        <td>${stock.symbol}</td>
        <td>${stock.name}</td>
        <td>$${price}</td>
        <td style="color:${change.startsWith("+") ? "green" : "red"}">${change}</td>
        <td>${stock.sector}</td>
      </tr>
    `;
  }));

  tbody.innerHTML = rows.join("");
}

// 📈 Render Chart.js graph for AAPL
async function renderChart() {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=${ALPHA_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const series = data["Time Series (Daily)"];

  const labels = Object.keys(series).slice(0, 5).reverse();
  const prices = labels.map(date => parseFloat(series[date]["4. close"]));

  const ctx = document.getElementById("priceChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "AAPL Price",
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

// 📰 Fetch financial news from Marketaux
async function fetchNews() {
  const list = document.getElementById("news-list");
  list.innerHTML = "<li>Loading news...</li>";

  const url = `https://api.marketaux.com/v1/news/all?filter_entities=true&language=en&api_token=${NEWS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const items = data.data.slice(0, 5).map(article => {
    return `<li><a href="${article.url}" target="_blank">${article.title}</a> <span class="source">${article.source}</span></li>`;
  });

  list.innerHTML = items.join("");
}

// 🔍 Combined search + sector filter
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const sectorFilter = document.getElementById("sectorFilter");

  function filterRows() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSector = sectorFilter.value;
    const rows = document.querySelectorAll("#stockTableBody tr");

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const sector = row.cells[4].textContent.trim();
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
  await renderChart();
  await fetchNews();
});
