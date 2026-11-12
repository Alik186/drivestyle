(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var mq = window.matchMedia('(max-width: 767px)');

  /* появление блоков при скролле */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* программы: показать все */
  $$('[data-more]').forEach(function (btn) {
    var panel = btn.closest('.programs__panel');
    var label = btn.querySelector('span');
    var openText = label.textContent, closeText = btn.getAttribute('data-less-text') || 'Свернуть';
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      label.textContent = open ? closeText : openText;
      if (!open) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* отзывы */
  var track = $('[data-reviews]');
  if (track) {
    var cards = $$('.rcard', track);
    var n = cards.length;
    var startIndex = function () { return mq.matches || n < 2 ? 0 : 1; };
    var active = startIndex();
    var lastOffset = [];
    var prevBtn = $('[data-rev-prev]'), nextBtn = $('[data-rev-next]');
    /* смещение карточки относительно активной по кругу: …, -1, 0, 1, … */
    var offsetOf = function (i) {
      var o = ((i - active) % n + n) % n;
      if (o > n / 2) o -= n;
      return o;
    };
    var layout = function (animate) {
      var w = track.clientWidth;
      var mobile = mq.matches;
      var cw = cards[0] ? cards[0].offsetWidth : 500;
      var peek = Math.round(w * 274 / 315);
      track.style.setProperty('--vis', (mobile ? peek : Math.round(w * 370 / 1240)) + 'px');
      cards.forEach(function (c, i) {
        var o = offsetOf(i), x, cls;
        c.classList.remove('is-active', 'is-prev', 'is-next', 'is-far', 'is-cur');
        if (mobile) {
          if (o === 0) { x = 0; cls = ['is-cur', 'is-prev']; }
          else if (o === 1) { x = peek; cls = ['is-active']; }
          else if (o > 1) { x = peek + (cw + 10) * (o - 1); cls = ['is-next', 'is-far']; }
          else { x = (cw + 10) * o; cls = ['is-prev', 'is-far']; }
        } else {
          /* раскладка макета: синяя карточка на 370/1240 ширины, предыдущая лежит под ней слева, следующая справа */
          var activeX = Math.round(w * 370 / 1240);
          if (o === 0) { x = activeX; cls = ['is-active']; }
          else if (o < 0) { x = 0; cls = o === -1 ? ['is-prev'] : ['is-prev', 'is-far']; }
          else { x = activeX + (cw + 20) * o; cls = o === 1 ? ['is-next'] : ['is-next', 'is-far']; }
        }
        /* карточка перескакивает через весь ряд (зацикливание) — переносим без анимации и проявляем */
        var jump = animate && lastOffset[i] !== undefined && Math.abs(o - lastOffset[i]) > 1;
        if (jump) c.classList.add('is-jump');
        cls.forEach(function (k) { c.classList.add(k); });
        c.style.transform = 'translateX(' + x + 'px)';
        if (jump) {
          void c.offsetWidth;
          requestAnimationFrame(function () { c.classList.remove('is-jump'); });
        }
        lastOffset[i] = o;
      });
    };
    if (mq.addEventListener) mq.addEventListener('change', function () { active = startIndex(); lastOffset = []; layout(false); });
    var go = function (k) { active = ((k % n) + n) % n; layout(true); };
    if (prevBtn) prevBtn.addEventListener('click', function () { go(active - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(active + 1); });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (offsetOf(i) !== 0 && !mq.matches) go(i); }); });
    var sx = null;
    track.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    });
    window.addEventListener('resize', function () { layout(false); });
    layout(false);
  }

  /* «Развернуть...» на мобильных */
  $$('[data-collapse-btn]').forEach(function (btn) {
    var box = btn.previousElementSibling;
    if (!box || !box.hasAttribute('data-collapse')) return;
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      btn.textContent = open ? 'Свернуть' : 'Развернуть...';
    });
  });

  /* инструкторы: показать всех (мобильные) */
  var instrAll = $('[data-instr-all]');
  if (instrAll) {
    var grid = $('[data-instr]');
    var instrLabel = instrAll.querySelector('span');
    var instrOpenText = instrLabel.textContent, instrLessText = instrAll.getAttribute('data-less-text') || 'Свернуть';
    if (grid && grid.children.length <= 2) instrAll.hidden = true;
    instrAll.addEventListener('click', function () {
      var open = grid.classList.toggle('is-open');
      instrLabel.textContent = open ? instrLessText : instrOpenText;
    });
  }

  /* мобильное меню */
  var menu = $('#mmenu');
  var setMenu = function (open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    root.classList.toggle('menu-open', open);
  };
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
  $$('[data-menu-close], .mmenu__nav a').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeVideo(); } });

  /* кнопка «наверх» */
  var fixed = $('.fixed-btns');
  var onScroll = function () { if (fixed) fixed.classList.toggle('show-up', window.pageYOffset > 600); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  var up = $('[data-up]');
  if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* cookie */
  var cookie = $('[data-cookie]');
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  if (cookie && !store.get('ds_cookie_ok')) {
    cookie.hidden = false;
    setTimeout(function () { cookie.classList.add('is-shown'); }, 600);
    $('[data-cookie-ok]', cookie).addEventListener('click', function () {
      store.set('ds_cookie_ok', '1');
      cookie.classList.remove('is-shown');
      setTimeout(function () { cookie.hidden = true; }, 500);
    });
  }

  /* видео */
  var vmodal = $('[data-vmodal]'), vmedia = $('[data-vmodal-media]');
  var embed = function (url) {
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return '<iframe src="https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    var r = url.match(/rutube\.ru\/(?:video|play\/embed)\/([\w]+)/);
    if (r) return '<iframe src="https://rutube.ru/play/embed/' + r[1] + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    var v = url.match(/vk\.com\/video(-?\d+)_(\d+)/);
    if (v) return '<iframe src="https://vk.com/video_ext.php?oid=' + v[1] + '&id=' + v[2] + '&autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    return '<video src="' + url + '" controls autoplay playsinline></video>';
  };
  function closeVideo() { if (vmodal && !vmodal.hidden) { vmodal.hidden = true; vmedia.innerHTML = ''; root.classList.remove('menu-open'); } }
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-video');
      if (!url || !vmodal) return;
      vmedia.innerHTML = embed(url);
      vmodal.hidden = false;
      root.classList.add('menu-open');
    });
  });
  if (vmodal) vmodal.addEventListener('click', function (e) { if (e.target === vmodal || e.target.closest('[data-vmodal-close]')) closeVideo(); });

  /* маска телефона: +7 (XXX) XXX-XX-XX */
  $$('.cta__form input[type="tel"]').forEach(function (phone) {
    phone.addEventListener('input', function () {
      var v = phone.value.replace(/\D/g, '');
      if (!v) { phone.value = ''; return; }
      if (v[0] === '8') v = '7' + v.slice(1);
      if (v[0] !== '7') v = '7' + v;
      v = v.slice(0, 11);
      var out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ')';
      if (v.length > 4) out += ' ' + v.slice(4, 7);
      if (v.length > 7) out += '-' + v.slice(7, 9);
      if (v.length > 9) out += '-' + v.slice(9, 11);
      phone.value = out;
    });
  });

  /* форма заявки */
  $$('[data-lead-form]').forEach(function (form) {
    var msg = $('[data-form-msg]', form);
    var phone = $('input[name="phone"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var name = $('input[name="name"]', form), consent = $('input[name="consent"]', form);
      [name, phone].forEach(function (inp) {
        var bad = inp.name === 'phone' ? inp.value.replace(/\D/g, '').length < 11 : inp.value.trim().length < 2;
        inp.closest('.field').classList.toggle('is-error', bad);
        if (bad) ok = false;
      });
      consent.closest('.consent').classList.toggle('is-error', !consent.checked);
      if (!consent.checked) ok = false;
      msg.className = 'cta__msg';
      if (!ok) { msg.textContent = 'Проверьте имя, телефон и согласие на обработку данных'; msg.classList.add('is-err'); return; }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form), headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && (res.ok || res.success)) {
            form.reset();
            msg.textContent = form.getAttribute('data-success') || 'Спасибо! Заявка отправлена, мы скоро перезвоним.'; msg.classList.add('is-ok');
          } else { throw new Error(); }
        })
        .catch(function () { msg.textContent = 'Не удалось отправить. Позвоните нам: ' + ((window.dsData && window.dsData.phone) || '+7 (916) 139-06-89'); msg.classList.add('is-err'); })
        .then(function () { btn.disabled = false; });
    });
  });
})();
