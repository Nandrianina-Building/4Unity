/* ==========================================================================
   4 UNITY — SCRIPT.JS
   Vanilla JS only. No GSAP. Every module is wrapped so a failure in one
   (e.g. Three.js not loading) never blocks the rest of the page.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  safeRun('preloader', initPreloader);
  safeRun('header', initHeader);
  safeRun('mobile-nav', initMobileNav);
  safeRun('typewriter', initTypewriter);
  safeRun('reveal', initScrollReveal);
  safeRun('counters', initCounters);
  safeRun('team-tilt', initTilt);
  safeRun('timeline', initTimeline);
  safeRun('contact-form', initContactForm);
  safeRun('back-to-top', initBackToTop);
  safeRun('year', initYear);
  safeRun('hero-3d', initHero3D);
  safeRun('contact-3d', initContact3D);

});

/**
 * Runs a module in isolation. If it throws, we log a warning and
 * every other module keeps working — this is what prevents a single
 * broken script (e.g. a missing library) from producing a blank page.
 */
function safeRun(name, fn) {
  try {
    fn();
  } catch (err) {
    console.warn('[4Unity] module "' + name + '" failed to initialize:', err);
  }
}

/* ---------------------------------------------------------------------- */
/* Preloader                                                              */
/* ---------------------------------------------------------------------- */
function initPreloader() {
  var loader = document.getElementById('preloader');
  if (!loader) return;
  window.addEventListener('load', function () {
    setTimeout(function () { loader.classList.add('is-hidden'); }, 300);
  });
  // Safety net: if 'load' never fires cleanly, hide it anyway after 3s.
  setTimeout(function () { loader.classList.add('is-hidden'); }, 3000);
}

/* ---------------------------------------------------------------------- */
/* Header: scroll state + smooth active link                             */
/* ---------------------------------------------------------------------- */
function initHeader() {
  var header = document.getElementById('header');
  if (!header) return;
  var onScroll = function () {
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------------- */
/* Mobile navigation toggle                                              */
/* ---------------------------------------------------------------------- */
function initMobileNav() {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Hero typewriter effect                                                 */
/* ---------------------------------------------------------------------- */
function initTypewriter() {
  var el = document.getElementById('typewriter');
  if (!el) return;

  var phrases = [
    'Quatre profils, un collectif.',
    'Des solutions web modernes et performantes.'
  ];
  var phraseIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function tick() {
    var current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
}

/* ---------------------------------------------------------------------- */
/* Scroll reveal via IntersectionObserver                                 */
/* ---------------------------------------------------------------------- */
function initScrollReveal() {
  var items = document.querySelectorAll('.reveal-up');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, (i % 4) * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------------------------------------------------------------------- */
/* Animated counters                                                      */
/* ---------------------------------------------------------------------- */
function initCounters() {
  var counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { observer.observe(el); });
}

/* ---------------------------------------------------------------------- */
/* Team cards: light 3D tilt on mouse move                                */
/* ---------------------------------------------------------------------- */
function initTilt() {
  var cards = document.querySelectorAll('.tilt');
  if (!cards.length) return;
  var maxTilt = 8;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        'perspective(800px) rotateY(' + (x * maxTilt) + 'deg) rotateX(' + (-y * maxTilt) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Process timeline: progressive fill based on scroll position            */
/* ---------------------------------------------------------------------- */
function initTimeline() {
  var section = document.getElementById('process');
  var progress = document.getElementById('timeline-progress');
  var steps = document.querySelectorAll('.timeline-step');
  if (!section || !steps.length) return;

  function update() {
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;
    var raw = (vh * 0.8 - rect.top) / (rect.height * 0.9);
    var ratio = Math.max(0, Math.min(1, raw));

    if (progress) progress.style.width = (ratio * 100) + '%';

    var activeCount = Math.round(ratio * steps.length);
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i < activeCount);
    });
  }

  window.addEventListener('scroll', throttle(update, 60), { passive: true });
  window.addEventListener('resize', debounce(update, 150));
  update();
}

/* ---------------------------------------------------------------------- */
/* Contact form: client-side validation + real submission via Web3Forms   */
/* (https://web3forms.com — free endpoint, no backend needed).            */
/* Replace the access_key hidden field in index.html with a real key,     */
/* obtained for free at web3forms.com, for messages to actually be sent.  */
/* ---------------------------------------------------------------------- */
function initContactForm() {
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var fail = document.getElementById('form-fail');
  if (!form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (success) success.classList.remove('is-visible');
    if (fail) fail.classList.remove('is-visible');

    var valid = true;
    ['name', 'email', 'subject', 'message'].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      var field = input.closest('.form-field');
      var filled = input.value.trim().length > 0;
      var okEmail = id !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      if (!filled || !okEmail) {
        valid = false;
        if (field) field.classList.add('is-invalid');
      } else if (field) {
        field.classList.remove('is-invalid');
      }
    });

    if (!valid) return;

    var accessKey = form.querySelector('input[name="access_key"]');
    if (!accessKey || !accessKey.value || accessKey.value.indexOf('REMPLACER_PAR') === 0) {
      console.warn('[4Unity] Aucune clé Web3Forms configurée — voir index.html (champ access_key).');
      if (fail) fail.classList.add('is-visible');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Envoi en cours…';

    var formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data && data.success) {
          if (success) {
            success.classList.add('is-visible');
            setTimeout(function () { success.classList.remove('is-visible'); }, 8000);
          }
          form.reset();
        } else {
          if (fail) fail.classList.add('is-visible');
        }
      })
      .catch(function () {
        if (fail) fail.classList.add('is-visible');
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Envoyer le message';
      });
  });
}

