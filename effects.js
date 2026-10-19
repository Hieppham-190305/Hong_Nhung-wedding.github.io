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

  function applyMotionPreference() {
    const enabled = !pausedByUser && !reducedMotion.matches;
    document.body.classList.toggle('motion-paused', !enabled);
  }
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
  const closingGarden = document.querySelector('.closing-garden');
  const closingScene = document.querySelector('.hero .swan-scene')?.cloneNode(true);
  if (closingGarden && closingScene) {
    closingScene.removeAttribute('role'); closingScene.removeAttribute('aria-label');
    closingGarden.append(closingScene);
    closingGarden.classList.add('has-new-swans');
  }
  // A short illustrated prelude leads into the existing invitation envelope.
  function showPrologue() {
    if (document.querySelector('.wedding-prologue, .welcome-envelope')) return;
    const originalScene = document.querySelector('.hero .swan-scene');
    if (!originalScene || reducedMotion.matches || pausedByUser) { showEnvelope(); return; }
    const intro = document.createElement('dialog');
    intro.className = 'wedding-prologue';
    intro.setAttribute('aria-labelledby', 'prologue-title');
    intro.innerHTML = `<div class="prologue-atmosphere" aria-hidden="true"></div><div class="prologue-stage"><div class="prologue-landscape" aria-hidden="true"></div><div class="prologue-flowers" aria-hidden="true"></div><div class="prologue-copy"><p class="prologue-kicker">MỘT LỜI HẸN · MỘT ĐỜI BÊN NHAU</p><h2 id="prologue-title">Hồng Nhung<span>&</span>Việt Hào</h2><p class="prologue-date">06 . 12 . 2026</p><p class="prologue-note">Câu chuyện của chúng mình bắt đầu…</p></div></div><button type="button" class="prologue-skip">Bỏ qua <span aria-hidden="true">↗</span></button><div class="prologue-progress" aria-hidden="true"><span></span></div>`;
    const scene = originalScene.cloneNode(true);
    scene.querySelector('canvas')?.remove();
    scene.classList.remove('mesh-ready');
    delete scene.dataset.rendererStarted;
    scene.removeAttribute('role'); scene.removeAttribute('aria-label');
    intro.querySelector('.prologue-landscape').append(scene);
    document.body.append(intro);
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      reducedMotion.removeEventListener('change', onPreferenceChange);
      scene.dispatchEvent(new Event('swan-scene-destroy'));
      intro.close(); intro.remove();
      showEnvelope();
    }
    function onPreferenceChange() { if (reducedMotion.matches) finish(); }
    reducedMotion.addEventListener('change', onPreferenceChange);
    intro.querySelector('button').addEventListener('click', finish);
    intro.querySelector('.prologue-progress span').addEventListener('animationend', finish, { once: true });
    intro.addEventListener('cancel', event => { event.preventDefault(); finish(); });
    document.body.classList.add('welcome-open');
    intro.showModal();
    scene.dispatchEvent(new Event('wedding-scene-mounted', { bubbles: true }));
  }
  // A direct section link stays a direct section link. The envelope appears once per tab.
  function showEnvelope() {
  const welcome = document.createElement('dialog');
  welcome.className = 'welcome-envelope'; welcome.setAttribute('aria-labelledby', 'welcome-title');
  welcome.innerHTML = `<div class="welcome-scene" aria-hidden="true"></div><div class="welcome-inner"><p class="eyebrow">MỘT LỜI MỜI TỪ TRÁI TIM</p><h2 id="welcome-title"><span>Hồng Nhung</span> <span class="welcome-amp">&</span> <span>Việt Hào</span></h2><p class="welcome-subtitle">Một lời hẹn, một đời bên nhau</p><div class="paper-envelope" aria-hidden="true"><div class="envelope-back"></div><div class="envelope-letter"><span>N & H</span></div><div class="envelope-front"></div><div class="envelope-flap"></div><div class="envelope-seal">NH</div></div><p class="welcome-guest">Trân trọng kính mời<span></span></p><button type="button" class="button primary">Mở thiệp mời <span aria-hidden="true">↗</span></button><p class="welcome-date">06 . 12 . 2026</p></div>`;
  const guestName = new URLSearchParams(location.search).get('guest');
  welcome.querySelector('.welcome-guest span').textContent = guestName?.trim().slice(0, 100) || 'Quý khách';
  const envelopeScene = document.querySelector('.hero .swan-scene')?.cloneNode(true);
  if (envelopeScene) {
    envelopeScene.querySelector('canvas')?.remove();
    envelopeScene.classList.remove('mesh-ready');
    delete envelopeScene.dataset.rendererStarted;
    envelopeScene.removeAttribute('role'); envelopeScene.removeAttribute('aria-label');
    welcome.querySelector('.welcome-scene').append(envelopeScene);
  }
  document.body.append(welcome);
  let opening = false;
  function openEnvelope() {
    if (opening) return;
    opening = true;
    writeSession('wedding-envelope-opened-v3', 'true');
    welcome.classList.add('is-opening');
    setTimeout(() => { envelopeScene?.dispatchEvent(new Event('swan-scene-destroy')); welcome.close(); welcome.remove(); document.body.classList.remove('welcome-open'); scrollTo({ top: 0, behavior: 'instant' }); celebrate(); document.querySelector('.hero-copy .button').focus({ preventScroll: true }); }, pausedByUser || reducedMotion.matches ? 0 : 650);
  }
  welcome.querySelector('button').addEventListener('click', openEnvelope);
  welcome.addEventListener('cancel', event => { event.preventDefault(); openEnvelope(); });
  welcome.showModal();
  document.body.classList.add('welcome-open');
  envelopeScene?.dispatchEvent(new Event('wedding-scene-mounted', { bubbles: true }));
  }
  document.getElementById('reopen-envelope')?.addEventListener('click', showPrologue);
  if (location.hash || readSession('wedding-envelope-opened-v3') === 'true') celebrate();
  else showPrologue();
})();
