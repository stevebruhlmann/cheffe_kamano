/* ======================================================================
   Cheffe Kamano — Script du site
   ====================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* Année dynamique dans le footer */
  document.querySelectorAll('.footer-annee')
    .forEach(el => el.textContent = new Date().getFullYear());

  // À venir : IntersectionObserver pour animer les .reveal au scroll.

});