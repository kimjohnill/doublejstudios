// ─── PARALLAX VIDEO ─────────────────────────────────────────
(function () {
  const videos = document.querySelectorAll('.parallax-video');

  function updateParallax() {
    const viewportCenter = window.innerHeight / 2;

    videos.forEach((video) => {
      const rect = video.parentElement.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distanceFromCenter = cardCenter - viewportCenter;
      const move = distanceFromCenter * -0.2;

      video.style.transform = `translateY(${move}px) scale(1.65)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('load', updateParallax);
  updateParallax();
})();

// ─── NAV GLASS WARP ON SCROLL ───────────────────────────────
(function () {
  const navInner = document.querySelector('.nav__inner');
  if (!navInner) return;

  function onScroll() {
    const maxOffset = 120; // Increased for a smoother, longer transition
    const y = Math.min(window.scrollY, maxOffset);
    const t = y / maxOffset; // 0 → 1

    // Smooth floating transition
    const translateY = t * 6;          // Up to 6px down
    const scale = 1 - t * 0.015;       // Subtle scale down to 0.985 for a docked feel
    navInner.style.transform = `translateY(${translateY}px) scale(${scale})`;

    // FIX: Keep the opacity low so backdrop-filter can actually do its job!
    // Scales beautifully from your CSS base (0.08) up to a crisp, clear glass maximum (0.35)
    const backgroundAlpha = 0.08 + t * 0.27;
    const borderAlpha = 0.22 + t * 0.18;      // Scales from 0.22 to 0.40

    navInner.style.background = `rgba(255, 255, 255, ${backgroundAlpha})`;
    navInner.style.borderColor = `rgba(255, 255, 255, ${borderAlpha})`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
})();

// ─── HERO BLOB MORPH ────────────────────────────────────────
(function () {
  const blobFill = document.getElementById('blobFill');
  const blobClipPath = document.getElementById('blobClipPath');
  if (!blobFill || !blobClipPath) return;

  const cx = 250, cy = 250, r = 280; // Slightly reduced r to keep it perfectly within view bounds
  const points = 8;
  const speed = 0.001;
  const warp = 10; // Increased warp slightly so you can actually see the beautiful organic waves

  function noise(x, y, t) {
    return Math.sin(x * 2.1 + t) * Math.cos(y * 1.7 + t * 0.8) +
           Math.sin(x * 0.9 + t * 1.3) * Math.cos(y * 2.3 + t * 0.5) +
           Math.cos(x * 1.5 + t * 0.7) * Math.sin(y * 1.1 + t * 1.1);
  }

  function buildPath(t) {
    const pts = [];

    // 1. Generate the base points of the blob
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const n = noise(nx, ny, t);
      const radius = r + n * warp;
      pts.push([
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius
      ]);
    }

    // 2. Start the SVG path at the very first generated point
    let d = `M ${pts[0][0]},${pts[0][1]} `;

    // Tension control: 0.15 - 0.25 is the sweet spot for perfectly fluid, organic shapes.
    const tension = 0.2;

    // 3. Connect every point using a continuous cubic bezier loop
    for (let i = 0; i < points; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % points];
      const prev = pts[(i - 1 + points) % points];
      const next = pts[(i + 2) % points];

      // Calculate control points based on the tangents of surrounding coordinates
      const cpx1 = p0[0] + (p1[0] - prev[0]) * tension;
      const cpy1 = p0[1] + (p1[1] - prev[1]) * tension;

      const cpx2 = p1[0] - (next[0] - p0[0]) * tension;
      const cpy2 = p1[1] - (next[1] - p0[1]) * tension;

      d += `C ${cpx1},${cpy1} ${cpx2},${cpy2} ${p1[0]},${p1[1]} `;
    }

    d += 'Z';
    return d;
  }

  function animate(ts) {
    const t = ts * speed;
    const d = buildPath(t);
    blobFill.setAttribute('d', d);
    blobClipPath.setAttribute('d', d);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();

// ─── EMAILJS FORM SUBMISSION ────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusMsg = document.getElementById('form-status');

  if (!form) return;

  // Initialize EmailJS with your verified Public Key
  emailjs.init("Ztl4DAyAGnnmT_rvB");

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Disable button and show loading state
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    statusMsg.innerText = '';
    statusMsg.className = 'form-status';

    // Send form data using your connected Service ID and Template ID
    emailjs.sendForm('service_2ei1qad', 'template_vx3yz3l', this)
      .then(function () {
        // Success
        submitBtn.innerText = 'Request Sent!';
        submitBtn.style.background = '#10b981'; // Turn button green on success
        submitBtn.style.borderColor = '#10b981';
        form.reset();

        setTimeout(() => {
          submitBtn.innerText = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.background = ''; // reset to CSS defaults
          submitBtn.style.borderColor = '';
        }, 5000);

      }, function (error) {
        // Error
        statusMsg.innerText = 'Oops! Something went wrong. Please try emailing us directly.';
        statusMsg.classList.add('error');

        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        console.error("EmailJS Error:", error);
      });
  });
})();
