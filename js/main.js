document.addEventListener("DOMContentLoaded", () => {
  const closeCombo = (root) => {
    root.classList.remove("select-combo--open");
    root.querySelector(".select-combo__trigger")?.setAttribute("aria-expanded", "false");
  };

  document.addEventListener("click", (e) => {
    document.querySelectorAll("[data-custom-select].select-combo--open").forEach((root) => {
      if (!root.contains(e.target)) closeCombo(root);
    });
  });

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
        el.classList.toggle("select-combo__option--active", idx === active)
      );
      if (scroll) els[active].scrollIntoView({ block: "nearest" });
    };

    const openDropdown = () => {
      document.querySelectorAll("[data-custom-select].select-combo--open").forEach((el) => {
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
      root.classList.contains("select-combo--open") ? closeCombo(root) : openDropdown()
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
});
