import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { MapPin, Calendar, Star, Clock, Shield, Smartphone } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Seu Corte Perfeito, <span className="text-primary">Na Régua</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Encontre as melhores barbearias da sua região, agende horários e garanta seu estilo com apenas alguns
              cliques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link href="/map">Encontrar Barbearias</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 bg-transparent">
                <Link href="/for-barbers">Sou Barbeiro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conectamos você com as melhores barbearias de forma simples e rápida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Encontre Próximo a Você</h3>
                <p className="text-muted-foreground">
                  Veja todas as barbearias no mapa e filtre por distância, avaliação e preço.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Agende Online</h3>
                <p className="text-muted-foreground">
                  Escolha o horário disponível e agende seu corte sem complicação.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Avalie e Compartilhe</h3>
                <p className="text-muted-foreground">
                  Deixe sua avaliação e ajude outros clientes a encontrar o melhor serviço.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lembretes Automáticos</h3>
                <p className="text-muted-foreground">Receba notificações 10 minutos antes do seu horário agendado.</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
                <p className="text-muted-foreground">
                  Todas as barbearias são verificadas e avaliadas pela comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">100% Mobile</h3>
                <p className="text-muted-foreground">
                  Acesse de qualquer dispositivo, a qualquer hora e em qualquer lugar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Ficar Na Régua?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de clientes que já encontraram sua barbearia ideal
              </p>
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link href="/signup">Começar Agora</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Na Régua</h3>
              <p className="text-sm text-muted-foreground">Conectando clientes e barbearias com tecnologia e estilo.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/map" className="hover:text-foreground transition-colors">
                    Encontrar Barbearias
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Criar Conta
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Barbeiros</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/for-barbers" className="hover:text-foreground transition-colors">
                    Cadastrar Barbearia
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Área do Barbeiro
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-foreground transition-colors">
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Na Régua. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
