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

  /* ------------------------------------------------------------------
     Menu — section active (Lot 12). Ne pilote pas le scroll : les
     liens sont des ancres HTML natives, déjà fluides via
     scroll-behavior (CSS). Ici, on marque juste quelle entrée du menu
     correspond à la section actuellement lue.
     ------------------------------------------------------------------ */
  const ordreSections = ['histoire', 'specialites', 'services', 'galerie', 'temoignages', 'contact'];
  const sectionsMenu  = ordreSections
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (sectionsMenu.length) {
    const liensMenu = document.querySelectorAll('.entete__nav a, .entete__rideau-nav a');
    const visible   = {};

    const activerLien = (id) => {
      liensMenu.forEach(a => {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };

    const choisirActive = () => {
      /* La section active est la dernière de l'ordre de la page encore
         marquée visible — celle qu'on est en train de lire. */
      let actif = null;
      ordreSections.forEach(id => { if (visible[id]) actif = id; });
      if (actif) activerLien(actif);
    };

    const menuObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        visible[entry.target.id] = entry.isIntersecting;
      });
      choisirActive();
    }, {
      root:       null,
      /* Bande utile : sous la barre collante (80px), sur les 40% hauts
         de l'écran — une section "compte" dès que son début y entre. */
      rootMargin: '-80px 0px -60% 0px',
      threshold:  0
    });

    sectionsMenu.forEach(section => menuObserver.observe(section));
  }

    /* ------------------------------------------------------------------
     Rideau mobile — ouverture/fermeture via le hamburger (Lot 12).
     ------------------------------------------------------------------ */
  const burger = document.querySelector('.entete__burger');
  const rideau = document.getElementById('rideau');

  if (burger && rideau) {
    let scrollAvantOuverture = 0;

    const ouvrirRideau = () => {
      /* Fige <body> à sa position de scroll actuelle plutôt que
         overflow:hidden — cette dernière technique casse position:sticky
         sur .entete (elle recalcule la barre par rapport à <body>, qui
         ne bouge jamais, au lieu de la page qu'on vient de scroller). */
      scrollAvantOuverture = window.scrollY;
      const largeurScrollbar = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = 'fixed';
      document.body.style.top      = `-${scrollAvantOuverture}px`;
      document.body.style.left     = '0';
      document.body.style.right    = '0';
      if (largeurScrollbar > 0) document.body.style.paddingRight = largeurScrollbar + 'px';

      rideau.removeAttribute('inert');
      rideau.classList.add('is-ouvert');
      burger.setAttribute('aria-expanded', 'true');

      /* Focus sur la première entrée, une fois le mouvement entamé. */
      const premierLien = rideau.querySelector('a');
      if (premierLien) window.setTimeout(() => premierLien.focus({ preventScroll: true }), 60);
    };

    /* rendreFocus=false : utilisé après un clic sur une entrée, pour ne
       pas ramener le focus (et donc la vue) en haut de page alors que
       l'ancre vient de faire défiler ailleurs. */
    const fermerRideau = (rendreFocus = true) => {
      rideau.classList.remove('is-ouvert');
      rideau.setAttribute('inert', '');
      burger.setAttribute('aria-expanded', 'false');

      document.body.style.position     = '';
      document.body.style.top          = '';
      document.body.style.left         = '';
      document.body.style.right        = '';
      document.body.style.paddingRight = '';
      window.scrollTo({ top: scrollAvantOuverture, behavior: 'instant' });

      if (rendreFocus) burger.focus({ preventScroll: true });
    };

    burger.addEventListener('click', () => {
      const estOuvert = burger.getAttribute('aria-expanded') === 'true';
      if (estOuvert) fermerRideau(); else ouvrirRideau();
    });

    rideau.querySelectorAll('a').forEach(lien => {
      lien.addEventListener('click', () => fermerRideau(false));
    });

    document.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        fermerRideau();
      }
    });

    /* Si la fenêtre s'élargit au-dessus de 900px pendant que le rideau
       est ouvert, il disparaît via la media query — mais sans ça, le
       scroll de la page restait bloqué malgré tout. */
    const seuilBureau = window.matchMedia('(min-width: 900px)');
    seuilBureau.addEventListener('change', (evenement) => {
      if (evenement.matches && burger.getAttribute('aria-expanded') === 'true') {
        fermerRideau(false);
      }
    });

    /* inert gère nativement le blocage du focus et du clic pendant que
       le rideau est fermé — plus besoin de piéger Tab à la main. */
  }

  /* ------------------------------------------------------------------
     Galerie (Lot 13) — données. Pour ajouter une photo : dupliquer une
     ligne, déposer le fichier dans images/galerie/, renseigner la
     légende réelle, passer placeholder à false. Rien d'autre à toucher.
     ------------------------------------------------------------------ */
  const PHOTOS = [
    { categorie: "Dressage",  fichier: "dressage-01.jpg",  legende: "Légende à venir", placeholder: true },
    { categorie: "Dressage",  fichier: "dressage-02.jpg",  legende: "Légende à venir", placeholder: true },
    { categorie: "Dressage",  fichier: "dressage-03.jpg",  legende: "Légende à venir", placeholder: true },
    { categorie: "Réception", fichier: "reception-01.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Réception", fichier: "reception-02.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Réception", fichier: "reception-03.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Coulisses", fichier: "coulisses-01.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Coulisses", fichier: "coulisses-02.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Coulisses", fichier: "coulisses-03.jpg", legende: "Légende à venir", placeholder: true },
    { categorie: "Cours",     fichier: "cours-01.jpg",     legende: "Légende à venir", placeholder: true },
    { categorie: "Cours",     fichier: "cours-02.jpg",     legende: "Légende à venir", placeholder: true },
    { categorie: "Cours",     fichier: "cours-03.jpg",     legende: "Légende à venir", placeholder: true },
  ];

  /* ------------------------------------------------------------------
     Galerie (Lot 13) — rendu.
     ------------------------------------------------------------------ */
  const CATEGORIES = ["Dressage", "Réception", "Coulisses", "Cours"];
  let filtreActif  = "Tout";
  let indexOuvert  = -1;   /* -1 = visionneuse fermée ; utilisé en Passe D2 */

  const galerieFiltres = document.querySelector('.galerie__filtres');
  const galerieGrille  = document.querySelector('.galerie__grille');
  const galerieCompteur = document.querySelector('.galerie__compteur');

  if (galerieFiltres && galerieGrille) {

    const listeFiltree = () =>
      filtreActif === 'Tout' ? PHOTOS : PHOTOS.filter(p => p.categorie === filtreActif);

    const rendreFiltres = () => {
      /* Une catégorie n'apparaît que si elle a au moins une photo —
         règle de la charte : jamais de filtre qui mène à une grille vide. */
      const categoriesPresentes = CATEGORIES.filter(cat => PHOTOS.some(p => p.categorie === cat));
      const toutes = ['Tout', ...categoriesPresentes];

      galerieFiltres.innerHTML = toutes.map(cat => `
        <button type="button" class="galerie__filtre" data-categorie="${cat}" aria-pressed="${cat === filtreActif}">${cat}</button>
      `).join('');
    };

    const rendreCompteur = () => {
      if (!galerieCompteur) return;
      const n = listeFiltree().length;
      galerieCompteur.textContent = `${n} photographie${n > 1 ? 's' : ''}`;
    };

    const rendreGrille = () => {
      const photos = listeFiltree();
      galerieGrille.innerHTML = photos.map((photo, i) => `
        <figure class="galerie__item">
          <button type="button" class="galerie__cadre" data-index="${i}" aria-label="Agrandir : ${photo.legende}">
            ${photo.placeholder
              ? `<span class="galerie__cadre-nom">${photo.fichier}</span>`
              : `<img src="images/galerie/${photo.fichier}" alt="${photo.legende}"
                     loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">`}
          </button>
        </figure>
      `).join('');
    };

    const rafraichirGalerie = () => {
      rendreFiltres();
      rendreCompteur();
      rendreGrille();
    };

    galerieFiltres.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('.galerie__filtre');
      if (!bouton) return;
      filtreActif = bouton.dataset.categorie;
      indexOuvert = -1;   /* évite d'ouvrir la mauvaise photo si la visionneuse rouvre ensuite */
      rafraichirGalerie();
    });

    rafraichirGalerie();   /* premier rendu, filtre "Tout" */

    /* ------------------------------------------------------------------
       Visionneuse — ouverture, fermeture, navigation précédent/suivant.
       ------------------------------------------------------------------ */
    const visionneuse   = document.getElementById('visionneuse');
    const vImage        = visionneuse.querySelector('.galerie__visionneuse-image');
    const vCategorie     = visionneuse.querySelector('.galerie__visionneuse-categorie');
    const vLegende       = visionneuse.querySelector('.galerie__visionneuse-legende');
    const vCompteur      = visionneuse.querySelector('.galerie__visionneuse-compteur');
    const boutonFermer   = visionneuse.querySelector('.galerie__visionneuse-fermer');
    const boutonPrecedent = visionneuse.querySelector('.galerie__visionneuse-precedent');
    const boutonSuivant  = visionneuse.querySelector('.galerie__visionneuse-suivant');
    let vignetteOrigine  = null;   /* pour rendre le focus au bon endroit à la fermeture */
    let scrollAvantVisionneuse = 0;

    const afficherPhoto = () => {
      const photos = listeFiltree();
      const photo  = photos[indexOuvert];
      if (!photo) return;

      vImage.innerHTML = photo.placeholder
        ? ''   /* le fond hachuré de .galerie__visionneuse-image suffit */
        : `<img src="images/galerie/${photo.fichier}" alt="${photo.legende}">`;

      vCategorie.textContent = photo.categorie;
      vLegende.textContent   = photo.legende;
      vCompteur.textContent  = `${indexOuvert + 1} sur ${photos.length}`;
    };

    const ouvrirVisionneuse = (i, origine) => {
      indexOuvert     = i;
      vignetteOrigine = origine;
      afficherPhoto();

      /* Même technique que le rideau (Lot 12) : position:fixed plutôt
         qu'overflow:hidden, qui casse position:sticky sur la barre. */
      scrollAvantVisionneuse = window.scrollY;
      const largeurScrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.position = 'fixed';
      document.body.style.top      = `-${scrollAvantVisionneuse}px`;
      document.body.style.left     = '0';
      document.body.style.right    = '0';
      if (largeurScrollbar > 0) document.body.style.paddingRight = largeurScrollbar + 'px';

      visionneuse.removeAttribute('inert');
      visionneuse.classList.add('is-ouvert');
      boutonFermer.focus({ preventScroll: true });
    };

    const fermerVisionneuse = () => {
      visionneuse.classList.remove('is-ouvert');
      visionneuse.setAttribute('inert', '');
      indexOuvert = -1;

      document.body.style.position     = '';
      document.body.style.top          = '';
      document.body.style.left         = '';
      document.body.style.right        = '';
      document.body.style.paddingRight = '';
      window.scrollTo({ top: scrollAvantVisionneuse, behavior: 'instant' });

      if (vignetteOrigine) vignetteOrigine.focus({ preventScroll: true });
    };

    const decalerPhoto = (delta) => {
      const n = listeFiltree().length;
      indexOuvert = (indexOuvert + delta + n) % n;   /* circulaire */
      afficherPhoto();
    };

    galerieGrille.addEventListener('click', (evenement) => {
      const cadre = evenement.target.closest('.galerie__cadre');
      if (!cadre) return;
      ouvrirVisionneuse(Number(cadre.dataset.index), cadre);
    });

    boutonFermer.addEventListener('click', fermerVisionneuse);
    boutonPrecedent.addEventListener('click', () => decalerPhoto(-1));
    boutonSuivant.addEventListener('click', () => decalerPhoto(1));

    /* Clic sur le voile ferme ; clic sur l'image ou les contrôles ne
       ferme pas (evenement.target === visionneuse exclut tout enfant). */
    visionneuse.addEventListener('click', (evenement) => {
      if (evenement.target === visionneuse) fermerVisionneuse();
    });

    /* Clavier — actif seulement visionneuse ouverte. inert (posé sur
       #visionneuse) gère déjà le blocage du focus au repos, donc pas
       besoin d'un piège de Tab manuel ici non plus. */
    document.addEventListener('keydown', (evenement) => {
      if (!visionneuse.classList.contains('is-ouvert')) return;

      if (evenement.key === 'Escape')     fermerVisionneuse();
      if (evenement.key === 'ArrowLeft')  decalerPhoto(-1);
      if (evenement.key === 'ArrowRight') decalerPhoto(1);

      /* Piège du focus — inert ne bloque que la visionneuse FERMÉE
         (empêche d'y entrer), pas l'inverse. Tant qu'elle est ouverte,
         Tab ne doit jamais en sortir vers le reste de la page cachée
         derrière. */
      if (evenement.key === 'Tab') {
        const focusables = visionneuse.querySelectorAll('button');
        if (!focusables.length) return;

        const premier = focusables[0];
        const dernier  = focusables[focusables.length - 1];

        if (evenement.shiftKey && document.activeElement === premier) {
          evenement.preventDefault();
          dernier.focus();
        } else if (!evenement.shiftKey && document.activeElement === dernier) {
          evenement.preventDefault();
          premier.focus();
        }
      }
    });

    /* Balayage mobile — seuil de 40px pour ignorer les scrolls verticaux
       involontaires interprétés comme un balayage. */
    let xDepart = null;
    visionneuse.addEventListener('touchstart', (evenement) => {
      xDepart = evenement.touches[0].clientX;
    }, { passive: true });

    visionneuse.addEventListener('touchend', (evenement) => {
      if (xDepart === null) return;
      const delta = evenement.changedTouches[0].clientX - xDepart;
      if (Math.abs(delta) > 40) decalerPhoto(delta > 0 ? -1 : 1);
      xDepart = null;
    }, { passive: true });
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

    const feu         = seg(p, 0.04, 0.34);
    const sortieHero  = seg(p, 0.10, 0.30);
    const aplat       = seg(p, 0.38, 0.58);
    const deviseEntree = seg(p, 0.46, 0.60);   /* apparition */
    const deviseSortie = seg(p, 0.86, 1.00);   /* remonte et sort par le haut,
                                                   se termine pile à p=1 —
                                                   c'est-à-dire exactement quand
                                                   le verrouillage se termine et
                                                   que "Mon histoire" commence
                                                   à arriver. Jamais recouverte :
                                                   déjà partie avant. */

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
    if (el.devise) {
      el.devise.style.opacity   = String(deviseEntree * (1 - deviseSortie));
      el.devise.style.transform = `translateY(calc(-50% - ${(deviseSortie * 70).toFixed(0)}vh))`;
    }
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