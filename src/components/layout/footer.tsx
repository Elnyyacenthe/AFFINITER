import Link from "next/link";
import Image from "next/image";
import { ShieldAlert } from "lucide-react";
import { SITE_NAME } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/40 bg-card/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.svg" alt={SITE_NAME} width={28} height={28} />
              <span className="font-display text-xl font-bold gradient-text">{SITE_NAME}</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Plateforme N°1 d'annonces escorts au Cameroun. Rencontres adultes vérifiées.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5" /> 18+ UNIQUEMENT
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Villes populaires</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ville/douala">Escorts Douala</Link></li>
              <li><Link href="/ville/yaounde">Escorts Yaoundé</Link></li>
              <li><Link href="/ville/bafoussam">Escorts Bafoussam</Link></li>
              <li><Link href="/ville/kribi">Escorts Kribi</Link></li>
              <li><Link href="/ville/limbe">Escorts Limbé</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Plateforme</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/poster-une-annonce">Poster une annonce</Link></li>
              <li><Link href="/inscription">Devenir escort</Link></li>
              <li><Link href="/recherche">Recherche avancée</Link></li>
              <li><Link href="/tarifs">Tarifs Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/cgu">Conditions d'utilisation</Link></li>
              <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
              <li><Link href="/rgpd">RGPD</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés. Site réservé aux personnes majeures.
          </p>
          <p className="mt-2">
            Toute publication d'annonce concernant un mineur ou impliquant la traite des personnes est strictement interdite et signalée aux autorités.
          </p>
        </div>
      </div>
    </footer>
  );
}
