import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Terms of Service – SunshineSpins" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-casino-900 text-white">
      <header className="sticky top-0 z-50 border-b border-casino-700 bg-casino-900/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <span className="text-xs text-white/30 uppercase tracking-widest">Terms of Service</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">
            Effective Date: [INSERT DATE] &nbsp;·&nbsp; Last Updated: [INSERT DATE]
          </p>
          <div className="mt-4 rounded-lg bg-gold-400/10 border border-gold-400/20 px-4 py-3 text-xs text-gold-300/80 leading-relaxed">
            <strong className="text-gold-400">Important — Please Read Carefully.</strong> These Terms of Service constitute a legally binding agreement between you and SunshineSpins Entertainment, LLC. By accessing or using the Platform you agree to be bound by these Terms. If you do not agree, do not use the Platform.
          </div>
        </div>

        <Section id="parties" title="1. Parties and Scope">
          <p>These Terms of Service ("<strong>Terms</strong>") are entered into between <strong>SunshineSpins Entertainment, LLC</strong>, a limited liability company organized under the laws of [STATE] ("<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>") and the individual creating an account or otherwise using the SunshineSpins platform ("<strong>you</strong>" or "<strong>User</strong>").</p>
          <p>These Terms govern your access to and use of the SunshineSpins website, mobile application, and all related services (collectively, the "<strong>Platform</strong>"). These Terms incorporate by reference our <Link href="/sweepstakes-rules" className="text-gold-400 hover:underline">Official Sweepstakes Rules</Link>, <Link href="/privacy" className="text-gold-400 hover:underline">Privacy Policy</Link>, and any additional policies posted on the Platform.</p>
        </Section>

        <Section id="eligibility" title="2. Eligibility">
          <p>To create an account and participate in the Platform, you must:</p>
          <ul>
            <li>Be at least <strong>eighteen (18) years of age</strong>;</li>
            <li>Be a legal resident of the United States (excluding the states of Washington, Idaho, and any other jurisdiction where such contests are prohibited by applicable law — see the Official Sweepstakes Rules for the current exclusion list);</li>
            <li>Have a valid email address;</li>
            <li>Not be prohibited from participating by applicable federal, state, or local law; and</li>
            <li>Not be a current employee, officer, director, or immediate family member of the household of the Company, its affiliates, subsidiaries, advertising agencies, or prize suppliers.</li>
          </ul>
          <p>By registering, you represent and warrant that you meet all eligibility requirements. We reserve the right to verify eligibility at any time and to disqualify any User who does not satisfy these requirements. Residents of <strong>Florida</strong> are eligible to participate in all Platform features.</p>
        </Section>

        <Section id="account" title="3. Account Registration and Security">
          <p>You may create one (1) account per person. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
          <p>You agree to notify us immediately at <strong>[support@sunshinespins.com]</strong> of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to protect your account credentials.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, contain false information, engage in fraudulent activity, or attempt to manipulate any aspect of the Platform or Sweepstakes.</p>
        </Section>

        <Section id="virtual-currency" title="4. Virtual Currencies">
          <h3>4.1 Gold Coins (GC)</h3>
          <p>Gold Coins are a virtual currency provided <strong>solely for entertainment purposes</strong>. Gold Coins have <strong>no cash value</strong>, are not redeemable for prizes, cannot be transferred to other users, and cannot be exchanged for real money or any item of monetary value. Purchases of Gold Coins are final and non-refundable except as required by applicable law. Gold Coins cannot be used to enter the Sweepstakes.</p>

          <h3>4.2 Sweeps Coins (SC)</h3>
          <p>Sweeps Coins are virtual tokens that may be used to participate in the Sweepstakes promotional games and, if the redemption requirements are met, may be redeemed for prizes as described in the Official Sweepstakes Rules. Sweeps Coins:</p>
          <ul>
            <li>Have <strong>no monetary value</strong> until redeemed in accordance with the Official Sweepstakes Rules;</li>
            <li>Are provided free of charge through daily login bonuses, sign-up bonuses, promotional activities, and other methods described in the Official Sweepstakes Rules;</li>
            <li>Are not purchased directly — any purchase on the Platform is a purchase of Gold Coins; SC provided alongside such a purchase are a <em>free promotional bonus</em> and not purchased;</li>
            <li>Cannot be transferred between users;</li>
            <li>Expire if your account is terminated for violation of these Terms; and</li>
            <li>Are subject to a <strong>minimum redemption threshold of 100 SC</strong> and require prior Sweepstakes gameplay participation as described in the Official Sweepstakes Rules.</li>
          </ul>

          <h3>4.3 No Real Gambling</h3>
          <p>The Platform does not offer gambling for money. Games played with Gold Coins are for entertainment only and have no prizes. Games played with Sweeps Coins constitute entry into a lawful promotional Sweepstakes. No purchase is necessary to participate. See the Official Sweepstakes Rules for complete details.</p>
        </Section>

        <Section id="no-purchase" title="5. No Purchase Necessary">
          <p>No purchase is required to obtain Sweeps Coins or to participate in the Sweepstakes. Sweeps Coins may be obtained free of charge by: (i) creating a free account; (ii) claiming a daily login bonus; (iii) submitting a written request by mail as described in the Official Sweepstakes Rules; or (iv) participating in other free promotions offered from time to time. A purchase of Gold Coins does not improve your odds of winning any Sweepstakes prize relative to a free entry method.</p>
        </Section>

        <Section id="purchases" title="6. Gold Coin Purchases">
          <p>You may optionally purchase Gold Coin bundles through the Platform's Gold Coin Shop using a valid payment method. All purchases are:</p>
          <ul>
            <li>Subject to applicable taxes;</li>
            <li><strong>Final and non-refundable</strong> except as required by applicable consumer protection law;</li>
            <li>Not a purchase of Sweeps Coins or any item of monetary value;</li>
            <li>Limited to persons who are at least 18 years of age; and</li>
            <li>Subject to our payment processor's terms of service.</li>
          </ul>
          <p>We reserve the right to modify, discontinue, or limit any purchase option at any time.</p>
        </Section>

        <Section id="gameplay" title="7. Gameplay and Platform Rules">
          <p>You agree to use the Platform only for its intended purposes and in compliance with these Terms and all applicable laws. When participating in games or the Sweepstakes, you agree not to:</p>
          <ul>
            <li>Use any automated software, bot, script, or other means to play games or collect virtual currencies;</li>
            <li>Exploit bugs, glitches, or other unintended game mechanics;</li>
            <li>Collude with other users or engage in any form of fraud;</li>
            <li>Use multiple accounts or share accounts;</li>
            <li>Manipulate game outcomes through unauthorized means;</li>
            <li>Launder money or use the Platform for any illegal financial activity; or</li>
            <li>Circumvent any responsible gaming limits or self-exclusion measures.</li>
          </ul>
          <p>We reserve the right to void any Sweeps Coin balance or prize resulting from activity we determine, in our sole discretion, to be fraudulent, abusive, or in violation of these Terms.</p>
        </Section>

        <Section id="prohibited" title="8. Prohibited Conduct">
          <p>In addition to Section 7, you agree not to:</p>
          <ul>
            <li>Violate any applicable federal, state, or local law, regulation, or ordinance;</li>
            <li>Infringe the intellectual property rights of the Company or any third party;</li>
            <li>Upload, transmit, or distribute any content that is defamatory, obscene, harassing, threatening, or otherwise objectionable;</li>
            <li>Attempt to gain unauthorized access to any portion of the Platform or its related systems;</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform; or</li>
            <li>Engage in any conduct that restricts or inhibits any other person from using or enjoying the Platform.</li>
          </ul>
        </Section>

        <Section id="ip" title="9. Intellectual Property">
          <p>All content on the Platform, including but not limited to text, graphics, logos, icons, game software, audio, and video, is the exclusive property of the Company or its licensors and is protected by applicable copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for your personal, non-commercial entertainment purposes.</p>
          <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any content from the Platform without our prior written consent.</p>
        </Section>

        <Section id="privacy" title="10. Privacy">
          <p>Your use of the Platform is subject to our <Link href="/privacy" className="text-gold-400 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, use, and disclosure of your information as described in the Privacy Policy.</p>
        </Section>

        <Section id="responsible-gaming" title="11. Responsible Gaming">
          <p>We are committed to promoting responsible participation on our Platform. If you find yourself spending excessive time on the Platform or experiencing distress related to your play, we encourage you to use our self-exclusion features or contact us to restrict your account. Resources for problem gambling assistance include:</p>
          <ul>
            <li><strong>National Problem Gambling Helpline:</strong> 1-800-522-4700 (24/7)</li>
            <li><strong>Florida Council on Compulsive Gambling:</strong> 1-888-ADMIT-IT (1-888-236-4848)</li>
            <li><strong>National Council on Problem Gambling:</strong> ncpgambling.org</li>
          </ul>
          <p>Users who request self-exclusion will be removed from all promotional communications and their ability to participate in Sweepstakes gameplay will be suspended for the period requested.</p>
        </Section>

        <Section id="disclaimers" title="12. Disclaimers of Warranties">
          <p>THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.</p>
        </Section>

        <Section id="liability" title="13. Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS, OR GOODWILL, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING UNDER OR RELATED TO THESE TERMS EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; OR (B) ONE HUNDRED DOLLARS ($100.00).</p>
          <p>SOME JURISDICTIONS, INCLUDING FLORIDA, DO NOT ALLOW CERTAIN LIMITATIONS OF LIABILITY, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</p>
        </Section>

        <Section id="indemnification" title="14. Indemnification">
          <p>You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, agents, and licensors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any applicable law or the rights of any third party; or (d) any content you submit to the Platform.</p>
        </Section>

        <Section id="governing-law" title="15. Governing Law and Dispute Resolution">
          <h3>15.1 Governing Law</h3>
          <p>These Terms shall be governed by and construed in accordance with the laws of the <strong>State of Florida</strong>, without regard to its conflict of law provisions. You consent to personal jurisdiction in the state and federal courts located in [COUNTY] County, Florida.</p>

          <h3>15.2 Informal Resolution</h3>
          <p>Before initiating any formal dispute, you agree to contact us at <strong>[legal@sunshinespins.com]</strong> and provide a written description of the dispute, your desired resolution, and your contact information. We will attempt to resolve the dispute informally within thirty (30) days.</p>

          <h3>15.3 Binding Arbitration</h3>
          <p>If the dispute is not resolved informally, it shall be resolved by binding arbitration administered by the American Arbitration Association ("<strong>AAA</strong>") under its Consumer Arbitration Rules. The arbitration shall be conducted in [CITY], Florida, or, at your election, via video conference. The arbitrator's decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction. <strong>You waive any right to a jury trial.</strong></p>

          <h3>15.4 Class Action Waiver</h3>
          <p>YOU AND THE COMPANY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. If this waiver is found unenforceable, the entire arbitration provision shall be void.</p>

          <h3>15.5 Exception — Small Claims and Injunctive Relief</h3>
          <p>Notwithstanding the foregoing, either party may bring an individual action in small claims court, and either party may seek emergency injunctive relief in a court of competent jurisdiction to prevent irreparable harm pending arbitration.</p>
        </Section>

        <Section id="termination" title="16. Termination">
          <p>We may suspend or terminate your account and access to the Platform at any time, with or without cause, with or without notice. Upon termination: (a) your right to use the Platform immediately ceases; (b) any unused Gold Coins and Sweeps Coins in your account are forfeited (except that SC accrued through legitimate free-play may be subject to a final redemption request submitted within 14 days of notice of termination, subject to verification); and (c) all provisions of these Terms that by their nature should survive termination shall survive.</p>
          <p>You may close your account at any time by contacting us at <strong>[support@sunshinespins.com]</strong>.</p>
        </Section>

        <Section id="changes" title="17. Changes to These Terms">
          <p>We may revise these Terms at any time by posting the updated version on the Platform with a new effective date. We will provide notice of material changes via email or a prominent notice on the Platform at least fourteen (14) days before the change takes effect. Your continued use of the Platform after the effective date of the revised Terms constitutes your acceptance of the changes. If you do not agree to the revised Terms, you must stop using the Platform.</p>
        </Section>

        <Section id="general" title="18. General Provisions">
          <p><strong>Entire Agreement.</strong> These Terms, together with the Official Sweepstakes Rules and Privacy Policy, constitute the entire agreement between you and the Company regarding the Platform and supersede all prior agreements, understandings, and representations.</p>
          <p><strong>Severability.</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining provisions remain in full force and effect.</p>
          <p><strong>Waiver.</strong> Our failure to enforce any provision of these Terms shall not constitute a waiver of our right to enforce it in the future.</p>
          <p><strong>Assignment.</strong> You may not assign your rights under these Terms without our prior written consent. We may assign our rights freely.</p>
          <p><strong>No Third-Party Beneficiaries.</strong> These Terms do not create any third-party beneficiary rights.</p>
        </Section>

        <Section id="contact" title="19. Contact Information">
          <div className="rounded-lg bg-casino-700 px-5 py-4 text-sm text-white/70 space-y-1">
            <p><strong className="text-white">SunshineSpins Entertainment, LLC</strong></p>
            <p>[REGISTERED ADDRESS]</p>
            <p>[CITY], Florida [ZIP CODE]</p>
            <p>Email: <span className="text-gold-400">[legal@sunshinespins.com]</span></p>
            <p>Support: <span className="text-gold-400">[support@sunshinespins.com]</span></p>
          </div>
        </Section>

        <div className="border-t border-casino-700 pt-6 flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/sweepstakes-rules" className="hover:text-gold-400 transition-colors">Official Sweepstakes Rules</Link>
          <Link href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-gold-400 transition-colors">← Back to SunshineSpins</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-xl font-bold text-white mb-4 pb-2 border-b border-casino-700">{title}</h2>
      <div className="space-y-3 text-sm text-white/60 leading-relaxed [&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-white/90">
        {children}
      </div>
    </section>
  );
}
