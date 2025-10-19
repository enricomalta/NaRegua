import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Star, Bell, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Sobre o <span className="text-primary">Na Régua</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Conectamos clientes a barbearias de qualidade, tornando o agendamento simples, rápido e confiável. Nossa
              missão é transformar a experiência de cuidado pessoal masculino através da tecnologia.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nossa Missão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Facilitar o acesso a serviços de barbearia de qualidade, conectando profissionais talentosos com
                  clientes que valorizam excelência e praticidade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nossa Visão</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ser a plataforma líder em agendamento de serviços de barbearia, reconhecida pela confiabilidade,
                  inovação e compromisso com a satisfação de clientes e barbeiros.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Encontre</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Navegue pelo mapa interativo e descubra barbearias próximas a você. Filtre por avaliação, preço e
                  distância.
                </p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Agende</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Escolha o serviço desejado, selecione data e horário disponível. Tudo em poucos cliques.
                </p>
              </div>

              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Avalie</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Após o atendimento, compartilhe sua experiência e ajude outros clientes a encontrar os melhores
                  profissionais.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Recursos da Plataforma</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Mapa Interativo</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize todas as barbearias em um mapa com pins interativos
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Calendar className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Agendamento Online</h3>
                  <p className="text-sm text-muted-foreground">Reserve horários em tempo real sem precisar ligar</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Bell className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Notificações</h3>
                  <p className="text-sm text-muted-foreground">Receba lembretes 10 minutos antes do seu horário</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Sistema de Avaliações</h3>
                  <p className="text-sm text-muted-foreground">Avalie e veja avaliações de outros clientes</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Perfis Verificados</h3>
                  <p className="text-sm text-muted-foreground">Todas as barbearias são verificadas pela nossa equipe</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Comunidade Ativa</h3>
                  <p className="text-sm text-muted-foreground">Faça parte de uma comunidade que valoriza qualidade</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Junte-se a milhares de clientes satisfeitos e encontre a barbearia perfeita para você.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/map">Encontrar Barbearias</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/for-barbers">Sou Barbeiro</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
