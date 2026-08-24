<?php
// =========================================================================
// Session : sert à faire transiter le résultat (succès/erreur) et les
// valeurs saisies depuis traitement.php jusqu'ici, après redirection.
// =========================================================================
session_start();

// On lit les infos laissées par traitement.php, puis on les efface aussitôt
// (message "flash" : ne doit s'afficher qu'une seule fois).
$envoiReussi       = $_SESSION['avis_succes']      ?? false;
$messageErreur     = $_SESSION['avis_erreur']      ?? null;
$ancienNom         = $_SESSION['avis_nom']         ?? '';
$ancienTemoignage  = $_SESSION['avis_temoignage']  ?? '';

unset($_SESSION['avis_succes'], $_SESSION['avis_erreur'], $_SESSION['avis_nom'], $_SESSION['avis_temoignage']);
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
          Vous avez fait appel à la Cheffe Kamano.<br>
          Partagez votre expérience en quelques mots.
        </p>

        <div class="avis-message-zone">
          <?php if ($messageErreur): ?>
            <div class="avis-message avis-message--erreur">
              <?php echo htmlspecialchars($messageErreur); ?>
            </div>
          <?php endif; ?>
        </div>

        <form class="avis-formulaire" action="traitement.php" method="POST" novalidate>

          <!-- Champ 1 : prénom -->
          <div class="avis-champ">
            <label for="nom">Votre prénom</label>
            <input type="text" id="nom" name="nom" value="<?php echo htmlspecialchars($ancienNom); ?>" required>
          </div>

          <!-- Champ 2 : témoignage -->
          <div class="avis-champ">
            <label for="temoignage">Votre témoignage</label>
            <p class="avis-champ-aide">Quelques mots suffisent — l'essentiel, c'est votre ressenti.</p>
            <textarea id="temoignage" name="temoignage" maxlength="250" rows="4" required><?php echo htmlspecialchars($ancienTemoignage); ?></textarea>
            <p class="avis-champ-compteur"><span id="compteur-valeur"><?php echo strlen($ancienTemoignage); ?></span> / 250</p>
          </div>

          <!-- Champ 3 : consentement (D2) -->
          <div class="avis-champ avis-champ--case">
            <input type="checkbox" id="consentement" name="consentement" required>
            <label for="consentement">
              J'autorise Cheffe Kamano à publier mon témoignage et mon prénom sur son site internet.
              Je peux demander son retrait à tout moment en écrivant à
              <a href="mailto:temoignages@cheffekamano.ch">temoignages@cheffekamano.ch</a>.
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
            <span class="avis-bouton__texte">Envoyer mon témoignage</span>
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

    // Si on revient sur la page après une erreur, focus le premier champ vide
    const champNom          = document.getElementById('nom');
    const champConsentement = document.getElementById('consentement');
    if (champNom) {
      if (champNom.value.trim() === '') {
        champNom.focus();
      } else if (champTemoignage.value.trim() === '') {
        champTemoignage.focus();
      } else if (champConsentement && !champConsentement.checked) {
        champConsentement.focus();
      }
    }
  </script>

</body>
</html>