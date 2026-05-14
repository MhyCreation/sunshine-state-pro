import { Hero } from "@/components/marketing/hero";
import { Features, Pricing, FAQ, CTA, Footer } from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
