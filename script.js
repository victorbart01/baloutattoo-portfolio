// ============================================
// BALOU TATTOO — Script
// ============================================

// Références vectorielles SVG
const styleGuide = [
  { src: "images/mandala-01.svg", label: "Mandala classique — 8 symétries" },
  { src: "images/mandala-07.svg", label: "Mandala soleil — triangles rayonnants" },
  { src: "images/mandala-02.svg", label: "Lotus mandala — 12 pétales" },
  { src: "images/mandala-03.svg", label: "Géométrie sacrée — hexagonal" },
  { src: "images/mandala-04.svg", label: "Fine line — 16 symétries" },
  { src: "images/mandala-06.svg", label: "Dotwork — pointilliste" },
  { src: "images/mandala-05.svg", label: "Bracelet ornamental — manchette" },
];

// Photos d'inspiration (dossier images/inspi/)
const inspiPhotos = [
  "IMG_7889.JPG","IMG_5097.JPG","IMG_6749.JPG","IMG_6751.JPG",
  "IMG_6745.JPG","IMG_7881.JPG","IMG_7880.JPG","IMG_3600.JPG",
  "IMG_6750.JPG","IMG_6746.JPG","IMG_6747.JPG","IMG_6782.JPG",
  "IMG_6901.JPG","IMG_7835.JPG","IMG_7836.JPG","IMG_4486.JPG",
  "IMG_6716.JPG","IMG_6809.JPG","IMG_7074.JPG","IMG_7470.JPG",
  "IMG_6780.JPG","IMG_6810.JPG","IMG_7571.JPG","IMG_7572.JPG",
  "IMG_4531.JPG","IMG_7341.JPG","IMG_7320.JPG","IMG_7321.JPG",
  "IMG_7323.JPG","IMG_7445.JPG","IMG_7337.JPG","IMG_7322.JPG",
  "IMG_7444.JPG","IMG_7681.JPG","IMG_7324.JPG","IMG_7882.JPG",
  "IMG_7883.JPG","IMG_7887.JPG","IMG_7886.JPG","IMG_7884.JPG",
  "IMG_7885.JPG","IMG_7588.JPG",
];

// ===== CURSEUR FLEUR DE VIE =====
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  cursor.style.opacity = '0';
  let mx = -100, my = -100, cx = -100, cy = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function moveCursor() {
    cx = lerp(cx, mx, 0.4);
    cy = lerp(cy, my, 0.4);
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(moveCursor);
  }
  moveCursor();
}

// ===== INTRO VIDÉO =====
function runIntro() {
  const intro = document.getElementById('intro');
  const video = document.getElementById('intro-video');
  const skip  = document.getElementById('intro-skip');
  if (!intro) return;

  function closeIntro() {
    intro.classList.add('fade-out');
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });
  }

  if (video) {
    video.addEventListener('ended', closeIntro);
    video.addEventListener('error', () => setTimeout(closeIntro, 500));
  } else {
    setTimeout(closeIntro, 300);
  }

  if (skip) skip.addEventListener('click', closeIntro);
  intro.addEventListener('mousemove', closeIntro, { once: true });
}

// ===== GALERIE INSTAGRAM (Behold.so) =====
let igImages = [];

async function loadInstagram() {
  const grid = document.getElementById('ig-grid');
  if (!grid) return;

  try {
    const res   = await fetch('https://feeds.behold.so/sqFxCkjri8mRpJyX2YJO');
    const data  = await res.json();
    const posts = data.posts || data;

    grid.innerHTML = '';
    igImages = [];

    posts.forEach((post, i) => {
      const imgUrl  = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || post.mediaUrl;
      if (!imgUrl) return;

      igImages.push({ src: imgUrl, caption: post.prunedCaption || post.caption || '' });

      const isVideo    = post.mediaType === 'VIDEO';
      const isCarousel = post.mediaType === 'CAROUSEL_ALBUM';
      const caption    = post.prunedCaption || post.caption || '';

      const item = document.createElement('div');
      item.className   = 'ig-item';
      item.dataset.index = igImages.length - 1;
      item.innerHTML = `
        <img src="${imgUrl}" alt="${caption.slice(0, 80)}" loading="lazy" />
        ${isVideo    ? '<span class="ig-type">▶</span>' : ''}
        ${isCarousel ? '<span class="ig-type">⊞</span>' : ''}
        <div class="ig-overlay">
          ${caption ? `<p class="ig-caption">${caption.slice(0, 90)}</p>` : ''}
        </div>
      `;
      item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
      grid.appendChild(item);
    });

  } catch {
    const g = document.getElementById('ig-grid');
    if (g) g.innerHTML = '<div class="ig-loading">Feed Instagram temporairement indisponible.</div>';
  }
}

