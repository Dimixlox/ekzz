
// Phone input formatter: 8(XXX)XXX-XX-XX
(function () {
  const phone = document.querySelector('input[name="phone"]');
  if (phone) {
    phone.addEventListener("input", () => {
      let digits = phone.value.replace(/\D/g, "");
      if (!digits) return;
      if (digits[0] !== "8") digits = "8" + digits.slice(1);
      digits = digits.slice(0, 11); // 8 + 10
      const p1 = digits.slice(1, 4);
      const p2 = digits.slice(4, 7);
      const p3 = digits.slice(7, 9);
      const p4 = digits.slice(9, 11);

      let out = "8";
      if (p1) out += "(" + p1;
      if (p1.length === 3) out += ")";
      if (p2) out += p2;
      if (p3) out += "-" + p3;
      if (p4) out += "-" + p4;
      phone.value = out;
    });
  }

  // Date input formatter: DD.MM.YYYY
  const date = document.querySelector('input[name="desiredStartDate"]');
  if (date) {
    date.addEventListener("input", () => {
      const digits = date.value.replace(/\D/g, "").slice(0, 8);
      let out = "";
      if (digits.length >= 2) out = digits.slice(0, 2) + ".";
      else out = digits;
      if (digits.length >= 4) out += digits.slice(2, 4) + ".";
      else if (digits.length > 2) out += digits.slice(2);
      if (digits.length > 4) out += digits.slice(4);
      date.value = out;
    });
  }

  // Slider
  const slider = document.querySelector(".slider");
  if (slider) {
    const imgs = Array.from(slider.querySelectorAll(".slider__img"));
    const prevBtn = slider.querySelector(".slider__btn--prev");
    const nextBtn = slider.querySelector(".slider__btn--next");
    const interval = parseInt(slider.dataset.interval || "3000", 10);

    let idx = imgs.findIndex(i => i.classList.contains("is-active"));
    if (idx < 0) idx = 0;

    function show(n) {
      imgs[idx].classList.remove("is-active");
      idx = (n + imgs.length) % imgs.length;
      imgs[idx].classList.add("is-active");
    }

    function next() { show(idx + 1); }
    function prev() { show(idx - 1); }

    let t = setInterval(next, interval);

    function resetTimer() {
      clearInterval(t);
      t = setInterval(next, interval);
    }

    nextBtn?.addEventListener("click", () => { next(); resetTimer(); });
    prevBtn?.addEventListener("click", () => { prev(); resetTimer(); });
  }
})();
