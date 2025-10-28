// script.js
console.log("Investable Dashboard is connected!");

// Example: highlight rows where Change is positive or negative
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const changeCell = row.cells[3]; // 4th column = Change
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
// Enable column sorting
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

  const isNumeric = columnIndex === 2 || columnIndex === 3; // Price or Change
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
        content.style.display = content.style.display === "none" ? "block" : "none";
      }
    });
  });
});
