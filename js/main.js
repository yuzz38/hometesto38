/* «Домашний вкус» — © 2026 Полунин Лев. Все права защищены. */
(function () {
  "use strict";
  var d = document, w = window;
  d.documentElement.classList.remove("no-js");
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function rub(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽"; }
  var store = {
    get: function (k) { try { return JSON.parse(w.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { w.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- шапка и бургер ---------- */
  var hdr = $("#hdr"), burger = $("#burger"), nav = $("#nav");
  function onScroll() { hdr.classList.toggle("is-scrolled", w.pageYOffset > 20); }
  w.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("open", open);
    hdr.classList.toggle("menu-open", open);
    d.body.classList.toggle("lock", open);
    d.body.classList.toggle("menu-on", open);
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); closeCart(); } });
  w.addEventListener("resize", function () { if (w.innerWidth > 1024) setMenu(false); });

  /* ---------- появление блоков ---------- */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in w) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- видео в hero: пауза вне экрана, экономия батареи ---------- */
  var vid = $(".arch__video");
  if (vid) {
    if (w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches) { vid.removeAttribute("autoplay"); vid.pause(); }
    else if ("IntersectionObserver" in w) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); });
      }).observe(vid);
    }
  }

  /* ---------- вкладки меню ---------- */
  var tabs = $$(".tab");
  function openTab(id, focus) {
    tabs.forEach(function (t) {
      var on = t.id === "tab-" + id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = d.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
      if (on) {
        if (focus) t.focus();
        var bar = t.parentNode;
        var x = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
        if (bar.scrollTo) bar.scrollTo({ left: x, behavior: "smooth" }); else bar.scrollLeft = x;
      }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { openTab(t.id.slice(4)); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === "Home") n = tabs[0];
      if (k === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); openTab(n.id.slice(4), true); }
    });
  });
  $$("[data-open-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      openTab(b.getAttribute("data-open-tab"));
      $("#menu").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- цветные пельмени ---------- */
  var colorSec = $("#color"), fact = $(".color__fact");
  var facts = {
    spinach: "Зелёный — сок свежего шпината. Мягкий вкус и яркий цвет без капли красителя.",
    beet: "Розовый — сок свёклы. Тесто становится сладковатым, а пельмени — самыми красивыми на столе.",
    carrot: "Жёлтый — сок моркови. Солнечный цвет и чуть больше пользы в каждой тарелке."
  };
  $$(".swatches button").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.getAttribute("data-c");
      colorSec.setAttribute("data-c", c);
      fact.textContent = facts[c];
      $$(".swatches button").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
    });
  });

  /* ---------- калькулятор КБЖУ ---------- */
  var data = w.CALC_DATA || [], sel = $("#calc-p"), rng = $("#calc-g");
  if (sel && data.length) {
    data.forEach(function (it, i) {
      var o = d.createElement("option"); o.value = i; o.textContent = it.n; sel.appendChild(o);
    });
    var br = data.findIndex ? data.findIndex(function (x) { return /брокколи/i.test(x.n); }) : 0;
    if (br > -1) sel.value = br;
    var fmt = function (v) { return (Math.round(v * 10) / 10).toString().replace(".", ","); };
    var calc = function () {
      var it = data[sel.value], g = +rng.value, f = g / 100;
      $("#calc-gv").textContent = g;
      $("#o-k").textContent = Math.round(it.k[0] * f);
      $("#o-b").textContent = fmt(it.k[1] * f);
      $("#o-j").textContent = fmt(it.k[2] * f);
      $("#o-u").textContent = fmt(it.k[3] * f);
      var tot = it.k[1] + it.k[2] + it.k[3] || 1;
      $("#b-b").style.width = (it.k[1] / tot * 100) + "%";
      $("#b-j").style.width = (it.k[2] / tot * 100) + "%";
      $("#b-u").style.width = (it.k[3] / tot * 100) + "%";
    };
    sel.addEventListener("change", calc); rng.addEventListener("input", calc); calc();
  }

  /* ---------- слайдер отзывов ---------- */
  var sl = $("#slider"), dotsBox = $("#dots");
  if (sl) {
    var slides = $$(".rev", sl), btns = $$(".slider__btn");
    slides.forEach(function () { dotsBox.appendChild(d.createElement("i")); });
    var dots = $$("i", dotsBox);
    var step = function () { return slides[0].offsetWidth + parseFloat(getComputedStyle(sl).columnGap || getComputedStyle(sl).gap || 20); };
    var upd = function () {
      var i = Math.round(sl.scrollLeft / step());
      dots.forEach(function (x, j) { x.classList.toggle("on", j === i); });
      btns[0].disabled = sl.scrollLeft < 5;
      btns[1].disabled = sl.scrollLeft + sl.clientWidth >= sl.scrollWidth - 5;
    };
    btns.forEach(function (b) {
      b.addEventListener("click", function () { sl.scrollBy({ left: step() * +b.getAttribute("data-dir"), behavior: "smooth" }); });
    });
    sl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); btns[1].click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); btns[0].click(); }
    });
    var t; sl.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(upd, 60); }, { passive: true });
    w.addEventListener("resize", upd); upd();
  }

  /* ---------- корзина ---------- */
  var cat = {};
  $$(".dish").forEach(function (li) {
    cat[li.getAttribute("data-id")] = { n: li.getAttribute("data-name"), p: +li.getAttribute("data-price"), w: li.getAttribute("data-w") };
  });
  var cart = store.get("dv-cart") || {};
  Object.keys(cart).forEach(function (k) { if (!cat[k]) delete cart[k]; });
  var fab = $("#fab"), drawer = $("#cart"), bg = $("#cart-bg"), list = $("#cart-list"), addr = $("#cart-addr");
  addr.value = store.get("dv-addr") || "";
  addr.addEventListener("input", function () { store.set("dv-addr", addr.value); });
  var toastEl = $("#toast"), tt;
  function toast(s) { toastEl.textContent = s; toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("on"); }, 2400); }
  function total() { var s = 0, n = 0; Object.keys(cart).forEach(function (k) { s += cat[k].p * cart[k]; n += cart[k]; }); return { s: s, n: n }; }
  function render() {
    var t = total();
    fab.hidden = t.n === 0;
    $("#fab-n").textContent = t.n; $("#fab-s").textContent = rub(t.s); $("#cart-sum").textContent = rub(t.s);
    $("#cart-empty").hidden = t.n > 0;
    list.innerHTML = "";
    Object.keys(cart).forEach(function (k) {
      var it = cat[k], li = d.createElement("li");
      li.innerHTML = '<div><div class="ci-n"></div><div class="ci-w"></div></div><div class="ci-p"></div>' +
        '<div class="qty"><button type="button" data-q="-1" aria-label="Меньше">−</button><span></span><button type="button" data-q="1" aria-label="Больше">+</button><button type="button" class="rm">убрать</button></div>';
      $(".ci-n", li).textContent = it.n;
      $(".ci-w", li).textContent = it.w + " · " + rub(it.p);
      $(".ci-p", li).textContent = rub(it.p * cart[k]);
      $(".qty span", li).textContent = cart[k];
      $$("[data-q]", li).forEach(function (b) { b.addEventListener("click", function () { change(k, +b.getAttribute("data-q")); }); });
      $(".rm", li).addEventListener("click", function () { delete cart[k]; save(); });
      list.appendChild(li);
    });
    $$(".add[data-add]").forEach(function (b) { b.classList.toggle("is-added", !!cart[b.getAttribute("data-add")]); });
  }
  function save() { store.set("dv-cart", cart); render(); }
  function change(k, q) { cart[k] = (cart[k] || 0) + q; if (cart[k] <= 0) delete cart[k]; save(); }
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var k = b.getAttribute("data-add"); if (!cat[k]) return;
      change(k, 1);
      fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
      toast("«" + cat[k].n + "» — в заказе");
    });
  });
  var lastFocus;
  function openCart() {
    lastFocus = d.activeElement;
    bg.hidden = false; requestAnimationFrame(function () { bg.classList.add("on"); drawer.classList.add("on"); });
    drawer.setAttribute("aria-hidden", "false"); fab.setAttribute("aria-expanded", "true"); d.body.classList.add("lock");
    setTimeout(function () { $("#cart-x").focus(); }, 50);
  }
  function closeCart() {
    if (!drawer.classList.contains("on")) return;
    drawer.classList.remove("on"); bg.classList.remove("on");
    drawer.setAttribute("aria-hidden", "true"); fab.setAttribute("aria-expanded", "false"); d.body.classList.remove("lock");
    setTimeout(function () { bg.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  fab.addEventListener("click", openCart);
  $("#cart-x").addEventListener("click", closeCart);
  bg.addEventListener("click", closeCart);

  function orderText() {
    var t = total(), lines = ["Здравствуйте, Алёна! Хочу заказать:"];
    Object.keys(cart).forEach(function (k) { lines.push("• " + cat[k].n + " (" + cat[k].w + ") × " + cart[k] + " = " + rub(cat[k].p * cart[k])); });
    lines.push("Итого: " + rub(t.s));
    if (addr.value.trim()) lines.push("Адрес и время: " + addr.value.trim());
    return lines.join("\n");
  }
  function copy(text) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; d.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      try { d.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); }
      d.body.removeChild(ta);
    });
  }
  $("#cart-send").addEventListener("click", function () {
    if (!total().n) { toast("Добавьте хотя бы одно блюдо"); return; }
    var url = w.DM_URL;
    var win = w.open("", "_blank");               /* открываем окно синхронно — iOS Safari не блокирует */
    copy(orderText()).then(function () { toast("Заказ скопирован — вставьте его в сообщение"); }, function () { toast("Скопируйте заказ вручную"); });
    if (win) { win.opener = null; win.location.href = url; } else { w.location.href = url; }
  });
  $("#cart-copy").addEventListener("click", function () {
    if (!total().n) { toast("Корзина пустая"); return; }
    copy(orderText()).then(function () { toast("Текст заказа скопирован"); }, function () { toast("Не получилось скопировать"); });
  });
  render();
})();
