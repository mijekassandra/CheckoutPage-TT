document.addEventListener("DOMContentLoaded", () => {
  // Order summary toggle script --------------------------------------------------------------------
  const orderSummaryToggle = document.getElementById("order-summary-toggle");
  const orderSummaryPanel = document.getElementById("order-summary-panel");
  if (orderSummaryToggle && orderSummaryPanel) {
    const orderSummaryDesktopMq = window.matchMedia("(min-width: 769px)");

    const syncOrderSummaryDesktop = () => {
      if (!orderSummaryDesktopMq.matches) return;
      orderSummaryToggle.setAttribute("aria-expanded", "true");
      orderSummaryPanel.setAttribute("aria-hidden", "false");
      orderSummaryPanel.classList.remove("order-summary-panel--collapsed");
    };

    syncOrderSummaryDesktop();
    orderSummaryDesktopMq.addEventListener("change", syncOrderSummaryDesktop);

    orderSummaryToggle.addEventListener("click", () => {
      if (orderSummaryDesktopMq.matches) return;
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

  // Billing address same / different toggle ------------------------------------------------------------
  const billingRadios = document.querySelectorAll(
    'input[name="billing-address"]',
  );
  const billingAddressContainer = document.getElementById(
    "billing-address-fields-container",
  );
  if (billingRadios.length && billingAddressContainer) {
    const syncBillingAddressVisibility = () => {
      const differentSelected =
        document.getElementById("billing-address-different")?.checked === true;
      billingAddressContainer.classList.toggle(
        "billing-address-container--hidden",
        !differentSelected,
      );
      billingAddressContainer.setAttribute(
        "aria-hidden",
        differentSelected ? "false" : "true",
      );
      billingAddressContainer
        .querySelectorAll("input, select, button")
        .forEach((el) => {
          el.disabled = !differentSelected;
        });
    };
    billingRadios.forEach((radio) =>
      radio.addEventListener("change", syncBillingAddressVisibility),
    );
    syncBillingAddressVisibility();
  }

  // Complete order: validate email + shipping address (match contact email error style)
  const completeOrderBtn = document.getElementById("complete-order-btn");
  const contactEmailInput = document.getElementById("contact-email");
  const contactEmailHelper = document.getElementById("contact-email-helper");

  const shippingFieldIds = [
    "shipping-first-name",
    "shipping-last-name",
    "shipping-country",
    "shipping-address",
    "shipping-city",
    "shipping-state",
    "shipping-zip-code",
    "shipping-phone-number",
  ];

  const fieldRoot = (el) => el?.closest(".field");

  const setFieldInvalid = (el, invalid) => {
    const root = fieldRoot(el);
    if (!root) return;
    root.classList.toggle("field--invalid", invalid);
    if (el?.matches?.("input, select")) {
      el.setAttribute("aria-invalid", invalid ? "true" : "false");
    }
    const trigger = root.querySelector(".select-combo__trigger");
    if (trigger)
      trigger.setAttribute("aria-invalid", invalid ? "true" : "false");
    const nativeSelect = root.querySelector("select");
    if (nativeSelect && nativeSelect !== el) {
      nativeSelect.setAttribute("aria-invalid", invalid ? "true" : "false");
    }
  };

  const clearFieldInvalid = (el) => setFieldInvalid(el, false);

  const validateCompleteOrder = () => {
    const empty = (v) => String(v ?? "").trim() === "";

    let firstToFocus = null;

    const mark = (control, invalid, focusTarget) => {
      const target = focusTarget ?? control;
      setFieldInvalid(control, invalid);
      if (invalid && firstToFocus == null) firstToFocus = target;
    };

    const markText = (id) => {
      const input = document.getElementById(id);
      mark(input, !input || empty(input.value), input);
    };

    if (contactEmailInput) {
      const emailEmpty = empty(contactEmailInput.value);
      const emailInvalidFormat =
        !emailEmpty && !contactEmailInput.checkValidity();
      const bad = emailEmpty || emailInvalidFormat;
      if (contactEmailHelper) {
        if (emailEmpty) contactEmailHelper.textContent = "Email is required";
        else if (emailInvalidFormat)
          contactEmailHelper.textContent = "Enter a valid email address";
        else contactEmailHelper.textContent = "Email is required";
      }
      mark(contactEmailInput, bad, contactEmailInput);
    }

    markText("shipping-first-name");
    markText("shipping-last-name");

    const countrySelect = document.getElementById("shipping-country");
    mark(
      countrySelect,
      !countrySelect || empty(countrySelect.value),
      document.getElementById("shipping-country-trigger"),
    );

    markText("shipping-address");
    markText("shipping-city");

    const stateSelect = document.getElementById("shipping-state");
    mark(
      stateSelect,
      !stateSelect || empty(stateSelect.value),
      document.getElementById("shipping-state-trigger"),
    );

    markText("shipping-zip-code");
    markText("shipping-phone-number");

    if (firstToFocus) {
      firstToFocus.focus({ preventScroll: true });
      firstToFocus.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    return !firstToFocus;
  };

  const attachClearInvalid = (el) => {
    if (!el) return;
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => clearFieldInvalid(el));
  };

  if (completeOrderBtn) {
    completeOrderBtn.addEventListener("click", () => {
      validateCompleteOrder();
    });
  }

  if (contactEmailInput) {
    contactEmailInput.addEventListener("input", () => {
      clearFieldInvalid(contactEmailInput);
      if (contactEmailHelper)
        contactEmailHelper.textContent = "Email is required";
    });
  }
  shippingFieldIds.forEach((id) =>
    attachClearInvalid(document.getElementById(id)),
  );

  // Discount code apply button: disabled while input is empty ---------------------------
  const discountCodeInput = document.getElementById("discount-code");
  const applyDiscountBtn = document.getElementById("apply-discount-code");
  if (discountCodeInput && applyDiscountBtn) {
    const syncDiscountApplyEnabled = () => {
      applyDiscountBtn.disabled = discountCodeInput.value.trim() === "";
    };
    discountCodeInput.addEventListener("input", syncDiscountApplyEnabled);
    syncDiscountApplyEnabled();
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
