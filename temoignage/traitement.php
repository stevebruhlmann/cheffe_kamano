<?php
// =========================================================================
// Traitement du formulaire de témoignage.
// Ne fait AUCUN affichage : vérifie, envoie l'e-mail, puis redirige
// toujours vers index.php (D3 — tout se passe sur la même page).
// =========================================================================
session_start();

// Garde-fou : ce fichier ne doit jamais être ouvert directement dans un
// navigateur, seulement recevoir les données du formulaire (D5).
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

// -------------------------------------------------------------------------
// Anti-spam (D4) — silencieux : un robot ne doit rien remarquer d'anormal.
// -------------------------------------------------------------------------

// Piège 1 (masqué par CSS) et piège 2 (hidden) : doivent revenir vides.
$piege1 = trim($_POST['site_web'] ?? '');
$piege2 = trim($_POST['reference_interne'] ?? '');

// Contrôle du temps : moins de 3 secondes entre l'affichage et l'envoi = robot.
$horodatage       = (int) ($_POST['horodatage'] ?? 0);
$tempsEcoule      = time() - $horodatage;

$nom        = trim($_POST['nom']        ?? '');
$temoignage = trim($_POST['temoignage'] ?? '');

if ($piege1 !== '' || $piege2 !== '' || $tempsEcoule < 3) {
    // Silence total pour un robot : pas de message, pas d'e-mail envoyé.
    // On garde quand même le texte tapé en session — confort de test uniquement,
    // ça ne change rien à la protection (un robot ne revient jamais lire la page).
    $_SESSION['avis_nom']       = $nom ?? '';
    $_SESSION['avis_temoignage'] = $temoignage ?? '';
    header('Location: index.php');
    exit;
}

// -------------------------------------------------------------------------
// Récupération et validation des champs réels
// -------------------------------------------------------------------------

$nom        = trim($_POST['nom']        ?? '');
$temoignage = trim($_POST['temoignage'] ?? '');
$consentement = isset($_POST['consentement']);

$erreur = null;

if ($nom === '' || $temoignage === '') {
    $erreur = 'Merci de remplir votre prénom et votre témoignage.';
} elseif (!$consentement) {
    $erreur = 'La publication nécessite votre accord — merci de cocher la case.';
} elseif (mb_strlen($temoignage) > 250) {
    $erreur = 'Votre témoignage dépasse 250 caractères — merci de le raccourcir.';
}

if ($erreur !== null) {
    // On garde ce que la personne a tapé, pour ne pas la faire tout retaper (D3).
    $_SESSION['avis_erreur']    = $erreur;
    $_SESSION['avis_nom']       = $nom;
    $_SESSION['avis_temoignage'] = $temoignage;
    header('Location: index.php');
    exit;
}

// -------------------------------------------------------------------------
// Envoi de l'e-mail à Marceline
// Adresse dédiée (placeholder) — à remplacer par la vraie adresse Infomaniak.
// -------------------------------------------------------------------------

$destinataire = 'temoignages@cheffekamano.ch';
$sujet        = 'Nouveau témoignage — ' . $nom;

$corps  = "Nouveau témoignage reçu via le site :\n\n";
$corps .= "Prénom : $nom\n\n";
$corps .= "Témoignage :\n$temoignage\n";

$entetes = 'Content-Type: text/plain; charset=UTF-8' . "\r\n";

$envoiOk = mail($destinataire, $sujet, $corps, $entetes);

if ($envoiOk) {
    $_SESSION['avis_succes'] = true;
} else {
    // L'envoi a échoué côté serveur (ex. mail() non configuré en local — attendu avant Infomaniak).
    $_SESSION['avis_erreur']     = 'Une erreur est survenue lors de l\'envoi. Merci de réessayer un peu plus tard.';
    $_SESSION['avis_nom']        = $nom;
    $_SESSION['avis_temoignage'] = $temoignage;
}

header('Location: index.php');
exit;