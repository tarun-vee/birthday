import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function MemoryNode({ image, index, rotation, side, onClick }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [hovered, setHovered] = useState(false)

  const isLeft = side === 'left'
  const slideX = isLeft ? -60 : 60

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: slideX, rotate: rotation * 1.5 }}
      animate={isInView
        ? { opacity: 1, x: 0, rotate: hovered ? rotation * 0.3 : rotation }
        : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 * (index % 3) }}
      className="polaroid-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        width: 'clamp(180px, 24vw, 260px)',
        background: '#FAFAFA',
        padding: '12px 12px 44px 12px',
        boxShadow: hovered
          ? '0 24px 56px rgba(74,55,40,0.28), 0 4px 12px rgba(0,0,0,0.12)'
          : '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
        transform: hovered
          ? `rotate(${rotation * 0.3}deg) scale(1.13) translateY(-10px)`
          : `rotate(${rotation}deg) scale(1)`,
        transformOrigin: 'center bottom',
        zIndex: hovered ? 10 : 1,
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Pin / washi tape decoration */}
      <WashiTape index={index} hovered={hovered} />

      {/* Image */}
      <div style={{ overflow: 'hidden', background: '#f0ebe3' }}>
        <img
          src={image}
          alt={`Memory ${index + 1}`}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      </div>

      {/* Polaroid label area */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          textAlign: 'center',
          fontFamily: 'Great Vibes, cursive',
          fontSize: 15,
          color: 'var(--coffee)',
          opacity: 0.8,
          letterSpacing: 0.5,
        }}
      >
        memory {index + 1}
      </div>

      {/* Hover glow */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 2,
            background: 'transparent',
            boxShadow: '0 0 0 2px rgba(212,177,106,0.5)',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  )
}

function WashiTape({ index, hovered }) {
  const styles = [
    { top: -10, left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: 50, height: 18, bg: 'rgba(212,177,106,0.6)' },
    { top: -8, left: '30%', transform: 'rotate(8deg)', width: 44, height: 16, bg: 'rgba(139,107,74,0.45)' },
    { top: -10, left: '55%', transform: 'rotate(-5deg)', width: 48, height: 18, bg: 'rgba(212,177,106,0.5)' },
  ]
  const s = styles[index % 3]
  return (
    <div
      style={{
        position: 'absolute',
        top: s.top,
        left: s.left,
        transform: s.transform,
        width: s.width,
        height: s.height,
        background: s.bg,
        borderRadius: 2,
        transition: 'opacity 0.3s',
        opacity: hovered ? 0.8 : 1,
        zIndex: 5,
      }}
    />
  )
}
