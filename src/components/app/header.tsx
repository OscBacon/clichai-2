
import { Logo } from "@/components/icons";

export function Header() {
  return (
    <header className="flex items-center gap-2">
      <Logo className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Maitch
      </h1>
    </header>
  );
}
