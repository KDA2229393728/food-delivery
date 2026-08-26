(() => {
  const STORAGE_KEY = "kakDomaReviewsV1";

  const defaultReviews = [
    {
      name: "Анна",
      rating: 5,
      text: "Очень вкусно! Всё действительно по-домашнему. Борщ отличный, а котлета с пюре вообще как дома ❤️",
      date: "Сегодня"
    },
    {
      name: "Максим",
      rating: 5,
      text: "Заказ приехал аккуратно упакованным. Порции хорошие, еда горячая. Буду заказывать ещё.",
      date: "Вчера"
    },
    {
      name: "Екатерина",
      rating: 5,
      text: "Очень понравились сырники и блины. Вкусная домашняя еда без ощущения обычного фастфуда.",
      date: "2 дня назад"
    }
  ];

  const list = document.getElementById("reviewsList");
  const form = document.getElementById("reviewForm");
  const nameInput = document.getElementById("reviewName");
  const textInput = document.getElementById("reviewText");
  const averageEl = document.getElementById("reviewsAverage");
  const countEl = document.getElementById("reviewsCount");
  const successEl = document.getElementById("reviewSuccess");
  const starButtons = Array.from(document.querySelectorAll("#starPicker button"));

  if (!list || !form || !nameInput || !textInput || !averageEl || !countEl) return;

  let selectedRating = 5;
  let reviews = loadReviews();

  function loadReviews() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (_) {}
    return [...defaultReviews];
  }

  function saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (_) {}
  }

  function reviewWord(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "отзыв";
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "отзыва";
    return "отзывов";
  }

  function stars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function makeCard(review) {
    const article = document.createElement("article");
    article.className = "review-card";

    const head = document.createElement("div");
    head.className = "review-card-head";

    const avatar = document.createElement("div");
    avatar.className = "review-avatar";
    avatar.textContent = (review.name || "?").trim().charAt(0).toUpperCase() || "?";

    const person = document.createElement("div");
    person.className = "review-person";

    const name = document.createElement("strong");
    name.textContent = review.name;

    const date = document.createElement("small");
    date.textContent = review.date;

    person.append(name, date);
    head.append(avatar, person);

    const rating = document.createElement("div");
    rating.className = "review-stars";
    rating.setAttribute("aria-label", `Оценка ${review.rating} из 5`);
    rating.textContent = stars(review.rating);

    const text = document.createElement("p");
    text.textContent = review.text;

    article.append(head, rating, text);
    return article;
  }

  function render() {
    list.replaceChildren();

    [...reviews].reverse().forEach((review) => {
      list.appendChild(makeCard(review));
    });

    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
      : 0;

    averageEl.textContent = average.toFixed(1);
    countEl.textContent = `${reviews.length} ${reviewWord(reviews.length)}`;
  }

  function paintStars() {
    starButtons.forEach((button) => {
      const rating = Number(button.dataset.rating);
      button.classList.toggle("active", rating <= selectedRating);
      button.setAttribute("aria-pressed", String(rating === selectedRating));
    });
  }

  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRating = Number(button.dataset.rating);
      paintStars();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    reviews.push({
      name,
      rating: selectedRating,
      text,
      date: new Date().toLocaleDateString("ru-RU")
    });

    saveReviews();
    render();

    form.reset();
    selectedRating = 5;
    paintStars();

    if (successEl) {
      successEl.textContent = "Спасибо! Ваш отзыв добавлен ❤️";
      window.setTimeout(() => {
        successEl.textContent = "";
      }, 3500);
    }

    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  paintStars();
  render();
})();
