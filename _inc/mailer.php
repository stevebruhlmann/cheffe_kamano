<?php
// =========================================================================
// Envoi d'e-mails via SMTP (PHPMailer) — partagé par tous les formulaires.
// Ne fait aucune validation de contenu : c'est la responsabilité de
// chaque traitement.php. Ce fichier ne s'occupe que de l'envoi technique.
// =========================================================================

require __DIR__ . '/../phpmailer/Exception.php';
require __DIR__ . '/../phpmailer/PHPMailer.php';
require __DIR__ . '/../phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Envoie un e-mail via le SMTP Infomaniak.
 *
 * @param string $destinataire Adresse e-mail du destinataire
 * @param string $sujet        Sujet de l'e-mail
 * @param string $corps        Corps du message (texte brut)
 * @param string $smtpUser     Adresse d'authentification SMTP (noreply@...)
 * @param string $smtpPass     Mot de passe d'appareil correspondant
 * @return bool true si l'envoi a réussi, false sinon
 */
function envoyerMail(string $destinataire, string $sujet, string $corps, string $smtpUser, string $smtpPass): bool
{
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->Port       = SMTP_PORT;
        $mail->SMTPAuth   = true;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($smtpUser, 'Cheffe Kamano — Site web');
        $mail->addAddress($destinataire);

        $mail->Subject = $sujet;
        $mail->Body    = $corps;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Pas d'affichage de l'erreur au visiteur — juste un échec
        // remonté au script appelant, qui décide quoi faire.
        return false;
    }
}