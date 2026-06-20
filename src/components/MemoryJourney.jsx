import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import MemoryModal from './MemoryModal'

// ─── Dynamic image import ──────────────────────────────────────────────────
const pageModules = import.meta.glob('../assets/pages/page*.png', { eager: true })
const IMAGES = Object.keys(pageModules)
  .sort((a, b) => {
    const numA = parseInt(a.match(/page(\d+)\.png/)?.[1] ?? '0')
    const numB = parseInt(b.match(/page(\d+)\.png/)?.[1] ?? '0')
    return numA - numB
  })
  .map(k => pageModules[k].default)

// ─── Chapter titles ────────────────────────────────────────────────────────
export const PAGE_TITLES = [
  { page: 'Page 1', title: 'THE DEEKSHA EFFECT' },
  { page: 'Page 2', title: 'WHO IS DEEKSHA?' },
  { page: 'Page 3', title: 'WHY ARE WE SCARED OF DEEKSHA?' },
  { page: 'Page 4', title: 'THE SMILE' },
  { page: 'Page 5', title: "THE PLACES WE WOULDN'T HAVE GONE" },
  { page: 'Page 6', title: 'PROJECT MANAGER' },
  { page: 'Page 7', title: 'DEEKSHA STARTER PACK' },
  { page: 'Page 8', title: 'THE EFFECT CONTINUES' },
  { page: 'Page 9', title: 'HAPPY BIRTHDAY' },
]

// ─── ViewBox ───────────────────────────────────────────────────────────────
const VB_W = 1000
const VB_H = 3200

// ─── Thread path ───────────────────────────────────────────────────────────
const THREAD_PATH = `
  M 500 50
  C 720 140, 800 220, 700 320
  C 600 420, 350 490, 250 580
  C 150 670, 180 750, 350 840
  C 520 930, 800 1000, 820 1160
  C 840 1320, 550 1400, 350 1500
  C 150 1600, 120 1720, 280 1840
  C 440 1960, 780 2040, 820 2200
  C 860 2360, 500 2480, 350 2580
  C 200 2680, 350 2880, 500 2980
  C 500 3060, 500 3130, 500 3180
`

// ─── Node definitions ──────────────────────────────────────────────────────
const NODES = [
  { threadX: 720, threadY: 181, cardX: 865, cardY: 148, side: 'right', connector: 'pin',    rotation: -4 },
  { threadX: 475, threadY: 454, cardX: 290, cardY: 420, side: 'left',  connector: 'tape',   rotation:  5 },
  { threadX: 199, threadY: 710, cardX: 372, cardY: 676, side: 'right', connector: 'string', rotation: -6 },
  { threadX: 641, threadY: 974, cardX: 800, cardY: 940, side: 'right', connector: 'clip',   rotation:  3 },
  { threadX: 668, threadY:1353, cardX: 492, cardY:1320, side: 'left',  connector: 'pin',    rotation: -5 },
  { threadX: 180, threadY:1663, cardX: 360, cardY:1630, side: 'right', connector: 'tape',   rotation:  4 },
  { threadX: 595, threadY:2005, cardX: 762, cardY:1971, side: 'right', connector: 'string', rotation: -3 },
  { threadX: 656, threadY:2413, cardX: 490, cardY:2379, side: 'left',  connector: 'clip',   rotation:  6 },
  { threadX: 313, threadY:2780, cardX: 490, cardY:2746, side: 'right', connector: 'pin',    rotation: -4 },
]

// ─── Decorative elements ───────────────────────────────────────────────────
const DECORATIONS = [
  { type: 'star',   x: 370, y: 330,  size: 22, rotation: 18  },
  { type: 'doodle', x: 550, y: 310,  variant: 'heart'        },
  { type: 'tape',   x: 610, y: 572,  width: 100, height: 26, rotation: -12 },
  { type: 'star',   x: 120, y: 630,  size: 16, rotation: -8  },
  { type: 'flower', x: 720, y: 840,  size: 26                },
  { type: 'arrow',  x: 440, y: 880,  rotation: 15            },
  { type: 'note',   x: 250, y: 1155                          },
  { type: 'tape',   x: 840, y: 1200, width: 85, height: 22, rotation: 8 },
  { type: 'arrow',  x: 540, y: 1495, rotation: -20           },
  { type: 'star',   x: 820, y: 1520, size: 18, rotation: 30  },
  { type: 'scrap',  x: 680, y: 1830, width: 120, height: 70, rotation: -6 },
  { type: 'flower', x: 140, y: 1870, size: 20                },
  { type: 'star',   x: 380, y: 2190, size: 20, rotation: -25 },
  { type: 'doodle', x: 870, y: 2220, variant: 'spiral'       },
  { type: 'tape',   x: 290, y: 2570, width: 90, height: 24, rotation: 16  },
  { type: 'note',   x: 680, y: 2610                          },
]

