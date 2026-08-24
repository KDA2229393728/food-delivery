
const dishes = [
  { id: 1, name: "Чизбургер", category: "Бургеры", price: 390, emoji: "🍔", desc: "Говяжья котлета, сыр чеддер, салат, томаты, фирменный соус." },
  { id: 2, name: "Двойной бургер", category: "Бургеры", price: 520, emoji: "🍔", desc: "Две котлеты, двойной сыр, маринованный огурец, соус." },
  { id: 3, name: "Пепперони 30 см", category: "Пицца", price: 690, emoji: "🍕", desc: "Моцарелла, пепперони, томатный соус." },
  { id: 4, name: "Маргарита 30 см", category: "Пицца", price: 590, emoji: "🍕", desc: "Моцарелла, томаты, базилик, томатный соус." },
  { id: 5, name: "Шаурма с курицей", category: "Шаурма", price: 350, emoji: "🌯", desc: "Курица, овощи, картофель, чесночный соус, лаваш." },
  { id: 6, name: "Картофель фри", category: "Закуски", price: 190, emoji: "🍟", desc: "Хрустящий картофель фри с солью." },
  { id: 7, name: "Наггетсы 9 шт.", category: "Закуски", price: 290, emoji: "🍗", desc: "Куриные наггетсы в хрустящей панировке." },
  { id: 8, name: "Coca-Cola 0,5", category: "Напитки", price: 140, emoji: "🥤", desc: "Газированный напиток, 0,5 л." },
  { id: 9, name: "Морс 0,5", category: "Напитки", price: 160, emoji: "🧃", desc: "Домашний ягодный морс, 0,5 л." }
];

let cart = {};
let activeCategory = "Все";

const menuEl = document.getElementById("menu");
const categoriesEl = document.getElementById("categories");
const cartEl = document.getElementById("cart");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const statusEl = document.getElementById("status");

function renderCategories() {
  const categories = ["Все", ...new Set(dishes.map(d => d.category))];
  categoriesEl.innerHTML = categories.map(c =>
    `<button class="category-btn ${c === activeCategory ? "active" : ""}" onclick="setCategory('${c}')">${c}</button>`
  ).join("");
}

function setCategory(c) {
  activeCategory = c;
  renderCategories();
  renderMenu();
}

function renderMenu() {
  const filtered = activeCategory === "Все" ? dishes : dishes.filter(d => d.category === activeCategory);
  menuEl.innerHTML = filtered.map(d => `
    <article class="card">
      <div class="food-img">${d.emoji}</div>
      <div class="card-body">
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="card-bottom">
          <div class="price">${d.price} ₽</div>
          <button class="add-btn" onclick="addToCart(${d.id})">+ Добавить</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function getCartLines() {
  return Object.entries(cart).map(([id, qty]) => {
    const dish = dishes.find(d => d.id === Number(id));
    return { ...dish, qty, lineTotal: dish.price * qty };
  });
}

function renderCart() {
  const lines = getCartLines();
  cartCountEl.textContent = lines.reduce((s, x) => s + x.qty, 0);
  cartTotalEl.textContent = lines.reduce((s, x) => s + x.lineTotal, 0);

  if (!lines.length) {
    cartItemsEl.innerHTML = `<p>Корзина пока пустая.</p>`;
    return;
  }

  cartItemsEl.innerHTML = lines.map(x => `
    <div class="cart-item">
      <div>
        <strong>${x.name}</strong>
        <div>${x.price} ₽ × ${x.qty}</div>
      </div>
      <div class="qty">
        <button onclick="changeQty(${x.id}, -1)">−</button>
        <span>${x.qty}</span>
        <button onclick="changeQty(${x.id}, 1)">+</button>
      </div>
    </div>
  `).join("");
}

document.getElementById("openCart").onclick = () => cartEl.classList.add("open");
document.getElementById("closeCart").onclick = () => cartEl.classList.remove("open");
cartEl.addEventListener("click", e => {
  if (e.target === cartEl) cartEl.classList.remove("open");
});

document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const items = getCartLines();
  if (!items.length) {
    statusEl.textContent = "Добавьте хотя бы одно блюдо.";
    return;
  }

  const form = new FormData(e.target);
  const payload = {
    customer: Object.fromEntries(form.entries()),
    items,
    total: items.reduce((s, x) => s + x.lineTotal, 0)
  };

  statusEl.textContent = "Отправляем заказ…";

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка отправки");

    statusEl.textContent = "Заказ принят! Мы скоро свяжемся с вами.";
    cart = {};
    renderCart();
    e.target.reset();
  } catch (err) {
    statusEl.textContent = "Не удалось отправить заказ. Проверьте настройки Telegram.";
  }
});

renderCategories();
renderMenu();
renderCart();
