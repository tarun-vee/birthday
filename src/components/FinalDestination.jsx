import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import confetti from 'canvas-confetti'

const pageModules = import.meta.glob('../assets/pages/page*.png', { eager: true })
const IMAGES = Object.keys(pageModules)
  .sort((a, b) => {
    const numA = parseInt(a.match(/page(\d+)\.png/)?.[1] ?? '0')
    const numB = parseInt(b.match(/page(\d+)\.png/)?.[1] ?? '0')
    return numA - numB
  })
  .map(k => pageModules[k].default)

function CollageItem({ img, index }) {
  const ROTATIONS = [-4, 3, -2, 5, -6, 2, -3, 4, -5]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: ROTATIONS[index % ROTATIONS.length] * 2 }}
      whileInView={{ opacity: 1, scale: 1, rotate: ROTATIONS[index % ROTATIONS.length] }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08, zIndex: 20, rotate: 0, transition: { duration: 0.3 } }}
      style={{
        background: '#FAFAFA',
        padding: '8px 8px 32px 8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)`,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <img
        src={img}
        alt={`Memory ${index + 1}`}
        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
      />
    </motion.div>
  )
}

export default function FinalDestination() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' })
  const confettiFired = useRef(false)

  useEffect(() => {
    if (isInView && !confettiFired.current) {
      confettiFired.current = true
      const colors = ['#D4B16A', '#8B6B4A', '#EFE4D2', '#4A3728', '#F7F1E8']

      const fire = (particleRatio, opts) => {
        confetti({
          origin: { y: 0.7 },
          colors,
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        })
      }

      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2,  { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1,  { spread: 120, startVelocity: 45 })

      setTimeout(() => {
        fire(0.3, { spread: 80, origin: { x: 0.2, y: 0.8 } })
        fire(0.3, { spread: 80, origin: { x: 0.8, y: 0.8 } })
      }, 400)
    }
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'var(--paper)',
        paddingTop: '8rem',
        paddingBottom: '6rem',
      }}
    >
      {/* Torn top edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'var(--bg)',
          clipPath: `polygon(
            0% 100%,0% 0%,2% 70%,4% 30%,6% 80%,8% 20%,10% 65%,12% 10%,14% 55%,
            16% 90%,18% 35%,20% 75%,22% 20%,24% 60%,26% 5%,28% 45%,30% 85%,
            32% 30%,34% 70%,36% 15%,38% 55%,40% 95%,42% 40%,44% 80%,46% 25%,
            48% 65%,50% 8%,52% 50%,54% 88%,56% 32%,58% 72%,60% 18%,62% 58%,
            64% 4%,66% 44%,68% 82%,70% 28%,72% 62%,74% 14%,76% 54%,78% 90%,
            80% 38%,82% 74%,84% 22%,86% 62%,88% 10%,90% 50%,92% 86%,94% 32%,
            96% 70%,98% 20%,100% 58%,100% 100%
          )`,
        }}
      />

      {/* Decorative floral SVG */}
      <svg
        className="floral-accent absolute top-20 left-8 w-32 h-32"
        viewBox="0 0 120 120"
        fill="none"
      >
        <circle cx="60" cy="60" r="30" stroke="#8B6B4A" strokeWidth="1" />
        <path d="M60 30 Q80 45 60 60 Q40 45 60 30Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M60 90 Q80 75 60 60 Q40 75 60 90Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M30 60 Q45 40 60 60 Q45 80 30 60Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M90 60 Q75 40 60 60 Q75 80 90 60Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <circle cx="60" cy="60" r="5" fill="#D4B16A" opacity="0.7" />
      </svg>

      <svg
        className="floral-accent absolute top-20 right-8 w-32 h-32"
        viewBox="0 0 120 120"
        fill="none"
        style={{ transform: 'scaleX(-1)' }}
      >
        <circle cx="60" cy="60" r="30" stroke="#8B6B4A" strokeWidth="1" />
        <path d="M60 30 Q80 45 60 60 Q40 45 60 30Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M60 90 Q80 75 60 60 Q40 75 60 90Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M30 60 Q45 40 60 60 Q45 80 30 60Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <path d="M90 60 Q75 40 60 60 Q75 80 90 60Z" stroke="#D4B16A" strokeWidth="1" fill="rgba(212,177,106,0.1)" />
        <circle cx="60" cy="60" r="5" fill="#D4B16A" opacity="0.7" />
      </svg>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Thread endpoint icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 24 }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="mx-auto">
            <circle cx="30" cy="30" r="28" stroke="#D4B16A" strokeWidth="2" />
            <circle cx="30" cy="30" r="18" stroke="#D4B16A" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="30" cy="30" r="8" fill="#D4B16A" opacity="0.8" />
            <circle cx="30" cy="30" r="4" fill="var(--dark-brown)" />
          </svg>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-greatVibes text-3xl mb-4"
          style={{ color: 'var(--coffee)' }}
        >
          you've reached the end of the thread
        </motion.p>

        {/* Main title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-playfair font-black leading-none"
          style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            color: 'var(--dark-brown)',
          }}
        >
          Happy Birthday
          <br />
          <span
            style={{
              color: 'var(--gold)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
            }}
          >
            Deeksha
          </span>
          <span style={{ fontSize: '0.6em' }}> 🎂</span>
        </motion.h2>

        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.7 }}
          style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            maxWidth: 400,
            margin: '2.5rem auto',
          }}
        />

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="font-cormorant italic"
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            color: 'var(--dark-brown)',
            lineHeight: 1.8,
            maxWidth: 600,
            margin: '0 auto 4rem',
          }}
        >
          "The memories were never about the places.
          <br />
          They were always about the people."
        </motion.blockquote>

        {/* Collage */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.1 }}
          style={{ marginBottom: '4rem' }}
        >
          <p
            className="font-cormorant italic mb-8 text-xl"
            style={{ color: 'var(--coffee)', opacity: 0.8 }}
          >
            every page, a chapter.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '24px',
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            {IMAGES.map((img, i) => (
              <CollageItem key={i} img={img} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Final footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.6 }}
          style={{ marginTop: '3rem' }}
        >
          <p className="font-greatVibes text-4xl" style={{ color: 'var(--gold)', marginBottom: 12 }}>
            with love ♡
          </p>
          <p
            className="font-inter text-sm tracking-widest uppercase"
            style={{ color: 'var(--coffee)', opacity: 0.6 }}
          >
            The Deeksha Effect — June 2026
          </p>
        </motion.div>
      </div>
    </section>
  )
}