/* ---------------------------------------------------------------------- */
/* Back to top button                                                     */
/* ---------------------------------------------------------------------- */
function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', throttle(function () {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, 100), { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------------------- */
/* Footer year                                                             */
/* ---------------------------------------------------------------------- */
function initYear() {
  var el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------------------- */
/* HERO 3D SCENE (Three.js r128 UMD build — global THREE variable)        */
/* If THREE failed to load (offline / blocked CDN) we bail out cleanly    */
/* and the CSS radial-gradient fallback (.hero-visual-fallback) is shown  */
/* instead — the rest of the page is completely unaffected.               */
/* ---------------------------------------------------------------------- */
function initHero3D() {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('[4Unity] THREE.js not available — showing CSS fallback for the hero visual.');
    return;
  }

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var wrap = canvas.parentElement;
  var width = wrap.clientWidth;
  var height = wrap.clientHeight;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  // Lighting
  scene.add(new THREE.AmbientLight(0x8899ff, 0.7));
  var pointLight = new THREE.PointLight(0x5b6eff, 2.2, 40);
  pointLight.position.set(5, 5, 6);
  scene.add(pointLight);
  var pointLight2 = new THREE.PointLight(0x22e6e0, 1.6, 40);
  pointLight2.position.set(-6, -3, 4);
  scene.add(pointLight2);

  var group = new THREE.Group();
  scene.add(group);

  // Central "digital sphere" — icosahedron wireframe, representing the web/core product
  var coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
  var coreMat = new THREE.MeshStandardMaterial({
    color: 0x6f8dff,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
    emissive: 0x3b6bff,
    emissiveIntensity: 0.3
  });
  var core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  var innerGeo = new THREE.IcosahedronGeometry(1.3, 0);
  var innerMat = new THREE.MeshStandardMaterial({
    color: 0x22e6e0,
    emissive: 0x22e6e0,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.3,
    transparent: true,
    opacity: 0.55
  });
  var innerCore = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerCore);

  // Floating "code" fragments — small flat boxes orbiting the core,
  // representing floating lines of code / holographic panels.
  var fragments = [];
  var fragCount = 14;
  for (var i = 0; i < fragCount; i++) {
    var w = 0.5 + Math.random() * 0.9;
    var h = 0.12 + Math.random() * 0.1;
    var geo = new THREE.BoxGeometry(w, h, 0.02);
    var mat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0x3b6bff : 0x8b5cf6,
      emissive: i % 2 === 0 ? 0x3b6bff : 0x8b5cf6,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85
    });
    var frag = new THREE.Mesh(geo, mat);

    var radius = 3.1 + Math.random() * 1.6;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos((Math.random() * 2) - 1);
    frag.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
    frag.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    frag.userData.speed = 0.2 + Math.random() * 0.4;
    frag.userData.radius = radius;
    frag.userData.theta = theta;
    frag.userData.phi = phi;
    frag.userData.driftOffset = Math.random() * Math.PI * 2;

    fragments.push(frag);
    group.add(frag);
  }

  // Particle field — floating tech dust
  var particleCount = 220;
  var positions = new Float32Array(particleCount * 3);
  for (var p = 0; p < particleCount; p++) {
    positions[p * 3] = (Math.random() - 0.5) * 16;
    positions[p * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[p * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var particleMat = new THREE.PointsMaterial({
    color: 0x9fb0ff,
    size: 0.035,
    transparent: true,
    opacity: 0.6
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Thin orbit rings for a "holographic screen" feel
  var ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.01, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x22e6e0, transparent: true, opacity: 0.5 })
  );
  ring1.rotation.x = Math.PI / 2.4;
  group.add(ring1);

  var ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(4.1, 0.008, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 })
  );
  ring2.rotation.x = Math.PI / 3.1;
  ring2.rotation.y = Math.PI / 5;
  group.add(ring2);

  // Mouse-reactive parallax (native mousemove, no external library)
  var mouseX = 0, mouseY = 0;
  var targetRotX = 0, targetRotY = 0;

  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  var clock = new THREE.Clock();
  var isVisible = true;

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { isVisible = entry.isIntersecting; });
  }, { threshold: 0.05 }) : null;
  if (io) io.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    var elapsed = clock.getElapsedTime();

    if (!prefersReduced) {
      core.rotation.y = elapsed * 0.15;
      core.rotation.x = elapsed * 0.08;
      innerCore.rotation.y = -elapsed * 0.25;
      innerCore.rotation.x = elapsed * 0.12;
      ring1.rotation.z = elapsed * 0.1;
      ring2.rotation.z = -elapsed * 0.08;
      particles.rotation.y = elapsed * 0.02;

      fragments.forEach(function (frag) {
        var t = elapsed * frag.userData.speed + frag.userData.driftOffset;
        var theta = frag.userData.theta + t * 0.15;
        var r = frag.userData.radius;
        frag.position.x = r * Math.sin(frag.userData.phi) * Math.cos(theta);
        frag.position.y = r * Math.sin(frag.userData.phi) * Math.sin(theta) + Math.sin(t) * 0.15;
        frag.position.z = r * Math.cos(frag.userData.phi);
        frag.rotation.z += 0.003;
      });
    }

    targetRotX += (mouseY * 0.25 - targetRotX) * 0.04;
    targetRotY += (mouseX * 0.35 - targetRotY) * 0.04;
    group.rotation.x = targetRotX;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.06;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', debounce(function () {
    width = wrap.clientWidth;
    height = wrap.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, 150));
}

