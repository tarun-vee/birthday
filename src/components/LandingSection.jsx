import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTE_LINES = [
  'Some people leave memories.',
  'Some people leave stories.',
  'Somehow, you left both.',
]

function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    top: `${10 + Math.random() * 80}%`,
    size: 3 + Math.random() * 5,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 6,
    color: i % 3 === 0 ? '#D4B16A' : i % 3 === 1 ? '#8B6B4A' : '#EFE4D2',
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.5,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function FloraSVG() {
  return (
    <svg
      className="floral-accent absolute bottom-8 right-8 w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M100 100 Q120 60 160 50 Q140 90 100 100Z" stroke="#8B6B4A" strokeWidth="1.5" fill="none" />
      <path d="M100 100 Q60 80 40 40 Q80 60 100 100Z" stroke="#8B6B4A" strokeWidth="1.5" fill="none" />
      <path d="M100 100 Q130 130 170 150 Q140 120 100 100Z" stroke="#8B6B4A" strokeWidth="1.5" fill="none" />
      <path d="M100 100 Q70 140 50 170 Q80 130 100 100Z" stroke="#8B6B4A" strokeWidth="1.5" fill="none" />
      <path d="M100 100 Q100 50 100 20" stroke="#8B6B4A" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      <path d="M100 100 Q150 100 180 100" stroke="#8B6B4A" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      <path d="M100 100 Q50 100 20 100" stroke="#8B6B4A" strokeWidth="1" strokeDasharray="3 4" fill="none" />
      <circle cx="100" cy="100" r="6" fill="#D4B16A" opacity="0.6" />
      <circle cx="100" cy="100" r="3" fill="#D4B16A" />
    </svg>
  )
}

export default function LandingSection() {
  const [displayedLines, setDisplayedLines] = useState(['', '', ''])
  const [currentLine, setCurrentLine] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (currentLine >= QUOTE_LINES.length) { setDone(true); return }
    const line = QUOTE_LINES[currentLine]
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setDisplayedLines(prev => {
          const next = [...prev]
          next[currentLine] = line.slice(0, charIdx + 1)
          return next
        })
        setCharIdx(c => c + 1)
      }, 52)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setCurrentLine(l => l + 1)
        setCharIdx(0)
      }, 480)
      return () => clearTimeout(t)
    }
  }, [currentLine, charIdx])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <FloatingParticles />
      <FloraSVG />

      {/* Decorative corner ornament top-left */}
      <svg className="floral-accent absolute top-6 left-6 w-24 h-24" viewBox="0 0 100 100" fill="none">
        <path d="M10 10 Q50 10 90 50 Q50 50 10 90" stroke="#8B6B4A" strokeWidth="1.2" fill="none" />
        <path d="M10 10 Q10 50 50 90" stroke="#D4B16A" strokeWidth="0.8" fill="none" />
        <circle cx="10" cy="10" r="3" fill="#D4B16A" opacity="0.7" />
      </svg>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-greatVibes text-2xl md:text-3xl lg:text-4xl mb-4"
          style={{ color: 'var(--coffee)' }}
        >
          a journey told through moments
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-playfair font-black leading-none tracking-tight flex flex-col items-center w-full"
          style={{
            fontSize: 'clamp(2.7rem, 11vw, 7rem)',
            color: 'var(--dark-brown)',
            textShadow: '2px 4px 12px rgba(74,55,40,0.12)',
          }}
        >
          <span>The Deeksha</span>
          <span style={{ color: 'var(--gold)', fontStyle: 'italic', marginTop: '0.1em' }}>Effect</span>
        </motion.h1>

        {/* Decorative gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mx-auto my-8"
          style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            maxWidth: 320,
          }}
        />

        {/* Typewriter quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="font-cormorant italic text-lg sm:text-xl md:text-2xl leading-relaxed min-h-[96px] w-full px-4"
          style={{ color: 'var(--dark-brown)' }}
        >
          {displayedLines.map((line, i) => (
            <div key={i} style={{ minHeight: '1.6em' }}>
              {line}
              {i === currentLine && !done && <span className="cursor" />}
            </div>
          ))}
          {done && <span className="cursor" />}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 scroll-bounce"
        style={{ color: 'var(--coffee)' }}
      >
        <span className="font-inter text-sm tracking-widest uppercase opacity-70">Scroll to begin</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16M6 14l6 6 6-6" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  )
}
