# Sources SVG — logo Cheffe Kamano

Ce fichier contient le code source des trois SVG de l'identite. Il remplace les
fichiers `.svg` binaires : Claude Code doit **recreer les fichiers depuis ces blocs**,
ou mieux, poser les definitions directement en SVG inline dans la page.

Le logo n'est **jamais** un PNG et n'est **jamais** reconstruit en texte CSS.

---

## 1. Definitions a poser une seule fois dans la page

A placer juste apres l'ouverture de `<body>`, avant tout usage du logo. Ce bloc ne
dessine rien : il declare `#kmkK` et `#kmkM`, reutilisables partout par `<use>`.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <clipPath id="kmkCut" clipPathUnits="userSpaceOnUse">
    <rect x="-24" y="0" width="264" height="96"></rect>
  </clipPath>
  <g id="kmkK" fill="none" stroke="currentColor" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="1.5">
    <line x1="0" y1="0" x2="0" y2="96" stroke-width="5"></line>
    <line x1="216" y1="0" x2="216" y2="96" stroke-width="5"></line>
    <g clip-path="url(#kmkCut)" stroke-width="5.4">
      <line x1="38.4" y1="-3.2" x2="0" y2="48"></line>
      <line x1="0" y1="48" x2="38.4" y2="99.2"></line>
      <line x1="177.6" y1="-3.2" x2="216" y2="48"></line>
      <line x1="216" y1="48" x2="177.6" y2="99.2"></line>
    </g>
  </g>
  <g id="kmkM" fill="none" stroke="currentColor" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="1.5">
    <line x1="72" y1="0" x2="72" y2="96" stroke-width="5"></line>
    <line x1="144" y1="0" x2="144" y2="96" stroke-width="5"></line>
    <g clip-path="url(#kmkCut)">
      <polyline points="70.475,-3.2 108,46.83 145.525,-3.2" stroke-width="5.4"></polyline>
    </g>
  </g>
</defs></svg>
```

La couleur se pilote par `style="color:…"` sur chaque `<use>`, jamais par `fill`.

---

## 2. Monogramme seul

Pour l'en-tete sous 900 px et le favicon. `viewBox` inclut la zone de protection.

```html
<svg viewBox="-2.7 -5.9 221.4 107.8" height="32" role="img" aria-label="Cheffe Kamano">
  <use href="#kmkK" style="color:#1C1714"></use>
  <use href="#kmkM" style="color:#6E1F2A"></use>
</svg>
```

---

## 3. Lockup horizontal — en-tete, 150 px

Sans la ligne de service. C'est la version de l'en-tete collant, sur fond creme.

```html
<svg width="150" height="27.38" viewBox="-6 -6 526 96" role="img" aria-label="Cheffe Kamano, accueil">
  <use href="#kmkK" style="color:#1C1714"></use>
  <use href="#kmkM" style="color:#6E1F2A"></use>
  <line x1="258" y1="0" x2="258" y2="96" stroke="#1C1714" stroke-width="0.9" stroke-opacity=".4"></line>
  <text x="300" y="29.07" fill="#1C1714" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">CHEFFE</text>
  <text x="300" y="73.07" fill="#1C1714" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">KAMANO</text>
</svg>
```

---

## 4. Lockup complet — pied de page, 320 px

Avec la ligne de service, justifiee a la largeur du nom par `textLength`. Sur charbon,
donc en version couleur : K or, M bordeaux clair.

```html
<svg width="320" height="58.4" viewBox="-6 -6 526 96" role="img" aria-label="Cheffe Kamano, services de cuisine gastronomique">
  <use href="#kmkK" style="color:#A88A5A"></use>
  <use href="#kmkM" style="color:#8E2A36"></use>
  <line x1="258" y1="0" x2="258" y2="96" stroke="#EDE6DA" stroke-width="0.9" stroke-opacity=".4"></line>
  <text x="300" y="29.07" fill="#EDE6DA" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">CHEFFE</text>
  <text x="300" y="66" fill="#EDE6DA" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">KAMANO</text>
  <text x="300" y="88" fill="#A88A5A" textLength="205.59" lengthAdjust="spacing" style="font-family:'Quicksand',sans-serif; font-weight:500; font-size:10px">SERVICES DE CUISINE GASTRONOMIQUE</text>
</svg>
```

---

## 5. Version monochrome — logo pose sur une photographie

Seul cas ou le monogramme et le nom prennent la meme couleur. Blanc craie `#F2EFEA`,
jamais de blanc pur. C'est la version du logo dans le titre d'ouverture.

```html
<svg width="150" height="27.38" viewBox="-6 -6 526 96" role="img" aria-label="Cheffe Kamano, accueil">
  <use href="#kmkK" style="color:#F2EFEA"></use>
  <use href="#kmkM" style="color:#F2EFEA"></use>
  <line x1="258" y1="0" x2="258" y2="96" stroke="#F2EFEA" stroke-width="0.9" stroke-opacity=".4"></line>
  <text x="300" y="29.07" fill="#F2EFEA" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">CHEFFE</text>
  <text x="300" y="73.07" fill="#F2EFEA" style="font-family:'Poiret One',cursive; font-size:38px; letter-spacing:.14em">KAMANO</text>
</svg>
```

---

## 6. Motif de losanges

Bandeau de section et pied de page uniquement, sur charbon, opacite du trait sous 15 %.
Jamais derriere un paragraphe.

```html
<svg width="100%" height="100%" aria-hidden="true">
  <defs>
    <pattern id="kmkMaille" width="36" height="48" patternUnits="userSpaceOnUse" patternTransform="translate(6,24)">
      <rect x="0" y="0" width="36" height="48" fill="#1C1714"></rect>
      <g stroke="#A88A5A" stroke-width="0.45" stroke-opacity=".14" fill="none">
        <polygon points="2.5,24 18,3.5 33.5,24 18,44.5"></polygon>
        <polygon points="-15.5,0 0,-20.5 15.5,0 0,20.5"></polygon>
        <polygon points="20.5,0 36,-20.5 51.5,0 36,20.5"></polygon>
        <polygon points="-15.5,48 0,27.5 15.5,48 0,68.5"></polygon>
        <polygon points="20.5,48 36,27.5 51.5,48 36,68.5"></polygon>
      </g>
    </pattern>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#kmkMaille)"></rect>
</svg>
```

---

## Favicon

Monogramme or `#A88A5A` sur fond charbon `#1C1714`, sans le nom, en 32 px et 180 px.
A generer depuis le bloc 1 avec un `<rect>` de fond charbon en premier.
Le fichier doit exister : il est declare dans le HTML actuel mais absent du projet.

## Geometrie — a ne pas recalculer

Maille 36 x 48. Angle unique 53,13 degres. Epaisseur des fûts 5, des diagonales 5,4.
Zone de protection : une hauteur de losange, 16 px minimum autour du lockup.
Toute nouvelle declinaison se construit sur ces valeurs, sans les arrondir.
