const menu = [
  {
    id: 1, name: "Борщ со сметаной", category: "Супы", price: 290, weight: "400 г",
    image: "/images/borsch.webp",
    desc: "Говядина, свёкла, капуста, картофель, морковь, лук, томатная паста, сметана и зелень."
  },
  {
    id: 2, name: "Лапша с курицей", category: "Супы", price: 260, weight: "400 г",
    image: "/images/chicken-noodle.webp",
    desc: "Куриный бульон, домашняя лапша, куриное филе, картофель, морковь, лук и зелень."
  },
  {
    id: 3, name: "Солянка", category: "Супы", price: 340, weight: "400 г",
    image: "/images/solyanka.webp",
    desc: "Говядина, колбаски, ветчина, солёные огурцы, маслины, томат, лимон, сметана и зелень."
  },
  {
    id: 4, name: "Котлета с пюре", category: "Горячее", price: 390, weight: "350 г",
    image: "/images/cutlet-mash.webp",
    desc: "Домашняя мясная котлета, картофельное пюре с молоком и сливочным маслом, свежая зелень."
  },
  {
    id: 5, name: "Котлета с гречкой", category: "Горячее", price: 380, weight: "350 г",
    image: "/images/cutlet-buckwheat.webp",
    desc: "Домашняя мясная котлета, рассыпчатая гречка, сливочное масло и свежая зелень."
  },
  {
    id: 6, name: "Плов с говядиной", category: "Горячее", price: 420, weight: "400 г",
    image: "/images/plov.webp",
    desc: "Рис, говядина, морковь, лук, чеснок и ароматные специи."
  },
  {
    id: 7, name: "Макароны с тефтелями", category: "Горячее", price: 390, weight: "350 г",
    image: "/images/meatballs-pasta.webp",
    desc: "Макароны, мясные тефтели, домашний томатный соус и зелень."
  },
  {
    id: 8, name: "Оливье", category: "Салаты", price: 230, weight: "200 г",
    image: "/images/olivier.webp",
    desc: "Картофель, морковь, яйцо, ветчина, зелёный горошек, солёный огурец и майонез."
  },
  {
    id: 9, name: "Винегрет", category: "Салаты", price: 190, weight: "200 г",
    image: "/images/vinaigrette.webp",
    desc: "Свёкла, картофель, морковь, солёный огурец, зелёный горошек, лук и растительное масло."
  },
  {
    id: 10, name: "Блины", category: "Завтраки", price: 220, weight: "3 шт. / 250 г",
    image: "/images/bliny.webp",
    desc: "Тонкие домашние блины. Подаются со сметаной и ягодным вареньем."
  },
  {
    id: 11, name: "Сырники", category: "Завтраки", price: 290, weight: "3 шт. / 240 г",
    image: "/images/syrniki.webp",
    desc: "Творог, яйцо, мука и немного сахара. Подаются со сметаной и ягодным вареньем."
  },
  {
    id: 12, name: "Пирожок с картошкой", category: "Выпечка", price: 110, weight: "1 шт. / 120 г",
    image: "/images/pie-potato.webp",
    desc: "Мягкое дрожжевое тесто, картофель, жареный лук и зелень."
  },
  {
    id: 13, name: "Пирожок с мясом", category: "Выпечка", price: 140, weight: "1 шт. / 120 г",
    image: "/images/pie-meat.webp",
    desc: "Мягкое дрожжевое тесто, мясной фарш, репчатый лук и специи."
  },
  {
    id: 14, name: "Домашний компот", category: "Напитки", price: 120, weight: "0,5 л",
    image: "/images/compote.webp",
    desc: "Домашний компот из яблок, ягод и сухофруктов."
  },
  {
    id: 15, name: "Ягодный морс", category: "Напитки", price: 150, weight: "0,5 л",
    image: "/images/mors.webp",
    desc: "Насыщенный морс из клюквы и лесных ягод."
  }
];

