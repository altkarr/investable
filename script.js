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
