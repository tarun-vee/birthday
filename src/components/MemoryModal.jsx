import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * MemoryModal — Premium Glassmorphism Viewer
 *
 * Opens a single isolated memory. No navigation between memories.
 * The modal expands from the card's screen position and collapses back on close.
 * Background: backdrop-blurred Memory Lane (the page behind, not a new scene).
 */
export default function MemoryModal({ image, pageTitle, originX, originY, onClose }) {

  // Keyboard close
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // The transform-origin maps the expand/collapse animation to start/end
  // at the exact card position on screen, creating the "pull from thread" feel.
  const transformOrigin = `${originX}px ${originY}px`

  return (
    <>
      {/* ── BACKDROP: frosted warm blur over the Memory Lane ─────────── */}
      <motion.div
        key="glass-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          // Warm cream tint — keeps the page colour temperature, not a dark overlay
          background: 'rgba(239, 228, 210, 0.45)',
          backdropFilter: 'blur(22px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
        }}
      >
        {/* Soft vignette over the blur so focus centres on the modal */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(74,55,40,0.22) 100%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── GLASS PANEL: expands from card origin ────────────────────── */}
      {/* Fixed centering wrapper (not the animated element) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <motion.div
          key="glass-panel"
          // Scale from 0 at the card origin → full size at center
          initial={{ opacity: 0, scale: 0.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.04 }}
          transition={{
            opacity: { duration: 0.32, ease: 'easeOut' },
            scale:   { type: 'spring', stiffness: 340, damping: 32 },
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            // Panel geometry
            width: 'min(90vw, 1600px)',
            height: '90vh',
            maxHeight: '95vh',
            overflowY: 'hidden', // No scrolling, flex layout
            pointerEvents: 'auto',

            // Transform-origin = the card's screen position
            // Makes the panel appear to emerge from that exact spot
            transformOrigin,

            // ── Glassmorphism ──
            background: 'rgba(250, 247, 240, 0.82)',
            backdropFilter: 'blur(36px) saturate(1.9)',
            WebkitBackdropFilter: 'blur(36px) saturate(1.9)',

            // Elegant border & corners
            borderRadius: 22,
            border: '1px solid rgba(212,177,106,0.42)',

            // Layered shadows: depth + glow
            boxShadow: `
              0 0 0 1px rgba(212,177,106,0.14),
              0 2px 0 rgba(255,255,255,0.55) inset,
              0 -1px 0 rgba(139,107,74,0.12) inset,
              0 48px 120px rgba(74,55,40,0.28),
              0 16px 40px rgba(0,0,0,0.14)
            `,

            // Padding — minimal to maximize image area
            padding: '24px 32px 20px',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,

            position: 'relative',
          }}
        >
          {/* ── CLOSE BUTTON ── */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 18,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(74,55,40,0.08)',
              border: '1px solid rgba(212,177,106,0.45)',
              color: 'var(--coffee)',
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
              lineHeight: 1,
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212,177,106,0.25)'
              e.currentTarget.style.borderColor = 'rgba(212,177,106,0.8)'
              e.currentTarget.style.color = 'var(--dark-brown)'
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(74,55,40,0.08)'
              e.currentTarget.style.borderColor = 'rgba(212,177,106,0.45)'
              e.currentTarget.style.color = 'var(--coffee)'
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
            }}
          >
            ✕
          </button>

          {/* ── HEADER: compact single line ── */}
          <div style={{ textAlign: 'center', width: '100%', zIndex: 10 }}>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.4rem)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--dark-brown)',
              lineHeight: 1,
              margin: 0,
            }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 600,
                opacity: 0.7,
                marginRight: 10,
                letterSpacing: '0.15em'
              }}>
                {pageTitle.page}
              </span>
              <span style={{ opacity: 0.4, marginRight: 10 }}>•</span>
              {pageTitle.title}
            </p>
          </div>

          {/* ── SCRAPBOOK PAGE IMAGE — the hero ── */}
          <div
            style={{
              width: '100%',
              flex: 1, // take remaining height
              minHeight: 0, // allow flex child to shrink below intrinsic content size
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              // Slight lift effect — image appears to float above the panel
              filter: 'drop-shadow(0 12px 36px rgba(74,55,40,0.28)) drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
            }}
          >
            <motion.img
              src={image}
              alt={pageTitle.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                // Auto scale while maintaining aspect ratio, bound to flex container
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: 'block',
                // White polaroid-style backing hugs the image perfectly
                background: '#FAFAF6',
                padding: '10px 10px 36px 10px',
                boxShadow: '0 2px 0 rgba(255,255,255,0.9) inset',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* ── CLOSE HINT ── */}
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(10px, 0.9vw, 12px)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--coffee)',
            opacity: 0.45,
            textAlign: 'center',
            margin: 0,
            zIndex: 10,
          }}>
            Click anywhere to return to the journey
          </p>
        </motion.div>
      </div>
    </>
  )
}
