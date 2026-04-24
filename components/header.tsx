"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scissors } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UserAvatar } from "@/components/user-avatar"
import { AnimatedButton } from "@/components/animated/animated-button"
import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export function Header() {
  const { user, loading } = useAuth()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)

  // Controle de transparência baseado no scroll
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98])
  const borderOpacity = useTransform(scrollY, [0, 100], [0.4, 0.8])

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
    return unsubscribe
  }, [scrollY])

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300"
      style={{ 
        backgroundColor: `rgba(var(--background) / ${isScrolled ? '0.98' : '0.95'})`,
        borderBottomColor: `rgba(var(--border) / ${isScrolled ? '0.8' : '0.4'})`,
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-2">
              <motion.div 
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"
                whileHover={{ 
                  backgroundColor: "hsl(var(--primary) / 0.9)",
                  rotate: 15,
                }}
                transition={{ duration: 0.2 }}
              >
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold">Na Régua</span>
            </Link>
          </motion.div>

          <motion.nav 
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { href: "/map", label: "Encontrar Barbearias" },
              { href: "/about", label: "Sobre" },
              ...(user ? [] : [{ href: "/for-barbers", label: "Para Barbeiros" }]),
              { href: "/support", label: "Suporte" },
            ].map((link, index) => (
              <motion.div
                key={link.href}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {loading ? (
              <motion.div 
                className="w-8 h-8 rounded-full bg-muted"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ) : user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserAvatar />
              </motion.div>
            ) : (
              <>
                <AnimatedButton variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/login">Entrar</Link>
                </AnimatedButton>
                <AnimatedButton ripple>
                  <Link href="/signup">Cadastrar</Link>
                </AnimatedButton>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
