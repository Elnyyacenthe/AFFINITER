import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-invert mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">Conditions Générales d'Utilisation</h1>

        <h2>1. Acceptation</h2>
        <p>
          En accédant à {SITE_NAME}, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes CGU.
          L'accès est strictement réservé aux personnes <strong>majeures (18 ans et plus)</strong>.
        </p>

        <h2>2. Inscription</h2>
        <p>
          Chaque utilisateur s'engage à fournir des informations exactes. Un seul compte par personne. Le compte est
          personnel et non transférable.
        </p>

        <h2>3. Publication d'annonces</h2>
        <p>L'annonceur certifie sur l'honneur :</p>
        <ul>
          <li>Être majeur(e) et consentant(e)</li>
          <li>Être seul(e) auteur(e) des photos publiées</li>
          <li>Ne pas représenter ni faire la promotion d'un mineur</li>
          <li>Ne pas être victime de traite ou de contrainte</li>
          <li>Respecter la législation camerounaise en vigueur</li>
        </ul>
        <p>
          Toute violation entraîne la suppression immédiate du compte et un signalement aux autorités compétentes.
        </p>

        <h2>4. Comportements interdits</h2>
        <ul>
          <li>Annonces impliquant un mineur (signalement immédiat aux autorités)</li>
          <li>Traite d'êtres humains, proxénétisme, contrainte</li>
          <li>Faux profils, usurpation d'identité</li>
          <li>Spam, harcèlement, arnaque</li>
          <li>Diffusion de contenu illégal (drogues, armes, etc.)</li>
        </ul>

        <h2>5. Responsabilité</h2>
        <p>
          {SITE_NAME} agit en qualité d'<strong>hébergeur</strong>. Les annonces sont publiées sous la seule responsabilité de leurs auteurs.
          {SITE_NAME} se réserve le droit de retirer toute annonce non conforme.
        </p>

        <h2>6. Paiements</h2>
        <p>
          Les options Premium et VIP sont payantes (MTN MoMo / Orange Money). Aucun remboursement n'est dû en cas de
          violation des CGU. Les paiements sont définitifs une fois la prestation activée.
        </p>

        <h2>7. Résiliation</h2>
        <p>
          Vous pouvez supprimer votre compte à tout moment. {SITE_NAME} peut suspendre ou supprimer tout compte en cas
          de violation des CGU, sans préavis.
        </p>

        <h2>8. Droit applicable</h2>
        <p>
          Les présentes CGU sont régies par le droit camerounais. Tout litige sera porté devant les tribunaux compétents
          de Douala.
        </p>
      </article>
    </div>
  );
}
