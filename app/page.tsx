"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { MapPin, Calendar, Star, Clock, Shield, Smartphone } from "lucide-react"
import { AnimatedElement, AnimatedList, ParallaxElement, FloatingElement } from "@/components/animated/animated-elements"
import { AnimatedButton } from "@/components/animated/animated-button"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Floating Background Elements */}
        <FloatingElement className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full blur-xl" duration={4}>
          <div />
        </FloatingElement>
        <FloatingElement className="absolute top-40 right-16 w-12 h-12 bg-primary/5 rounded-full blur-lg" duration={6} y={[-15, 15]}>
          <div />
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 left-1/4 w-20 h-20 bg-primary/5 rounded-full blur-2xl" duration={5}>
          <div />
        </FloatingElement>

        <div className="container mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedElement animation="fadeInDown" delay={200}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
                Seu Corte Perfeito, <span className="text-primary">Na Régua</span>
              </h1>
            </AnimatedElement>
            
            <AnimatedElement animation="fadeInUp" delay={400}>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Encontre as melhores barbearias da sua região, agende horários e garanta seu estilo com apenas alguns
                cliques.
              </p>
            </AnimatedElement>
            
            <AnimatedElement animation="scaleIn" delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton size="lg" className="text-lg h-12 px-8" ripple>
                  <Link href="/map" className="w-full h-full flex items-center justify-center">
                    Encontrar Barbearias
                  </Link>
                </AnimatedButton>
                <AnimatedButton size="lg" variant="outline" className="text-lg h-12 px-8 bg-transparent">
                  <Link href="/for-barbers" className="w-full h-full flex items-center justify-center">
                    Sou Barbeiro
                  </Link>
                </AnimatedButton>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50 relative">
        <ParallaxElement offset={30} className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div />
        </ParallaxElement>
        
        <div className="container mx-auto relative">
          <AnimatedElement animation="fadeInUp" className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Conectamos você com as melhores barbearias de forma simples e rápida
            </p>
          </AnimatedElement>

          <AnimatedList
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            itemClassName="h-full"
          >
            {[
              {
                icon: MapPin,
                title: "Encontre Próximo a Você",
                description: "Veja todas as barbearias no mapa e filtre por distância, avaliação e preço.",
              },
              {
                icon: Calendar,
                title: "Agende Online",
                description: "Escolha o horário disponível e agende seu corte sem complicação.",
              },
              {
                icon: Star,
                title: "Avalie e Compartilhe",
                description: "Deixe sua avaliação e ajude outros clientes a encontrar o melhor serviço.",
              },
              {
                icon: Clock,
                title: "Lembretes Automáticos",
                description: "Receba notificações 10 minutos antes do seu horário agendado.",
              },
              {
                icon: Shield,
                title: "Seguro e Confiável",
                description: "Todas as barbearias são verificadas e avaliadas pela comunidade.",
              },
              {
                icon: Smartphone,
                title: "100% Mobile",
                description: "Acesse de qualquer dispositivo, a qualquer hora e em qualquer lugar.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                className="h-full"
              >
                <Card className="border-border/50 bg-card/80 backdrop-blur h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="pt-6">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4"
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "hsl(var(--primary) / 0.2)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatedList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <AnimatedElement animation="scaleIn">
            <motion.div
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <CardContent className="p-12 text-center relative z-10">
                  <AnimatedElement animation="fadeInDown">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Ficar Na Régua?</h2>
                  </AnimatedElement>
                  <AnimatedElement animation="fadeInUp" delay={200}>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                      Junte-se a milhares de clientes que já encontraram sua barbearia ideal
                    </p>
                  </AnimatedElement>
                  <AnimatedElement animation="scaleIn" delay={400}>
                    <AnimatedButton size="lg" className="text-lg h-12 px-8" pulse ripple>
                      <Link href="/signup" className="w-full h-full flex items-center justify-center">
                        Começar Agora
                      </Link>
                    </AnimatedButton>
                  </AnimatedElement>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedElement>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <AnimatedList
            className="grid md:grid-cols-4 gap-8"
            itemClassName="space-y-4"
          >
            {[
              {
                title: "Na Régua",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Conectando clientes e barbearias com tecnologia e estilo.
                  </p>
                ),
              },
              {
                title: "Para Clientes",
                content: (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/map" className="hover:text-foreground transition-colors">
                          Encontrar Barbearias
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/signup" className="hover:text-foreground transition-colors">
                          Criar Conta
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                ),
              },
              {
                title: "Para Barbeiros",
                content: (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/for-barbers" className="hover:text-foreground transition-colors">
                          Cadastrar Barbearia
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/login" className="hover:text-foreground transition-colors">
                          Área do Barbeiro
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                ),
              },
              {
                title: "Suporte",
                content: (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/about" className="hover:text-foreground transition-colors">
                          Sobre
                        </Link>
                      </motion.div>
                    </li>
                    <li>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/support" className="hover:text-foreground transition-colors">
                          Suporte
                        </Link>
                      </motion.div>
                    </li>
                  </ul>
                ),
              },
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <motion.h4
                  className="font-semibold"
                  whileHover={{ color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  {section.title}
                </motion.h4>
                {section.content}
              </div>
            ))}
          </AnimatedList>
          
          <AnimatedElement animation="fadeInUp" delay={800}>
            <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 Na Régua. Todos os direitos reservados.</p>
            </div>
          </AnimatedElement>
        </div>
      </footer>
    </div>
  )
}
