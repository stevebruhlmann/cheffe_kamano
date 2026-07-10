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
     Chorégraphie d'introduction — pilotée par la progression du scroll
     Dans la scène .intro (400vh), on calcule une progression p (0 → 1) :
       phase 1 (0    → 0.3) : Hero s'efface + crossfade vers la couche N&B
       phase 2 (0.25 → 0.5) : Devise apparaît, puis pause jusqu'au recouvrement
     Calculs throttlés via requestAnimationFrame pour rester fluide.
     ------------------------------------------------------------------ */
  const intro       = document.querySelector('.intro');
  const introBgNb   = document.querySelector('.intro__bg--nb');
  const introHero   = document.querySelector('.intro__hero');
  const introDevise = document.querySelector('.intro__devise');

  const motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (intro && introBgNb && introHero && introDevise) {

    if (motionOff) {
      /* Accessibilité : pas d'anim au scroll → on montre la Devise, état statique */
      introDevise.style.opacity = '1';
    } else {
      const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
      let ticking = false;

      const updateIntro = () => {
        /* Distance utile = hauteur de la scène - 1 écran (durée de l'épinglage) */
        const scrollable = intro.offsetHeight - window.innerHeight;
        /* Défilement DANS la scène : 0 en haut, croît vers le bas */
        const scrolled   = -intro.getBoundingClientRect().top;
        const p          = clamp(scrolled / scrollable, 0, 1);

        /* Phase 1 — Hero fond + crossfade N&B, synchronisés (0 → 0.3).
           La couche N&B (pré-calculée au chargement) monte en opacity pendant
           que le Hero s'efface → aucun recalcul de filtre à chaque frame. */
        const p1 = clamp(p / 0.3, 0, 1);
        introHero.style.opacity  = String(1 - p1);
        introBgNb.style.opacity  = String(p1);        /* crossfade vers la couche N&B */
        

        /* Phase 2 — Devise en fondu (0.25 → 0.5), puis PAUSE jusqu'au recouvrement */
        const p2 = clamp((p - 0.25) / 0.25, 0, 1);
        introDevise.style.opacity = String(p2);

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

});