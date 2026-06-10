import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Image src="/icon.svg" alt={SITE_NAME} width={40} height={40} priority />
          <span className="font-display text-3xl font-bold gradient-text">{SITE_NAME}</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
