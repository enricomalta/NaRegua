import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageCircle, Phone, HelpCircle } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Como podemos <span className="text-primary">ajudar</span>?
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Estamos aqui para responder suas dúvidas e garantir a melhor experiência na plataforma Na Régua.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-3">Resposta em até 24 horas</p>
                <a href="mailto:suporte@naregua.com.br" className="text-sm text-primary hover:underline">
                  suporte@naregua.com.br
                </a>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-3">Atendimento rápido</p>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  (11) 99999-9999
                </a>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Telefone</h3>
                <p className="text-sm text-muted-foreground mb-3">Seg-Sex, 9h às 18h</p>
                <a href="tel:+551140004000" className="text-sm text-primary hover:underline">
                  (11) 4000-4000
                </a>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-16 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">Como faço para agendar um horário?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Para agendar, navegue pelo mapa e encontre a barbearia desejada. Clique em "Ver Perfil", escolha o
                  serviço, selecione data e horário disponível, e confirme seu agendamento. Você receberá uma
                  notificação 10 minutos antes do horário marcado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  Posso cancelar ou remarcar um agendamento?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Acesse seu dashboard de cliente, encontre o agendamento e clique em "Cancelar" ou "Remarcar".
                  Recomendamos fazer isso com pelo menos 2 horas de antecedência para não prejudicar a barbearia.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  Como cadastro minha barbearia na plataforma?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Clique em "Para Barbeiros" no menu, depois em "Cadastrar Minha Barbearia". Preencha as informações
                  sobre seu estabelecimento, adicione fotos, serviços e horários de funcionamento. Após a verificação,
                  seu perfil ficará visível no mapa.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">Quanto custa usar a plataforma?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Para clientes, a plataforma é 100% gratuita. Para barbeiros, oferecemos um plano gratuito com até 50
                  agendamentos/mês e planos pagos a partir de R$ 49/mês com recursos adicionais. Veja todos os planos na
                  página "Para Barbeiros".
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">Como funcionam as avaliações?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Após comparecer a um agendamento, você pode avaliar a barbearia com estrelas (1 a 5) e deixar um
                  comentário sobre sua experiência. As avaliações ajudam outros clientes a escolher e incentivam as
                  barbearias a manter alta qualidade.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  Recebo notificações sobre meus agendamentos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Você receberá uma notificação 10 minutos antes do horário agendado para não esquecer.
                  Certifique-se de permitir notificações do Na Régua no seu navegador ou dispositivo.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border border-border/50 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Levamos a segurança muito a sério. Todos os dados são criptografados e armazenados com segurança.
                  Não compartilhamos suas informações pessoais com terceiros sem seu consentimento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Envie sua Mensagem</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Seu nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input id="subject" placeholder="Sobre o que você precisa de ajuda?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" placeholder="Descreva sua dúvida ou problema em detalhes..." rows={6} />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
