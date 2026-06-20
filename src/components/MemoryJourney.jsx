import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
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

// ─── Configuration ──────────────────────────────────────────────────────────
const DESKTOP_VB_W = 1000

// We define the logical memory sequence.
// The side dictates where the card is placed relative to the center.
// The thread will automatically weave to the OPPOSITE side.
const JOURNEY_STOPS = [
  { side: 'right', tyRaw: 350,  connector: 'pin',    rotation: -4 },
  { side: 'left',  tyRaw: 650,  connector: 'tape',   rotation:  5 },
  { side: 'right', tyRaw: 950,  connector: 'string', rotation: -6 },
  { side: 'left',  tyRaw: 1250, connector: 'clip',   rotation:  3 },
  { side: 'right', tyRaw: 1580, connector: 'pin',    rotation: -5 },
  { side: 'left',  tyRaw: 1880, connector: 'tape',   rotation:  4 },
  { side: 'right', tyRaw: 2220, connector: 'string', rotation: -3 },
  { side: 'left',  tyRaw: 2580, connector: 'clip',   rotation:  6 },
  { side: 'right', tyRaw: 2950, connector: 'pin',    rotation: -4 },
]

const DESKTOP_VB_H = 3500

const DECORATIONS = [
  { type: 'star',   x: 370, y: 530,  size: 22, rotation: 18  },
  { type: 'doodle', x: 550, y: 510,  variant: 'heart'        },
  { type: 'tape',   x: 610, y: 772,  width: 100, height: 26, rotation: -12 },
  { type: 'star',   x: 120, y: 830,  size: 16, rotation: -8  },
  { type: 'flower', x: 720, y: 1040, size: 26                },
  { type: 'arrow',  x: 440, y: 1080, rotation: 15            },
  { type: 'note',   x: 250, y: 1355                          },
  { type: 'tape',   x: 840, y: 1400, width: 85, height: 22, rotation: 8 },
  { type: 'arrow',  x: 540, y: 1695, rotation: -20           },
  { type: 'star',   x: 820, y: 1720, size: 18, rotation: 30  },
  { type: 'scrap',  x: 680, y: 2030, width: 120, height: 70, rotation: -6 },
  { type: 'flower', x: 140, y: 2070, size: 20                },
  { type: 'star',   x: 380, y: 2390, size: 20, rotation: -25 },
  { type: 'doodle', x: 870, y: 2420, variant: 'spiral'       },
  { type: 'tape',   x: 290, y: 2770, width: 90, height: 24, rotation: 16  },
  { type: 'note',   x: 680, y: 2810                          },
]

// ─── Generative Thread Logic ──────────────────────────────────────────────
function generateElegantThread(nodes) {
  if (nodes.length === 0) return ''
  
  // Start the thread slightly above the first node and centered
  let path = `M 500 50 `
  path += `C 500 150, ${nodes[0].tx} ${nodes[0].ty - 100}, ${nodes[0].tx} ${nodes[0].ty} `
  
  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i]
    const next = nodes[i+1]
    
    const dy = next.ty - curr.ty
    
    // Standard elegant S-curve connecting the points
    let cp1x = curr.tx
    let cp1y = curr.ty + dy * 0.4
    let cp2x = next.tx
    let cp2y = next.ty - dy * 0.4
    
    // Thread Landmarks! (Handcrafted curated moments)
    if (i === 1) {
      // Gentle loop around the second memory
      // We push the control points past each other horizontally
      cp1x = curr.tx - 250
      cp1y = curr.ty + dy * 0.6
      cp2x = next.tx + 250
      cp2y = next.ty - dy * 0.6
    }
    
    if (i === 4) {
      // Wider sweep before important section
      cp1x = curr.tx > 500 ? 950 : 50
      cp2x = next.tx > 500 ? 950 : 50
    }
    
    if (i === 7) {
      // Elegant turn approaching final destination
      cp1y = curr.ty + dy * 0.7
      cp2y = next.ty - dy * 0.1
    }
    
    path += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.tx.toFixed(1)} ${next.ty.toFixed(1)} `
  }
  
  // End the thread elegantly towards the final destination (Happy Birthday)
  const lastNode = nodes[nodes.length - 1]
  path += `C ${lastNode.tx} ${lastNode.ty + 100}, 500 ${lastNode.ty + 250}, 500 ${lastNode.ty + 400}`
  
  return path
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function StarShape({ x, y, r, rotation = 0, opacity = 0.45 }) {
  const pts = []
  for (let i = 0; i < 10; i++) {
    const ang = (i * 36 - 90) * Math.PI / 180
    const rad = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(rad * Math.cos(ang)).toFixed(1)},${(rad * Math.sin(ang)).toFixed(1)}`)
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <polygon points={pts.join(' ')} fill="rgba(212,177,106,0.28)"
        stroke="#8B6B4A" strokeWidth="1.8" opacity={opacity} />
    </g>
  )
}

