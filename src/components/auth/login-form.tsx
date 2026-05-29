"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction, type AuthState } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState | null, FormData>(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Connexion réussie 👋");
      router.push("/");
      router.refresh();
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Connexion</CardTitle>
        <CardDescription>Connectez-vous avec votre email ou téléphone</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email ou téléphone</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="vous@example.com ou +237 6XX XX XX XX"
              required
              autoComplete="username"
            />
            {state && !state.ok && state.fieldErrors?.identifier && (
              <p className="text-xs text-destructive">{state.fieldErrors.identifier[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {state && !state.ok && state.fieldErrors?.password && (
              <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
            )}
          </div>
          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