let cart = JSON.parse(localStorage.getItem("kakDomaCart") || "{}");
let activeCategory = "Все";

const menuGrid = document.getElementById("menuGrid");
const categoryTabs = document.getElementById("categoryTabs");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const orderForm = document.getElementById("orderForm");
const statusEl = document.getElementById("status");
const submitOrder = document.getElementById("submitOrder");

const money = value => `${value.toLocaleString("ru-RU")} ₽`;

function saveCart() {
  localStorage.setItem("kakDomaCart", JSON.stringify(cart));
}

function categories() {
  return ["Все", ...new Set(menu.map(item => item.category))];
}

function renderCategories() {
  categoryTabs.innerHTML = categories().map(cat => `
    <button class="category-tab ${cat === activeCategory ? "active" : ""}" data-category="${cat}" type="button">${cat}</button>
  `).join("");

  categoryTabs.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const items = activeCategory === "Все" ? menu : menu.filter(item => item.category === activeCategory);
  menuGrid.innerHTML = items.map(item => `
    <article class="card">
      <div class="card-image-wrap">
        <img class="card-image" src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">${item.category}</span>
          <span>${item.weight}</span>
        </div>
        <h3>${item.name}</h3>
        <p class="card-description">${item.desc}</p>
        <div class="card-bottom">
          <span class="card-price">${money(item.price)}</span>
          <button class="add-button" type="button" data-add="${item.id}">Добавить</button>
        </div>
      </div>
    </article>
  `).join("");

  menuGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.add)));
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const button = document.querySelector(`[data-add="${id}"]`);
  if (button) {
    const old = button.textContent;
    button.textContent = "Добавлено ✓";
    setTimeout(() => button.textContent = old, 700);
  }
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function getCartLines() {
  return Object.entries(cart).map(([id, qty]) => {
    const item = menu.find(x => x.id === Number(id));
    return item ? { ...item, qty, lineTotal: item.price * qty } : null;
  }).filter(Boolean);
}

function renderCart() {
  const lines = getCartLines();
  const count = lines.reduce((sum, item) => sum + item.qty, 0);
  const total = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (!lines.length) {
    cartItems.innerHTML = `<div class="empty-cart">Корзина пока пуста.<br>Добавьте блюда из меню.</div>`;
  } else {
    cartItems.innerHTML = lines.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="" />
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${money(item.price)} × ${item.qty}</span>
        </div>
        <div class="qty">
          <button type="button" data-minus="${item.id}" aria-label="Уменьшить">−</button>
          <b>${item.qty}</b>
          <button type="button" data-plus="${item.id}" aria-label="Увеличить">+</button>
        </div>
      </div>
    `).join("");
  }

  cartItems.querySelectorAll("[data-minus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.minus), -1)));
  cartItems.querySelectorAll("[data-plus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.plus), 1)));
}

function openCart() {
  overlay.hidden = false;
  requestAnimationFrame(() => cartDrawer.classList.add("open"));
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => { overlay.hidden = true; }, 280);
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lines = getCartLines();
  if (!lines.length) {
    statusEl.className = "status error";
    statusEl.textContent = "Сначала добавьте блюда в корзину.";
    return;
  }

  const customer = Object.fromEntries(new FormData(orderForm).entries());
  const items = lines.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    lineTotal: item.lineTotal
  }));
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  statusEl.className = "status";
  statusEl.textContent = "Отправляем заказ…";
  submitOrder.disabled = true;

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items, total })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Ошибка отправки");

    cart = {};
    saveCart();
    renderCart();
    orderForm.reset();
    statusEl.className = "status ok";
    statusEl.textContent = "Заказ принят! Мы скоро свяжемся с вами.";
  } catch (err) {
    statusEl.className = "status error";
    statusEl.textContent = `Не удалось отправить заказ: ${err.message}`;
  } finally {
    submitOrder.disabled = false;
  }
});

renderCategories();
renderMenu();
renderCart();
