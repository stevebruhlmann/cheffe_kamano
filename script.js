/* La position de scroll au rechargement suit le standard du navigateur —
   on n'y touche pas. On s'assure seulement que la chorégraphie (intro,
   en-tête) recalcule son état après une restauration depuis le cache
   arrière/avant (bfcache), cas où aucun script ne se réexécute et où seul
   l'événement "pageshow" en informe la page. */
window.addEventListener('pageshow', () => {
  window.dispatchEvent(new Event('scroll'));
});

/* ======================================================================
   Cheffe Kamano — Script du site
   ====================================================================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------------------
     Année dynamique dans le footer
     ------------------------------------------------------------------ */
  document.querySelectorAll('.footer-annee')
    .forEach(el => el.textContent = new Date().getFullYear());

  /* ------------------------------------------------------------------
     Reveal au scroll — IntersectionObserver
     Ajoute .is-visible sur chaque .reveal quand il entre dans le viewport.
     threshold 0.12 : l'animation se déclenche quand 12 % de l'élément
     est visible — assez tôt pour paraître fluide sans partir trop tôt.
     ------------------------------------------------------------------ */
  const observerOptions = {
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); /* déclenche une seule fois */
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal')
    .forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     Spécialités — scrollytelling image sticky + liste de plats (P7)
     rootMargin "-45% 0px -45% 0px" : ne déclenche que quand un plat
     traverse la bande centrale de l'écran (±10% autour du milieu).
     Contrairement à .reveal, on NE unobserve PAS : l'effet doit se
     redéclencher dans les deux sens du scroll (haut ↔ bas).
     ------------------------------------------------------------------ */
  const specialitesItems  = document.querySelectorAll('.specialites__plats li[data-plat]');
  const specialitesImages = document.querySelectorAll('.specialites__image[data-plat]');

  if (specialitesItems.length && specialitesImages.length) {

    const activatePlat = (platId) => {
      specialitesItems.forEach(li => li.classList.toggle('is-active', li.dataset.plat === platId));
      specialitesImages.forEach(img => img.classList.toggle('is-active', img.dataset.plat === platId));
    };

    const specialitesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activatePlat(entry.target.dataset.plat);
        }
      });
    }, {
      root:       null,
      rootMargin: '-45% 0px -45% 0px',
      threshold:  0
    });

    specialitesItems.forEach(li => specialitesObserver.observe(li));
  }

  /* ------------------------------------------------------------------
     Chorégraphie d'introduction — pilotée par la progression du scroll
     Dans la scène .intro (400vh), on calcule une progression p (0 → 1) :
       phase 1 (0    → 0.3) : Hero s'efface + crossfade vers la couche N&B
       phase 2 (0.25 → 0.5) : Devise apparaît, puis pause jusqu'au recouvrement
     Calculs throttlés via requestAnimationFrame pour rester fluide.
     ------------------------------------------------------------------ */
  const intro       = document.querySelector('.intro');
  const introBgNb   = document.querySelector('.intro__bg--nb');
  const introVoile  = document.querySelector('.intro__voile');
  const introHero   = document.querySelector('.intro__hero');
  const introDevise = document.querySelector('.intro__devise');

  const motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (intro && introBgNb && introVoile && introHero && introDevise) {

    if (motionOff) {
      /* Accessibilité : état final direct, la mise en forme est dans le CSS */
    } else {
      const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
      /* Segment normalisé : 0 avant a, 1 après b, progression linéaire entre */
      const seg   = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
      let ticking = false;

      const updateIntro = () => {
        /* Distance utile = hauteur de la scène - 1 écran (durée de l'épinglage) */
        const scrollable = intro.offsetHeight - window.innerHeight;
        /* Défilement DANS la scène : 0 en haut, croît vers le bas */
        const scrolled   = -intro.getBoundingClientRect().top;
        const p          = clamp(scrolled / scrollable, 0, 1);

        /* Seuils repris de la référence exécutable, à ne pas redeviner.
           Temps 2 — Effacement  : le hero s'efface        (0,32 → 0,56)
           Temps 3 — Embrasement : couleur, voile, devise  (0,48 → 0,76)
           Les deux se chevauchent volontairement entre 0,48 et 0,56. */
        const sortieHero   = seg(p, 0.32, 0.56);
        const entreeDevise = seg(p, 0.48, 0.76);

        introHero.style.opacity   = String(1 - sortieHero);
        introBgNb.style.opacity   = String(1 - entreeDevise);   /* le N&B s'efface, la couleur paraît */
        introVoile.style.opacity  = String(0.58 + 0.06 * entreeDevise);
        introDevise.style.opacity = String(entreeDevise);

        ticking = false;
      };

      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateIntro);
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      updateIntro();  /* fixe l'état correct dès le chargement */
    }
  }

  /* ------------------------------------------------------------------
     En-tête collant — paraît sur les 100 derniers pixels du recouvrement.
     Piloté sur la position réelle de .histoire plutôt que sur des seuils
     en pixels : reste juste si la hauteur de la scène change.
     ------------------------------------------------------------------ */
  const entete   = document.querySelector('.entete');
  const histoire = document.querySelector('.histoire');

  if (entete && histoire && !motionOff) {
    const clampBarre = (v) => Math.min(Math.max(v, 0), 1);
    let tickingBarre = false;

    const updateEntete = () => {
      /* Distance restante avant que .histoire atteigne le haut de l'écran.
         100 → barre absente ; 0 → barre pleinement opaque. */
      const restant = histoire.getBoundingClientRect().top;
      const entree  = clampBarre((100 - restant) / 100);

      entete.style.opacity       = String(entree);
      entete.style.pointerEvents = entree >= 0.99 ? 'auto' : 'none';

      tickingBarre = false;
    };

    const onScrollBarre = () => {
      if (!tickingBarre) {
        window.requestAnimationFrame(updateEntete);
        tickingBarre = true;
      }
    };

    window.addEventListener('scroll', onScrollBarre, { passive: true });
    window.addEventListener('resize', onScrollBarre, { passive: true });
    updateEntete();   /* fixe l'état correct dès le chargement */
  }

});