function DecorationElement({ dec, svgScale, stretchY, squeezeX }) {
  const yCoord = dec.y * stretchY
  const xCoord = 500 + (dec.x - 500) * squeezeX
  const opacity = 0.42
  
  return (
    <g transform={`translate(${xCoord} ${yCoord}) scale(${svgScale})`}>
      {dec.type === 'star' && <StarShape x={0} y={0} r={dec.size||18} rotation={dec.rotation} opacity={opacity} />}
      
      {dec.type === 'tape' && (
        <g opacity={opacity} transform={`rotate(${dec.rotation||0})`}>
          <rect x={-(dec.width||80)/2} y={-(dec.height||22)/2} width={dec.width||80} height={dec.height||22} rx="4"
            fill="rgba(212,177,106,0.55)" stroke="rgba(139,107,74,0.5)" strokeWidth="1.2"/>
          <line x1={-(dec.width||80)*0.25} y1={-(dec.height||22)/2} x2={-(dec.width||80)*0.25} y2={(dec.height||22)/2}
            stroke="rgba(74,55,40,0.25)" strokeWidth="1.5"/>
          <line x1={(dec.width||80)*0.25} y1={-(dec.height||22)/2} x2={(dec.width||80)*0.25} y2={(dec.height||22)/2}
            stroke="rgba(74,55,40,0.25)" strokeWidth="1.5"/>
        </g>
      )}

      {dec.type === 'flower' && (
        <g opacity={opacity}>
          {[0,60,120,180,240,300].map(ang => (
            <ellipse key={ang} cx={0} cy={-(dec.size||22)} rx={(dec.size||22)*0.36} ry={(dec.size||22)*0.9}
              fill="rgba(212,177,106,0.22)" stroke="#8B6B4A" strokeWidth="1.2" transform={`rotate(${ang})`}/>
          ))}
          <circle cx={0} cy={0} r={(dec.size||22)*0.32} fill="#D4B16A" opacity="0.65"/>
        </g>
      )}

      {dec.type === 'arrow' && (
        <g opacity={opacity} transform={`rotate(${dec.rotation||0})`}>
          <path d={`M -44 8 Q -10 -28 44 0`} fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round"/>
          <path d={`M 28 -14 L 44 0 L 30 10`} fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}

      {dec.type === 'note' && (
        <g opacity={opacity} transform={`rotate(-4)`}>
          <rect x={-58} y={-42} width={116} height={84} rx="3" fill="rgba(0,0,0,0.07)" transform="translate(3,3)"/>
          <rect x={-58} y={-42} width={116} height={84} rx="3" fill="rgba(255,249,232,0.92)" stroke="#C09A4E" strokeWidth="1.5"/>
          <line x1={-36} y1={-42} x2={-36} y2={42} stroke="rgba(210,80,80,0.4)" strokeWidth="1.5"/>
          {[-22,-7,8,23].map(dy=>(
            <line key={dy} x1={-28} y1={dy} x2={48} y2={dy} stroke="#C09A4E" strokeWidth="0.9" opacity="0.55"/>
          ))}
          <path d={`M -24 -22 Q 5 -28 28 -22`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
          <path d={`M -24 -7 Q 8 -11 35 -7`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
          <path d={`M -24 8 Q 0 4 20 8`} fill="none" stroke="#4A3728" strokeWidth="2" opacity="0.4"/>
        </g>
      )}

      {dec.type === 'scrap' && (
        <g opacity={opacity} transform={`rotate(${dec.rotation||0})`}>
          <rect x={-(dec.width||110)/2} y={-(dec.height||65)/2} width={dec.width||110} height={dec.height||65} rx="4"
            fill="rgba(239,228,210,0.88)" stroke="#8B6B4A" strokeWidth="1.5" strokeDasharray="5 2.5"/>
          <line x1={-(dec.width||110)/2+14} y1={-12} x2={(dec.width||110)/2-14} y2={-12} stroke="#C09A4E" strokeWidth="1"/>
          <line x1={-(dec.width||110)/2+14} y1={5} x2={(dec.width||110)/2-25} y2={5} stroke="#C09A4E" strokeWidth="1"/>
        </g>
      )}

      {dec.type === 'doodle' && dec.variant === 'heart' && (
        <g opacity={opacity} transform="scale(0.65)">
          <path d="M0,8 C-18,-10 -38,2 -24,20 C-12,34 0,40 0,40 C0,40 12,34 24,20 C38,2 18,-10 0,8Z"
            fill="rgba(212,177,106,0.3)" stroke="#8B6B4A" strokeWidth="2"/>
        </g>
      )}

      {dec.type === 'doodle' && dec.variant === 'spiral' && (
        <g opacity={opacity}>
          <path d={`M 0 0 Q 20 -20 30 0 Q 20 20 0 10 Q -10 0 -5 -12 Q 5 -20 15 -15`}
            fill="none" stroke="#8B6B4A" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      )}
    </g>
  )
}

function AttachmentElement({ type, side, htmlScale }) {
  // If card is on the right, thread is on the left, so attachment must be on the LEFT edge.
  const isLeftEdge = side === 'right'
  const offset = '-3.5%' // slight outer push so it perfectly overlaps the border

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      [isLeftEdge ? 'left' : 'right']: offset,
      transform: `translate(${isLeftEdge ? '-50%' : '50%'}, -50%) scale(${1 / htmlScale})`, 
      // We invert the htmlScale slightly to keep pins from becoming microscopic, 
      // but they are physically bound to the DOM hierarchy so they move perfectly.
      zIndex: 30,
      pointerEvents: 'none'
    }}>
      <div style={{ transform: `scale(${htmlScale < 0.6 ? 0.7 : 1})` }}>
        {type === 'pin' && (
          <svg width="48" height="48" viewBox="-24 -24 48 48">
            <circle cx={0} cy={0} r={20} fill="rgba(0,0,0,0.15)"/>
            <circle cx={0} cy={0} r={14} fill="#D4B16A"/>
            <circle cx={0} cy={0} r={9}  fill="#C09440"/>
            <circle cx={0} cy={0} r={4}  fill="#4A3728"/>
            <circle cx={-4} cy={-4} r={2.5} fill="rgba(255,255,255,0.5)"/>
          </svg>
        )}
        {type === 'tape' && (
          <svg width="96" height="32" viewBox="-48 -16 96 32" style={{ transform: `rotate(${isLeftEdge ? -14 : 16}deg)` }}>
            <rect x={-40} y={-14} width={80} height={28} rx="3" fill="rgba(0,0,0,0.1)"/>
            <rect x={-48} y={-16} width={96} height={32} rx="5" fill="#D4B16A" opacity="0.9"/>
            <line x1={-32} y1={-16} x2={-32} y2={16} stroke="rgba(74,55,40,0.3)" strokeWidth="2"/>
            <line x1={32} y1={-16} x2={32} y2={16} stroke="rgba(74,55,40,0.3)" strokeWidth="2"/>
          </svg>
        )}
        {type === 'clip' && (
          <svg width="24" height="64" viewBox="-12 -32 24 64" style={{ transform: `rotate(${isLeftEdge ? -5 : 5}deg)` }}>
            <path d={`M -10 -28 L -10 20 Q -10 32 0 32 Q 10 32 10 20 L 10 -14 Q 10 -28 0 -28 Q -4 -28 -4 -14 L -4 16 Q -4 22 0 22 Q 4 22 4 16 L 4 -14`}
              fill="none" stroke="#8B6B4A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {type === 'string' && (
          <svg width="24" height="24" viewBox="-12 -12 24 24">
            <circle cx={0} cy={0} r={9} fill="rgba(212,177,106,0.8)"/>
            <circle cx={0} cy={0} r={5} fill="#D4B16A"/>
          </svg>
        )}
      </div>
    </div>
  )
}

