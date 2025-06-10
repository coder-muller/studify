import { Label } from "@/components/ui/label";
import { ArrowRight, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/theme-toggle";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
        <Sprout className="w-10 h-10 text-secondary" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <Label className="text-2xl font-bold">Studify</Label>
        <p className="text-sm text-muted-foreground">
          A melhor plataforma para estudar
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <Link href="/signup">
          <Button variant={"default"} size={"sm"}>
            Começar Agora
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
        <Link href="/login">
          <Button variant={"outline"} size={"sm"}>
            Entrar
          </Button>
        </Link>
      </div>
      <div className="absolute bottom-4 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Feito com ❤️ por <Link href="https://github.com/coder-muller" className="text-primary hover:underline">Guilherme Müller</Link>
        </p>
      </div>
    </div>
  );
}
