import { Logo } from "@/components/icons";

export function Header() {
  return (
    <header className="py-8">
      <div className="container mx-auto max-w-5xl px-4 flex items-center gap-4">
        <Logo className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Clichai
        </h1>
      </div>
    </header>
  );
}
