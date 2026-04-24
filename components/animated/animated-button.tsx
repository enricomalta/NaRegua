"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import React from "react"

interface AnimatedButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  ripple?: boolean
  pulse?: boolean
}

/**
 * Botão com animações suaves de hover, tap e efeitos visuais
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, ripple = false, pulse = false, variant, size, onClick, disabled, type = "button" }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant, size }),
          "relative overflow-hidden",
          pulse && "animate-pulse",
          className
        )}
        whileHover={!disabled ? {
          scale: 1.02,
          y: -1,
          transition: { duration: 0.2 },
        } : {}}
        whileTap={!disabled ? {
          scale: 0.98,
          transition: { duration: 0.1 },
        } : {}}
      >
        {ripple && (
          <motion.span
            className="absolute inset-0 bg-white/20 rounded-full scale-0"
            whileTap={{
              scale: 4,
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 0.4,
            }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"