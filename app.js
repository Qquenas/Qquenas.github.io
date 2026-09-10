/*
  FIXED UI｜第一堂不用改。個人內容全部留在 index.html。
  這份 JS 只管手機目錄、目前章節、圖片放大、閱讀進度與列印。
  不從 JS 寫入姓名或作品；換圖只需改 HTML 的 src/alt。
*/
(() => {
  'use strict';
  document.documentElement.classList.add('js-ready');
  const menuButton = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#side-nav');
  const sidebar = document.querySelector('.sidebar');
  function closeMenu(returnFocus = false) {
    navigation?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuButton?.focus();
  }
  menuButton?.addEventListener('click', () => {
    if (!navigation) return;
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  navigation?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('click', event => {
    if (navigation?.classList.contains('open') && !sidebar?.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation?.classList.contains('open')) closeMenu(true);
  });
  // 目前章節指示與進度。章節刪除後，依實際 DOM 重新計算，不写死數量。
  const navLinks = Array.from(navigation?.querySelectorAll('a[href^="#"]') || []);
  const targets = navLinks.map(link => {
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    return { link, section: document.getElementById(id) };
  }).filter(item => item.section);
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  const progressBar = document.createElement('span');
  progress.append(progressBar);
  document.body.append(progress);
  let scheduled = false;
  function updateReading() {
    const trigger = window.innerWidth <= 840 ? 135 : 130;
    let active = targets[0];
    for (const item of targets) {
      if (item.section.getBoundingClientRect().top <= trigger) active = item;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) active = targets.at(-1);
    for (const item of targets) {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const value = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
    progressBar.style.transform = `scaleX(${value})`;
    scheduled = false;
  }
  function scheduleReading() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateReading); }
  }
  window.addEventListener('scroll', scheduleReading, { passive: true });
  window.addEventListener('resize', scheduleReading, { passive: true });
  window.addEventListener('load', scheduleReading);
  updateReading();
  // 一個共用放大視窗。讀取被點擊的 img，避免同一張照片維護兩個路徑。
  if (typeof HTMLDialogElement !== 'undefined') {
    const dialog = document.createElement('dialog');
    dialog.className = 'photo-dialog';
    dialog.id = 'photo-dialog';
    dialog.setAttribute('aria-labelledby', 'photo-dialog-title');
    const head = document.createElement('div'); head.className = 'photo-dialog-head';
    const title = document.createElement('h2'); title.id = 'photo-dialog-title'; title.textContent = '照片';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '關閉 ×';
    close.setAttribute('aria-label', '關閉放大圖片');
    const figure = document.createElement('figure');
    const enlarged = document.createElement('img'); enlarged.alt = '';
    const caption = document.createElement('figcaption');
    head.append(title, close); figure.append(enlarged, caption); dialog.append(head, figure);
    document.body.append(dialog);
    let opener = null;
    function sourceText(image) {
      const fig = image.closest('figure');
      const article = image.closest('article');
      return fig?.querySelector('figcaption')?.textContent.trim() || article?.querySelector('h3')?.textContent.trim() || image.alt;
    }
    const candidates = document.querySelectorAll('.hero-photo img, .project-visual img, #life-gallery img');
    for (const image of candidates) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'photo-open';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-label', `放大圖片：${image.alt || '照片'}`);
      image.replaceWith(button); button.append(image);
      button.addEventListener('click', () => {
        if (!image.complete || image.naturalWidth === 0) return;
        opener = button;
        enlarged.src = image.currentSrc || image.src;
        enlarged.alt = image.alt;
        const source = sourceText(image);
        title.textContent = image.closest('article')?.querySelector('h3')?.textContent.trim() || '照片與日常';
        caption.textContent = source || image.alt;
        dialog.showModal();
        close.focus();
      });
    }
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
  }
  // 列印時完整呈現 details；結束後恢復原本展開狀態。
  let printStates = [];
  window.addEventListener('beforeprint', () => {
    printStates = Array.from(document.querySelectorAll('details')).map(el => [el, el.open]);
    printStates.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printStates.forEach(([el, open]) => { el.open = open; });
    printStates = [];
  });
  // 課後擴充可在此新增，但第一堂不要改上面的固定輔助程式。
})();
