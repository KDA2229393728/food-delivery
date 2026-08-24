const menu = [
  { id: 1, name: "Борщ со сметаной", category: "Супы", price: 290, weight: "400 г", image: "/images/borsch.webp", desc: "Говядина, свёкла, капуста, картофель, морковь, лук, томатная паста, сметана и зелень.", badge: "🔥 Хит" },
  { id: 2, name: "Лапша с курицей", category: "Супы", price: 260, weight: "400 г", image: "/images/chicken-noodle.webp", desc: "Куриный бульон, домашняя лапша, куриное филе, картофель, морковь, лук и зелень.", badge: "♡ Любимое" },
  { id: 3, name: "Солянка", category: "Супы", price: 340, weight: "400 г", image: "/images/solyanka.webp", desc: "Говядина, колбаски, ветчина, солёные огурцы, маслины, томат, лимон, сметана и зелень.", badge: "Сытно" },
  { id: 4, name: "Котлета с пюре", category: "Горячее", price: 390, weight: "350 г", image: "/images/cutlet-mash.webp", desc: "Домашняя мясная котлета, картофельное пюре с молоком и сливочным маслом, свежая зелень.", badge: "🔥 Хит" },
  { id: 5, name: "Котлета с гречкой", category: "Горячее", price: 380, weight: "350 г", image: "/images/cutlet-buckwheat.webp", desc: "Домашняя мясная котлета, рассыпчатая гречка, сливочное масло и свежая зелень." },
  { id: 6, name: "Плов с говядиной", category: "Горячее", price: 420, weight: "400 г", image: "/images/plov.webp", desc: "Рис, говядина, морковь, лук, чеснок и ароматные специи.", badge: "🔥 Хит" },
  { id: 7, name: "Макароны с тефтелями", category: "Горячее", price: 390, weight: "350 г", image: "/images/meatballs-pasta.webp", desc: "Макароны, мясные тефтели, домашний томатный соус и зелень.", badge: "♡ Любимое" },
  { id: 8, name: "Оливье", category: "Салаты", price: 230, weight: "200 г", image: "/images/olivier.webp", desc: "Картофель, морковь, яйцо, ветчина, зелёный горошек, солёный огурец и майонез." },
  { id: 9, name: "Винегрет", category: "Салаты", price: 190, weight: "200 г", image: "/images/vinaigrette.webp", desc: "Свёкла, картофель, морковь, солёный огурец, зелёный горошек, лук и растительное масло.", badge: "🌿 Легче" },
  { id: 10, name: "Блины", category: "Завтраки", price: 220, weight: "3 шт. / 250 г", image: "/images/bliny.webp", desc: "Тонкие домашние блины. Подаются со сметаной и ягодным вареньем.", badge: "Уютно" },
  { id: 11, name: "Сырники", category: "Завтраки", price: 290, weight: "3 шт. / 240 г", image: "/images/syrniki.webp", desc: "Творог, яйцо, мука и немного сахара. Подаются со сметаной и ягодным вареньем.", badge: "♡ Любимое" },
  { id: 12, name: "Пирожок с картошкой", category: "Выпечка", price: 110, weight: "1 шт. / 120 г", image: "/images/pie-potato.webp", desc: "Мягкое дрожжевое тесто, картофель, жареный лук и зелень." },
  { id: 13, name: "Пирожок с мясом", category: "Выпечка", price: 140, weight: "1 шт. / 120 г", image: "/images/pie-meat.webp", desc: "Мягкое дрожжевое тесто, мясной фарш, репчатый лук и специи." },
  { id: 14, name: "Домашний компот", category: "Напитки", price: 120, weight: "0,5 л", image: "/images/compote.webp", desc: "Домашний компот из яблок, ягод и сухофруктов." },
  { id: 15, name: "Ягодный морс", category: "Напитки", price: 150, weight: "0,5 л", image: "/images/mors.webp", desc: "Насыщенный морс из клюквы и лесных ягод.", badge: "Ягодный" }
];

const specials = [
  { id: 101, name: "Комбо «Домашний обед»", price: 590, weight: "3 позиции", image: "/images/cutlet-mash.webp", desc: "Борщ со сметаной + котлета с пюре + домашний компот." },
  { id: 102, name: "Питание на неделю", price: 2690, weight: "5 обедов", image: "/images/plov.webp", desc: "Пять домашних обедов на неделю. Меню можно чередовать по дням." }
];

const allProducts = [...menu, ...specials];
let cart = JSON.parse(localStorage.getItem("kakDomaCart") || "{}");
let activeCategory = "Все";
let toastTimer;

const menuGrid = document.getElementById("menuGrid");
const categoryTabs = document.getElementById("categoryTabs");
const cartCount = document.getElementById("cartCount");
const cartButtonTotal = document.getElementById("cartButtonTotal");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const orderForm = document.getElementById("orderForm");
const statusEl = document.getElementById("status");
const submitOrder = document.getElementById("submitOrder");
const openCartButton = document.getElementById("openCart");
const toast = document.getElementById("toast");

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

