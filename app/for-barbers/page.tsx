import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, TrendingUp, Calendar, Users, BarChart3, Clock } from "lucide-react"
import Link from "next/link"

export default function ForBarbersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Leve sua barbearia para o <span className="text-primary">próximo nível</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed mb-8">
              Aumente sua visibilidade, gerencie agendamentos com facilidade e conquiste mais clientes com a plataforma
              Na Régua.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/barber/setup">Cadastrar Minha Barbearia</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Já Tenho Conta</Link>
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o Na Régua?</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Mais Visibilidade</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Apareça no mapa para milhares de clientes em potencial procurando barbearias na sua região.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gestão de Agendamentos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sistema completo para gerenciar horários, evitar conflitos e reduzir faltas com notificações
                    automáticas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Novos Clientes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Atraia clientes que buscam ativamente por serviços de barbearia de qualidade na sua área.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Relatórios e Insights</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Acompanhe métricas importantes como número de agendamentos, avaliações e receita.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Economia de Tempo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Reduza ligações e mensagens. Clientes agendam online e você foca no que faz de melhor.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Fácil de Usar</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Interface intuitiva e suporte dedicado para você começar rapidamente sem complicações.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works for Barbers */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cadastre sua Barbearia</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Crie seu perfil com fotos, descrição, localização e serviços oferecidos. Leva apenas alguns
                      minutos.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Configure seus Horários</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Defina seus dias e horários de funcionamento. O sistema gerencia automaticamente a
                      disponibilidade.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Receba Agendamentos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Clientes encontram sua barbearia no mapa e fazem reservas online. Você recebe notificações em
                      tempo real.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Construa sua Reputação</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Clientes satisfeitos deixam avaliações positivas, aumentando sua credibilidade e atraindo mais
                      clientes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">Planos e Preços</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua barbearia
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Básico</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">Grátis</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Perfil no mapa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Até 50 agendamentos/mês</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Sistema de avaliações</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/barber/setup">Começar Grátis</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Profissional</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">R$ 49</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Tudo do plano Básico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Agendamentos ilimitados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Relatórios detalhados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Destaque no mapa</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/barber/setup">Começar Agora</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">R$ 99</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Tudo do plano Profissional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Múltiplos barbeiros</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">API de integração</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Suporte prioritário</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/barber/setup">Começar Agora</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Pronto para crescer?</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Junte-se a centenas de barbeiros que já estão transformando seus negócios com o Na Régua.
                </p>
                <Button size="lg" asChild>
                  <Link href="/barber/setup">Cadastrar Minha Barbearia</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
