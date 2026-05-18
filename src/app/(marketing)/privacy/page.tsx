import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Privacy Policy – SunshineSpins" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-casino-900 text-white">
      <header className="sticky top-0 z-50 border-b border-casino-700 bg-casino-900/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <span className="text-xs text-white/30 uppercase tracking-widest">Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">
            Effective Date: [INSERT DATE] &nbsp;·&nbsp; Last Updated: [INSERT DATE]
          </p>
          <div className="mt-4 rounded-lg bg-casino-700 border border-casino-600 px-4 py-3 text-xs text-white/60 leading-relaxed">
            SunshineSpins Entertainment, LLC ("<strong className="text-white/80">Company</strong>," "<strong className="text-white/80">we</strong>," "<strong className="text-white/80">us</strong>," or "<strong className="text-white/80">our</strong>") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the SunshineSpins platform. Please read this policy carefully. By using the Platform, you agree to the practices described here.
          </div>
        </div>

        <PS id="collect" title="1. Information We Collect">
          <h3>1.1 Information You Provide Directly</h3>
          <ul>
            <li><strong>Account Registration:</strong> Username, email address, password (stored as a hashed value, never in plain text), date of birth, and state of residence.</li>
            <li><strong>Identity Verification:</strong> For prize redemption, we may collect government-issued photo ID, full legal name, mailing address, date of birth, and Social Security number (last 4 digits or full, as required for tax reporting).</li>
            <li><strong>Payment Information:</strong> If you purchase Gold Coins, your payment details (credit/debit card number, billing address) are processed directly by our third-party payment processor. We do not store full card numbers.</li>
            <li><strong>Communications:</strong> If you contact our support team, we collect the contents of your messages and your contact information.</li>
            <li><strong>Promotions:</strong> If you participate in an AMOE mail-in entry, we collect the information on your entry card.</li>
          </ul>

          <h3>1.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Game sessions played, bets placed, wins, virtual currency balances, features accessed, and timestamps.</li>
            <li><strong>Device and Technical Data:</strong> IP address, browser type and version, operating system, device identifiers, screen resolution, and referring URL.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and local storage to maintain your session, remember preferences, analyze usage, and deliver relevant content. See Section 4 for details.</li>
            <li><strong>Log Data:</strong> Server logs that capture your interactions with the Platform, including error reports.</li>
          </ul>

          <h3>1.3 Information from Third Parties</h3>
          <ul>
            <li><strong>Identity Verification Services:</strong> If required for redemption, a third-party identity verification provider may share verification results with us.</li>
            <li><strong>Analytics Providers:</strong> We may receive aggregated analytics data from third-party analytics services.</li>
          </ul>
        </PS>

        <PS id="use" title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li><strong>Operate the Platform:</strong> Create and manage your account, process transactions, credit virtual currencies, and fulfill prize redemptions;</li>
            <li><strong>Run the Sweepstakes:</strong> Administer the promotional Sweepstakes, verify eligibility, determine winners, and fulfill prizes;</li>
            <li><strong>Verify Identity:</strong> Confirm eligibility, prevent fraud, and meet tax reporting obligations;</li>
            <li><strong>Process Payments:</strong> Facilitate Gold Coin purchases through our payment processor;</li>
            <li><strong>Communicate with You:</strong> Send transactional emails (account confirmations, password resets, redemption updates), service announcements, and, with your consent, promotional communications;</li>
            <li><strong>Improve the Platform:</strong> Analyze usage patterns, diagnose technical issues, and develop new features;</li>
            <li><strong>Safety and Security:</strong> Detect and prevent fraud, abuse, cheating, money laundering, and other prohibited activity;</li>
            <li><strong>Legal Compliance:</strong> Meet our obligations under applicable laws including Florida Statute §849.094, IRS tax reporting requirements, and other applicable regulations; and</li>
            <li><strong>Responsible Gaming:</strong> Monitor for signs of problem gambling and administer self-exclusion requests.</li>
          </ul>
          <p><strong>Legal Bases (applicable to EEA/UK residents where relevant):</strong> Processing is based on performance of a contract (account and Sweepstakes administration), legitimate interests (fraud prevention, platform improvement), legal obligation (tax reporting, regulatory compliance), and consent (marketing communications).</p>
        </PS>

        <PS id="sharing" title="3. How We Share Your Information">
          <p>We do <strong>not sell your personal information</strong> to third parties. We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Payment processors, identity verification services, cloud hosting providers, analytics platforms, email service providers, and customer support tools — each bound by contractual data protection obligations;</li>
            <li><strong>Prize Fulfillment Partners:</strong> To deliver gift cards and other prizes, we share your name, email, and mailing address with our fulfillment partners;</li>
            <li><strong>Tax Authorities:</strong> As required by law, including IRS Form 1099 reporting for prize winners whose aggregate annual winnings exceed applicable thresholds;</li>
            <li><strong>Regulatory Authorities:</strong> Florida Department of Agriculture and Consumer Services and other governmental bodies as required by applicable law;</li>
            <li><strong>Legal Process:</strong> In response to a valid subpoena, court order, or other legal process, or to protect the rights, property, or safety of the Company, our users, or others;</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, sale of assets, or other corporate transaction, subject to standard data protection commitments; and</li>
            <li><strong>With Your Consent:</strong> For any other purpose with your prior consent.</li>
          </ul>
        </PS>

        <PS id="cookies" title="4. Cookies and Tracking Technologies">
          <p>We use the following types of cookies and similar technologies:</p>
          <ul>
            <li><strong>Strictly Necessary Cookies:</strong> Required for the Platform to function, including session authentication and security tokens. Cannot be disabled.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences such as currency type and game settings.</li>
            <li><strong>Analytics Cookies:</strong> Collect aggregate information about how users interact with the Platform to help us improve functionality. You may opt out by adjusting your browser settings or using an analytics opt-out tool.</li>
          </ul>
          <p>Most web browsers allow you to control cookies through browser settings. Disabling cookies may affect the functionality of the Platform. We do not respond to "Do Not Track" browser signals at this time.</p>
        </PS>

        <PS id="security" title="5. Data Security">
          <p>We implement administrative, technical, and physical safeguards designed to protect your personal information, including:</p>
          <ul>
            <li>Transport Layer Security (TLS/HTTPS) for all data in transit;</li>
            <li>Encryption at rest for sensitive data including password hashes and payment information;</li>
            <li>Access controls limiting employee access to personal data on a need-to-know basis;</li>
            <li>Regular security assessments; and</li>
            <li>Incident response procedures.</li>
          </ul>
          <p>No security system is impenetrable. We cannot guarantee the absolute security of your information. In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you and applicable authorities as required by law.</p>
        </PS>

        <PS id="children" title="6. Children's Privacy (COPPA)">
          <p>The Platform is intended for users who are at least <strong>eighteen (18) years of age</strong>. We do not knowingly collect, use, or disclose personal information from children under the age of 13. If we learn that we have inadvertently collected personal information from a child under 13, we will promptly delete it. If you believe we have inadvertently collected information from a child under 13, please contact us at <strong>[privacy@sunshinespins.com]</strong>.</p>
          <p>We also do not knowingly permit individuals between 13 and 17 years of age to create accounts or participate in the Sweepstakes.</p>
        </PS>

        <PS id="rights" title="7. Your Privacy Rights">
          <h3>7.1 Florida Residents</h3>
          <p>Under the <strong>Florida Information Protection Act (FIPA), Fla. Stat. §501.171</strong>, and other applicable Florida law, you have rights regarding your personal information. If you are a Florida resident, you may request:</p>
          <ul>
            <li>Access to the personal information we hold about you;</li>
            <li>Correction of inaccurate personal information; and</li>
            <li>Deletion of your personal information, subject to legal retention obligations.</li>
          </ul>
          <p>To exercise these rights, contact us at <strong>[privacy@sunshinespins.com]</strong>.</p>

          <h3>7.2 All Users</h3>
          <ul>
            <li><strong>Account Information:</strong> You may access and update your account information by logging into your account settings.</li>
            <li><strong>Marketing Communications:</strong> You may opt out of promotional emails by clicking the unsubscribe link in any marketing email. Transactional emails (e.g., password resets, redemption confirmations) are required and cannot be opted out of while your account is active.</li>
            <li><strong>Data Deletion:</strong> To request deletion of your account and associated personal data, contact <strong>[privacy@sunshinespins.com]</strong>. Note that we may retain certain information as required by law or for legitimate business purposes (e.g., tax records, fraud prevention).</li>
            <li><strong>Data Portability:</strong> Upon request, we will provide you with a copy of your personal data in a commonly used machine-readable format, to the extent technically practicable.</li>
          </ul>

          <h3>7.3 Response Timeline</h3>
          <p>We will respond to verifiable requests within <strong>forty-five (45) days</strong>. We may extend this period by an additional 45 days where reasonably necessary, with notice.</p>
        </PS>

        <PS id="retention" title="8. Data Retention">
          <p>We retain personal information for as long as necessary to fulfill the purposes described in this Policy, including:</p>
          <ul>
            <li><strong>Account Data:</strong> For the duration of your account plus a reasonable period thereafter for backup, legal, and business purposes;</li>
            <li><strong>Transaction Records:</strong> A minimum of <strong>seven (7) years</strong> for tax and legal compliance purposes;</li>
            <li><strong>Sweepstakes Records:</strong> A minimum of <strong>three (3) years</strong> after the end of the relevant Promotion Period, as required by Florida Statute §849.094; and</li>
            <li><strong>Security Logs:</strong> As needed for fraud prevention and security purposes.</li>
          </ul>
          <p>When we no longer need your personal data, we will securely delete or anonymize it.</p>
        </PS>

        <PS id="third-party-links" title="9. Third-Party Links and Services">
          <p>The Platform may contain links to third-party websites or integrate third-party services (e.g., payment processors). This Privacy Policy does not apply to those third parties. We encourage you to review the privacy policies of any third-party services you access through our Platform.</p>
        </PS>

        <PS id="changes" title="10. Changes to This Privacy Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated Policy on the Platform with a new effective date and, where required by law, by email or in-app notification. Your continued use of the Platform after the effective date of the revised Policy constitutes your acceptance of the changes.</p>
        </PS>

        <PS id="contact" title="11. Contact Us">
          <p>For privacy-related questions, requests, or concerns, please contact our Privacy team:</p>
          <div className="rounded-lg bg-casino-700 px-5 py-4 text-sm text-white/70 space-y-1">
            <p><strong className="text-white">Privacy Officer — SunshineSpins Entertainment, LLC</strong></p>
            <p>[REGISTERED ADDRESS]</p>
            <p>[CITY], Florida [ZIP CODE]</p>
            <p>Email: <span className="text-gold-400">[privacy@sunshinespins.com]</span></p>
            <p className="pt-1 text-xs text-white/40">Response time: within 45 business days of receipt of a verifiable request.</p>
          </div>
        </PS>

        <div className="border-t border-casino-700 pt-6 flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
          <Link href="/sweepstakes-rules" className="hover:text-gold-400 transition-colors">Official Sweepstakes Rules</Link>
          <Link href="/" className="hover:text-gold-400 transition-colors">← Back to SunshineSpins</Link>
        </div>
      </main>
    </div>
  );
}

function PS({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-xl font-bold text-white mb-4 pb-2 border-b border-casino-700">{title}</h2>
      <div className="space-y-3 text-sm text-white/60 leading-relaxed [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-white/90">
        {children}
      </div>
    </section>
  );
}
