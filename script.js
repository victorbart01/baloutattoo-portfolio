/* ============================================================
   BALOU TATTOO — Portfolio JS
   ============================================================ */

(() => {
  'use strict';

  /* ============================================================
     Config
     ============================================================ */

  const BEHOLD_FEED = 'https://feeds.behold.so/sqFxCkjri8mRpJyX2YJO';
  const IG_DM_URL   = 'https://ig.me/m/balou_tattoo.ink';
  // Détecte si le Formspree n'est pas encore configuré.
  const FORMSPREE_PLACEHOLDER = 'VOTRE_ID_FORMSPREE';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Helpers
     ============================================================ */

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (str = '') =>
    str.replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

  /* ============================================================
     Navigation — scroll state + active link
     ============================================================ */

  function initNav() {
    const nav = $('#nav');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Active link au scroll (IntersectionObserver léger)
    const sections = $$('main section[id]');
    const links    = $$('.nav-links > a[href^="#"]');
    if (!sections.length || !links.length) return;

    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = byId.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
  }

  /* ============================================================
     Menu mobile (burger)
     ============================================================ */

  function initMobileMenu() {
    const burger = $('#burger');
    const menu   = $('#mobileMenu');
    if (!burger || !menu) return;

    const close = () => {
      burger.classList.remove('is-open');
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const toggle = () => {
      const isOpen = burger.classList.toggle('is-open');
      menu.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    burger.addEventListener('click', toggle);

    $$('.mobile-menu-inner a', menu).forEach(a =>
      a.addEventListener('click', close)
    );

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  /* ============================================================
     Instagram feed (Behold.so)
     ============================================================ */

  const igState = {
    posts: [],       // [{ imgUrl, permalink, caption, isVideo, isCarousel }]
  };

  async function loadInstagram() {
    const grid = $('#igGrid');
    if (!grid) return;

    try {
      const res = await fetch(BEHOLD_FEED);
      if (!res.ok) throw new Error('feed unavailable');
      const data = await res.json();
      const posts = (data.posts || data || []).slice(0, 12);

      igState.posts = posts
        .map(post => {
          const imgUrl = post.sizes?.medium?.mediaUrl || post.thumbnailUrl || post.mediaUrl;
          if (!imgUrl) return null;
          return {
            imgUrl,
            permalink: post.permalink || 'https://www.instagram.com/balou_tattoo.ink/',
            caption: (post.prunedCaption || post.caption || '').trim(),
            isVideo: post.mediaType === 'VIDEO',
            isCarousel: post.mediaType === 'CAROUSEL_ALBUM',
          };
        })
        .filter(Boolean);

      if (!igState.posts.length) throw new Error('no posts');

      renderInstagram(grid);
    } catch (err) {
      grid.innerHTML = `
        <div class="ig-loading">
          Feed Instagram temporairement indisponible —
          <a href="https://www.instagram.com/balou_tattoo.ink/" target="_blank" rel="noopener" style="color:var(--accent)">
            voir directement sur Instagram ↗
          </a>
        </div>`;
    }
  }

  function renderInstagram(grid) {
    grid.innerHTML = '';
    igState.posts.forEach((post, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'ig-item';
      item.dataset.index = String(index);
      item.setAttribute('aria-label', post.caption.slice(0, 80) || 'Tatouage Balou');

      const caption = escapeHtml(post.caption);
      const alt     = escapeHtml(post.caption.slice(0, 120) || 'Tatouage Balou');

      item.innerHTML = `
        <img src="${post.imgUrl}" alt="${alt}" loading="lazy" />
        ${post.isVideo    ? '<span class="ig-type">▶ Reel</span>' : ''}
        ${post.isCarousel ? '<span class="ig-type">⊞ Carousel</span>' : ''}
        <div class="ig-overlay">
          ${caption ? `<p class="ig-caption">${caption}</p>` : ''}
        </div>
      `;

      item.addEventListener('click', () => openLightbox(index));
      grid.appendChild(item);
    });
  }

  /* ============================================================
     Lightbox
     ============================================================ */

  const lb = {
    el: null,
    img: null,
    caption: null,
    link: null,
    index: 0,
  };

  function initLightbox() {
    lb.el      = $('#lightbox');
    lb.img     = $('#lbImg');
    lb.caption = $('#lbCaption');
    lb.link    = $('#lbLink');
    if (!lb.el || !lb.img) return;

    $('#lbClose')?.addEventListener('click', closeLightbox);
    $('#lbPrev')?.addEventListener('click', () => navLightbox(-1));
    $('#lbNext')?.addEventListener('click', () => navLightbox(+1));

    lb.el.addEventListener('click', e => {
      if (e.target === lb.el || e.target.classList.contains('lb-figure')) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (!lb.el.classList.contains('is-open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(+1);
    });

    // Swipe mobile
    let touchX = 0;
    lb.el.addEventListener('touchstart', e => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    lb.el.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) navLightbox(diff > 0 ? +1 : -1);
    }, { passive: true });
  }

  function openLightbox(index) {
    const post = igState.posts[index];
    if (!post || !lb.el) return;
    lb.index = index;
    lb.img.src     = post.imgUrl;
    lb.img.alt     = post.caption.slice(0, 120) || 'Tatouage Balou';
    lb.caption.textContent = post.caption;
    lb.link.href   = post.permalink;
    lb.el.classList.add('is-open');
    lb.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lb.el) return;
    lb.el.classList.remove('is-open');
    lb.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    if (!igState.posts.length) return;
    lb.index = (lb.index + dir + igState.posts.length) % igState.posts.length;
    openLightbox(lb.index);
  }

  /* ============================================================
     Formulaire booking
     ============================================================ */

  function initBookingForm() {
    const form   = $('#bookingForm');
    if (!form) return;

    const status = $('#formStatus');
    const btn    = form.querySelector('.btn-submit');
    const btnLabel = btn?.querySelector('.btn-label');
    const btnOriginal = btnLabel?.textContent || 'Envoyer ma demande';
    const fileInput = $('#f-inspiration');
    const fileSelected = $('#fileSelected');

    const formspreeConfigured = !form.action.includes(FORMSPREE_PLACEHOLDER);

    // Preview des fichiers choisis
    if (fileInput && fileSelected) {
      fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files || []);
        if (!files.length) {
          fileSelected.hidden = true;
          fileSelected.textContent = '';
          return;
        }
        // Limite à 5 fichiers
        if (files.length > 5) {
          fileSelected.hidden = false;
          fileSelected.textContent = 'Maximum 5 images. Seules les 5 premières seront envoyées.';
          fileSelected.style.color = 'var(--danger, #d88a8a)';
          return;
        }
        const names = files.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} Mo)`);
        fileSelected.hidden = false;
        fileSelected.textContent = names.length + ' image' + (names.length > 1 ? 's' : '') + ' : ' + names.join(', ');
        fileSelected.style.color = '';
      });
    }

    const showStatus = (msg, type = 'success') => {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-visible is-' + type;
    };

    const setLoading = (loading) => {
      if (!btn) return;
      btn.disabled = loading;
      btn.classList.toggle('is-loading', loading);
      if (btnLabel) btnLabel.textContent = loading ? 'Envoi en cours' : btnOriginal;
    };

    // Helper : accès fiable aux champs (évite la collision form.name / form.style avec les propriétés natives de HTMLFormElement)
    const field = (n) => form.elements.namedItem(n);
    const val   = (n) => (field(n)?.value || '').trim();

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const name    = val('name');
      const email   = val('email');
      const project = val('project');
      const consent = field('consent')?.checked;

      if (!name || !email || !project) {
        showStatus('Merci de remplir les champs obligatoires (nom, email, description).', 'error');
        return;
      }
      if (!consent) {
        showStatus('Tu dois accepter la politique de confidentialité pour envoyer ta demande.', 'error');
        return;
      }

      // Si Formspree n'est pas configuré, fallback Instagram DM avec message pré-rempli
      if (!formspreeConfigured) {
        showStatus('Ouverture d\'Instagram pour envoyer ton message directement à Balou…', 'success');
        const igMessage = buildIgMessage(form);
        try {
          await navigator.clipboard?.writeText(igMessage);
        } catch (_) {}
        setTimeout(() => {
          window.open(IG_DM_URL, '_blank', 'noopener');
        }, 600);
        return;
      }

      setLoading(true);
      showStatus('Envoi en cours…', 'success');

      try {
        const formData = new FormData(form);

        // Limite à 5 fichiers inspiration côté client
        if (fileInput?.files?.length > 5) {
          formData.delete('inspiration[]');
          Array.from(fileInput.files).slice(0, 5).forEach(f =>
            formData.append('inspiration[]', f)
          );
        }

        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          showStatus('Merci ! Ta demande est bien arrivée. Je te réponds sous 48h.', 'success');
          form.reset();
          if (fileSelected) { fileSelected.hidden = true; fileSelected.textContent = ''; }
          setLoading(false);
          if (btnLabel) btnLabel.textContent = 'Envoyé ✓';
          btn.disabled = true;
          return;
        }

        const data = await res.json().catch(() => ({}));
        const errMsg = data?.errors?.map(x => x.message).join(', ')
          || 'Le serveur n\'a pas accepté la demande. Réessaie ou contacte-moi sur Instagram.';
        showStatus(errMsg, 'error');
      } catch (err) {
        showStatus('Connexion impossible. Tu peux me contacter directement sur Instagram.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  function buildIgMessage(form) {
    const get = (n) => {
      const el = form.elements.namedItem(n);
      return (el && 'value' in el && el.value) ? el.value : '';
    };
    const styleRadio  = form.querySelector('input[name="style"]:checked')?.value  || '';
    const sizeRadio   = form.querySelector('input[name="size"]:checked')?.value   || '';
    const budgetRadio = form.querySelector('input[name="budget"]:checked')?.value || '';

    const lines = [
      `Bonjour Balou,`,
      ``,
      `Je te contacte pour un projet de tatouage.`,
      ``,
      `Nom : ${get('name')}`,
      get('phone')     && `Téléphone : ${get('phone')}`,
      get('city')      && `Ville : ${get('city')}`,
      styleRadio       && `Style : ${styleRadio}`,
      sizeRadio        && `Taille : ${sizeRadio}`,
      budgetRadio      && `Budget : ${budgetRadio}`,
      get('placement') && `Placement : ${get('placement')}`,
      get('period')    && `Période : ${get('period')}`,
      ``,
      `Projet :`,
      get('project'),
    ].filter(Boolean).join('\n');
    return lines;
  }

  /* ============================================================
     Scroll reveal (progressive enhancement)
     ============================================================ */

  function initScrollReveal() {
    if (prefersReduced) return;
    if (!('IntersectionObserver' in window)) return;

    const selectors = [
      '.stats-grid',
      '.section-header',
      '.ig-grid',
      '.process-steps',
      '.testi-grid',
      '.pricing-grid',
      '.studios',
      '.about-media',
      '.about-text',
      '.faq-list',
      '.booking-inner',
    ];

    const targets = $$(selectors.join(','));
    if (!targets.length) return;

    // Observer D'ABORD, puis ajout de la classe .js-reveal dans un rAF
    // (évite le flash d'éléments cachés si l'observer ne déclenche pas)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 10% 0px' });

    requestAnimationFrame(() => {
      targets.forEach(el => {
        el.classList.add('js-reveal');
        io.observe(el);
      });
    });

    // FILET DE SÉCURITÉ : si pour une raison quelconque l'observer ne se déclenche
    // pas (bug, extension, viewport étrange), on force l'affichage après 1.5s.
    setTimeout(() => {
      targets.forEach(el => el.classList.add('is-visible'));
    }, 1500);
  }

  /* ============================================================
     Hero video — fallback gracieux
     ============================================================ */

  function initHeroVideo() {
    const video = $('.hero-video');
    if (!video) return;

    // Si la vidéo ne peut pas charger, on la supprime (le gradient du hero prend le relais)
    video.addEventListener('error', () => {
      video.remove();
    }, { once: true });

    // Si on passe en mode reduced-motion après coup, on retire la vidéo
    if (prefersReduced) video.remove();
  }

  /* ============================================================
     Portrait fallback — vérifie si balou-portrait.jpg charge
     ============================================================ */

  function initPortraitFallback() {
    const img = $('.about-frame img');
    if (!img) return;
    // Si l'image est déjà en erreur (cache ou 404 instantané)
    if (img.complete && img.naturalWidth === 0) {
      img.remove();
      $('.about-frame')?.classList.add('no-img');
    }
  }

  /* ============================================================
     Init
     ============================================================ */

  const onReady = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  // Wrapper safe : si une init throw, on log et on continue les suivantes.
  const safe = (name, fn) => {
    try { fn(); }
    catch (err) { console.warn(`[Balou] init ${name} failed:`, err); }
  };

  onReady(() => {
    safe('nav',              initNav);
    safe('mobileMenu',       initMobileMenu);
    safe('heroVideo',        initHeroVideo);
    safe('portraitFallback', initPortraitFallback);
    safe('instagram',        loadInstagram);
    safe('lightbox',         initLightbox);
    safe('bookingForm',      initBookingForm);
    safe('scrollReveal',     initScrollReveal);
  });

})();
