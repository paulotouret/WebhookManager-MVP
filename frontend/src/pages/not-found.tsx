import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          A página que você procura não existe ou você não tem permissão para visualizá-la.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8">
            Voltar ao painel
          </Button>
        </Link>
      </div>
    </div>
  );
}
