import { useInView } from "react-intersection-observer"
import { useAnimation } from "framer-motion"
import { useEffect } from "react"

/**
 * Hook personalizado para animações baseadas em scroll
 * Detecta quando um elemento entra na viewport e dispara animações
 */
export function useScrollAnimation(
  threshold: number = 0.1,
  triggerOnce: boolean = true,
  delay: number = 0
) {
  const controls = useAnimation()
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  })

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        controls.start("visible")
      }, delay)
      return () => clearTimeout(timer)
    } else {
      controls.start("hidden")
    }
  }, [controls, inView, delay])

  return { ref, controls, inView }
}

/**
 * Hook para animações de hover suaves
 */
export function useHoverAnimation() {
  const controls = useAnimation()

  const handleHoverStart = () => controls.start("hover")
  const handleHoverEnd = () => controls.start("rest")

  return {
    controls,
    whileHover: "hover",
    whileTap: "tap",
    animate: controls,
    onHoverStart: handleHoverStart,
    onHoverEnd: handleHoverEnd,
  }
}

/**
 * Hook para controlar animações de loading/estado
 */
export function useLoadingAnimation(isLoading: boolean) {
  const controls = useAnimation()

  useEffect(() => {
    if (isLoading) {
      controls.start("loading")
    } else {
      controls.start("loaded")
    }
  }, [controls, isLoading])

  return controls
}