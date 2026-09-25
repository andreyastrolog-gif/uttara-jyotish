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
  telegram:        'https://t.me/andreyastrolog',          // личный Telegram для записи, напр. https://t.me/username
  telegramChannel: 'https://t.me/andreyastrolog',  // Telegram-канал, напр. https://t.me/uttara_jyotish
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
    items.forEach(function (el) {
      if (el.closest('.hero')) { requestAnimationFrame(function () { el.classList.add('in'); }); }
      else { io.observe(el); }
    });
  }

  // 5. FAQ: keep one item open at a time
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

})();
