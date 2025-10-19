"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scissors } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Na Régua</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/map"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Encontrar Barbearias
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/for-barbers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Para Barbeiros
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Suporte
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
