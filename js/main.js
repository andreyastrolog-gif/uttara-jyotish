/* =====================================================================
 * Uttara Jyotish — landing script (vanilla JS, no dependencies)
 *
 * ▼▼▼ НАСТРОЙКИ: ССЫЛКИ (заполните здесь — и все кнопки на сайте обновятся) ▼▼▼
 * Сейчас в HTML стоят заглушки вида href="#TELEGRAM_LINK".
 * Скрипт подставляет значения ниже во все элементы с атрибутом data-link.
 * Для надёжности (и для поисковиков, которые не выполняют JS) можно также
 * сделать поиск-замену заглушек прямо в index.html — см. README.md.
 * ===================================================================== */
const LINKS = {
  telegram:        '#TELEGRAM_LINK',          // личный Telegram для записи, напр. https://t.me/username
  telegramChannel: '#TELEGRAM_CHANNEL_LINK',  // Telegram-канал, напр. https://t.me/uttara_jyotish
  instagram:       '#INSTAGRAM_LINK',         // напр. https://instagram.com/uttara.jyotish
  youtube:         '#YOUTUBE_LINK',           // напр. https://youtube.com/@uttarajyotish
  tiktok:          '#TIKTOK_LINK',            // напр. https://tiktok.com/@uttara.jyotish
  facebook:        '#FACEBOOK_LINK'           // ссылка на страницу Facebook
};
/* ▲▲▲ КОНЕЦ НАСТРОЕК ▲▲▲ */

(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Links from config
  document.querySelectorAll('[data-link]').forEach(function (a) {
    const url = LINKS[a.dataset.link];
    if (url) a.setAttribute('href', url);
    if (!url || url.charAt(0) === '#') { a.removeAttribute('target'); } // placeholder: stay on page
  });

  // 2. Year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // 3. Header state + mobile nav
  const header = document.getElementById('siteHeader');
  const onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 30); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  toggle.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  // 4. Reveal on scroll
  const items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // 5. Card spotlight follows cursor
  if (!reduceMotion) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // 6. FAQ: keep one item open at a time
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // 7. Starry sky (canvas), paused off-screen; static when reduced motion
  function starfield(canvas, density) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [], raf = null, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(w * h / density);
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() < 0.08 ? Math.random() * 1.3 + 1 : Math.random() * 0.9 + 0.25,
          a: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2,
          gold: Math.random() < 0.25, vy: 0.02 + Math.random() * 0.05
        });
      }
      draw(0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(s.a + t * 0.001 * s.s);
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.gold ? '#e7cd92' : '#f6eedc';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.r > 1.2) { // soft glow on bigger stars
          ctx.globalAlpha = tw * 0.18;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2); ctx.fill();
        }
        if (!reduceMotion) { s.y -= s.vy; if (s.y < -4) s.y = h + 4; }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) { draw(t); raf = visible ? requestAnimationFrame(loop) : null; }
    resize();
    let rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if (reduceMotion) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      }).observe(canvas);
    } else { raf = requestAnimationFrame(loop); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { visible = false; } else if (!raf) { visible = true; raf = requestAnimationFrame(loop); }
    });
  }
  starfield(document.getElementById('stars'), 2600);
  starfield(document.getElementById('stars2'), 3200);
})();