// ─── Star shape ───────────────────────────────────────────────────────────
function StarShape({ x, y, r, rotation = 0, opacity = 0.45 }) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const ang = (i * 36 - 90) * Math.PI / 180
    const rad = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(x + rad * Math.cos(ang)).toFixed(1)},${(y + rad * Math.sin(ang)).toFixed(1)}`)
  }
  return (
    <polygon points={pts.join(' ')} fill="rgba(212,177,106,0.28)"
      stroke="#8B6B4A" strokeWidth="1.8" opacity={opacity}
      transform={`rotate(${rotation} ${x} ${y})`} />
  )
}

// ─── Decoration renderer ──────────────────────────────────────────────────
function DecorationElement({ dec, idx }) {
  const { type, x, y } = dec
  const opacity = 0.42
  if (type === 'star') return <StarShape x={x} y={y} r={dec.size||18} rotation={dec.rotation} opacity={opacity} />
  if (type === 'tape') return (
    <g opacity={opacity} transform={`rotate(${dec.rotation||0} ${x} ${y})`}>
      <rect x={x-(dec.width||80)/2} y={y-(dec.height||22)/2} width={dec.width||80} height={dec.height||22} rx="4"
        fill="rgba(212,177,106,0.55)" stroke="rgba(139,107,74,0.5)" strokeWidth="1.2"/>
      <line x1={x-(dec.width||80)*0.25} y1={y-(dec.height||22)/2} x2={x-(dec.width||80)*0.25} y2={y+(dec.height||22)/2}
        stroke="rgba(74,55,40,0.25)" strokeWidth="1.5"/>
      <line x1={x+(dec.width||80)*0.25} y1={y-(dec.height||22)/2} x2={x+(dec.width||80)*0.25} y2={y+(dec.height||22)/2}
        stroke="rgba(74,55,40,0.25)" strokeWidth="1.5"/>
    </g>
  )
  if (type === 'flower') return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {[0,60,120,180,240,300].map(ang => (
        <ellipse key={ang} cx={0} cy={-(dec.size||22)} rx={(dec.size||22)*0.36} ry={(dec.size||22)*0.9}
          fill="rgba(212,177,106,0.22)" stroke="#8B6B4A" strokeWidth="1.2" transform={`rotate(${ang})`}/>
      ))}
      <circle cx={0} cy={0} r={(dec.size||22)*0.32} fill="#D4B16A" opacity="0.65"/>
    </g>
  )
  if (type === 'arrow') return (
    <g opacity={opacity} transform={`rotate(${dec.rotation||0} ${x} ${y})`}>
      <path d={`M ${x-44} ${y+8} Q ${x-10} ${y-28} ${x+44} ${y}`}
        fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round"/>
      <path d={`M ${x+28} ${y-14} L ${x+44} ${y} L ${x+30} ${y+10}`}
        fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  )
  if (type === 'note') return (
    <g opacity={opacity} transform={`rotate(-4 ${x} ${y})`}>
      <rect x={x-58} y={y-42} width={116} height={84} rx="3" fill="rgba(0,0,0,0.07)" transform="translate(3,3)"/>
      <rect x={x-58} y={y-42} width={116} height={84} rx="3" fill="rgba(255,249,232,0.92)" stroke="#C09A4E" strokeWidth="1.5"/>
      <line x1={x-36} y1={y-42} x2={x-36} y2={y+42} stroke="rgba(210,80,80,0.4)" strokeWidth="1.5"/>
      {[-22,-7,8,23].map(dy=>(
        <line key={dy} x1={x-28} y1={y+dy} x2={x+48} y2={y+dy} stroke="#C09A4E" strokeWidth="0.9" opacity="0.55"/>
      ))}
      <path d={`M ${x-24} ${y-22} Q ${x+5} ${y-28} ${x+28} ${y-22}`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
      <path d={`M ${x-24} ${y-7} Q ${x+8} ${y-11} ${x+35} ${y-7}`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
      <path d={`M ${x-24} ${y+8} Q ${x} ${y+4} ${x+20} ${y+8}`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
    </g>
  )
  if (type === 'scrap') return (
    <g opacity={opacity} transform={`rotate(${dec.rotation||0} ${x} ${y})`}>
      <rect x={x-(dec.width||110)/2} y={y-(dec.height||65)/2} width={dec.width||110} height={dec.height||65} rx="4"
        fill="rgba(239,228,210,0.88)" stroke="#8B6B4A" strokeWidth="1.5" strokeDasharray="5 2.5"/>
      <line x1={x-(dec.width||110)/2+14} y1={y-12} x2={x+(dec.width||110)/2-14} y2={y-12} stroke="#C09A4E" strokeWidth="1"/>
      <line x1={x-(dec.width||110)/2+14} y1={y+5} x2={x+(dec.width||110)/2-25} y2={y+5} stroke="#C09A4E" strokeWidth="1"/>
    </g>
  )
  if (type === 'doodle') {
    if (dec.variant === 'heart') return (
      <g opacity={opacity} transform={`translate(${x} ${y})`}>
        <path d="M0,8 C-18,-10 -38,2 -24,20 C-12,34 0,40 0,40 C0,40 12,34 24,20 C38,2 18,-10 0,8Z"
          fill="rgba(212,177,106,0.3)" stroke="#8B6B4A" strokeWidth="2" transform="scale(0.65)"/>
      </g>
    )
    if (dec.variant === 'spiral') return (
      <g opacity={opacity}>
        <path d={`M ${x} ${y} Q ${x+20} ${y-20} ${x+30} ${y} Q ${x+20} ${y+20} ${x} ${y+10} Q ${x-10} ${y} ${x-5} ${y-12} Q ${x+5} ${y-20} ${x+15} ${y-15}`}
          fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    )
  }
  return null
}

// ─── SVG Connector ────────────────────────────────────────────────────────
function ConnectorElements({ node }) {
  const { threadX: tx, threadY: ty, cardX: cx, cardY: cy, side, connector } = node
  const edgeX = side === 'right' ? cx - 120 : cx + 120
  const edgeY = cy + 6
  return (
    <g>
      {connector === 'string'
        ? <path d={`M ${tx} ${ty} Q ${(tx+edgeX)/2} ${Math.max(ty,cy)+60} ${edgeX} ${edgeY}`}
            stroke="#7A5C38" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.88"/>
        : <line x1={tx} y1={ty} x2={edgeX} y2={edgeY}
            stroke="#7A5C38" strokeWidth="4" strokeLinecap="round" opacity="0.88"/>
      }
      {connector === 'pin' && (
        <g>
          <circle cx={tx} cy={ty} r={24} fill="rgba(212,177,106,0.15)"/>
          <circle cx={tx} cy={ty} r={14} fill="#D4B16A"/>
          <circle cx={tx} cy={ty} r={9}  fill="#C09440"/>
          <circle cx={tx} cy={ty} r={4}  fill="#4A3728"/>
          <circle cx={tx-4} cy={ty-4} r={2.5} fill="rgba(255,255,255,0.5)"/>
        </g>
      )}
      {connector === 'tape' && (
        <g transform={`rotate(${connector === 'tape' ? -14 : 16} ${tx} ${ty})`}>
          <rect x={tx-48} y={ty-16} width={96} height={32} rx="5" fill="#D4B16A" opacity="0.6"/>
          <line x1={tx-32} y1={ty-16} x2={tx-32} y2={ty+16} stroke="rgba(74,55,40,0.28)" strokeWidth="2"/>
          <line x1={tx+32} y1={ty-16} x2={tx+32} y2={ty+16} stroke="rgba(74,55,40,0.28)" strokeWidth="2"/>
        </g>
      )}
      {connector === 'clip' && (
        <path d={`M ${tx-10} ${ty-28} L ${tx-10} ${ty+20} Q ${tx-10} ${ty+32} ${tx} ${ty+32} Q ${tx+10} ${ty+32} ${tx+10} ${ty+20} L ${tx+10} ${ty-14} Q ${tx+10} ${ty-28} ${tx} ${ty-28} Q ${tx-4} ${ty-28} ${tx-4} ${ty-14} L ${tx-4} ${ty+16} Q ${tx-4} ${ty+22} ${tx} ${ty+22} Q ${tx+4} ${ty+22} ${tx+4} ${ty+16} L ${tx+4} ${ty-14}`}
          fill="none" stroke="#8B6B4A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {connector === 'string' && (
        <g>
          <circle cx={tx} cy={ty} r={12} fill="rgba(139,107,74,0.22)"/>
          <circle cx={tx} cy={ty} r={7}  fill="#7A5C38"/>
          <circle cx={tx} cy={ty} r={3}  fill="#4A3728"/>
        </g>
      )}
      <circle cx={edgeX} cy={edgeY} r={9} fill="rgba(212,177,106,0.35)"/>
      <circle cx={edgeX} cy={edgeY} r={5} fill="#D4B16A" opacity="0.9"/>
    </g>
  )
}

// ─── Polaroid Memory Card ──────────────────────────────────────────────────
function PolaroidCard({ node, image, index, pageTitle, onOpenModal }) {
  const [hovered, setHovered] = useState(false)
  const { cardX, cardY, rotation } = node
  const leftPct = (cardX / VB_W) * 100
  const topPct  = (cardY / VB_H) * 100

  const handleClick = useCallback((e) => {
    // Capture the card's screen center for origin animation
    const rect = e.currentTarget.getBoundingClientRect()
    const originX = rect.left + rect.width / 2
    const originY = rect.top + rect.height / 2
    onOpenModal(index, originX, originY)
  }, [index, onOpenModal])

  return (
    <div
      style={{
        position: 'absolute',
        left:   `${leftPct}%`,
        top:    `${topPct}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: hovered ? 20 : 5,
        width: 'clamp(240px, 26vw, 430px)',
      }}
    >
      {/* Entrance animation wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82, rotate: rotation * 2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      >
        {/* Card */}
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: rotation * 0.15,
            y: -14,
            transition: { duration: 0.26, ease: [0.23, 1, 0.32, 1] },
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={handleClick}
          style={{
            background: '#FAF9F6',
            padding: '12px 12px 48px 12px',
            boxShadow: hovered
              ? '0 32px 70px rgba(74,55,40,0.38), 0 10px 24px rgba(0,0,0,0.16)'
              : '0 12px 32px rgba(74,55,40,0.22), 0 4px 10px rgba(0,0,0,0.10)',
            cursor: 'pointer',
            transformOrigin: 'center bottom',
            width: '100%',
            position: 'relative',
            filter: hovered
              ? 'drop-shadow(0 0 18px rgba(212,177,106,0.5))'
              : 'drop-shadow(0 3px 6px rgba(0,0,0,0.10))',
            transition: 'box-shadow 0.28s ease, filter 0.28s ease',
          }}
        >
          <div style={{ overflow: 'hidden', background: '#ede8df', lineHeight: 0 }}>
            <motion.img
              src={image}
              alt={pageTitle.title}
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Gold inset glow on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', inset: 0,
              boxShadow: 'inset 0 0 0 2px rgba(212,177,106,0.65)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>

        {/* Chapter label — below the polaroid */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0.62, y: hovered ? 0 : 3 }}
          transition={{ duration: 0.25 }}
          style={{
            textAlign: 'center',
            marginTop: 14,
            padding: '0 8px',
            pointerEvents: 'none',
          }}
        >
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(10px, 0.9vw, 13px)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--coffee)',
            opacity: 0.65,
            marginBottom: 4,
          }}>
            {pageTitle.page}
          </p>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(11px, 1vw, 14px)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--dark-brown)',
            lineHeight: 1.3,
          }}>
            {pageTitle.title}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function MemoryJourney() {
  const containerRef = useRef(null)
  const measureRef   = useRef(null)
  const [pathLength, setPathLength] = useState(10000)
  // modal: { open, index, originX (px), originY (px) }
  const [modal, setModal] = useState({ open: false, index: 0, originX: 0, originY: 0 })

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset: ['start start', 'end end'],
  })
  const dashOffset = useTransform(scrollYProgress, [0, 0.94], [pathLength, 0])

  useEffect(() => {
    if (measureRef.current) setPathLength(measureRef.current.getTotalLength())
  }, [])

  const handleOpenModal = useCallback((index, originX, originY) => {
    setModal({ open: true, index, originX, originY })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModal(m => ({ ...m, open: false }))
  }, [])

  return (
    <>
      <section
        ref={containerRef}
        className="relative w-full torn-edge-top"
        style={{
          height: `${(VB_H / VB_W) * 100}vw`,
          background: 'var(--bg)',
          overflow: 'visible',
        }}
      >
        {/* Central warm wash */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '12%', right: '12%',
          background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(212,177,106,0.055) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Section header */}
        <div style={{ position: 'absolute', top: '1.2%', left: 0, right: 0, textAlign: 'center', zIndex: 30, pointerEvents: 'none' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'Great Vibes, cursive', fontSize: 'clamp(2rem, 4vw, 3.8rem)', color: 'var(--coffee)' }}
          >
            Follow the thread...
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{ height: 1.5, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', maxWidth: 180, margin: '10px auto 0' }}
          />
        </div>

        {/* SVG: thread + connectors + decorations */}
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="threadGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#F0D080"/>
              <stop offset="30%"  stopColor="#D4B16A"/>
              <stop offset="60%"  stopColor="#B8924A"/>
              <stop offset="100%" stopColor="#D4B16A"/>
            </linearGradient>
            <filter id="threadGlow3" x="-60%" y="-20%" width="220%" height="140%">
              <feGaussianBlur stdDeviation="10" result="blur1"/>
              <feGaussianBlur stdDeviation="4" result="blur2" in="SourceGraphic"/>
              <feMerge>
                <feMergeNode in="blur1"/>
                <feMergeNode in="blur2"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path ref={measureRef} d={THREAD_PATH} fill="none" stroke="transparent" strokeWidth="1"/>
          {/* Glow layers */}
          <path d={THREAD_PATH} fill="none" stroke="rgba(212,177,106,0.12)" strokeWidth="60" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={THREAD_PATH} fill="none" stroke="rgba(212,177,106,0.22)" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"/>
          <path d={THREAD_PATH} fill="none" stroke="rgba(240,208,128,0.18)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Decorations */}
          {DECORATIONS.map((dec, i) => <DecorationElement key={`dec-${i}`} dec={dec} idx={i}/>)}
          {/* Connectors */}
          {NODES.map((node, i) => <ConnectorElements key={`conn-${i}`} node={node} index={i}/>)}
          {/* Main animated thread */}
          <motion.path d={THREAD_PATH} fill="none" stroke="url(#threadGrad3)"
            strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"
            filter="url(#threadGlow3)" strokeDasharray={pathLength}
            style={{ strokeDashoffset: dashOffset }}/>
          {/* Start/end medallions */}
          <circle cx="500" cy="50"   r="14" fill="#D4B16A" opacity="0.95"/>
          <circle cx="500" cy="50"   r="8"  fill="#4A3728"/>
          <circle cx="500" cy="50"   r="3"  fill="#D4B16A" opacity="0.8"/>
          <circle cx="500" cy="3180" r="14" fill="#D4B16A" opacity="0.75"/>
          <circle cx="500" cy="3180" r="8"  fill="#4A3728" opacity="0.75"/>
        </svg>

        {/* Memory cards */}
        {IMAGES.map((img, i) => {
          const node = NODES[i]
          if (!node) return null
          return (
            <PolaroidCard
              key={i}
              node={node}
              image={img}
              index={i}
              pageTitle={PAGE_TITLES[i]}
              onOpenModal={handleOpenModal}
            />
          )
        })}
      </section>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <MemoryModal
            key="modal"
            image={IMAGES[modal.index]}
            pageTitle={PAGE_TITLES[modal.index]}
            originX={modal.originX}
            originY={modal.originY}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  )
}
