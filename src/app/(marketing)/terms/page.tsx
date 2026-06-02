import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Terms of Service — Sunshine State Pro",
  description: "Terms of Service for Sunshine State Pro, the field-service management platform for Florida service businesses.",
};

const EFFECTIVE = "June 2, 2026";
const CONTACT_EMAIL = "legal@sunshinestatepro.com";

export default function TermsPage() {
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
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8 md:p-12 prose prose-navy max-w-none">
          <h1 className="font-display text-3xl font-semibold text-navy-800 mb-2">Terms of Service</h1>
          <p className="text-sm text-navy-400 mb-10">Effective date: {EFFECTIVE}</p>

          <p className="text-navy-600 leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the Sunshine State Pro platform,
            including our web application, APIs, and any related services (collectively, the "Service"),
            operated by Sunshine State Pro LLC ("Company," "we," "us," or "our"). By creating an account
            or using the Service you agree to these Terms in full.
          </p>

          <Section title="1. Eligibility">
            <p>
              You must be at least 18 years of age and have the legal authority to enter into binding contracts
              on behalf of yourself or the business you represent. By using the Service you represent that all
              information you provide is accurate, current, and complete.
            </p>
          </Section>

          <Section title="2. Accounts">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity that occurs under your account. Notify us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-600 hover:underline">{CONTACT_EMAIL}</a>{" "}
              if you suspect unauthorised access. We may suspend or terminate accounts that violate these Terms.
            </p>
            <p>
              Each subscription covers one business entity. You may not share a single account across multiple
              businesses without upgrading to an Enterprise plan.
            </p>
          </Section>

          <Section title="3. Subscriptions and Billing">
            <p>
              The Service is offered on a subscription basis with tiers described on our{" "}
              <Link href="/#pricing" className="text-gold-600 hover:underline">Pricing page</Link>.
              All payments are processed securely by Stripe, Inc. By subscribing you authorise Stripe to charge
              the payment method on file on a recurring monthly basis until you cancel.
            </p>
            <ul>
              <li><strong>Free trial.</strong> New accounts receive a 14-day trial with full Pro feature access. No credit card is required to start the trial.</li>
              <li><strong>Upgrades / downgrades.</strong> Plan changes take effect immediately; prorated credits or charges are applied at the next billing cycle.</li>
              <li><strong>Cancellation.</strong> You may cancel at any time through the Billing settings. Access continues until the end of the current paid period; no partial refunds are issued for unused time.</li>
              <li><strong>Refunds.</strong> Refund requests within 7 days of the initial charge may be considered at our discretion. Contact us at {CONTACT_EMAIL}.</li>
              <li><strong>Price changes.</strong> We will provide 30 days' notice before increasing subscription prices, with the option to cancel before the new rate takes effect.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable federal, state, or local law or regulation, including Florida Statute Chapter 501 (FDUTPA) and applicable data-privacy laws.</li>
              <li>Send unsolicited commercial messages (spam) through our SMS or email features.</li>
              <li>Harvest, scrape, or collect data from the platform without our express written permission.</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from the Service.</li>
              <li>Upload or transmit malware, viruses, or any destructive code.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
              <li>Engage in any activity that materially disrupts or degrades the Service for other users.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account immediately and without notice if we
              determine, in our sole discretion, that you have violated this Section.
            </p>
          </Section>

          <Section title="5. Your Data">
            <p>
              You retain ownership of all data you input into the Service, including customer records, job
              histories, and invoices ("Customer Data"). You grant us a limited, non-exclusive licence to store,
              process, and display Customer Data solely as necessary to provide and improve the Service.
            </p>
            <p>
              We will not sell your Customer Data to third parties. We may share data with sub-processors
              (such as Stripe for payment processing) only to the extent required to deliver the Service.
              See our <Link href="/privacy" className="text-gold-600 hover:underline">Privacy Policy</Link> for details.
            </p>
            <p>
              Upon termination you may export your Customer Data within 30 days. After that period we may
              delete it from our systems in accordance with our data-retention policy.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              The Service, including all software, design, text, graphics, and documentation, is owned by or
              licensed to Sunshine State Pro LLC and is protected by United States copyright, trademark, and
              other intellectual-property laws. These Terms do not grant you any rights in the Service beyond
              the limited licence to use it during an active subscription.
            </p>
            <p>
              Feedback, suggestions, or ideas you submit to us may be used by us without restriction or
              compensation to you.
            </p>
          </Section>

          <Section title="7. Third-Party Integrations">
            <p>
              The Service integrates with third-party providers including Stripe (payments), Twilio (SMS),
              and Google Maps (routing). Your use of these integrations is also subject to the respective
              third parties' terms and privacy policies. We are not responsible for the actions or omissions
              of third-party providers.
            </p>
          </Section>

          <Section title="8. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
            </p>
            <p>
              Route-optimisation estimates, AI-generated content (quotes, follow-ups, insights), and any
              financial projections displayed in the Service are provided for informational purposes only and
              do not constitute legal, financial, or professional advice.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SUNSHINE STATE PRO LLC AND ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA,
              OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN
              IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              OUR AGGREGATE LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE
              SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US IN THE THREE MONTHS
              PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Sunshine State Pro LLC and its affiliates
              from and against any claims, liabilities, damages, judgments, fines, costs, and expenses
              (including reasonable attorneys' fees) arising out of or relating to your use of the Service,
              your Customer Data, or your violation of these Terms.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              Either party may terminate the agreement at any time. We may terminate or suspend your access
              without prior notice for material breach of these Terms, non-payment, or any activity that
              poses a security or legal risk. Upon termination, Sections 5 (Your Data – retention), 6, 8, 9,
              10, and 12 survive.
            </p>
          </Section>

          <Section title="12. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law
              principles. Any dispute arising out of or relating to these Terms or the Service shall be resolved
              exclusively in the state or federal courts located in Miami-Dade County, Florida, and you consent
              to the personal jurisdiction of those courts.
            </p>
            <p>
              Before initiating litigation you agree to attempt good-faith negotiation for at least 30 days.
              To initiate that process, send a written notice to {CONTACT_EMAIL} describing the dispute and
              the relief sought.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email and via an in-app
              banner at least 14 days before material changes take effect. Continued use of the Service after
              the effective date constitutes acceptance of the revised Terms. If you do not agree, you must
              cancel your subscription before the changes take effect.
            </p>
          </Section>

          <Section title="14. Contact Us">
            <p>
              Questions about these Terms? We're here to help.
            </p>
            <address className="not-italic text-navy-600">
              Sunshine State Pro LLC<br />
              Florida, United States<br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-600 hover:underline">{CONTACT_EMAIL}</a>
            </address>
          </Section>
        </div>
      </main>

      <footer className="bg-navy-900 text-white/40 text-sm py-8 text-center">
        © {new Date().getFullYear()} Sunshine State Pro LLC. All rights reserved. ·{" "}
        <Link href="/privacy" className="hover:text-white/70 transition">Privacy Policy</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-navy-800 mb-3">{title}</h2>
      <div className="text-navy-600 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-sm [&_p]:text-sm">
        {children}
      </div>
    </section>
  );
}
