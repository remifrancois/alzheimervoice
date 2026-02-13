import { useRouter } from './lib/router'
import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import Stats from './sections/Stats'
import Problem from './sections/Problem'
import Breakthrough from './sections/Breakthrough'
import HowItWorks from './sections/HowItWorks'
import Science from './sections/Science'
import Domains from './sections/Domains'
import Technology from './sections/Technology'
import Families from './sections/Families'
import Modes from './sections/Modes'
import CTA from './sections/CTA'
import Footer from './sections/Footer'
import ScientificPage from './pages/ScientificPage'
import FamilyPage from './pages/FamilyPage'
import OpenSourcePage from './pages/OpenSourcePage'
import DemoPage from './pages/DemoPage'
import PrivacyPage from './pages/PrivacyPage'
import LegalPage from './pages/LegalPage'
import CompliancePage from './pages/CompliancePage'
import CreatorsPage from './pages/CreatorsPage'
import CoreVoiceFrameworkPage from './pages/CoreVoiceFrameworkPage'

const pages = {
  cognitivevoicefingerprint: ScientificPage,
  family: FamilyPage,
  opensource: OpenSourcePage,
  demo: DemoPage,
  privacy: PrivacyPage,
  legal: LegalPage,
  compliance: CompliancePage,
  creators: CreatorsPage,
  corevoiceframework: CoreVoiceFrameworkPage,
}

function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Problem />
      <Breakthrough />
      <HowItWorks />
      <Science />
      <Domains />
      <Technology />
      <Families />
      <Modes />
      <CTA />
    </>
  )
}

export default function App() {
  const { page } = useRouter()
  const PageComponent = pages[page] || HomePage

  return (
    <>
      <Navbar />
      <PageComponent />
      <Footer />
    </>
  )
}
