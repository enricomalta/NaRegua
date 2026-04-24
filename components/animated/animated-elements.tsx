"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-animations"
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  staggerItem,
} from "@/lib/animation-variants"
import { ReactNode } from "react"

interface AnimatedElementProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  animation?: "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn"
  delay?: number
  threshold?: number
  className?: string
}

/**
 * Componente wrapper que adiciona animações de scroll automáticas
 */
export function AnimatedElement({
  children,
  animation = "fadeInUp",
  delay = 0,
  threshold = 0.1,
  className,
  ...props
}: AnimatedElementProps) {
  const { ref, controls } = useScrollAnimation(threshold, true, delay)

  const variants = {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[animation]}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
  delay?: number
}

/**
 * Componente para animar listas com efeito stagger
 */
export function AnimatedList({ children, className, itemClassName, delay = 0 }: AnimatedListProps) {
  const { ref, controls } = useScrollAnimation(0.1, true, delay)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={staggerItem} className={itemClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface ParallaxElementProps {
  children: ReactNode
  offset?: number
  className?: string
}

/**
 * Componente de parallax simples para efeitos de profundidade
 */
export function ParallaxElement({ children, offset = 50, className }: ParallaxElementProps) {
  return (
    <motion.div
      className={className}
      style={{
        y: offset,
      }}
      whileInView={{
        y: -offset,
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      viewport={{ once: false, amount: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: ReactNode
  duration?: number
  y?: number[]
  className?: string
}

/**
 * Componente para elementos flutuantes suaves
 */
export function FloatingElement({
  children,
  duration = 3,
  y = [-10, 10],
  className,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: y,
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}