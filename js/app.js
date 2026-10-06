/* ============================================================
   LAWCARDS — Master Interactive Controller
   3D Holographic Slab Physics, Web Audio Synthesis, Canvas Ambience
   ============================================================ */

(function () {
  'use strict';

  // State
  const state = {
    soundEnabled: true,
    inverted: false,
    crtEnabled: false,
    slabFlipped: false,
    audioCtx: null
  };

  /* ================= WEB AUDIO API SYNTHESIZER ================= */
  function initAudio() {
    if (!state.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        state.audioCtx = new AudioContext();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!state.audioCtx) return;

    const ctx = state.audioCtx;
    const now = ctx.currentTime;

    try {
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } else if (type === 'shimmer') {
        [660, 990, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          gain.gain.setValueAtTime(0.04, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.2);
        });
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.35);
        });
      }
    } catch (e) {
      // Audio fallback fail-safe
    }
  }

  /* ================= AMBIENT CANVAS ================= */
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(45, Math.floor((width * height) / 22000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function render(time) {
      ctx.clearRect(0, 0, width, height);
      const isDark = !state.inverted;
      const baseAlpha = isDark ? 0.35 : 0.25;

      // Draw subtle grid crosshairs
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      const step = 140;
      for (let x = (width % step) / 2; x < width; x += step) {
        for (let y = (height % step) / 2; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(x - 3, y);
          ctx.lineTo(x + 3, y);
          ctx.moveTo(x, y - 3);
          ctx.lineTo(x, y + 3);
          ctx.stroke();
        }
      }

      // Draw floating holographic particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase)) * baseAlpha;
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${currentAlpha})`
          : `rgba(0, 0, 0, ${currentAlpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  /* ================= 3D HOLOGRAPHIC SLAB PHYSICS ================= */
  function initSlabPhysics() {
    const stage = document.querySelector('.slab-stage');
    const container = document.getElementById('slabContainer');
    const inner = container ? container.querySelector('.slab-inner') : null;
    const flipBtn = document.getElementById('slabFlipTrigger');
    if (!stage || !container || !inner) return;

    let targetRx = 0;
    let targetRy = 0;
    let currentRx = 0;
    let currentRy = 0;
    let isHovering = false;

    function updateHolo(xPercent, yPercent) {
      document.documentElement.style.setProperty('--holo-x', `${xPercent}%`);
      document.documentElement.style.setProperty('--holo-y', `${yPercent}%`);
    }

    function handleMove(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const normX = (clientX - cardCenterX) / (window.innerWidth / 2);
      const normY = (clientY - cardCenterY) / (window.innerHeight / 2);

      // Clamp tilt limits (-18deg to 18deg)
      targetRy = Math.max(-18, Math.min(18, normX * 22));
      targetRx = Math.max(-18, Math.min(18, -normY * 22));

      // Foil glare position relative to card
      const foilX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const foilY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      updateHolo(foilX, foilY);
    }

    window.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('mouseenter', () => {
      isHovering = true;
      playSound('shimmer');
      document.documentElement.style.setProperty('--holo-opacity', '0.85');
    });

    container.addEventListener('mouseleave', () => {
      isHovering = false;
      targetRx = 0;
      targetRy = 0;
      document.documentElement.style.setProperty('--holo-opacity', '0.55');
    });

    // Flip slab on click
    function toggleFlip() {
      state.slabFlipped = !state.slabFlipped;
      container.classList.toggle('is-flipped', state.slabFlipped);
      playSound('flip');
      const flipHint = document.getElementById('slabFlipText');
      if (flipHint) {
        flipHint.textContent = state.slabFlipped
          ? '[◄ GIRAR: VER ANVERSO ORIGINAL]'
          : '[► GIRAR: VER CERTIFICADO & AUTENTICIDAD]';
      }
    }

    container.addEventListener('click', (e) => {
      toggleFlip();
    });

    if (flipBtn) {
      flipBtn.addEventListener('mousedown', (e) => e.preventDefault());
      flipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        flipBtn.blur();
        toggleFlip();
      });
    }

    // Smooth animation loop for physics dampening
    function loop() {
      // Linear interpolation (Lerp) for smooth butter feel
      currentRx += (targetRx - currentRx) * 0.1;
      currentRy += (targetRy - currentRy) * 0.1;

      // Base idle wobble when not interacting
      const idleWobbleX = isHovering ? 0 : Math.sin(Date.now() * 0.0015) * 2.5;
      const idleWobbleY = isHovering ? 0 : Math.cos(Date.now() * 0.0018) * 3;

      container.style.transform = `rotateX(${currentRx + idleWobbleX}deg) rotateY(${currentRy + idleWobbleY}deg)`;

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ================= TOAST NOTIFICATION SYSTEM ================= */
  let toastTimeout = null;
  function showToast(message) {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastMsg';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  /* ================= HUD CONTROLS ================= */
  function initHudControls() {
    // Sound toggle
    const sndBtn = document.getElementById('btnSnd');
    if (sndBtn) {
      sndBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        sndBtn.classList.toggle('is-active', state.soundEnabled);
        const val = sndBtn.querySelector('.hud-btn__label');
        if (val) val.textContent = state.soundEnabled ? 'ON' : 'OFF';
        if (state.soundEnabled) {
          playSound('success');
          showToast('AUDIO SINTETIZADOR ACTIVADO');
        } else {
          showToast('AUDIO SILENCIADO');
        }
      });
    }

    // Share button
    const shareBtn = document.getElementById('btnShare');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        playSound('click');
        if (navigator.share) {
          navigator.share({
            title: 'LawCards — Tienda Oficial TCG',
            text: 'Próximamente tienda oficial de TCG: Pokémon y Slabs certificados PSA/BGS directos desde Medellín.',
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(window.location.href).then(() => {
            playSound('success');
            showToast('ENLACE COPIADO AL PORTAPAPELES');
          });
        }
      });
    }

    // Attach click and hover sound feedback to interactive items
    document.querySelectorAll('a, button, .link-card').forEach((el) => {
      el.addEventListener('mouseenter', () => playSound('hover'));
    });
  }

  /* ================= LINKTREE INTERACTIONS & COPY ================= */
  function initLinkActions() {
    // Copy buttons
    document.querySelectorAll('.link-card__copy').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const copyText = btn.getAttribute('data-copy');
        if (copyText) {
          navigator.clipboard.writeText(copyText).then(() => {
            playSound('success');
            showToast(`COPIADO: ${copyText}`);
          });
        }
      });
    });
  }

  /* ================= DROP ALERT SIGNUP & SANITIZATION ================= */
  function sanitizeInput(str) {
    return str.replace(/[<>&"']/g, '').trim().slice(0, 100);
  }

  function initDropForm() {
    const form = document.getElementById('dropAlertForm');
    const input = document.getElementById('dropAlertInput');
    const btn = document.getElementById('dropAlertBtn');

    if (form && input && btn) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = sanitizeInput(input.value);
        if (!value) return;

        // Persist to localStorage safely
        try {
          const subs = JSON.parse(localStorage.getItem('lc_drop_subs') || '[]');
          subs.push({ contact: value, date: new Date().toISOString() });
          localStorage.setItem('lc_drop_subs', JSON.stringify(subs));
        } catch (err) {}

        playSound('success');
        showToast('✓ REGISTRADO: RECIBIRÁS ACCESO VIP 24H ANTES DEL LANZAMIENTO');
        btn.textContent = 'REGISTRADO ✓';
        btn.disabled = true;
        btn.style.opacity = '0.7';
        input.value = '';
        input.disabled = true;
      });
    }
  }

  /* ================= INITIALIZATION ================= */
  document.addEventListener('DOMContentLoaded', () => {
    // Universal image drag prevention
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });

    initAmbientCanvas();
    initSlabPhysics();
    initHudControls();
    initLinkActions();
    initDropForm();
  });
})();
