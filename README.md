# Balou Tattoo — Portfolio

Site vitrine & booking de [Balou Tattoo](https://www.instagram.com/balou_tattoo.ink/) — tatoueur mandala, ornemental et grand format, Paris & Thaïlande.

## Stack

Site statique en HTML/CSS/JS vanilla, zéro dépendance, déployé sur Vercel.

- `index.html` — page principale
- `styles.css` — design system complet (variables, sections, responsive, reduced-motion)
- `script.js` — nav, feed Instagram (Behold.so), lightbox, formulaire booking, scroll reveal
- `favicon.svg` — mandala SVG
- `robots.txt` + `sitemap.xml` — SEO basique
- `hero.mp4` — vidéo hero optimisée (~2 Mo, 720×1280, 30fps, sans audio)
- `images/` — assets statiques (poster, og cover, portrait)
- `linktree.html` — page link-in-bio pour Instagram
- `devis.html` — générateur de devis standalone

## Développement

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

Aucun build, aucun watcher. Modifier un fichier, recharger la page.

## Déploiement

Le projet est connecté à Vercel (`.vercel/project.json`).

```bash
vercel --prod
```

Le domaine `baloutattoo.ink` pointe dessus.

## À configurer / remplacer

- [ ] **Formspree** — créer un compte sur [formspree.io](https://formspree.io), copier l'ID du formulaire, remplacer `VOTRE_ID_FORMSPREE` dans `index.html:598`. Tant que le placeholder y est, le formulaire ouvre automatiquement Instagram DM avec les infos pré-remplies.
- [ ] **Portrait Balou** — déposer `images/balou-portrait.jpg` (ratio 3:4, ~800×1066px). Fallback automatique avec la lettre "B" en serif doré si absent.
- [ ] **Témoignages réels** — remplacer les 3 placeholders dans `index.html` (section "Leurs histoires")
- [ ] **Pages légales** — créer `confidentialite.html` et `mentions-legales.html` (obligation RGPD)

## Assets présents

- `hero.mp4` — vidéo hero (Balou tatouant un mandala)
- `images/hero-poster.jpg` — frame statique pour fallback/loading
- `images/og-cover.jpg` — 1200×630 pour partages sociaux

## Structure des sections

1. **Hero** plein écran avec vidéo de fond
2. **Status strip** — indicateur "Actuellement à..." (à mettre à jour manuellement)
3. **Stats** — 3 chiffres clés (41K followers, 200+ pièces, 10 ans)
4. **Œuvres** — grille feed Instagram live via Behold.so, premier post 2×2
5. **Processus** — 5 étapes
6. **Témoignages** — 3 quotes
7. **Tarifs & Studios** — 4 fourchettes + Paris/Thaïlande
8. **À propos**
9. **FAQ** — 6 questions (native `<details>`)
10. **Booking** — formulaire enrichi avec RGPD

## Points techniques

- **Accessibilité** : skip link, `prefers-reduced-motion`, ARIA, focus-visible, fieldset/legend
- **SEO** : Schema.org `Person` + `LocalBusiness` + `FAQPage`, Open Graph, Twitter card, sitemap
- **Performance** : lazy loading images, `display=swap` fonts, preconnect, vidéo compressée
- **Conversion** : formulaire multi-champs (budget/taille/style/période), consent RGPD, fallback IG DM