function ConnectorBranch({ node }) {
  const { tx, ty, edgeX, edgeY, svgScale } = node

  // Draw a gentle curved wire from the main thread to the exact card edge
  return (
    <g>
      <path 
        d={`M ${tx} ${ty} Q ${(tx+edgeX)/2} ${ty + 25 * svgScale} ${edgeX} ${edgeY}`}
        stroke="#7A5C38" strokeWidth={3.5 * svgScale} fill="none" strokeLinecap="round" opacity="0.85"
      />
    </g>
  )
}

function PolaroidCard({ node, image, index, pageTitle, onOpenModal, vbW, vbH, cardBaseWidthPhysical, cardScale }) {
  const [hovered, setHovered] = useState(false)
  const { cardX, cardY, rotation, connector, side } = node
  const leftPct = (cardX / vbW) * 100
  const topPct  = (cardY / vbH) * 100

  const handleClick = useCallback((e) => {
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
        width: cardBaseWidthPhysical,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: cardScale * 0.82, rotate: rotation * 2 }}
        whileInView={{ opacity: 1, scale: cardScale, rotate: rotation }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
        style={{ position: 'relative' }}
      >
        <AttachmentElement type={connector} side={side} htmlScale={cardScale} />

        <motion.div
          whileHover={{
            scale: 1.05,
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
              loading="lazy"
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4 }}
            />
          </div>

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

        <motion.div
          animate={{ opacity: hovered ? 1 : 0.8, y: hovered ? 0 : 3 }}
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
            fontSize: 'clamp(12px, 1.2vw, 15px)',
            fontWeight: 800,
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

export default function MemoryJourney() {
  const containerRef = useRef(null)
  const measureRef   = useRef(null)
  const [pathLength, setPathLength] = useState(10000)
  const [modal, setModal] = useState({ open: false, index: 0, originX: 0, originY: 0 })
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)

  useEffect(() => {
    const handleResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 1. Core Responsive Parameters
  const STRETCH_Y = vw < 768 ? 1.8 : vw < 1024 ? 1.4 : 1;
  const SQUEEZE_X = vw < 768 ? 0.35 : vw < 1024 ? 0.6 : 1;
  const SVG_SCALE = vw < 768 ? 2.5 : vw < 1024 ? 1.5 : 1;

  // 2. Physical Card Dimensions & Scaling
  const cardBaseWidthPhysical = vw < 768 ? Math.max(220, Math.min(vw * 0.65, 300)) :
                                vw < 1024 ? Math.max(240, Math.min(vw * 0.4, 380)) :
                                Math.max(240, Math.min(vw * 0.26, 430));

  const cardScale = vw < 380 ? 0.50 :
                    vw < 500 ? 0.55 :
                    vw < 768 ? 0.65 :
                    vw < 1024 ? 0.75 :
                    vw < 1366 ? 0.85 :
                    vw < 1600 ? 0.95 : 1;

  // 3. Convert physical size to exact SVG coordinates
  const visualCardWidthPhysical = cardBaseWidthPhysical * cardScale;
  const edgeOffsetSvg = (visualCardWidthPhysical / vw) * 1000 / 2;

  // 4. Mathematically compute node positions guaranteeing 0% overflow and perfect attachment
  const activeNodes = useMemo(() => {
    return JOURNEY_STOPS.map(stop => {
      // Base vertical positioning
      const ty = stop.tyRaw * STRETCH_Y
      const cy = ty
      
      // Thread Weave Positioning (Thread sweeps to opposite side of card)
      const baseThreadSpread = 220
      const threadOffset = baseThreadSpread * SQUEEZE_X
      const tx = stop.side === 'right' ? 500 - threadOffset : 500 + threadOffset
      
      const desiredConnLen = 140 * SVG_SCALE
      let desiredEdgeX = stop.side === 'right' ? tx + desiredConnLen : tx - desiredConnLen
      let desiredCardX = stop.side === 'right' ? desiredEdgeX + edgeOffsetSvg : desiredEdgeX - edgeOffsetSvg
      
      const screenMargin = 40; // visual padding
      const minCardX = edgeOffsetSvg + screenMargin;
      const maxCardX = 1000 - edgeOffsetSvg - screenMargin;
      
      let finalCardX = Math.min(Math.max(desiredCardX, minCardX), maxCardX);
      
      // Compute absolute matching edge in SVG space mapping directly to the HTML card border
      let actualEdgeX = stop.side === 'right' ? finalCardX - edgeOffsetSvg : finalCardX + edgeOffsetSvg;
      
      return {
        ...stop,
        tx, ty,
        cardX: finalCardX,
        cardY: cy,
        edgeX: actualEdgeX,
        edgeY: cy,
        svgScale: SVG_SCALE
      }
    })
  }, [SQUEEZE_X, STRETCH_Y, SVG_SCALE, edgeOffsetSvg])

  // 5. Generate Thread Path dynamically from the responsive nodes
  const activePath = useMemo(() => {
    return generateElegantThread(activeNodes)
  }, [activeNodes])

  const vbW = DESKTOP_VB_W
  const vbH = DESKTOP_VB_H * STRETCH_Y

  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset: ['start start', 'end end'],
  })
  const dashOffset = useTransform(scrollYProgress, [0, 0.94], [pathLength, 0])

  useEffect(() => {
    if (measureRef.current) {
      setPathLength(measureRef.current.getTotalLength())
    }
  }, [vw, activePath])

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
          height: `${(vbH / vbW) * 100}vw`,
          background: 'var(--bg)',
          overflow: 'visible',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '5%', right: '5%',
          background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(212,177,106,0.055) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

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

        <svg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="none"
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
              <feGaussianBlur stdDeviation="8" result="blur1"/>
              <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#4A3728" floodOpacity="0.3" result="shadow"/>
              <feMerge>
                <feMergeNode in="shadow"/>
                <feMergeNode in="blur1"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path ref={measureRef} d={activePath} fill="none" stroke="transparent" strokeWidth="1"/>
          
          <path d={activePath} fill="none" stroke="rgba(212,177,106,0.12)" strokeWidth={vw < 768 ? 40 : 50} strokeLinecap="round" strokeLinejoin="round"/>
          <path d={activePath} fill="none" stroke="rgba(212,177,106,0.22)" strokeWidth={vw < 768 ? 26 : 32} strokeLinecap="round" strokeLinejoin="round"/>
          
          {DECORATIONS.map((dec, i) => <DecorationElement key={`dec-${i}`} dec={dec} svgScale={SVG_SCALE} stretchY={STRETCH_Y} squeezeX={SQUEEZE_X} />)}
          {activeNodes.map((node, i) => <ConnectorBranch key={`conn-${i}`} node={node} />)}
          
          <motion.path 
            d={activePath} 
            fill="none" 
            stroke="url(#threadGrad3)"
            strokeWidth={vw < 768 ? 16 : 22} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#threadGlow3)" 
            strokeDasharray={pathLength}
            style={{ strokeDashoffset: dashOffset }}
          />
            
          <circle cx="500" cy={vw < 768 ? 80 : 50} r="14" fill="#D4B16A" opacity="0.95"/>
          <circle cx="500" cy={vw < 768 ? 80 : 50} r="8" fill="#4A3728"/>
          <circle cx="500" cy={vw < 768 ? 80 : 50} r="3" fill="#D4B16A" opacity="0.8"/>
          <circle cx="500" cy={vbH - 120} r="14" fill="#D4B16A" opacity="0.75"/>
          <circle cx="500" cy={vbH - 120} r="8" fill="#4A3728" opacity="0.75"/>
        </svg>

        {IMAGES.map((img, i) => {
          const node = activeNodes[i]
          if (!node) return null
          return (
            <PolaroidCard
              key={i}
              node={node}
              image={img}
              index={i}
              pageTitle={PAGE_TITLES[i]}
              onOpenModal={handleOpenModal}
              vbW={vbW}
              vbH={vbH}
              cardBaseWidthPhysical={cardBaseWidthPhysical}
              cardScale={cardScale}
            />
          )
        })}
      </section>

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
