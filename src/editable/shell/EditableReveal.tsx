'use client'

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  as?: ElementType
  index?: number
  delay?: number
  className?: string
  once?: boolean
  threshold?: number
  style?: CSSProperties
}

/**
 * IntersectionObserver-driven fade + slide-up.
 * Hidden class only applied after mount so JS-off visitors see full content.
 * Staggers per-item via inline transitionDelay derived from index.
 */
export function EditableReveal({
  children,
  as,
  index = 0,
  delay,
  className = '',
  once = true,
  threshold = 0.12,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const node = ref.current
    if (!node) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduced) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hydrated, once, threshold])

  const Tag = (as || 'div') as ElementType
  const computedDelay = typeof delay === 'number' ? delay : Math.min(index * 90, 900)

  const cls = [
    'editable-reveal',
    hydrated && !visible ? 'editable-reveal-hydrated' : '',
    visible ? 'is-visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const mergedStyle: CSSProperties = { transitionDelay: `${computedDelay}ms`, ...(style || {}) }

  return (
    <Tag ref={ref as never} className={cls} style={mergedStyle}>
      {children}
    </Tag>
  )
}
