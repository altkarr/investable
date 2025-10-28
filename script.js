console.log("Investable Dashboard is connected!");

// Color-code Change column
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const changeCell = row.cells[3];
    if (changeCell) {
      const value = changeCell.textContent.trim();
      if (value.startsWith("+")) {
        changeCell.style.color = "green";
      } else if (value.startsWith("-")) {
        changeCell.style.color = "red";
      }
    }
  });
});

// Column sorting
document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector("table");
  const headers = table.querySelectorAll("th");

  headers.forEach((header, index) => {
    header.addEventListener("click", () => {
      sortTableByColumn(table, index);
    });
  });
});

function sortTableByColumn(table, columnIndex) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  const isNumeric = columnIndex === 2 || columnIndex === 3;
  const direction = table.dataset.sortDirection === "asc" ? "desc" : "asc";
  table.dataset.sortDirection = direction;

  rows.sort((a, b) => {
    let aText = a.cells[columnIndex].textContent.trim().replace(/[$%]/g, "");
    let bText = b.cells[columnIndex].textContent.trim().replace(/[$%]/g, "");

    if (isNumeric) {
      aText = parseFloat(aText);
      bText = parseFloat(bText);
    }

    if (aText < bText) return direction === "asc" ? -1 : 1;
    if (aText > bText) return direction === "asc" ? 1 : -1;
    return 0;
  });

  rows.forEach(row => tbody.appendChild(row));
}

// Collapsible sections
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll("section h2");
  headers.forEach(header => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      if (content) {
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          content.style.opacity = 0;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          content.style.opacity = 1;
        }
      }
    });
  });
});

// Dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("darkModeToggle");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
});

// Tab switching logic
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

// Search filter for stock table
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const rows = document.querySelectorAll("tbody tr");

  searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });
});

// Highlight active nav link on scroll
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
