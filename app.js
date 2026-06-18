/* ============================================================
   Burgers & World Cup — логика страницы
   ============================================================ */
(function () {
  'use strict';

  // ---------- выбор опций (чипсы) ----------
  var groups = document.querySelectorAll('.options');
  groups.forEach(function (group) {
    var mode = group.getAttribute('data-mode'); // 'single' | 'multi'
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.opt');
      if (!btn) return;
      if (mode === 'single') {
        group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('selected'); });
        btn.classList.add('selected');
        // снимаем ошибку, если была
        var field = group.closest('.field');
        if (field) field.classList.remove('invalid');
      } else {
        btn.classList.toggle('selected');
      }
    });
  });

  // снятие ошибки имени при вводе
  var nameInput = document.getElementById('name');
  nameInput.addEventListener('input', function () {
    this.closest('.field').classList.remove('invalid');
  });

  // ---------- сбор значений ----------
  function getSingle(groupName) {
    var sel = document.querySelector('.options[data-group="' + groupName + '"] .opt.selected');
    return sel ? sel.getAttribute('data-value') : '';
  }
  function getMulti(groupName) {
    var sels = document.querySelectorAll('.options[data-group="' + groupName + '"] .opt.selected');
    return Array.prototype.map.call(sels, function (o) { return o.getAttribute('data-value'); });
  }

  // ---------- отправка заказа ----------
  var form = document.getElementById('burger-form');
  var submitBtn = form.querySelector('.submit-btn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var patties = getSingle('patties');
    var valid = true;

    if (!name) {
      nameInput.closest('.field').classList.add('invalid');
      valid = false;
    }
    if (!patties) {
      document.querySelector('.options[data-group="patties"]').closest('.field').classList.add('invalid');
      valid = false;
    }
    if (!valid) {
      var firstInvalid = document.querySelector('.field.invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var order = {
      name: name,
      patties: patties,
      cheese: getSingle('cheese') || 'без сыра',
      toppings: getMulti('toppings'),
      sauces: getMulti('sauces'),
      ts: new Date().toISOString()
    };

    sendOrder(order);
  });

  function sendOrder(order) {
    showSummary(order);

    var endpoint = (typeof ORDERS_ENDPOINT !== 'undefined') ? ORDERS_ENDPOINT : '';

    // Демо-режим: эндпоинт ещё не настроен — просто показываем успех.
    if (!endpoint) {
      showSuccess();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Отправляем…';

    // text/plain намеренно: «простой» запрос без CORS-preflight,
    // который Google Apps Script не обрабатывает.
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(order)
    })
      .then(function () {
        // Строка сохраняется в таблице, даже если чтение ответа заблокировано CORS.
        showSuccess();
      })
      .catch(function () {
        alert('Не удалось отправить заказ автоматически 😔\nНапишите ваш заказ Пете напрямую — он уже показан на экране.');
        showSuccess();
      })
      .then(function () {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Сделать заказ 🍔';
      });
  }

  // ---------- сводка заказа ----------
  function showSummary(order) {
    var box = document.getElementById('order-summary');
    var lines = [
      '<b>Имя:</b> ' + esc(order.name),
      '<b>Котлетки:</b> ' + esc(order.patties),
      '<b>Сыр:</b> ' + esc(order.cheese),
      '<b>Топпинги:</b> ' + (order.toppings.length ? esc(order.toppings.join(', ')) : '—'),
      '<b>Соусы:</b> ' + (order.sauces.length ? esc(order.sauces.join(', ')) : '—')
    ];
    box.innerHTML = lines.join('<br>');
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---------- оверлей успеха + конфетти ----------
  var overlay = document.getElementById('success');
  document.getElementById('success-close').addEventListener('click', hideSuccess);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) hideSuccess(); });

  function showSuccess() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    launchConfetti();
  }
  function hideSuccess() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function launchConfetti() {
    var holder = document.getElementById('confetti');
    holder.innerHTML = '';
    var colors = ['#f5b301', '#e23b3b', '#5dd06a', '#4aa8ff', '#ff8a3d'];
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = (2 + Math.random() * 2) + 's';
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      holder.appendChild(p);
    }
  }

  // ---------- появление секций при скролле ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();
