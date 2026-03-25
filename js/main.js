document.addEventListener("DOMContentLoaded", () => {
  // Order summary toggle script --------------------------------------------------------------------
  const orderSummaryToggle = document.getElementById("order-summary-toggle");
  const orderSummaryPanel = document.getElementById("order-summary-panel");
  if (orderSummaryToggle && orderSummaryPanel) {
    orderSummaryToggle.addEventListener("click", () => {
      const expanded =
        orderSummaryToggle.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      orderSummaryToggle.setAttribute("aria-expanded", String(next));
      orderSummaryPanel.setAttribute("aria-hidden", String(!next));
      orderSummaryPanel.classList.toggle(
        "order-summary-panel--collapsed",
        !next,
      );
    });
  }

  // Select dropdown close script --------------------------------------------------------------------
  const closeCombo = (root) => {
    root.classList.remove("select-combo--open");
    root
      .querySelector(".select-combo__trigger")
      ?.setAttribute("aria-expanded", "false");
  };

  // Select dropdown click outside close script --------------------------------------------------------------------
  document.addEventListener("click", (e) => {
    document
      .querySelectorAll("[data-custom-select].select-combo--open")
      .forEach((root) => {
        if (!root.contains(e.target)) closeCombo(root);
      });
  });

  // Select dropdown open script --------------------------------------------------------------------
  document.querySelectorAll("[data-custom-select]").forEach((root) => {
    const select = root.querySelector("select");
    const trigger = root.querySelector(".select-combo__trigger");
    const dropdown = root.querySelector("[data-select-dropdown]");
    const list = root.querySelector(".select-combo__list");
    const display = root.querySelector("[data-select-display]");
    if (!select || !trigger || !dropdown || !list || !display) return;

    let active = select.selectedIndex;
    const items = () => [...list.querySelectorAll('[role="option"]')];

    const syncLabel = () => {
      const o = select.options[select.selectedIndex];
      display.textContent = o ? o.textContent.trim() : "";
    };

    const highlight = (i, scroll) => {
      const els = items();
      if (!els.length) return;
      active = Math.max(0, Math.min(i, els.length - 1));
      els.forEach((el, idx) =>
        el.classList.toggle("select-combo__option--active", idx === active),
      );
      if (scroll) els[active].scrollIntoView({ block: "nearest" });
    };

    const openDropdown = () => {
      document
        .querySelectorAll("[data-custom-select].select-combo--open")
        .forEach((el) => {
          if (el !== root) closeCombo(el);
        });
      active = select.selectedIndex;
      highlight(active, false);
      root.classList.add("select-combo--open");
      trigger.setAttribute("aria-expanded", "true");
      list.focus();
      items()[active]?.scrollIntoView({ block: "nearest" });
    };

    const choose = (i) => {
      if (i < 0 || i >= select.options.length) return;
      active = i;
      select.selectedIndex = i;
      syncLabel();
      items().forEach((el, idx) => {
        const on = idx === i;
        el.setAttribute("aria-selected", on ? "true" : "false");
        el.classList.toggle("select-combo__option--selected", on);
      });
      select.dispatchEvent(new Event("change", { bubbles: true }));
      closeCombo(root);
      trigger.focus();
    };

    list.innerHTML = "";
    [...select.options].forEach((opt, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.id = `${select.id}-opt-${i}`;
      li.className = "select-combo__option";
      li.textContent = opt.textContent.trim();
      li.setAttribute("aria-selected", opt.selected ? "true" : "false");
      if (opt.selected) li.classList.add("select-combo__option--selected");
      li.addEventListener("click", (e) => {
        e.preventDefault();
        choose(i);
      });
      list.appendChild(li);
    });
    highlight(select.selectedIndex, false);

    trigger.addEventListener("click", () =>
      root.classList.contains("select-combo--open")
        ? closeCombo(root)
        : openDropdown(),
    );

    root.addEventListener("keydown", (e) => {
      if (!trigger.contains(e.target) && !list.contains(e.target)) return;
      const isOpen = root.classList.contains("select-combo--open");

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) openDropdown();
        else highlight(active + (e.key === "ArrowDown" ? 1 : -1), true);
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && isOpen) {
        e.preventDefault();
        choose(active);
        return;
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeCombo(root);
        if (list.contains(e.target)) trigger.focus();
        return;
      }
      if (!isOpen || !list.contains(e.target)) return;
      if (e.key === "Home") {
        e.preventDefault();
        highlight(0, true);
      } else if (e.key === "End") {
        e.preventDefault();
        highlight(select.options.length - 1, true);
      }
    });

    select.addEventListener("change", syncLabel);
    syncLabel();
  });

  // Payment method radio script --------------------------------------------------------------------
  const paymentRadios = document.querySelectorAll(
    'input[name="payment-method"]',
  );

  // Payment method radio change script --------------------------------------------------------------------
  const paymentDetails = document.getElementById("payment-details-container");
  if (paymentRadios.length && paymentDetails) {
    const syncPaymentDetails = () => {
      const creditCardSelected =
        document.getElementById("credit-card-option")?.checked;
      paymentDetails.classList.toggle(
        "payment-details-container--hidden",
        !creditCardSelected,
      );
      paymentDetails.setAttribute(
        "aria-hidden",
        creditCardSelected ? "false" : "true",
      );
      paymentDetails.querySelectorAll("input").forEach((input) => {
        input.disabled = !creditCardSelected;
      });
    };
    paymentRadios.forEach((radio) =>
      radio.addEventListener("change", syncPaymentDetails),
    );
    syncPaymentDetails();
  }

  // Trustpilot star rating script --------------------------------------------------------------------
  document.querySelectorAll(".tp-rating").forEach((root) => {
    const raw = parseFloat(root.dataset.rating);
    const rating = Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0;
    const valueEl = root.nextElementSibling;
    if (valueEl && valueEl.classList.contains("tp-rating-value")) {
      valueEl.textContent = rating.toFixed(1);
    }
    root.innerHTML = "";
    root.setAttribute("aria-label", `${rating} out of 5 stars`);
    for (let i = 0; i < 5; i++) {
      const portion = rating - i;
      const star = document.createElement("span");
      star.className = "tp-star";
      if (portion >= 1) star.classList.add("tp-star--full");
      else if (portion >= 0.5) star.classList.add("tp-star--half");
      const img = document.createElement("img");
      img.src = "assets/images/trustpilot-star.png";
      img.alt = "";
      star.appendChild(img);
      root.appendChild(star);
    }
  });

  // Customer review star rating script --------------------------------------------------------------------

  document.querySelectorAll(".review-star-rating").forEach((root) => {
    const raw = parseFloat(root.dataset.rating);
    const rating = Number.isFinite(raw) ? Math.min(5, Math.max(0, raw)) : 0;
    root.innerHTML = "";
    root.setAttribute("aria-label", `${rating} out of 5 stars`);
    for (let i = 0; i < 5; i++) {
      const portion = rating - i;
      const star = document.createElement("span");
      star.className = "review-star";
      if (portion >= 1) star.classList.add("review-star--full");
      else if (portion >= 0.5) star.classList.add("review-star--half");
      root.appendChild(star);
    }
  });
});

// --------------------------------------------------------------------
