import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Privacy Policy — Sunshine State Pro",
  description: "How Sunshine State Pro collects, uses, and protects your personal information.",
};

const EFFECTIVE = "June 2, 2026";
const CONTACT_EMAIL = "privacy@sunshinestatepro.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-navy-800 text-white py-6 px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/">
            <Logo className="[&_span]:text-white [&_.text-gold-600]:text-gold-400" />
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition">← Back to home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8 md:p-12">
          <h1 className="font-display text-3xl font-semibold text-navy-800 mb-2">Privacy Policy</h1>
          <p className="text-sm text-navy-400 mb-10">Effective date: {EFFECTIVE}</p>

          <p className="text-sm text-navy-600 leading-relaxed">
            Sunshine State Pro LLC ("Company," "we," "us," or "our") is committed to protecting your
            personal information. This Privacy Policy explains what data we collect, how we use it,
            who we share it with, and your rights regarding that data when you use our field-service
            management platform (the "Service").
          </p>

          <Section title="1. Information We Collect">
            <Sub title="1.1 Account and Profile Information">
              When you sign up we collect your name, email address, and password (stored as a
              bcrypt hash — we never store plaintext passwords). If you represent a business, we
              also collect your business name, address, and phone number.
            </Sub>
            <Sub title="1.2 Customer and Job Data">
              Through normal use of the Service you may enter customer names, contact details,
              service addresses, job notes, invoices, and payment histories. You control this data
              and remain its owner.
            </Sub>
            <Sub title="1.3 Payment Information">
              We use <strong>Stripe, Inc.</strong> to process all payments. We never receive or
              store your full credit-card number, CVV, or bank account details. Stripe may collect
              and store payment-method data subject to its own{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"
                className="text-gold-600 hover:underline">Privacy Policy</a>.
              We store only Stripe customer IDs and subscription IDs to manage your plan.
            </Sub>
            <Sub title="1.4 Usage and Log Data">
              We automatically collect server logs, IP addresses, browser/device type, pages visited,
              and timestamps. This data is used for security, debugging, and aggregate analytics. Logs
              are retained for up to 90 days.
            </Sub>
            <Sub title="1.5 Cookies and Local Storage">
              We use two session tokens stored in HTTP-only cookies:
              <ul>
                <li><code className="text-xs bg-navy-50 px-1 rounded">lb_at</code> — short-lived access token (15-minute expiry) for authenticating API requests.</li>
                <li><code className="text-xs bg-navy-50 px-1 rounded">lb_rt</code> — refresh token (30-day expiry) used to issue new access tokens without re-login.</li>
              </ul>
              We do not use advertising cookies or third-party tracking pixels.
            </Sub>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="text-sm text-navy-600">We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account and authenticate your sessions.</li>
              <li>Provide and improve all features of the Service, including scheduling, invoicing, routing, and AI-powered tools.</li>
              <li>Process payments, manage subscriptions, and send billing-related communications via Stripe.</li>
              <li>Send transactional emails (account confirmations, password resets, invoice receipts). We will not send marketing emails without your explicit opt-in.</li>
              <li>Detect, investigate, and prevent fraudulent transactions, abuse, and security incidents.</li>
              <li>Comply with legal obligations and respond to lawful requests from government authorities.</li>
              <li>Generate anonymised, aggregated statistics to understand how the Service is used. These statistics cannot reasonably be used to identify individuals.</li>
            </ul>
          </Section>

          <Section title="3. How We Share Your Information">
            <p className="text-sm text-navy-600">
              We do not sell your personal information. We may share it only in these circumstances:
            </p>
            <ul>
              <li><strong>Sub-processors.</strong> We use the following third-party services to operate the platform: Stripe (payment processing), Twilio (SMS delivery), and Vercel / cloud infrastructure providers (hosting). Each has been evaluated for adequate data-protection practices.</li>
              <li><strong>Legal compliance.</strong> We may disclose information if required to do so by law, court order, or government authority, or if we believe disclosure is necessary to protect our legal rights or the safety of our users.</li>
              <li><strong>Business transfers.</strong> If the Company is acquired or merged, your information may be transferred as part of that transaction. We will notify you before your data is subject to a materially different privacy policy.</li>
            </ul>
            <p className="text-sm text-navy-600">
              We require all sub-processors to maintain at minimum the same level of data protection
              that we apply to your information.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <p className="text-sm text-navy-600">
              We retain your account and Customer Data for as long as your account is active. If you
              cancel your subscription or request deletion, we will delete your data within 30 days,
              except where we are required to retain it to comply with applicable law (e.g., financial
              records for tax purposes, typically 7 years).
            </p>
            <p className="text-sm text-navy-600">
              You may export your data at any time from the account settings or by contacting us.
            </p>
          </Section>

          <Section title="5. Security">
            <p className="text-sm text-navy-600">
              We implement industry-standard safeguards including TLS/HTTPS for data in transit,
              bcrypt password hashing, row-level data isolation between tenants, and HTTP-only
              session cookies. Our infrastructure is hosted in SOC 2-compliant data centres.
            </p>
            <p className="text-sm text-navy-600">
              No method of transmission or storage is 100% secure. In the event of a data breach
              affecting your personal information we will notify you as required by applicable law,
              including the Florida Information Protection Act (FIPA), within the statutory timeframe.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p className="text-sm text-navy-600">
              The Service is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child under 13 has provided us with personal
              information, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="7. Your Rights and Choices">
            <p className="text-sm text-navy-600">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul>
              <li><strong>Access.</strong> Request a copy of the personal information we hold about you.</li>
              <li><strong>Correction.</strong> Request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion.</strong> Request deletion of your account and associated personal data.</li>
              <li><strong>Portability.</strong> Receive your Customer Data in a machine-readable format (CSV export).</li>
              <li><strong>Opt-out of marketing.</strong> Unsubscribe from marketing emails at any time via the link in any email or by contacting us.</li>
            </ul>
            <p className="text-sm text-navy-600">
              <strong>Florida residents</strong> may exercise rights under the Florida Digital Bill of
              Rights (FDBR), including the right to opt out of targeted advertising and to correct or
              delete personal data. To submit a request, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-600 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
            <p className="text-sm text-navy-600">
              <strong>California residents</strong> may have additional rights under the California
              Consumer Privacy Act (CCPA/CPRA). We do not sell personal information as defined by the CCPA.
            </p>
            <p className="text-sm text-navy-600">
              We will respond to verified requests within 45 days as required by applicable law.
            </p>
          </Section>

          <Section title="8. Third-Party Links">
            <p className="text-sm text-navy-600">
              The Service may contain links to third-party websites or integrations. We are not
              responsible for the privacy practices of those sites and encourage you to review their
              respective privacy policies before providing any personal information.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p className="text-sm text-navy-600">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by email and via an in-app notification at least 14 days before the changes
              take effect. The "Effective date" at the top of this page indicates when the current
              version was last revised.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p className="text-sm text-navy-600">
              If you have questions, concerns, or requests regarding this Privacy Policy or how we
              handle your data, please contact our Privacy team:
            </p>
            <address className="not-italic text-sm text-navy-600 mt-3">
              Sunshine State Pro LLC — Privacy Team<br />
              Florida, United States<br />
              Email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-600 hover:underline">{CONTACT_EMAIL}</a>
            </address>
            <p className="text-sm text-navy-600 mt-3">
              See also our{" "}
              <Link href="/terms" className="text-gold-600 hover:underline">Terms of Service</Link>{" "}
              for additional legal terms that govern your use of the platform.
            </p>
          </Section>
        </div>
      </main>

      <footer className="bg-navy-900 text-white/40 text-sm py-8 text-center">
        © {new Date().getFullYear()} Sunshine State Pro LLC. All rights reserved. ·{" "}
        <Link href="/terms" className="hover:text-white/70 transition">Terms of Service</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-navy-800 mb-3">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-sm [&_li]:text-navy-600">
        {children}
      </div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-navy-700 mb-1">{title}</h3>
      <div className="text-sm text-navy-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mt-2">
        {children}
      </div>
    </div>
  );
}
