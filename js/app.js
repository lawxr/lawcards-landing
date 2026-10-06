/* ============================================================
   LAWCARDS — Master Interactive Controller
   3D Holographic Slab Physics & Lightweight Ambient Canvas
   ============================================================ */

(function () {
  'use strict';

  /* ================= AMBIENT CANVAS ================= */
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 100);
    });

    const particles = [];
    const count = Math.min(32, Math.floor((width * height) / 28000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.08,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.4 + 0.15,
        phase: Math.random() * Math.PI * 2
      });
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function render() {
      if (!isVisible) {
        requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle minimalist grid crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
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

      // Floating ambient stardust
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.015;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase)) * 0.35;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;

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
    const container = document.getElementById('slabContainer');
    if (!container) return;

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

      // Clamp tilt limits (-16deg to 16deg)
      targetRy = Math.max(-16, Math.min(16, normX * 18));
      targetRx = Math.max(-16, Math.min(16, -normY * 18));

      // Foil glare position relative to card
      const foilX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const foilY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      updateHolo(foilX, foilY);
    }

    window.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('mouseenter', () => {
      isHovering = true;
      document.documentElement.style.setProperty('--holo-opacity', '0.75');
    });

    container.addEventListener('mouseleave', () => {
      isHovering = false;
      targetRx = 0;
      targetRy = 0;
      document.documentElement.style.setProperty('--holo-opacity', '0.55');
    });

    // Smooth animation loop for physics dampening
    function loop() {
      // Linear interpolation (Lerp) for silky smooth tilt
      currentRx += (targetRx - currentRx) * 0.1;
      currentRy += (targetRy - currentRy) * 0.1;

      // Base idle wobble when not directly hovering
      const idleWobbleX = isHovering ? 0 : Math.sin(Date.now() * 0.0015) * 2;
      const idleWobbleY = isHovering ? 0 : Math.cos(Date.now() * 0.0018) * 2.5;

      container.style.transform = `rotateX(${currentRx + idleWobbleX}deg) rotateY(${currentRy + idleWobbleY}deg)`;

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ================= INITIALIZATION ================= */
  document.addEventListener('DOMContentLoaded', () => {
    // Prevent dragging images
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });

    initAmbientCanvas();
    initSlabPhysics();
  });
})();
