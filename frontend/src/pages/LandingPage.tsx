import { LandingNavbar } from '@/layout/landing/LandingNavbar'
import { ScrollProgressBar } from '@/components/motion/ScrollProgressBar'
import { Hero } from './landing-sections/Hero'
import { Features } from './landing-sections/Features'
import { WhyChooseUs } from './landing-sections/WhyChooseUs'
import { ProductsShowcase } from './landing-sections/ProductsShowcase'
import { InterfaceShowcase } from './landing-sections/InterfaceShowcase'
import { Contact } from './landing-sections/Contact'
import { Footer } from './landing-sections/Footer'

// CategoriesPreview / SuppliersPreview / HowItWorks stay in the codebase, unused, for a later phase.
export default function LandingPage() {
  return (
    <div className="relative bg-bg">
      <ScrollProgressBar />
      <LandingNavbar />
      <Hero />
      <Features />
      <WhyChooseUs />
      <ProductsShowcase />
      <InterfaceShowcase />
      <Contact />
      <Footer />
    </div>
  )
}