function cardMarkup(item) {
  const qty = cart[item.id] || 0;
  return `
    <article class="card">
      <div class="card-image-wrap">
        <img class="card-image" src="${item.image}" alt="${item.name}" loading="lazy" />
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ""}
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
          ${qty > 0 ? `
            <div class="inline-qty" aria-label="Количество ${item.name}">
              <button type="button" data-minus="${item.id}" aria-label="Уменьшить">−</button>
              <b>${qty}</b>
              <button type="button" data-plus="${item.id}" aria-label="Увеличить">+</button>
            </div>` : `<button class="add-button" type="button" data-add="${item.id}">Добавить</button>`}
        </div>
      </div>
    </article>`;
}

function comboMarkup() {
  const qty = cart[101] || 0;
  return `
    <section class="promo-card combo-promo" id="combo">
      <div class="promo-copy">
        <span class="eyebrow">Выгодное комбо</span>
        <h3>Домашний обед</h3>
        <p>Борщ со сметаной + котлета с пюре + домашний компот. Всё, что нужно для сытного обеда.</p>
        <div class="promo-price"><strong>590 ₽</strong><del>800 ₽</del></div>
        ${qty ? `<div class="inline-qty"><button type="button" data-minus="101">−</button><b>${qty}</b><button type="button" data-plus="101">+</button></div>` : `<button class="promo-button" type="button" data-add="101">Добавить комбо</button>`}
      </div>
      <div class="promo-art" aria-hidden="true">
        <img src="/images/borsch.webp" alt="" loading="lazy" />
        <img src="/images/cutlet-mash.webp" alt="" loading="lazy" />
        <img src="/images/compote.webp" alt="" loading="lazy" />
      </div>
    </section>`;
}

function weekMarkup() {
  const qty = cart[102] || 0;
  return `
    <section class="promo-card week-promo" id="week">
      <div class="promo-copy">
        <span class="eyebrow">На всю неделю</span>
        <h3>5 домашних обедов</h3>
        <p>Удобный вариант на пять дней: суп или салат, горячее и напиток. Блюда можно чередовать по дням.</p>
        <div class="week-list"><span>5 дней</span><span>Разное меню</span><span>Домашние блюда</span></div>
        <div class="promo-price"><strong>2 690 ₽</strong></div>
        ${qty ? `<div class="inline-qty"><button type="button" data-minus="102">−</button><b>${qty}</b><button type="button" data-plus="102">+</button></div>` : `<button class="promo-button" type="button" data-add="102">Выбрать питание</button>`}
      </div>
      <div class="promo-art" aria-hidden="true">
        <img src="/images/plov.webp" alt="" loading="lazy" />
        <img src="/images/chicken-noodle.webp" alt="" loading="lazy" />
        <img src="/images/olivier.webp" alt="" loading="lazy" />
      </div>
    </section>`;
}

function renderMenu() {
  if (activeCategory !== "Все") {
    menuGrid.innerHTML = menu.filter(item => item.category === activeCategory).map(cardMarkup).join("");
  } else {
    const beforeCombo = menu.slice(0, 7).map(cardMarkup).join("");
    const middle = menu.slice(7, 11).map(cardMarkup).join("");
    const afterWeek = menu.slice(11).map(cardMarkup).join("");
    menuGrid.innerHTML = `${beforeCombo}${comboMarkup()}${middle}${weekMarkup()}${afterWeek}`;
  }
  bindProductControls(menuGrid);
}

function bindProductControls(root) {
  root.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(Number(btn.dataset.add))));
  root.querySelectorAll("[data-minus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.minus), -1)));
  root.querySelectorAll("[data-plus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.plus), 1)));
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
}

function bumpCart() {
  openCartButton.classList.remove("bump");
  void openCartButton.offsetWidth;
  openCartButton.classList.add("bump");
  setTimeout(() => openCartButton.classList.remove("bump"), 380);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  renderMenu();
  const product = allProducts.find(item => item.id === id);
  showToast(`${product?.name || "Блюдо"} добавлено в корзину`);
  bumpCart();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
  renderMenu();
}

function getCartLines() {
  return Object.entries(cart).map(([id, qty]) => {
    const item = allProducts.find(x => x.id === Number(id));
    return item ? { ...item, qty, lineTotal: item.price * qty } : null;
  }).filter(Boolean);
}

function renderCart() {
  const lines = getCartLines();
  const count = lines.reduce((sum, item) => sum + item.qty, 0);
  const total = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  cartButtonTotal.textContent = money(total);

  if (!lines.length) {
    cartItems.innerHTML = `<div class="empty-cart">Корзина пока пуста.<br>Добавьте блюда из меню.</div>`;
  } else {
    cartItems.innerHTML = lines.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="" />
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${money(item.price)} × ${item.qty} · ${money(item.lineTotal)}</span>
        </div>
        <div class="qty">
          <button type="button" data-cart-minus="${item.id}" aria-label="Уменьшить">−</button>
          <b>${item.qty}</b>
          <button type="button" data-cart-plus="${item.id}" aria-label="Увеличить">+</button>
        </div>
      </div>
    `).join("");
  }

  cartItems.querySelectorAll("[data-cart-minus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.cartMinus), -1)));
  cartItems.querySelectorAll("[data-cart-plus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.cartPlus), 1)));
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
  setTimeout(() => { overlay.hidden = true; }, 300);
}

openCartButton.addEventListener("click", openCart);
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
  const items = lines.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty, lineTotal: item.lineTotal }));
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
    renderMenu();
    orderForm.reset();
    statusEl.className = "status ok";
    statusEl.textContent = "Заказ принят! Мы скоро свяжемся с вами.";
    showToast("Заказ успешно оформлен ✓");
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
