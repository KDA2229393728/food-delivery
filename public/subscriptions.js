(() => {
  const plans = {
    "student": { name: "Студенческий", price: "1 990 ₽" },
    "home-lunch": { name: "Домашний обед", price: "2 990 ₽" },
    "kak-doma": { name: "Как дома", price: "3 790 ₽" },
    "big-week": { name: "Сытная неделя", price: "4 990 ₽" },
    "all-inclusive": { name: "Всё включено", price: "6 490 ₽" }
  };

  const form = document.getElementById("subscriptionForm");
  const select = document.getElementById("subscriptionPlan");
  const selectedName = document.getElementById("selectedPlanName");
  const selectedPrice = document.getElementById("selectedPlanPrice");
  const startDate = document.getElementById("subscriptionStartDate");
  const status = document.getElementById("subscriptionStatus");
  const submit = document.getElementById("subscriptionSubmit");

  if (!form || !select) return;

  function updateSelectedPlan() {
    const plan = plans[select.value];
    if (!plan) return;
    selectedName.textContent = plan.name;
    selectedPrice.textContent = plan.price;
  }

  document.querySelectorAll(".plan-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.plan;
      if (!plans[id]) return;
      select.value = id;
      updateSelectedPlan();
      document.getElementById("subscriptionOrder")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  select.addEventListener("change", updateSelectedPlan);

  if (startDate) {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    startDate.min = local.toISOString().slice(0, 10);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.textContent = "";
    status.className = "subscription-status";
    submit.disabled = true;
    submit.textContent = "Отправляем заявку...";

    const payload = {
      planId: select.value,
      customer: {
        name: document.getElementById("subscriptionName").value.trim(),
        phone: document.getElementById("subscriptionPhone").value.trim(),
        address: document.getElementById("subscriptionAddress").value.trim(),
        startDate: startDate.value,
        comment: document.getElementById("subscriptionComment").value.trim()
      }
    };

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Не удалось отправить заявку.");

      status.textContent = "Заявка отправлена! Мы свяжемся с вами для подтверждения.";
      status.classList.add("success");

      const currentPlan = select.value;
      form.reset();
      select.value = currentPlan;
      updateSelectedPlan();

      if (startDate) {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        startDate.min = local.toISOString().slice(0, 10);
      }
    } catch (error) {
      status.textContent = error.message || "Не удалось отправить заявку.";
      status.classList.add("error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Оформить абонемент";
    }
  });

  updateSelectedPlan();
})();