/* ---------------------------------------------------------------------- */
/* Subtle animated 3D background for the contact section                  */
/* ---------------------------------------------------------------------- */
function initContact3D() {
  var canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  var wrap = canvas.parentElement;
  var width = wrap.clientWidth;
  var height = wrap.clientHeight;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50);
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(width, height);

  scene.add(new THREE.AmbientLight(0x6f8dff, 0.8));

  var count = 130;
  var positions = new Float32Array(count * 3);
  for (var i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var mat = new THREE.PointsMaterial({ color: 0x3b6bff, size: 0.05, transparent: true, opacity: 0.5 });
  var field = new THREE.Points(geo, mat);
  scene.add(field);

  var isVisible = true;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { isVisible = entry.isIntersecting; });
  }, { threshold: 0.05 }) : null;
  if (io) io.observe(canvas);

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    var t = clock.getElapsedTime();
    field.rotation.y = t * 0.02;
    field.rotation.x = t * 0.01;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', debounce(function () {
    width = wrap.clientWidth;
    height = wrap.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, 150));
}

/* ---------------------------------------------------------------------- */
/* Utilities                                                               */
/* ---------------------------------------------------------------------- */
function debounce(fn, wait) {
  var t;
  return function () {
    var args = arguments, ctx = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(ctx, args); }, wait);
  };
}

function throttle(fn, wait) {
  var last = 0;
  return function () {
    var now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}
