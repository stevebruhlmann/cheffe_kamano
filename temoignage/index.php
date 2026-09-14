<?php
// =========================================================================
// Session : sert à faire transiter le résultat (succès/erreur) et les
// valeurs saisies depuis traitement.php jusqu'ici, après redirection.
// =========================================================================
session_start();

// On lit les infos laissées par traitement.php, puis on les efface aussitôt
// (message "flash" : ne doit s'afficher qu'une seule fois).
$envoiReussi      = $_SESSION['avis_succes']      ?? false;
$messageErreur    = $_SESSION['avis_erreur']      ?? null;
$ancienNom        = $_SESSION['avis_nom']         ?? '';
$ancienNomFamille = $_SESSION['avis_nom_famille'] ?? '';
$ancienEstSociete = $_SESSION['avis_est_societe'] ?? false;
$ancienNomSociete = $_SESSION['avis_nom_societe'] ?? '';
$ancienVille      = $_SESSION['avis_ville']       ?? '';
$ancienPrestation = $_SESSION['avis_prestation']  ?? '';
$ancienTemoignage = $_SESSION['avis_temoignage']  ?? '';

unset(
    $_SESSION['avis_succes'],
    $_SESSION['avis_erreur'],
    $_SESSION['avis_nom'],
    $_SESSION['avis_nom_famille'],
    $_SESSION['avis_est_societe'],
    $_SESSION['avis_nom_societe'],
    $_SESSION['avis_ville'],
    $_SESSION['avis_prestation'],
    $_SESSION['avis_temoignage']
);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Page volontairement non indexée et non liée depuis le site (D5) -->
  <meta name="robots" content="noindex, nofollow">

  <title>Laissez votre avis — Cheffe Kamano</title>

  <!-- Favicon (chemin remonté d'un niveau, on est dans /temoignage/) -->
  <link rel="icon" href="../favicon.ico">

  <!-- Mêmes polices que le site principal -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poiret+One&family=Quicksand:wght@300&display=swap" rel="stylesheet">

  <!-- Feuille de style du site (chemin remonté d'un niveau) -->
  <link rel="stylesheet" href="../style.css">
</head>
<body>

  <main class="avis-page">

    <div class="avis-conteneur">

      <h1 class="avis-titre">Votre avis compte</h1>

      <?php if ($envoiReussi): ?>

        <!-- Succès : le formulaire disparaît, remplacé par le remerciement -->
        <div class="avis-message avis-message--succes">
          <p>
            Merci infiniment pour votre témoignage !<br>
            Il sera lu avec attention, puis mis en ligne prochainement.
          </p>
          <p class="avis-signature">Marceline<br>Cheffe Kamano</p>
        </div>

        <a href="../index.html" class="avis-retour">Découvrir le site de Cheffe Kamano →</a>

      <?php else: ?>

        <p class="avis-intro">
          Vous avez par le passé fait appel à la Cheffe Kamano.<br>
          Partagez votre expérience en quelques mots.
        </p>

        <?php if ($messageErreur): ?>
          <div class="avis-message-zone">
            <div class="avis-message avis-message--erreur">
              <?php echo htmlspecialchars($messageErreur); ?>
            </div>
          </div>
        <?php endif; ?>

        <form class="avis-formulaire" action="traitement.php" method="POST" novalidate>

          <!-- Radio : particulier ou société (bascule les 2 blocs ci-dessous) -->
          <fieldset class="avis-champ avis-champ--radio">
            <legend>Vous répondez...</legend>
            <div class="avis-choix-radio">
              <label class="avis-radio-option">
                <input type="radio" name="type_reponse" value="particulier" <?php echo !$ancienEstSociete ? 'checked' : ''; ?>>
                ...en tant que particulier(s)
              </label>
              <label class="avis-radio-option">
                <input type="radio" name="type_reponse" value="societe" <?php echo $ancienEstSociete ? 'checked' : ''; ?>>
                ...au nom d'une société
              </label>
            </div>
          </fieldset>

          <!-- Bloc particulier : prénom(s) + nom de famille -->
          <div id="bloc-particulier">
            <div class="avis-champ">
              <label for="prenom">Prénom(s)</label>
              <input type="text" id="prenom" name="prenom" value="<?php echo htmlspecialchars($ancienNom); ?>">
            </div>

            <div class="avis-champ">
              <label for="nom_famille">
                <span>Nom</span>
                <span class="avis-champ-aide">(seule la première lettre du nom sera affichée -> ex. « B. »)</span>
              </label>

              <input type="text" id="nom_famille" name="nom_famille" value="<?php echo htmlspecialchars($ancienNomFamille); ?>">
            </div>
          </div>

          <!-- Bloc société : nom de la société (masqué par défaut) -->
          <div id="bloc-societe" hidden>
            <div class="avis-champ">
              <label for="nom_societe">Nom de la société</label>
              <input type="text" id="nom_societe" name="nom_societe" value="<?php echo htmlspecialchars($ancienNomSociete); ?>">
            </div>
          </div>

          <!-- Champ : ville -->
          <div class="avis-champ">
            <label for="ville">Ville</label>
            <input type="text" id="ville" name="ville" value="<?php echo htmlspecialchars($ancienVille); ?>" required>
          </div>

          <!-- Champ : type de prestation -->
          <!-- Liste NON DÉFINITIVE — à mettre à jour ici si l'offre de Marceline évolue -->
          <div class="avis-champ">
            <label for="prestation">Prestation commandée</label>
            <select id="prestation" name="prestation" required>
              <option value="" disabled <?php echo $ancienPrestation === '' ? 'selected' : ''; ?>>Choisissez...</option>
              <option value="Cheffe à domicile" <?php echo $ancienPrestation === 'Cheffe à domicile' ? 'selected' : ''; ?>>Cheffe à domicile</option>
              <option value="Traiteur" <?php echo $ancienPrestation === 'Traiteur' ? 'selected' : ''; ?>>Traiteur</option>
              <option value="Cours de cuisine" <?php echo $ancienPrestation === 'Cours de cuisine' ? 'selected' : ''; ?>>Cours de cuisine</option>
            </select>
          </div>

          <!-- Champ : témoignage -->
          <div class="avis-champ">
            <label for="temoignage">
              <span>Votre témoignage</span>
              <span class="avis-champ-aide">(quelques mots suffisent, l'essentiel est votre ressenti)</span>
            </label>

            <textarea id="temoignage" name="temoignage" maxlength="250" rows="4" required><?php echo htmlspecialchars($ancienTemoignage); ?></textarea>
            <p class="avis-champ-compteur"><span id="compteur-valeur"><?php echo strlen($ancienTemoignage); ?></span> / 250</p>
          </div>

          <!-- Champ : consentement (D2) -->
          <div class="avis-champ avis-champ--case avis-champ--case-secondaire">
            <input type="checkbox" id="consentement" name="consentement" required>
            <label for="consentement">
              J'autorise Cheffe Kamano à publier mon témoignage et mon prénom sur son site internet.
              Je peux demander son retrait à tout moment en écrivant à
              <a href="mailto:contact@cheffekamano.ch">contact@cheffekamano.ch</a>.
            </label>
          </div>

          <!-- Pièges anti-spam (D4) — invisibles pour un humain -->
          <div class="site_web-enveloppe">
            <label for="site_web">Site web</label>
            <input type="text" id="site_web" name="site_web" autocomplete="off" tabindex="-1">
          </div>
          <input type="text" name="reference_interne" value="" autocomplete="off" tabindex="-1" hidden>

          <!-- Horodatage d'affichage, pour le contrôle du temps (D4) -->
          <input type="hidden" name="horodatage" value="<?php echo time(); ?>">

          <button type="submit" class="avis-bouton" id="bouton-envoi" disabled>
            Envoyer mon témoignage
          </button>

        </form>

      <?php endif; ?>

    </div>

  </main>

  <script>
    // Compteur en direct pour le champ témoignage (limite 250 caractères)
    const champTemoignage = document.getElementById('temoignage');
    const compteurValeur  = document.getElementById('compteur-valeur');

    champTemoignage.addEventListener('input', () => {
      compteurValeur.textContent = champTemoignage.value.length;
    });

    // Bouton désactivé 3,5 s après le chargement — laisse une marge par
    // rapport aux 3 s vérifiées côté serveur (D4), pour éviter qu'un envoi
    // limite arrive une fraction de seconde trop tôt côté PHP.
    const boutonEnvoi = document.getElementById('bouton-envoi');
    setTimeout(() => {
      boutonEnvoi.disabled = false;
    }, 3500);

    // Bascule particulier / société : affiche le bon jeu de champs,
    // et ajuste les champs obligatoires en conséquence.
    const radiosTypeReponse = document.querySelectorAll('input[name="type_reponse"]');
    const blocParticulier   = document.getElementById('bloc-particulier');
    const blocSociete       = document.getElementById('bloc-societe');
    const champPrenom       = document.getElementById('prenom');
    const champNomFamille   = document.getElementById('nom_famille');
    const champNomSociete   = document.getElementById('nom_societe');

    function estModeSociete() {
      return document.querySelector('input[name="type_reponse"]:checked').value === 'societe';
    }

    function basculerModeSociete() {
      const estSociete = estModeSociete();
      blocParticulier.hidden = estSociete;
      blocSociete.hidden     = !estSociete;
      champPrenom.required     = !estSociete;
      champNomFamille.required = !estSociete;
      champNomSociete.required = estSociete;
    }

    radiosTypeReponse.forEach(radio => radio.addEventListener('change', basculerModeSociete));
    basculerModeSociete(); // état initial au chargement

    // Si on revient sur la page après une erreur, focus le premier champ pertinent
    const champConsentement = document.getElementById('consentement');
    if (!estModeSociete() && champPrenom.value.trim() === '') {
      champPrenom.focus();
    } else if (champTemoignage.value.trim() === '') {
      champTemoignage.focus();
    } else if (champConsentement && !champConsentement.checked) {
      champConsentement.focus();
    }
  </script>

</body>
</html>