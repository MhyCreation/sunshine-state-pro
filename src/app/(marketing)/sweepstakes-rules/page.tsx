import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Official Sweepstakes Rules – SunshineSpins" };

export default function SweepstakesRulesPage() {
  return (
    <div className="min-h-screen bg-casino-900 text-white">
      <header className="sticky top-0 z-50 border-b border-casino-700 bg-casino-900/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <span className="text-xs text-white/30 uppercase tracking-widest">Official Sweepstakes Rules</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Official Sweepstakes Rules</h1>
          <p className="text-white/40 text-sm">
            Effective Date: [INSERT DATE] &nbsp;·&nbsp; Sponsor: SunshineSpins Entertainment, LLC
          </p>
          <div className="mt-4 rounded-lg bg-win/10 border border-win/20 px-4 py-3 text-xs text-win/80 leading-relaxed">
            <strong className="text-win">No Purchase Necessary.</strong> A purchase will not improve your odds of winning. Void where prohibited. Sweeps Coins have no cash value until redeemed in accordance with these Rules.
          </div>
        </div>

        <Rule id="sponsor" title="1. Sponsor">
          <p><strong>SunshineSpins Entertainment, LLC</strong><br />
          [REGISTERED ADDRESS]<br />
          [CITY], Florida [ZIP CODE]<br />
          Email: [legal@sunshinespins.com]<br />
          (the "<strong>Sponsor</strong>")</p>
          <p>The SunshineSpins Sweepstakes (the "<strong>Sweepstakes</strong>") is operated by Sponsor and is in no way sponsored, endorsed, administered by, or associated with any social media platform, payment processor, or third-party prize fulfillment partner.</p>
        </Rule>

        <Rule id="period" title="2. Promotion Period">
          <p>The Sweepstakes is an ongoing promotion that begins on <strong>[START DATE]</strong> at 12:00:01 a.m. Eastern Time ("<strong>ET</strong>") and continues until terminated or modified by Sponsor upon reasonable notice ("<strong>Promotion Period</strong>"). Sponsor reserves the right to modify, suspend, or terminate the Sweepstakes at any time for any reason, subject to applicable law. All activity occurring after the Promotion Period ends will be void.</p>
        </Rule>

        <Rule id="eligibility" title="3. Eligibility">
          <p>The Sweepstakes is open only to <strong>legal residents of the United States</strong> who are at least <strong>eighteen (18) years of age</strong> at the time of participation, <strong>except</strong> residents of the following excluded jurisdictions: <strong>Washington State, Idaho</strong>, and any other state, territory, or jurisdiction where this type of promotion is prohibited, taxed, or otherwise restricted by applicable law ("<strong>Excluded Jurisdictions</strong>"). Sponsor will update the list of Excluded Jurisdictions on the Platform as needed.</p>
          <p>The following persons are <strong>not eligible</strong> to participate: (a) employees, officers, and directors of Sponsor, its affiliates, subsidiaries, advertising agencies, and prize suppliers; (b) immediate family members (spouse, parent, sibling, child) or members of the same household as any such person; and (c) any person who has been suspended or banned from the Platform.</p>
          <p><strong>Residents of Florida are eligible to participate</strong> in the Sweepstakes and to redeem Sweeps Coins for prizes subject to these Rules.</p>
        </Rule>

        <Rule id="no-purchase" title="4. No Purchase Necessary — Alternate Method of Entry (AMOE)">
          <p><strong>No purchase, payment, or other consideration is required to obtain Sweeps Coins or to enter the Sweepstakes.</strong> Sweeps Coins are available free of charge by the following methods:</p>
          <ul>
            <li><strong>Sign-Up Bonus:</strong> Create a free account at sunshinespins.com and receive <strong>2.00 SC</strong> at no charge.</li>
            <li><strong>Daily Login Bonus:</strong> Log in to your account each calendar day and claim <strong>0.50 SC</strong> at no charge, once per day per account.</li>
            <li><strong>Mail-In Entry (AMOE):</strong> Hand-print your full legal name, date of birth, complete mailing address, email address, and phone number on a 3" × 5" card, and mail it with a self-addressed stamped envelope to: <em>SunshineSpins AMOE, [MAILING ADDRESS], [CITY], FL [ZIP]</em>. One (1) mail-in request per outer envelope per week. Requests must be postmarked during the Promotion Period. Sponsor is not responsible for lost, late, misdirected, or illegible mail. Upon receipt and verification, Sponsor will credit <strong>1.00 SC</strong> to a qualifying account (or create one if you do not already have one) within fourteen (14) days. Limit one (1) mail-in AMOE per person per calendar week.</li>
            <li><strong>Promotions:</strong> Sponsor may from time to time offer additional free SC through promotional activities, which will be described on the Platform.</li>
          </ul>
          <p>A purchase of Gold Coins does not improve your odds of winning any prize relative to any free entry method.</p>
        </Rule>

        <Rule id="sweeps-coins" title="5. Sweeps Coins — Description and Use">
          <p>Sweeps Coins ("<strong>SC</strong>") are virtual tokens issued by Sponsor solely for use in the Sweepstakes. SC:</p>
          <ul>
            <li>Are not currency, have no monetary or cash value, and are not redeemable for cash except as prizes in accordance with these Rules;</li>
            <li>Are not transferable between users;</li>
            <li>Do not expire during the Promotion Period so long as your account remains in good standing;</li>
            <li>Are subject to verification before redemption; and</li>
            <li>May be voided by Sponsor in the event of fraud, abuse, or violation of these Rules or the Terms of Service.</li>
          </ul>
          <p>Gold Coins ("<strong>GC</strong>") are a separate virtual currency for entertainment play only. GC have no cash value, are not Sweepstakes entries, and cannot be used for prize redemption.</p>
        </Rule>

        <Rule id="gameplay" title="6. How to Participate — Sweepstakes Gameplay">
          <p>Once you have SC in your account, you may use them to play Sweepstakes-eligible games on the Platform (currently: Slots, Blackjack, Video Poker, and Roulette). Each game played with SC constitutes a Sweepstakes entry. The outcome of each game determines the number of SC won, if any, in accordance with the posted game paytables.</p>
          <p><strong>Game Outcomes:</strong> Game results are determined by a random number generator ("<strong>RNG</strong>") that produces statistically random outcomes on each play. Prior results do not influence future results. The RNG is not seeded by or connected to any purchase activity.</p>
          <p><strong>Approximate Odds:</strong> The odds of winning SC on any individual game play vary by game and bet amount. The approximate overall return-to-player percentage for each game is:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-casino-600">
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">Game</th>
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">Approx. RTP</th>
                  <th className="text-left py-2 text-white/50 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-casino-700">
                {[
                  ["Slots (3-Reel)", "~92–95%", "Varies by paytable"],
                  ["Blackjack (21 Royale)", "~99.5%", "Optimal basic strategy"],
                  ["Video Poker (Jacks or Better)", "~99.5%", "Optimal hold strategy"],
                  ["Roulette (European)", "~97.3%", "Single zero wheel"],
                ].map(([game, rtp, note]) => (
                  <tr key={game}>
                    <td className="py-2 pr-4 text-white/70">{game}</td>
                    <td className="py-2 pr-4 text-win/80 font-mono">{rtp}</td>
                    <td className="py-2 text-white/40">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>These figures represent long-run statistical averages across all users; individual session results will vary.</p>
        </Rule>

        <Rule id="prizes" title="7. Prizes and Approximate Retail Values">
          <p>Prizes are awarded in the form of gift cards, prepaid debit cards, or other items of value as made available by Sponsor from time to time ("<strong>Prizes</strong>"). The following prize tiers are available for redemption:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-casino-600">
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">SC Required</th>
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">Approximate Retail Value</th>
                  <th className="text-left py-2 text-white/50 font-medium">Prize Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-casino-700">
                {[
                  ["100 SC", "$[X].00 USD", "Gift card (various brands)"],
                  ["250 SC", "$[X].00 USD", "Gift card / prepaid card"],
                  ["500 SC", "$[X].00 USD", "Gift card / prepaid card"],
                  ["1,000 SC", "$[X].00 USD", "Gift card / prepaid card"],
                  ["2,500 SC", "$[X].00 USD", "Gift card / prepaid card"],
                ].map(([sc, arv, form]) => (
                  <tr key={sc}>
                    <td className="py-2 pr-4 text-gold-400 font-mono">{sc}</td>
                    <td className="py-2 pr-4 text-white/70">{arv}</td>
                    <td className="py-2 text-white/40">{form}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Sponsor reserves the right to substitute a prize of equal or greater approximate retail value if a specific prize becomes unavailable. Prizes are non-transferable and may not be exchanged for Gold Coins or other virtual currency. The total approximate retail value of all prizes available during the Promotion Period is <strong>$[TOTAL ARV] USD</strong>.</p>
          <p className="text-xs text-white/40 italic">Note to Operator: If total ARV exceeds $5,000, Florida Statute §849.094 requires filing with the Florida Department of Agriculture and Consumer Services (FDACS) not less than 30 days before the promotion commences and posting a surety bond. Consult your attorney before launch.</p>
        </Rule>

        <Rule id="redemption" title="8. Redemption Requirements and Process">
          <p>To redeem SC for a Prize, a User must:</p>
          <ul>
            <li>Have a verified account in good standing;</li>
            <li>Have accumulated a <strong>minimum of one hundred (100) SC</strong> in their account;</li>
            <li>Have completed <strong>at least one (1) Sweepstakes gameplay session</strong> using SC prior to submitting a redemption request — Users who have received SC only through bonuses and have not played any SC game are not yet eligible to redeem;</li>
            <li>Submit a redemption request through the Platform's wallet interface;</li>
            <li>Successfully complete any identity verification process requested by Sponsor, which may include providing government-issued photo identification, proof of address, date of birth verification, and/or Social Security number for tax reporting purposes; and</li>
            <li>Reside in an eligible jurisdiction at the time of redemption.</li>
          </ul>
          <p><strong>Verification Period:</strong> Sponsor will process redemption requests within <strong>three (3) to five (5) business days</strong> of receipt, subject to identity verification completion. Sponsor may extend the verification period to up to thirty (30) days in cases requiring additional review.</p>
          <p><strong>Limit:</strong> Redemption requests are limited to one (1) active request per account at a time. Maximum monthly redemption is <strong>[INSERT LIMIT] SC</strong> per account unless otherwise approved by Sponsor.</p>
        </Rule>

        <Rule id="taxes" title="9. Taxes">
          <p>Prizes may be subject to federal, state, and/or local income taxes. <strong>All tax obligations are the sole responsibility of the Prize winner.</strong> Sponsor will issue an IRS Form 1099-MISC (or other applicable tax form) to any winner whose aggregate Prize redemptions during a calendar year exceed the applicable IRS reporting threshold (currently $600). Winners may be required to provide a completed IRS Form W-9 (U.S. residents) before a Prize is issued. Failure to provide required tax information may result in withholding of the Prize.</p>
        </Rule>

        <Rule id="disqualification" title="10. Disqualification and Fraud">
          <p>Sponsor reserves the right, in its sole discretion, to disqualify any User and void any SC or Prize if: (a) the User has violated these Rules or the Terms of Service; (b) the User has used or attempted to use any robot, script, automated program, or any unauthorized means to participate; (c) the User has tampered with the entry process or the operation of the Sweepstakes; (d) the User's entry or participation is incomplete or contains false information; (e) the User resides in an Excluded Jurisdiction; or (f) Sponsor determines that the User's participation was fraudulent or abusive.</p>
          <p>Sponsor's decisions on all matters relating to the Sweepstakes are final and binding.</p>
        </Rule>

        <Rule id="release" title="11. Release and Limitations of Liability">
          <p>By participating in the Sweepstakes, each participant agrees to release and hold harmless Sponsor, its affiliates, subsidiaries, officers, directors, employees, agents, licensors, and prize suppliers from and against any claim, injury, loss, damage, right, or cause of action, including death, arising out of participation in the Sweepstakes or from the acceptance, use, or misuse of any Prize.</p>
          <p>Sponsor is not responsible for: (a) any technical failures of any kind; (b) lost, late, misdirected, or delayed entries; (c) printing or typographical errors in any Sweepstakes-related materials; (d) any injury or damage to participants or to any other person's computer or mobile device arising out of or related to participation; or (e) the actions of third-party prize fulfillment partners.</p>
        </Rule>

        <Rule id="publicity" title="12. Publicity">
          <p>Except where prohibited by law, acceptance of a Prize constitutes permission for Sponsor to use the winner's username, state of residence, and Prize information for promotional purposes, including on the Platform and social media channels, without additional compensation or notice. Sponsor will not publish winners' full legal names or personal contact information without express written consent.</p>
        </Rule>

        <Rule id="florida" title="13. Florida Residents — Specific Disclosures">
          <p>This Sweepstakes is conducted in compliance with <strong>Florida Statute §849.094</strong>. In accordance with that statute:</p>
          <ul>
            <li>The names of major prize winners will be available by sending a self-addressed, stamped envelope to: <em>SunshineSpins Winners List, [MAILING ADDRESS], [CITY], FL [ZIP]</em>, or by emailing <em>[legal@sunshinespins.com]</em> within ninety (90) days of a prize being awarded.</li>
            <li>If required by §849.094(3), Sponsor will register this promotion with the Florida Department of Agriculture and Consumer Services and post the required bond or security no later than thirty (30) days prior to the commencement of the Promotion Period.</li>
            <li>All registered and bonded materials, to the extent required, are on file with the FDACS and available for public inspection.</li>
            <li>Sponsor will not require any person to attend a sales presentation or sales solicitation as a condition of receiving a Prize.</li>
          </ul>
        </Rule>

        <Rule id="general-conditions" title="14. General Conditions">
          <p><strong>Governing Law.</strong> These Rules shall be governed by and construed in accordance with the laws of the <strong>State of Florida</strong>.</p>
          <p><strong>Void Where Prohibited.</strong> This Sweepstakes is void in Excluded Jurisdictions and wherever prohibited, taxed, or restricted by applicable law.</p>
          <p><strong>Severability.</strong> If any provision of these Rules is held to be illegal, invalid, or unenforceable, the remaining provisions will remain in full force and effect.</p>
          <p><strong>Modifications.</strong> Sponsor reserves the right to modify, suspend, or terminate the Sweepstakes at any time, for any reason, with reasonable notice to participants.</p>
          <p><strong>No Affiliation.</strong> This Sweepstakes is not affiliated with, endorsed by, or sponsored by Apple Inc., Google LLC, Meta Platforms, or any other third-party platform or service.</p>
          <p><strong>Record Retention.</strong> Sponsor will retain records of all entries, prize winners, and related documentation for a minimum of three (3) years following the end of the Promotion Period, as required by Florida Statute §849.094.</p>
        </Rule>

        <Rule id="contact" title="15. Contact and Winners List">
          <div className="rounded-lg bg-casino-700 px-5 py-4 text-sm text-white/70 space-y-1">
            <p><strong className="text-white">SunshineSpins Entertainment, LLC</strong></p>
            <p>[REGISTERED ADDRESS]</p>
            <p>[CITY], Florida [ZIP CODE]</p>
            <p>Legal: <span className="text-gold-400">[legal@sunshinespins.com]</span></p>
            <p>Support: <span className="text-gold-400">[support@sunshinespins.com]</span></p>
            <p className="pt-2 text-xs text-white/40">For Winners List requests: mail a self-addressed stamped envelope to the address above, Attn: Winners List.</p>
          </div>
        </Rule>

        <div className="border-t border-casino-700 pt-6 flex flex-wrap gap-4 text-xs text-white/30">
          <Link href="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-gold-400 transition-colors">← Back to SunshineSpins</Link>
        </div>
      </main>
    </div>
  );
}

function Rule({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-xl font-bold text-white mb-4 pb-2 border-b border-casino-700">{title}</h2>
      <div className="space-y-3 text-sm text-white/60 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-white/90 [&_em]:text-white/50">
        {children}
      </div>
    </section>
  );
}