// ===== LIGHTBOX =====
let lbIndex = 0;

function openLightbox(index) {
  lbIndex = index;
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  if (!lb || !lbImg) return;
  lbImg.src = igImages[lbIndex].src;
  lbImg.alt = igImages[lbIndex].caption;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNext() {
  lbIndex = (lbIndex + 1) % igImages.length;
  const lbImg = document.getElementById('lb-img');
  if (lbImg) lbImg.src = igImages[lbIndex].src;
}

function lbPrev() {
  lbIndex = (lbIndex - 1 + igImages.length) % igImages.length;
  const lbImg = document.getElementById('lb-img');
  if (lbImg) lbImg.src = igImages[lbIndex].src;
}

function initLightbox() {
  const lbClose = document.getElementById('lb-close');
  const lbNextBtn = document.getElementById('lb-next');
  const lbPrevBtn = document.getElementById('lb-prev');
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  if (lbClose)   lbClose.addEventListener('click', closeLightbox);
  if (lbNextBtn) lbNextBtn.addEventListener('click', lbNext);
  if (lbPrevBtn) lbPrevBtn.addEventListener('click', lbPrev);

  lb.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') lbNext();
    if (e.key === 'ArrowLeft')  lbPrev();
  });

  // Swipe mobile
  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) lbNext(); else lbPrev(); }
  }, { passive: true });
}

// ===== GALERIE INSPIRATION =====
function loadInspi() {
  const section = document.getElementById('gallery-pint');
  if (!section) return;

  section.innerHTML = '';
  inspiPhotos.forEach(filename => {
    const img = document.createElement('img');
    img.src     = `images/inspi/${filename}`;
    img.alt     = 'Référence tatouage mandala';
    img.loading = 'lazy';
    // Masquer silencieusement si l'image n'existe pas
    img.onerror = () => img.remove();
    section.appendChild(img);
  });
}

// ===== RÉFÉRENCES VECTORIELLES =====
function loadReferences() {
  const section = document.getElementById('references-section');
  if (!section) return;

  section.innerHTML = '';
  styleGuide.forEach(ref => {
    const item = document.createElement('div');
    item.className = 'ref-item';
    item.innerHTML = `
      <div class="ref-img-wrapper">
        <img src="${ref.src}" alt="${ref.label}" loading="lazy" />
      </div>
      <p class="ref-label">${ref.label}</p>
    `;
    section.appendChild(item);
  });
}

// ===== FORMULAIRE BOOKING (Formspree AJAX) =====
// Remplacer VOTRE_ID_FORMSPREE dans index.html par ton vrai ID (formspree.io)
function initForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      alert('Merci de remplir les champs obligatoires (nom, email, projet).');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        btn.textContent = 'Message envoyé ✓';
        btn.style.background = '#2a5c3a';
        btn.style.color = '#fff';
        form.reset();
      } else {
        const data = await res.json();
        const errMsg = data?.errors?.map(e => e.message).join(', ') || 'Erreur inconnue';
        btn.textContent = orig;
        btn.disabled = false;
        alert('Erreur : ' + errMsg);
      }
    } catch {
      btn.textContent = orig;
      btn.disabled = false;
      alert('Connexion impossible. Merci de contacter via Instagram.');
    }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  runIntro();
  loadInstagram();
  initLightbox();
  loadInspi();
  loadReferences();
  initForm();
});
