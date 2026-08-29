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
     Chorégraphie d'introduction — Lot 10, Claude Design. Le pilotage
     (régime auto + régime scroll) vit dans une IIFE séparée, tout en bas
     de ce fichier. motionOff reste déclaré ici : le bloc En-tête collant,
     juste après, en dépend toujours.
     ------------------------------------------------------------------ */
  const motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ==========================================================================
   SCÈNE D'INTRODUCTION — Lot 10, Claude Design.
   Régime A : automatique, 3.4s, défilement verrouillé (tracé du monogramme).
   Régime B : piloté par le scroll (couleur, maille, devise, recouvrement).
   IIFE indépendante — script.js est chargé en defer, le DOM est déjà prêt.
   ========================================================================== */
(function () {
  const scene = document.querySelector('.kmk-scene');
  if (!scene) return;
  const intro = document.querySelector('.kmk-intro');
  const $ = (n) => scene.querySelector('[data-r="' + n + '"]');
  const el = {
    photoNb: $('photoNb'), photoCoul: $('photoCoul'), voile: $('voile'),
    scrim: $('scrim'), maille: $('maille'), traceG: $('traceG'), mots: $('mots'),
    surtitre: $('surtitre'), cta: $('cta'), heroBloc: $('heroBloc'),
    invite: $('invite'), aplat: $('aplat'), devise: $('devise')
  };

  const seg = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));
  const op  = (n, v) => { if (el[n]) el[n].style.opacity = String(v); };

  /* Tracé du monogramme : chaque trait est un pointillé qu'on déroule */
  let traits = null;
  function preparerTraits() {
    if (!el.traceG) return;
    traits = Array.prototype.map.call(
      el.traceG.querySelectorAll('line, polyline'),
      function (n) {
        const L = n.getTotalLength();
        n.style.strokeDasharray = L;
        n.style.strokeDashoffset = L;
        return { n: n, L: L };
      });
  }

  /* Rendu d'un état complet.
     a : avancement du régime automatique (0 → 1)
     p : avancement du défilement (0 → 1) */
  function rendre(a, p) {
    const arrivee = seg(a, 0.00, 0.46);
    const dessin  = seg(a, 0.40, 0.80);
    const mots    = seg(a, 0.74, 0.92);
    const texte   = seg(a, 0.82, 1.00);

    const feu        = seg(p, 0.04, 0.34);
    const sortieHero = seg(p, 0.10, 0.30);
    const aplat      = seg(p, 0.38, 0.58);
    const devise     = seg(p, 0.46, 0.68);

    if (!traits || !traits.length || !traits[0].n.isConnected) preparerTraits();
    if (traits) {
      const n = traits.length;
      traits.forEach(function (t, i) {
        const d = (i / n) * 0.70, f = d + 0.30;
        const q = Math.max(0, Math.min(1, (dessin - d) / (f - d)));
        t.n.style.strokeDashoffset = t.L * (1 - q);
      });
    }

    op('photoNb', arrivee);
    op('photoCoul', feu);
    op('voile', 1 - arrivee);
    /* scrim retiré du pilotage JS — vignettage fixe en CSS, jamais animé */
    /* Grillage : apparaît déjà pendant le tracé du monogramme (phase N&B),
       reste visible ensuite pendant la phase couleur au scroll. */
    op('maille', 0.16 * Math.max(seg(a, 0.40, 0.80), seg(p, 0.06, 0.40)));
    op('mots', mots);
    op('surtitre', texte);
    op('cta', texte);
    op('heroBloc', 1 - sortieHero);
    op('aplat', 0);     /* désactivé temporairement — assombrissement uniforme jugé gênant */
    op('devise', devise);
  }

  /* Régime A : automatique, défilement verrouillé */
  let autoFini = false, raf = 0;
  function jouerAuto() {
    cancelAnimationFrame(raf);
    autoFini = false;
    window.scrollTo(0, 0);
    document.documentElement.classList.add('kmk-verrou');
    const duree = 3400, t0 = performance.now();
    (function pas(t) {
      const q = Math.min(1, (t - t0) / duree);
      const e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; /* easeInOutQuad */
      rendre(e, 0);
      if (q < 1) raf = requestAnimationFrame(pas);
      else {
        autoFini = true;
        document.documentElement.classList.remove('kmk-verrou');
        if (el.invite) el.invite.style.opacity = '1';
      }
    })(performance.now());
  }

  /* Régime B : piloté par le défilement */
  function auDefilement() {
    if (!autoFini) return;
    const course = intro.offsetHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, window.scrollY / course));
    if (el.invite) el.invite.style.opacity = String(Math.max(0, 1 - p * 12));
    rendre(1, p);
  }

  /* Ajuste la taille de la devise pour qu'elle tienne toujours sur une
     seule ligne, sans jamais dépasser 96px (plafond desktop). */
  function ajusterDevise() {
    const p = el.devise ? el.devise.querySelector('p') : null;
    if (!p) return;
    /* .kmk-devise est positionné via left/right (pas de padding) :
       clientWidth correspond déjà exactement à l'espace disponible. */
    const disponible = el.devise.clientWidth;
    let taille = 96;
    p.style.fontSize = taille + 'px';
    while (p.scrollWidth > disponible && taille > 16) {
      taille -= 1;
      p.style.fontSize = taille + 'px';
    }
  }

  /* Démarrage */
  preparerTraits();
  ajusterDevise();
  rendre(0, 0);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    autoFini = true;
    rendre(1, 0);   /* état final de l'ouverture, sans animation */
  } else {
    /* les polices d'abord : le lockup ne doit pas se tracer avant que Poiret One soit prête */
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(jouerAuto);
  }

  window.addEventListener('scroll', auDefilement, { passive: true });
  window.addEventListener('resize', function () { preparerTraits(); ajusterDevise(); auDefilement(); });
})();