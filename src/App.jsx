import LandingSection from './components/LandingSection'
import MemoryJourney from './components/MemoryJourney'
import FinalDestination from './components/FinalDestination'

export default function App() {
  return (
    <main style={{ background: 'var(--bg)' }}>
      <LandingSection />
      <MemoryJourney />
      <FinalDestination />
    </main>
  )
}
