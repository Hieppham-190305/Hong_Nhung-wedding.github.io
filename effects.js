'use strict';
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pausedByUser = false;
  // Storage is optional, including in privacy modes and embedded browsers.
  function readSession(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
  function writeSession(key, value) { try { sessionStorage.setItem(key, value); } catch { /* Nonessential preference. */ } }
  pausedByUser = readSession('wedding-motion-paused') === 'true';
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const field = document.createElement('div');
  field.className = 'petal-field'; field.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 14; index++) {
    const drift = document.createElement('span'); drift.className = 'petal-drift';
    drift.style.cssText = `--left:${(index * 31 + 7) % 100}%;--size:${7 + index % 5}px;--duration:${18 + index % 8 * 2}s;--delay:-${index * 2.7}s;--drift:${index % 2 ? '-' : ''}${35 + index * 7}px;--sway:${3 + index % 4}s`;
    const petal = document.createElement('span'); petal.className = 'petal'; drift.append(petal); field.append(drift);
  }
  document.body.append(field);

  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'motion-toggle';
  toggle.innerHTML = '<span class="sparkle" aria-hidden="true">✧</span><span>Hiệu ứng</span>';
  document.body.append(toggle);
  function applyMotionPreference() {
    const enabled = !pausedByUser && !reducedMotion.matches;
    document.body.classList.toggle('motion-paused', !enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    const label = enabled ? 'Tắt hiệu ứng chuyển động' : reducedMotion.matches ? 'Chuyển động đã giảm theo cài đặt thiết bị' : 'Bật hiệu ứng chuyển động';
    toggle.setAttribute('aria-label', label); toggle.title = label;
    toggle.disabled = reducedMotion.matches;
  }
  toggle.addEventListener('click', () => { pausedByUser = !pausedByUser; writeSession('wedding-motion-paused', String(pausedByUser)); applyMotionPreference(); });
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-inactive', document.hidden));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }, { threshold: 0.08 });
    document.querySelectorAll('.invitation-paper > *, .section-heading > *, .event, .countdown-wrap, .venue-art, .venue-copy, .closing-content > *').forEach((element, index) => {
      element.classList.add('reveal-item'); element.style.setProperty('--reveal-delay', `${index % 3 * 90}ms`); observer.observe(element);
    });
  }
  let scrollFrame = 0;
  function updateProgress() {
    scrollFrame = 0;
    const available = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${available > 0 ? Math.max(0, Math.min(1, scrollY / available)) : 0})`;
  }
  function queueProgress() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress); }
  addEventListener('scroll', queueProgress, { passive: true });
  addEventListener('resize', queueProgress, { passive: true });
  updateProgress();

  function celebrate() { document.body.classList.add('celebrating'); }
  // A direct section link stays a direct section link. The envelope appears once per tab.
  function showEnvelope() {
  const welcome = document.createElement('dialog');
  welcome.className = 'welcome-envelope'; welcome.setAttribute('aria-labelledby', 'welcome-title');
  welcome.innerHTML = `<div class="welcome-scene" aria-hidden="true"></div><div class="welcome-inner"><p class="eyebrow">MỘT LỜI MỜI TỪ TRÁI TIM</p><h2 id="welcome-title"><span>Hồng Nhung</span> <span class="welcome-amp">&</span> <span>Việt Hào</span></h2><p class="welcome-subtitle">Một lời hẹn, một đời bên nhau</p><div class="paper-envelope" aria-hidden="true"><div class="envelope-back"></div><div class="envelope-letter"><span>N & H</span></div><div class="envelope-front"></div><div class="envelope-flap"></div><div class="envelope-seal">NH</div></div><p class="welcome-guest">Trân trọng kính mời<span></span></p><button type="button" class="button primary">Mở thiệp mời <span aria-hidden="true">↗</span></button><p class="welcome-date">06 . 12 . 2026</p></div>`;
  const guestName = new URLSearchParams(location.search).get('guest');
  welcome.querySelector('.welcome-guest span').textContent = guestName?.trim().slice(0, 100) || 'Quý khách';
  document.body.append(welcome);
  let opening = false;
  function openEnvelope() {
    if (opening) return;
    opening = true;
    writeSession('wedding-envelope-opened-v2', 'true');
    welcome.classList.add('is-opening');
    setTimeout(() => { welcome.close(); welcome.remove(); document.body.classList.remove('welcome-open'); scrollTo({ top: 0, behavior: 'instant' }); celebrate(); document.querySelector('.hero-copy .button').focus({ preventScroll: true }); }, pausedByUser || reducedMotion.matches ? 0 : 650);
  }
  welcome.querySelector('button').addEventListener('click', openEnvelope);
  welcome.addEventListener('cancel', event => { event.preventDefault(); openEnvelope(); });
  welcome.showModal();
  document.body.classList.add('welcome-open');
  }
  document.getElementById('reopen-envelope')?.addEventListener('click', showEnvelope);
  if (location.hash || readSession('wedding-envelope-opened-v2') === 'true') celebrate();
  else showEnvelope();
})();
