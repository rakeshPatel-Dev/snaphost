"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { flushSync } from "react-dom"

import { Moon, Sun } from "lucide-react"

import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

type AnimatedThemeTogglerProps = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Sync with current HTML state after mount
    const currentDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(currentDarkMode)
    setMounted(true)

    const syncTheme = () => {
      setDarkMode(document.documentElement.classList.contains("dark"))
    }

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const onToggle = useCallback(() => {
    if (!buttonRef.current) return

    try {
      const currentDarkMode = document.documentElement.classList.contains("dark")
      const newDarkMode = !currentDarkMode

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setDarkMode(newDarkMode)
          if (newDarkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
          localStorage.setItem("theme", newDarkMode ? "dark" : "light")
        })
      })

      transition.ready.then(() => {
        const { left, top, width, height } = buttonRef.current!.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2
        const maxDistance = Math.hypot(
          Math.max(centerX, window.innerWidth - centerX),
          Math.max(centerY, window.innerHeight - centerY)
        )

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${centerX}px ${centerY}px)`,
              `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
            ],
          },
          {
            duration: 700,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    } catch (error) {
      // Fallback if View Transition API is not supported
      const currentDarkMode = document.documentElement.classList.contains("dark")
      const newDarkMode = !currentDarkMode
      setDarkMode(newDarkMode)
      if (newDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      localStorage.setItem("theme", newDarkMode ? "dark" : "light")
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      aria-label="Switch theme"
      className={cn(
        "flex items-center justify-center p-2 rounded-full outline-none focus:outline-none active:outline-none focus:ring-0 cursor-pointer",
        className
      )}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span
            key="sun-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
            className="text-white"
          >
            <Sun />
          </motion.span>
        ) : (
          <motion.span
            key="moon-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
            className="text-black"
          >
            <Moon />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
