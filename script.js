// ============================================
// BALOU TATTOO — Script
// ============================================

// --- Galerie Instagram (Behold.so feed) ---
async function loadInstagram() {
  const grid = document.getElementById('igGrid');
  if (!grid) return;

  try {
    const res  = await fetch('https://feeds.behold.so/sqFxCkjri8mRpJyX2YJO');
    const data = await res.json();
    const posts = data.posts || data;

    grid.innerHTML = '';

    posts.forEach(post => {
      const img = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || post.mediaUrl;
      if (!img) return;

      const isVideo    = post.mediaType === 'VIDEO';
      const isCarousel = post.mediaType === 'CAROUSEL_ALBUM';
      const caption    = post.prunedCaption || post.caption || '';

      const item = document.createElement('a');
      item.className = 'ig-item';
      item.href      = post.permalink;
      item.target    = '_blank';
      item.rel       = 'noopener';

      item.innerHTML = `
        <img src="${img}" alt="${caption.slice(0, 80)}" loading="lazy" />
        ${isVideo    ? '<span class="ig-type">▶ Reel</span>' : ''}
        ${isCarousel ? '<span class="ig-type">⊞</span>' : ''}
        <div class="ig-overlay">
          ${caption ? `<p class="ig-caption">${caption}</p>` : ''}
        </div>
      `;

      grid.appendChild(item);
    });

  } catch (err) {
    const grid = document.getElementById('igGrid');
    if (grid) grid.innerHTML = '<p class="ig-loading">Impossible de charger le feed Instagram.</p>';
  }
}

loadInstagram();

// --- Nav scroll ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// --- Burger menu ---
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// --- Gallery filter ---
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.cat === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// --- Lightbox ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentImages = [];
let currentIndex = 0;

function getVisibleImages() {
  return Array.from(document.querySelectorAll('.gallery-item:not(.hidden) .gallery-card img'));
}

function openLightbox(img) {
  currentImages = getVisibleImages();
  currentIndex = currentImages.indexOf(img);
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function showNext() {
  currentIndex = (currentIndex + 1) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex].src;
  lightboxImg.alt = currentImages[currentIndex].alt;
}

function showPrev() {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex].src;
  lightboxImg.alt = currentImages[currentIndex].alt;
}

document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    if (img && img.src && !img.src.endsWith('/')) openLightbox(img);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

// --- Swipe sur mobile (lightbox) ---
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) showNext();
    else showPrev();
  }
}, { passive: true });

// --- Formulaire booking ---
const form = document.getElementById('bookingForm');
form.addEventListener('submit', e => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    alert('Merci de remplir les champs obligatoires (nom, email, projet).');
    return;
  }

  // Pour une vraie intégration : remplace par Formspree, EmailJS, ou ton backend
  // Exemple Formspree : form.action = 'https://formspree.io/f/VOTRE_ID'
  // Ici on simule juste un retour visuel :
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Message envoyé ✓';
  btn.disabled = true;
  btn.style.background = '#4a7c59';
  btn.style.color = '#fff';
});

// --- Apparition au scroll (Intersection Observer) ---
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat, .gallery-item, .about-img, .about-text, .booking-text, .booking-form').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});
