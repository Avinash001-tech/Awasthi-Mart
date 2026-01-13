const container = document.getElementById("products");
const searchInput = document.getElementById("searchInput");

const API_BASE = "https://awasthi-mart-9.onrender.com";
let allProducts = [];

async function loadProducts(category = "") {
  const url = category
    ? `${API_BASE}/api/products?category=${category}`
    : `${API_BASE}/api/products`;

  const res = await fetch(url);
  allProducts = await res.json();
  renderProducts(allProducts);
}

function renderProducts(products) {
  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${API_BASE}${p.image}">
        <h4>${p.title}</h4>
        <span>₹${p.price}</span>
        <a href="https://wa.me/918840125802" target="_blank">
          Buy on WhatsApp
        </a>
      </div>
    `;
  });
}

// 🔍 SEARCH FUNCTION
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.title.toLowerCase().includes(value)
  );
  renderProducts(filtered);
});

loadProducts();
