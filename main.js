document.addEventListener('DOMContentLoaded', () => {

    // --- DRAG SYSTEM ---
    let dragging = null;
    let offsetX = 0;
    let offsetY = 0;
    let startX = 0;
    let startY = 0;
    let zCounter = 100;
    const DRAG_THRESHOLD = 5;
  
    const artifacts = document.querySelectorAll('.artifact');
  
    artifacts.forEach(card => {
      // Force position baseline so left/top assignments work
      const rect = card.getBoundingClientRect();
      card.style.position = 'absolute';
      card.style.left = rect.left + 'px';
      card.style.top = rect.top + 'px';
      card.style.margin = '0';
  
      card.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
  
        dragging = card;
        startX = e.clientX;
        startY = e.clientY;
  
        const cardRect = card.getBoundingClientRect();
        offsetX = e.clientX - cardRect.left;
        offsetY = e.clientY - cardRect.top;
  
        card.style.zIndex = ++zCounter;
        card.style.transform = 'scale(1.02)';
        card.style.transition = 'transform 0.1s';
  
        // Touch mirror
      });
  
      // Block anchor navigation if dragged
      const anchor = card.tagName === 'A' ? card : card.querySelector('a');
      if (anchor) {
        anchor.addEventListener('click', (e) => {
          const dx = Math.abs(e.clientX - startX);
          const dy = Math.abs(e.clientY - startY);
          if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
            e.preventDefault();
          }
        });
      }
    });
  
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
  
      const cardW = dragging.offsetWidth;
      const cardH = dragging.offsetHeight;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
  
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;
  
      // Clamp — keep at least 20px of card visible on each edge
      newLeft = Math.max(-cardW + 20, Math.min(newLeft, vpW - 20));
      newTop = Math.max(-cardH + 20, Math.min(newTop, vpH - 20));
  
      dragging.style.left = newLeft + 'px';
      dragging.style.top = newTop + 'px';
    });
  
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging.style.transform = 'scale(1.0)';
      dragging.style.transition = 'transform 0.15s';
      dragging = null;
    });
  
    // --- TOUCH SUPPORT ---
    artifacts.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        dragging = card;
        startX = touch.clientX;
        startY = touch.clientY;
  
        const cardRect = card.getBoundingClientRect();
        offsetX = touch.clientX - cardRect.left;
        offsetY = touch.clientY - cardRect.top;
  
        card.style.zIndex = ++zCounter;
        card.style.transform = 'scale(1.02)';
      }, { passive: true });
    });
  
    document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
  
      const cardW = dragging.offsetWidth;
      const cardH = dragging.offsetHeight;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
  
      let newLeft = touch.clientX - offsetX;
      let newTop = touch.clientY - offsetY;
  
      newLeft = Math.max(-cardW + 20, Math.min(newLeft, vpW - 20));
      newTop = Math.max(-cardH + 20, Math.min(newTop, vpH - 20));
  
      dragging.style.left = newLeft + 'px';
      dragging.style.top = newTop + 'px';
    }, { passive: true });
  
    document.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging.style.transform = 'scale(1.0)';
      dragging = null;
    });
  
    // --- BACKGROUND PARTICLE ANIMATION ---
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }));
  
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
  
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40,201,113,0.3)';
        ctx.fill();
      });
  
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(40,201,113,${(1 - dist / 120) * 0.08})`;
            ctx.stroke();
          }
        }
      }
  
      requestAnimationFrame(animateParticles);
    }
  
    animateParticles();
  
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  
  });