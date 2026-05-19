import { Hero } from "@/components/marketing/hero";
import { Features, Pricing, FAQ, Footer } from "@/components/marketing/sections";
import { LeadCapture } from "@/components/marketing/lead-capture";

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <LeadCapture />
      <Footer />
    </main>
  );
}
