(() => {
  const list = document.getElementById("reviewsList");
  const form = document.getElementById("reviewForm");
  const nameInput = document.getElementById("reviewName");
  const textInput = document.getElementById("reviewText");
  const averageEl = document.getElementById("reviewsAverage");
  const countEl = document.getElementById("reviewsCount");
  const successEl = document.getElementById("reviewSuccess");
  const adminButton = document.getElementById("reviewAdminButton");
  const adminStatus = document.getElementById("reviewAdminStatus");
  const starButtons = Array.from(document.querySelectorAll("#starPicker button"));

  if (!list || !form || !nameInput || !textInput || !averageEl || !countEl) return;

  let selectedRating = 5;
  let reviews = [];
  let adminPassword = sessionStorage.getItem("kakDomaReviewAdminPassword") || "";
  let adminMode = false;

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

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || "Ошибка сервера");
      error.status = response.status;
      throw error;
    }

    return data;
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

    if (adminMode) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "review-delete";
      deleteButton.type = "button";
      deleteButton.textContent = "Удалить отзыв";

      deleteButton.addEventListener("click", async () => {
        const ok = window.confirm(`Удалить отзыв от «${review.name}»?`);
        if (!ok) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "Удаление...";

        try {
          await api(`/api/reviews/${encodeURIComponent(review.id)}`, {
            method: "DELETE",
            headers: { "X-Admin-Password": adminPassword }
          });
          await loadReviews();
        } catch (error) {
          if (error.status === 401) {
            adminMode = false;
            adminPassword = "";
            sessionStorage.removeItem("kakDomaReviewAdminPassword");
            if (adminStatus) adminStatus.textContent = "";
            alert("Неверный пароль администратора.");
          } else {
            alert(error.message || "Не удалось удалить отзыв.");
          }
          render();
        }
      });

      article.append(deleteButton);
    }

    return article;
  }

  function render() {
    list.replaceChildren();

    reviews.forEach((review) => {
      list.appendChild(makeCard(review));
    });

    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
      : 0;

    averageEl.textContent = average.toFixed(1);
    countEl.textContent = `${reviews.length} ${reviewWord(reviews.length)}`;

    if (adminStatus) {
      adminStatus.textContent = adminMode ? "Режим администратора включён" : "";
    }

    if (adminButton) {
      adminButton.textContent = adminMode ? "Выйти из управления" : "Управление отзывами";
    }
  }

  async function loadReviews() {
    try {
      const data = await api("/api/reviews");
      reviews = Array.isArray(data.reviews) ? data.reviews : [];
      render();
    } catch (error) {
      list.innerHTML = "";
      const message = document.createElement("p");
      message.textContent = "Не удалось загрузить отзывы.";
      list.appendChild(message);
      console.error(error);
    }
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    const submitButton = form.querySelector(".review-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Отправляем...";
    }

    try {
      await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          name,
          rating: selectedRating,
          text
        })
      });

      form.reset();
      selectedRating = 5;
      paintStars();

      if (successEl) {
        successEl.textContent = "Спасибо! Ваш отзыв добавлен ❤️";
        window.setTimeout(() => {
          successEl.textContent = "";
        }, 3500);
      }

      await loadReviews();
    } catch (error) {
      if (successEl) successEl.textContent = error.message || "Не удалось отправить отзыв.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Оставить отзыв";
      }
    }
  });

  if (adminButton) {
    adminButton.addEventListener("click", async () => {
      if (adminMode) {
        adminMode = false;
        adminPassword = "";
        sessionStorage.removeItem("kakDomaReviewAdminPassword");
        render();
        return;
      }

      const password = window.prompt("Введите пароль администратора:");
      if (!password) return;

      try {
        await api("/api/reviews/admin/check", {
          method: "POST",
          headers: { "X-Admin-Password": password },
          body: "{}"
        });

        adminPassword = password;
        adminMode = true;
        sessionStorage.setItem("kakDomaReviewAdminPassword", password);
        render();
      } catch (_) {
        alert("Неверный пароль.");
      }
    });
  }

  paintStars();
  loadReviews();
})();
