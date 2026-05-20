# Recovery App — Full Product Design Document

> **Working title:** *Anchor* (placeholder — see naming ideas in §1)
> **Document version:** 1.0 — 2026-05-20
> **Scope:** Strategy → UX → Architecture → Safety → Roadmap

---

## Table of Contents

1. [Product Vision & Positioning](#1-product-vision--positioning)
2. [Competitive Landscape](#2-competitive-landscape)
3. [Target Users & Personas](#3-target-users--personas)
4. [Information Architecture & App Flow](#4-information-architecture--app-flow)
5. [Onboarding Flow](#5-onboarding-flow)
6. [Feature Design — Core](#6-feature-design--core)
7. [AI Companion Design](#7-ai-companion-design)
8. [Gamification & Progress System](#8-gamification--progress-system)
9. [Community & Accountability Systems](#9-community--accountability-systems)
10. [Emergency Impulse Interrupt Mode](#10-emergency-impulse-interrupt-mode)
11. [Notification Strategy](#11-notification-strategy)
12. [Safety, Moderation & Ethics](#12-safety-moderation--ethics)
13. [UI/UX Design System](#13-uiux-design-system)
14. [Technical Architecture](#14-technical-architecture)
15. [Database Schema](#15-database-schema)
16. [Monetization Strategy](#16-monetization-strategy)
17. [Retention Mechanics](#17-retention-mechanics)
18. [MVP Roadmap](#18-mvp-roadmap)
19. [Launch Strategy](#19-launch-strategy)
20. [Future Expansion](#20-future-expansion)

---

## 1. Product Vision & Positioning

### Core Vision

> "Someone notices when I disappear."

The app is a daily accountability companion for people working on impulse control, addiction recovery, and habit change. It is **not** a therapy replacement — it is the supportive friend who checks in, celebrates wins, and refuses to shame you after a slip.

### Positioning Statement

For people struggling with destructive impulses — from social media overuse to serious addiction — who feel isolated and unseen in their recovery journey, this app is a calm, always-available companion that combines AI emotional support, community accountability, and honest progress tracking. Unlike clinical apps that feel cold, or streak-based apps that punish failure, this app treats every day — even hard ones — as meaningful progress.

### Name Candidates

| Name | Rationale |
|---|---|
| **Anchor** | Stability, grounding, holding you when urges pull |
| **Harbour** | Safe haven, refuge, warmth |
| **Stride** | Forward motion, not perfection |
| **Pact** | Mutual accountability, commitment |
| **Tether** | Connection to your future self and community |
| **Unhooked** | Freedom-forward, action-oriented |
| **Grove** | Growth, nature, community (a grove of trees) |

**Recommendation:** "Anchor" — short, universal, emotionally resonant, not clinical.

### What It Is Not

- Not a therapy replacement
- Not a 12-step program digitized
- Not a shame machine
- Not a streak tracker that punishes failure
- Not a medical device

### Core Emotional Promise

The app should make users feel:
1. **Seen** — the AI and community notice patterns and check in proactively
2. **Safe** — no judgment, ever
3. **Capable** — every day they use the app, they grow
4. **Connected** — accountability partners and community mean they're never alone

---

## 2. Competitive Landscape

### Direct Competitors

| App | Strengths | Weaknesses |
|---|---|---|
| **Nomo** | Clean streak tracking, multiple habits, accountability partner | No AI, limited community, streak-focused (punishes relapse) |
| **Quitzilla** | Simple habit stopping, customizable | Very basic, no community, no emotional support |
| **I Am Sober** | Large community, milestone focus | Community can be triggering, limited AI, clinical feel |
| **Reframe** | Strong alcohol focus, CBT content | Niche (alcohol only), costly, content-heavy not companion-y |
| **Finch** | Emotional support, self-care, pet metaphor | Doesn't focus on addiction specifically, gamification is childish for adult addictions |
| **BetterHelp / Woebot** | Proper therapy / CBT chatbot | Expensive, clinical, not addiction-recovery-specific |
| **Headspace / Calm** | Meditation, calm UX | No accountability, no addiction tracking, no community |

### Competitive Advantages

1. **AI companion depth** — not just a chatbot, but a contextually aware friend who remembers your patterns
2. **Relapse-compassionate design** — the only system where relapsing is treated as data, not failure
3. **Synergy / accountability partner system** — real social accountability, not just a leaderboard
4. **Multi-addiction support** — most competitors focus on one category
5. **Emergency Interrupt Mode** — instant, one-tap crisis support
6. **Tone** — warm and human vs. clinical or gamey

### Market Opportunity

- 46M Americans have substance use disorder (SAMHSA 2023)
- 210M people globally have internet/social media addiction (WHO estimates)
- Mental wellness app market: $6B+ and growing at ~16% CAGR
- Recovery apps specifically underserved vs. wellness/meditation apps
- Growing destigmatization of addiction = growing addressable market

---

## 3. Target Users & Personas

### Persona 1 — Marcus, 28, "The Silent Struggler"

- Porn addiction, ashamed to tell anyone
- Has tried quitting alone multiple times
- Needs: anonymous community, non-judgmental AI, private tracking
- Trigger: loneliness, late nights, boredom
- Motivation: relationship health, self-respect
- Fear: being judged, being seen

### Persona 2 — Keisha, 34, "The Aware but Stuck"

- Knows her wine habit is becoming a problem
- High-functioning, professional, doesn't want formal treatment
- Needs: smart insights, data about her patterns, private journal
- Trigger: work stress, Wednesday–Friday evenings
- Motivation: health, control, not wanting to "become her mother"
- Fear: losing control, admitting the severity

### Persona 3 — Javier, 22, "The Relapse Roller"

- Nicotine vaping, has quit 4 times this year
- Competitive, responds well to streaks but gets crushed by resets
- Needs: relapse-compassionate design, accountability partner, gamification
- Trigger: social situations, stress, seeing others vape
- Motivation: money saved, lung health, proving it to himself
- Fear: giving up entirely after another relapse

### Persona 4 — Diane, 45, "The Hidden Gambler"

- Online gambling, hides it from family
- Has significant financial stress from it
- Needs: emergency interrupt, money tracking, accountability partner who doesn't judge
- Trigger: payday, sports events, stress, boredom
- Motivation: family, finances, dignity
- Fear: family finding out, losing everything

### Persona 5 — Theo, 19, "The Digital Native"

- Social media/phone addiction, doomscrolling
- Understands it's a problem intellectually, struggles to act
- Needs: screen time data integration, daily check-ins, community of peers
- Trigger: boredom, notifications, FOMO
- Motivation: focus, mental clarity, sleep
- Fear: missing out, being disconnected

---

## 4. Information Architecture & App Flow

### Top-Level Navigation (5 tabs)

```
[ Home ]  [ Progress ]  [ Community ]  [ Partner ]  [ Profile ]
```

### Home Tab — Daily Command Center

```
┌─────────────────────────────────┐
│  Good evening, Marcus.          │
│  Day 14 clean. You're building  │
│  something real.                │
│                                 │
│  [  SOS Button — I Need Help  ] │
│                                 │
│  Today's Check-In               │
│  ┌──────────────────────────┐   │
│  │ How are you feeling?     │   │
│  │ 😤 😐 😊 😌 💪           │   │
│  └──────────────────────────┘   │
│                                 │
│  Active Streaks                 │
│  ┌──────┐ ┌──────┐             │
│  │ 14d  │ │  6d  │             │
│  │ Porn │ │ Smok │             │
│  └──────┘ └──────┘             │
│                                 │
│  AI Companion                   │
│  ┌──────────────────────────┐   │
│  │ "You mentioned stress at │   │
│  │ work earlier. How's the  │   │
│  │ evening going?"          │   │
│  │ [  Chat with Anchor  ]   │   │
│  └──────────────────────────┘   │
│                                 │
│  Today's Mission                │
│  [ Log a craving before it      │
│    acts on you ] ○              │
│                                 │
│  Partner Activity               │
│  ┌──────────────────────────┐   │
│  │ Alex checked in 2h ago ✓ │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Progress Tab — Data & Reflection

```
┌─────────────────────────────────┐
│  Your Journey                   │
│                                 │
│  [ Week ] [ Month ] [ All Time ]│
│                                 │
│  Streak Calendar (GitHub-style  │
│  contribution grid — green days)│
│                                 │
│  Stats Cards                    │
│  ┌────────┐ ┌────────┐         │
│  │ $420   │ │ 168h   │         │
│  │ Saved  │ │ Reclaim│         │
│  └────────┘ └────────┘         │
│  ┌────────┐ ┌────────┐         │
│  │  14    │ │  3     │         │
│  │ Urges  │ │ Resist │         │
│  │ Logged │ │ %grow  │         │
│  └────────┘ └────────┘         │
│                                 │
│  Mood Trend (line chart)        │
│  ━━━━━╮   ╭━━━━━                │
│       ╰━━━╯                     │
│                                 │
│  Craving Pattern Heatmap        │
│  Mon Tue Wed Thu Fri Sat Sun    │
│  ░░░ ▒▒▒ ▒▒▒ ░░░ ███ ███ ▒▒▒  │
│  (dark = more urges)            │
│                                 │
│  Journal Entries (last 7)       │
│  [ + New Entry ]                │
│                                 │
│  Achievements                   │
│  🏅 First Week  ✅              │
│  🏅 Urge Logged ✅              │
│  🏅 Day 30     🔒               │
└─────────────────────────────────┘
```

### Community Tab

```
┌─────────────────────────────────┐
│  Community                      │
│  Anonymous. Safe. Moderated.    │
│                                 │
│  Your username: TealFox#4821    │
│                                 │
│  Channels                       │
│  ─────────────────────────────  │
│  # day-1          23 online     │
│  # relapse-support 8 online     │
│  # night-urges    41 online     │
│  # quit-smoking   15 online     │
│  # gambling       9 online      │
│  # wins-today     ⭐ active      │
│  # weekend-warriors 12 online   │
│  ─────────────────────────────  │
│  [ Browse All Channels ]        │
│                                 │
│  Featured Post                  │
│  ┌──────────────────────────┐   │
│  │ OrangeSky#2214           │   │
│  │ "Day 30. I didn't think  │   │
│  │ I'd make it. Thank you   │   │
│  │ all." ❤️ 47 💬 12        │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Partner Tab — Accountability Link

```
┌─────────────────────────────────┐
│  Your Partner: Alex             │
│  Pact since Day 1 (14 days)     │
│                                 │
│  Alex's streak: 14 days ✅      │
│  Your streak:   14 days ✅      │
│                                 │
│  [ Send Encouragement ]         │
│  [ SOS — I need support ]       │
│                                 │
│  Shared Milestone               │
│  ┌──────────────────────────┐   │
│  │ 🏆 30-Day Pact — 16 days │   │
│  │ to go. You're doing it.  │   │
│  └──────────────────────────┘   │
│                                 │
│  Check-In Feed                  │
│  Alex ✓ checked in at 8:02am   │
│  You ✓ checked in at 9:14am    │
│  Alex sent encouragement 🙏     │
│                                 │
│  [ View Partner Profile ]       │
│  [ Leave Pact ]                 │
└─────────────────────────────────┘
```

---

## 5. Onboarding Flow

Goal: get the user to their first habit logged in under 3 minutes, with emotional safety established immediately.

### Screen 1 — Welcome

```
"You showed up.
That's already the hardest part."

[ Get Started ]     [ I've been here before ]
```

No sign-up required yet. Reduce friction.

### Screen 2 — What brings you here?

Soft, non-clinical framing. Multi-select.

```
What are you working on?
(Choose as many as you like — this is just for you.)

○ Porn / sexual content
○ Nicotine / vaping / smoking
○ Alcohol
○ Gambling
○ Social media / phone
○ Shopping / spending
○ Something else

No judgment. This stays private.
[ Continue ]
```

### Screen 3 — Your starting point

```
Where are you right now?

○ I'm starting fresh today
○ I've had some clean days already
○ I keep relapsing and I need help
○ I'm just curious / exploring

[ Continue ]
```

### Screen 4 — Meet your companion

Soft intro to the AI. Do NOT call it AI yet in the first impression — call it your companion or Anchor.

```
Meet Anchor.

Anchor is your private recovery companion.
Always available. Never judgmental. Here
for the hard nights and the big wins.

[Short animated illustration — calm, warm,
non-robotic. Think: a warm light or abstract
friendly form, not a humanoid avatar.]

Anchor will:
✓ Check in on you daily
✓ Help you through cravings
✓ Celebrate your milestones
✓ Support you after setbacks — without shame

[ Say hi to Anchor ]
```

### Screen 5 — First AI message

```
Anchor: "Hey. I'm glad you're here.
Can I ask — what's been the hardest
part about this for you so far?"

[ Free text response ]
```

This first message is collected as context for the AI. Even if ignored, it establishes the emotional tone.

### Screen 6 — Accountability setup

```
Recovery is stronger with someone else.

Would you like to:
○ Connect with an accountability partner
○ Be matched with someone
○ Go solo for now

[ Continue ]
```

### Screen 7 — Account creation (deferred until now)

```
Save your progress — it's yours forever.

[ Continue with Google ]
[ Continue with Apple ]
[ Continue with Email ]

Your data is private and encrypted.
Anonymous in community. Always.
```

**Key principle:** Email/account creation comes AFTER the user has already invested in onboarding. The emotional hook is set before the friction.

### Screen 8 — First streak set

```
Let's mark today.

Your clean start: Today, [date]

One day is real progress.
Let's keep going together.

[ Start My Journey ]
```

---

## 6. Feature Design — Core

### 6.1 Habit / Addiction Tracking

**Habit types with sensible defaults:**

| Category | Default cost/unit | Default time/unit |
|---|---|---|
| Nicotine (pack/day) | $12/pack | 10 min/cigarette |
| Alcohol (drinks/day) | $8/drink | — |
| Gambling | User-defined | — |
| Porn | — | User-defined |
| Social media | — | 2h/day saved |
| Shopping | User-defined | — |
| Custom | User-defined | User-defined |

**Per-habit tracking panel:**

- Streak counter (days, hours for sub-24h)
- "Urges resisted today" counter
- Money saved / time reclaimed (calculated)
- Craving log with: intensity (1–10), trigger tag, action taken, outcome
- Mood log (emoji or slider)
- Quick journal entry

**Relapse handling — critical design:**

When a user logs a relapse:

1. No alarm sounds, no red screens, no dramatic reset animation
2. Show: "It happened. That's okay. What matters is what you do next."
3. Log the relapse as data — show it on the calendar but never as a "failure" indicator
4. Ask: "What do you think triggered it?" — add to trigger log
5. Show their longest streak to anchor identity: "Your best is 14 days. That version of you is still in there."
6. Offer to talk to Anchor
7. Restart the streak counter quietly — no fanfare, just reset and a gentle nudge forward

**The 80/20 principle for streaks:** Display both current streak AND "clean days this month / this year" so users can see cumulative progress even after a relapse. One relapse in 20 days = 19/20 clean days. That matters.

### 6.2 Craving Log

When an urge hits, the user can:

1. Tap "Log a Craving" (big, accessible button)
2. Rate intensity: 1–10
3. Tag trigger: bored / stressed / lonely / tired / social pressure / physical / other
4. Log what they did: breathed through it / called someone / opened the app / relapsed
5. Add a note (optional)

This data feeds:
- The craving heatmap (time-of-day patterns)
- AI pattern detection ("You tend to crave around 10pm on weekdays")
- Weekly insights summary

### 6.3 Journal

- Daily prompt (AI-generated, context-aware: "You mentioned stress yesterday — how are you feeling today?")
- Free-write mode
- Gratitude prompt option
- Private — never shared with community or partner unless user explicitly shares a quote
- Searchable
- Mood tag on each entry

### 6.4 Daily Check-In

Every day, a gentle (not aggressive) notification:

"How's today going? [ Tap to check in ]"

Check-in takes 15 seconds max:
1. Mood (emoji selector)
2. "Any cravings today?" (yes/no)
3. "One word for today:" (optional)

If yes to cravings → offer to log or talk to Anchor.

---

## 7. AI Companion Design

### Philosophy

The AI companion is not a chatbot. It is a warm, emotionally intelligent presence that:

- Remembers context across conversations
- Speaks like a calm, non-preachy friend
- Never moralizes or lectures
- Asks questions rather than giving lectures
- Celebrates wins with genuine enthusiasm
- Responds to relapses with grace, not disappointment
- Knows when to suggest professional help without being pushy

### Personality Traits

| Trait | Behavior |
|---|---|
| Warm | Uses first names, acknowledges feelings before offering advice |
| Curious | Asks about the "why" behind urges, not just the "what" |
| Non-reactive | Never sounds alarmed or judgmental, even at bad news |
| Honest | Doesn't say "you're doing great" if the user is clearly struggling |
| Boundaried | Clear about what it is and isn't — not a therapist |
| Consistent | Same tone whether it's 2pm or 2am |

### Conversation Scenarios

**Scenario A — Urge/Craving**

User: "I'm about to gamble. I can feel it."

Bad AI response:
> "You should not gamble! Remember your goals!"

Good AI response:
> "I hear you — that pull feels really real right now. Can you tell me what's going on? What happened in the last hour or two?"
>
> [After user responds]
>
> "That makes sense. Stress has a way of pushing you toward the old escape routes. Let's try something — just 10 minutes. Set a timer. If you still feel like gambling after we try one thing together, we'll talk about what to do next. Want to try a quick breathing reset, or would you rather just talk it through?"

The goal is: **delay, engage, redirect** — not lecture.

**Scenario B — Relapse**

User: "I messed up. I watched porn last night."

Bad AI response:
> "That's okay, try again tomorrow!"
> (Too dismissive — doesn't acknowledge the weight)

Also bad:
> "Oh no! All your progress..."
> (Adds shame)

Good AI response:
> "Thank you for telling me. That took something. How are you feeling about it right now?"
>
> [After user responds]
>
> "That feeling makes sense. What I want you to hold onto: you have 13 days of actual clean days this month. That's 13 days that happened, and no relapse erases them. Can you tell me what led up to last night? Not to analyze you — just so we can figure out what to do differently next time."

**Scenario C — Milestone**

User: Day 30 triggers automatically.

AI: "30 days. That's not a small thing. A month ago you decided to try something different, and you did. How does it feel from the inside?"

**Scenario D — Crisis / Safety Risk**

If a user expresses suicidal ideation, self-harm, or severe distress:

AI immediately:
> "I'm really glad you're talking to me right now, and I want to make sure you're safe. What you're feeling sounds really heavy. I want to connect you with someone who can support you right now — can I share a crisis resource?"
>
> [Show: Crisis Text Line (text HOME to 741741), 988 Suicide & Crisis Lifeline, local emergency services]
>
> "I'll be right here too. You're not alone."

**Hard rules for AI behavior:**

- NEVER diagnose any disorder
- NEVER prescribe or recommend medications
- NEVER discourage professional treatment — always encourage it as complementary
- NEVER tell a user their addiction isn't serious
- NEVER express disappointment or frustration at a user
- NEVER claim to be human if sincerely asked
- ALWAYS route to crisis resources when safety is at risk
- ALWAYS respect "I don't want to talk about it" — offer presence without pressure

### AI Context Memory

The AI should maintain a rolling context of:

- Current streaks and habit types
- Recent craving logs and triggers
- Emotional tone from last 7 days of check-ins
- Milestone proximity ("getting close to 30 days")
- Time-of-day patterns ("tends to struggle after 10pm")
- Accountability partner status

This context is injected into every AI API call as a system prompt enrichment.

### AI Implementation

```
System prompt structure:

[BASE PERSONALITY]
You are Anchor, a warm and non-judgmental recovery companion...

[USER CONTEXT]
User name: Marcus
Active habits: porn addiction (day 14), nicotine (day 6)
Recent mood trend: improving
Known triggers: loneliness, late nights
Current partner: connected (Alex, day 14)
Last check-in: 6 hours ago, mood: 😐
Upcoming milestone: Day 15 tomorrow
Recent note from user: "Work was stressful today"

[SAFETY RULES]
Never diagnose. Route crisis to 988/Crisis Text Line immediately...
```

Use Claude API (claude-sonnet-4-6 or claude-haiku-4-5 for speed) with streaming for a natural typing feel.

---

## 8. Gamification & Progress System

### Design Principle

Gamification in a recovery app must feel **meaningful, not manipulative**. The goal is intrinsic motivation reinforcement — not Skinner-box dopamine loops. Every reward should map to real progress.

### XP & Levels

XP is earned by actions, not just streaks:

| Action | XP |
|---|---|
| Daily check-in | +10 |
| Logging a craving (without relapsing) | +25 |
| Logging a craving (relapsed but honest) | +10 (honesty rewarded) |
| Completing daily mission | +20 |
| Journal entry | +15 |
| Sending partner encouragement | +10 |
| 7-day streak | +100 bonus |
| 30-day streak | +300 bonus |
| Resisting 3 cravings in one day | +50 |
| Community post that gets 5+ replies | +20 |

**Level names — recovery journey themed:**

| Level | XP Range | Name |
|---|---|---|
| 1 | 0–100 | Just Starting |
| 2 | 100–300 | Finding Footing |
| 3 | 300–600 | Building Momentum |
| 4 | 600–1000 | Gaining Clarity |
| 5 | 1000–1500 | Growing Stronger |
| 6 | 1500–2200 | Holding the Line |
| 7 | 2200–3000 | Earning Freedom |
| 8 | 3000–4000 | Living Different |
| 9 | 4000–5500 | Solid Ground |
| 10 | 5500+ | Anchor |

Levels unlock features (not content that's needed for recovery — cosmetic + social).

### Milestone Badges

**Streak milestones:**
- 24 Hours (First Dawn)
- 3 Days (Weekend Warrior)
- 7 Days (One Week Real)
- 14 Days (Two Weeks Strong)
- 30 Days (One Month Changed)
- 60 Days (Two Months Clear)
- 90 Days (Quarter-Year Free)
- 6 Months (Half a Year New)
- 1 Year (Anniversary)

**Behavior milestones:**
- First craving logged (Honest with Myself)
- 10 cravings resisted total (Urge Buster)
- 30 cravings resisted total (Discipline Rising)
- First partner connected (Not Alone)
- First journal entry (Reflection Unlocked)
- 7-day check-in streak (Showing Up)
- $100 saved (Money Back)
- $500 saved (Real Freedom)

**Comeback badges (relapse-compassionate):**
- "Back on Track" — for restarting within 24h of a relapse
- "Resilient" — for reaching a new personal best after a relapse
- "Pattern Breaker" — for logging 5 triggers without relapsing

### Journey Map

Visual metaphor: a winding path through landscapes that change as users progress (forest → mountain → summit). This avoids the mechanical feeling of a progress bar alone.

- Week 1–2: Forest (finding the path)
- Week 3–4: Clearing (light emerging)
- Month 2–3: Mountain path (effort, rising)
- Month 3–6: Summit approach (real momentum)
- 6m+: Above the clouds (a new view)

### Daily Missions

One optional mission per day, never guilt-inducing:

- "Before you sleep, write one sentence about today."
- "Next time you feel an urge, wait 5 minutes and log how it felt."
- "Send your partner one word of encouragement."
- "Identify one trigger you experienced today."
- "Drink a glass of water and take 3 deep breaths."

Missions are personalized based on the user's stage (early recovery vs. established).

### Visual Progress — Money & Time Reclaimed

- **Money saved** counter (animated, ticking up in real time for habits with cost data)
- **Hours reclaimed** counter
- **Health improvements timeline** — e.g., "Day 3: circulation improves," "Day 14: taste returns," "30 days: lung function improving" — pulled from public health data for each addiction type

These make abstract progress concrete and deeply satisfying.

---

## 9. Community & Accountability Systems

### 9.1 Anonymous Community

**Identity system:**
- Auto-generated anonymous username: `AdjectiveAnimal#NNNN` (e.g., TealFox#4821)
- Users never see each other's email, name, location, or real identity
- Avatar is auto-generated (abstract shape/color — no profile photos to protect privacy)
- Username can be regenerated once per 90 days

**Channel structure:**

Core channels (permanent):
- `#day-1` — for people starting today
- `#relapse-support` — judgment-free post-relapse space
- `#night-urges` — late night active support (highest traffic 10pm–2am)
- `#wins-today` — positive posts only, milestones and small wins
- `#check-in` — daily check-in posts

Habit-specific:
- `#quit-smoking`
- `#alcohol`
- `#gambling-support`
- `#screen-time`
- `#porn-free`
- `#shopping`

Milestone celebration:
- `#7-days` (auto-posted when users hit 7 days, they can opt in)
- `#30-days`
- `#90-days`

**Post types:**
- Text posts
- Voice notes (Phase 2 — voice is more raw and connecting)
- Reaction system: ❤️ 🙏 💪 🌟 (no "likes" — these are specifically supportive reactions)
- Replies with threading

**Moderation model:**

Automated:
- Profanity filter
- Explicit content detection (block)
- Crisis keyword detection → trigger private message with crisis resources + flag for human moderator
- Spam detection
- URL blocking (prevent sharing of triggering content or gambling/porn sites)

Human moderation:
- Volunteer moderators (vetted community members, background-checked)
- Paid moderation team during high-risk hours (nights, weekends)
- Report system (any user can flag any post — 3 reports = temporary hold pending review)
- "Safe community" monthly training for moderators

**Community norms (shown during onboarding, always accessible):**
1. No shaming or judging — ever
2. No sharing of triggering content
3. No glorifying relapse
4. No soliciting (apps, services, relationships)
5. No identifying information (yours or others')
6. Encouragement over advice — unless advice is explicitly requested
7. "Trigger warning" prefix for posts that mention specific scenarios

### 9.2 Accountability Partner / Synergy System

**Naming options for the feature itself:** "Pact Mode" or "Anchor Link" — recommend Pact.

**How partners connect:**
1. Invite via share link (no names exposed until both accept)
2. Match system — algorithm matches by: habit type, timezone, length of recovery, language
3. In-app request from community connections

**Pact features:**

Shared view:
- Both users' streaks visible to each other
- Shared milestone progress bar
- Check-in confirmation feed ("Alex checked in today ✓")

Communication:
- In-app direct message (text, emoji, voice note in Phase 2)
- SOS button: sends instant push notification to partner — "Your Pact partner needs support right now"
- Encouragement presets (quick taps): "Proud of you," "You've got this," "I see you"
- Daily prompt: "How's your partner doing today? [ Send a note ]"

Shared milestones:
- Both complete 7 days = Team badge: "Week One Together"
- Both complete 30 days = "Month One Pact"
- Both maintain 90 days = "Unbreakable"

Handling one partner relapsing:
- The non-relapsing partner gets a gentle notification: "Your partner is having a hard day. They might need support."
- Their individual streak is NOT reset — only the shared milestone timer pauses
- Shared milestone resumes when both are active again (not reset from zero)

**Accountability partner SOS flow:**

When user taps SOS to partner:
1. Partner receives high-priority push notification
2. Partner app opens to urgent message: "[Partner name] needs support right now. They're having a hard moment."
3. One-tap options: "Call," "Send voice note," "Send message," "I'm here 💙"
4. If partner doesn't respond in 15 min → app routes user to community `#night-urges` and suggests AI companion

**Partner limits:** One primary partner at a time. Can also have up to 3 "supporters" who receive relapse notifications but have less intimate access.

---

## 10. Emergency Impulse Interrupt Mode

The "SOS" button is always visible on the home screen. Never buried. Never hidden.

### Activation Flow

```
Tap SOS
  │
  ▼
┌──────────────────────────────────┐
│  I'm here with you.              │
│                                  │
│  Right now, just breathe.        │
│                                  │
│  [  4-7-8 Breathing Guide  ]     │
│  [  Grounding Exercise     ]     │
│  [  Talk to Anchor         ]     │
│  [  Alert My Partner       ]     │
│  [  5-Minute Delay Timer   ]     │
│  [  Call a Crisis Line     ]     │
└──────────────────────────────────┘
```

### Breathing Exercise (4-7-8)

Full-screen, dark calming background, gentle animation (expanding circle):

1. Inhale: 4 seconds (circle expands)
2. Hold: 7 seconds (circle pauses, slight pulse)
3. Exhale: 8 seconds (circle contracts)

With audio option (binaural tone or gentle voice guide).

### Grounding Exercise (5-4-3-2-1 Sensory)

Guided prompts, one per screen:
1. "Name 5 things you can see right now"
2. "Name 4 things you can physically feel"
3. "Name 3 things you can hear"
4. "Name 2 things you can smell"
5. "Name 1 thing you can taste"

### Delay Timer

"Just wait 10 minutes. Urges peak and then pass."

Big, simple countdown timer. During the timer:
- Motivational micro-message every 2 minutes
- Your streak stats visible
- "The urge is a wave. You don't have to surf it."

If they make it through: "You did it. That was real strength." Log the successful resistance.

If they tap "I gave in" during the timer: No judgment. "That's okay. Let's talk." → Relapse flow.

### Distraction Options

Quick-launch actions:
- "Call someone" (opens contacts)
- "Go for a walk" (starts a 10-minute walk timer with encouragement)
- "Watch something (not that)" (links to safe content — YouTube, Netflix)
- "Play a game" (simple mindless mini-game built in)
- "Read something" (curated recovery stories)

---

## 11. Notification Strategy

### Core Principles

1. **Never guilt-trip** — notifications should feel like a friend, not a manager
2. **Respect quiet hours** — no notifications between 11pm and 8am (user configurable)
3. **Contextual, not scheduled** — notifications triggered by patterns, not just timers
4. **Easy to reduce** — one-tap notification preference changes in settings

### Notification Types

**Daily check-in** (1 per day, user-set time):
- "Good morning. How's today starting? [ Check in ]"
- "Evening check-in — how did today go? [ Share ]"

**Milestone approaching:**
- "You're 2 days from your longest streak ever. Keep going."
- "Day 29 — tomorrow is a month. You're almost there."

**Partner activity:**
- "Alex just checked in ✓"
- "Your partner hit 7 days — send them something 🙏"

**Pattern-based proactive (Phase 2 — AI-driven):**
- "You usually have a hard time on Friday evenings. Want to check in early tonight?"
- "It's been 3 days since you logged. Everything okay?"

**Milestone celebration:**
- "🎉 14 days. That's two weeks of showing up. Open your badge."

**Re-engagement (lapsed users — gentle, limited):**
- Day 3 since last open: "No pressure — just wanted you to know Anchor is here."
- Day 7: "Your journey doesn't disappear when you close the app. Come back whenever."
- Day 14: One final message. Then silence — no dark patterns.

### What to Avoid

- No streak notifications that emphasize what you'll LOSE ("Your 14-day streak is at risk!")
- No fake urgency
- No "you haven't checked in" messages that feel accusatory
- No notifications after a relapse asking "are you sure?" — that's toxic

---

## 12. Safety, Moderation & Ethics

### AI Safety Guardrails

**Input filtering:**
- Detect crisis keywords (suicid*, self-harm, want to die, can't go on) → immediate crisis routing
- Detect requests for medical advice → redirect with "I'm not a medical professional, but here's a resource..."
- Detect requests for specific drug/substance information that could enable harm → decline gently

**Output filtering:**
- Never produce shaming language
- Never produce diagnostic language
- Never produce specific medical dosage or withdrawal information
- Rate-limit AI responses to prevent dependency loops (if user messages more than 50x/day, gently suggest professional support)

**Crisis routing:**
- US: 988 Suicide & Crisis Lifeline, Crisis Text Line (741741)
- UK: Samaritans (116 123)
- Canada: 1-833-456-4566
- Australia: Lifeline (13 11 14)
- International: findahelpline.com
- These are surfaced immediately, not buried

### Community Moderation

**Content rules enforced at upload:**
- Image scanning for explicit content (using a vision moderation API)
- URL scanning against blocklists
- Keyword filters for glorifying substance use

**Escalation tiers:**
- Tier 1 (automated): spam, known slurs, explicit content → auto-removed + logged
- Tier 2 (user-reported): 3 reports → hidden pending review, reviewed within 2 hours
- Tier 3 (crisis): crisis keywords → private message to user with resources, flagged for human moderator immediate review

**Moderator guidelines:**
- Moderators never share why posts were removed publicly
- Users receive private message: "Your post was removed — here's why and how to appeal"
- Appeal process with 24h turnaround

### Privacy & Data

- All user habit data, journal entries, and AI conversations are end-to-end encrypted at rest
- User identity is separated from community identity — they are never linked
- No selling of behavioral or health data — ever. This is existential to the product's trust
- GDPR/CCPA compliant from day one
- Right to export all personal data
- Right to delete all data — includes AI conversation history
- No third-party advertising SDKs that access health data

**Specific addiction categories:**
- Porn addiction tracking data is treated with elevated sensitivity — never referenced in push notifications that could appear on lock screens
- Gambling data — flag for GAMSTOP/GamCare (UK) and NCPG (US) self-exclusion resource awareness

### Legal Considerations

- Terms of Service must clearly state: not a medical device, not therapy, not crisis support
- Privacy Policy must enumerate all data collected and retention periods
- Minors: 17+ age gate (addiction recovery context), strict enforcement
- HIPAA does not apply (not a covered entity) — but treat health data with equivalent care
- Do not make clinical outcome claims in marketing ("this app cures addiction" is FDA-regulated territory)

### Mental Health Disclaimers

In-app, accessible at all times:
> "Anchor is a supportive accountability tool, not a substitute for professional mental health care or medical treatment. If you are in crisis, please contact a crisis line or emergency services immediately. If you are dealing with substance dependence, please speak with a healthcare provider."

---

## 13. UI/UX Design System

### Design Language

**Emotion:** Calm, warm, human. The app should feel like a cozy conversation, not a dashboard.

**Visual metaphors:** Nature, light, water, growth. Avoid hard geometric corporate design.

### Color Palette

```
Primary (Anchor Blue):
  Deep Anchor: #1A2B4A     — trust, stability, depth
  Warm Blue:   #3D6B9E     — approachability
  Sky:         #7EB5E0     — openness, clarity

Accent (Growth):
  Sage Green:  #4A8B6F     — growth, health, nature
  Warm Mint:   #7BC9A8     — lightness, progress

Warmth:
  Sunrise:     #F0B86E     — celebration, milestones
  Warm White:  #FAFAF7     — calm backgrounds

Emergency/Crisis:
  Calm Red:    #C0433A     — urgent but not alarming (SOS button only)

Neutrals:
  Charcoal:    #2C2C35     — text
  Soft Gray:   #8A8A9A     — secondary text
  Cloud:       #F0F0F6     — card backgrounds
```

### Typography

- **Headlines:** Rounded sans-serif — Nunito, Poppins, or DM Sans (warm, not sharp)
- **Body:** Inter or SF Pro (readable, neutral, human)
- **Avoid:** Serif fonts (clinical), condensed fonts (anxiety-inducing), all-caps (aggressive)

### Component Design Principles

**Cards:** Rounded corners (16–24px radius), subtle shadows, soft backgrounds. Never sharp edges.

**Buttons:**
- Primary: Filled, rounded, with generous padding
- Secondary: Outlined or ghost
- SOS: Always red-adjacent, always accessible, never hidden

**Progress indicators:**
- Contribution grid (GitHub-style calendar, green squares = clean days)
- Circular progress rings (for daily missions)
- Animated counters (money saved — ticker-style)
- Linear bars with soft gradients (not sharp)

**Illustrations:**
- Abstract, warm, non-literal. Think Headspace meets Calm.
- Avoid: stock photo humans (feels clinical), cartoonish characters (too childish)
- Recommend: custom illustrated abstract forms, soft gradients, nature-inspired

**Dark mode:** Full dark mode support — especially important for late-night crisis moments. Dark mode uses deep navy, not pure black.

### Animation Principles

- **Breathing exercises:** Slow, smooth scale animations
- **Progress unlocks:** Satisfying but not jarring — soft glow, gentle scale, confetti only for major milestones
- **Transitions:** Fade + subtle slide (not bouncy or aggressive)
- **Loading states:** Pulsing soft shapes, never spinners for emotional content

### Accessibility

- WCAG AA minimum contrast ratios throughout
- All interactive elements ≥44pt touch targets
- Full VoiceOver / TalkBack support
- Haptic feedback for key moments (milestone unlock, SOS activation)
- Large text support without layout breaking

---

## 14. Technical Architecture

### Mobile App Framework

**Recommendation: React Native (Expo managed workflow)**

Rationale:
- Shared codebase for iOS + Android (this product needs both)
- Expo Router for navigation (file-based, mirrors Next.js patterns)
- Rich ecosystem: push notifications, camera, biometrics, haptics
- Strong community, easier recruting than Flutter
- If you already have Next.js/React web, code sharing is possible

Alternative: **Flutter** — better performance ceiling, worse ecosystem for AI/chat integrations, smaller talent pool.

**Avoid:** Native iOS/Android separately — too expensive for a startup.

### Backend Architecture

**Supabase (already in the existing repo)** — excellent fit:

- **Auth:** Supabase Auth with anonymous users → upgrade to email/social
- **Database:** Postgres with RLS (same pattern as the existing Sunshine State Pro project)
- **Realtime:** Supabase Realtime for community chat (WebSocket subscriptions)
- **Storage:** Supabase Storage for user avatars, voice notes
- **Edge Functions:** Supabase Edge Functions (Deno) for:
  - AI API calls (keep API keys server-side)
  - Notification triggers
  - Moderation webhooks
  - Cron jobs for daily check-in reminders

### AI Stack

**Primary:** Anthropic Claude API (claude-sonnet-4-6 for companion conversations, claude-haiku-4-5 for quick pattern detection)

**Architecture:**
```
Mobile App
  → Supabase Edge Function (AI proxy)
    → System prompt injection (user context from DB)
    → Claude API (streaming)
    → Response to app (streaming)
    → Log conversation to DB (encrypted)
```

**Context management:**
- Last 20 messages in conversation window
- User profile summary injected every call
- Recent craving/mood data injected as structured data

**Prompt caching:** Use Claude API prompt caching for the base system prompt — saves ~80% of tokens on the static personality/rules portion.

### Realtime Chat Infrastructure

**Option A (recommended for MVP): Supabase Realtime**
- Already available, no extra cost initially
- Postgres-backed — messages persist naturally
- Sufficient for <10k concurrent users

**Option B (scale): Stream Chat**
- Purpose-built chat infrastructure
- Better moderation hooks
- Better at scale (millions of users)
- $399+/month — Phase 2/3 when needed

### Database Design (see §15 for full schema)

Key tables:
- `users` — auth + profile
- `habits` — user habit definitions
- `streaks` — current + historical streak data
- `craving_logs` — per-craving records
- `mood_logs` — daily mood check-ins
- `journal_entries` — encrypted journal
- `ai_conversations` — encrypted conversation history
- `community_posts` — anonymous posts
- `community_channels` — channel definitions
- `pact_partnerships` — accountability partner links
- `achievements` — badge/XP records
- `notifications` — notification queue

### Push Notifications

**Expo Push Notifications** → routes to APNS (iOS) / FCM (Android)

- Supabase Edge Function cron triggers daily check-in at user's preferred time
- Event-driven triggers: partner SOS, milestone achieved, relapse support
- Notification payload never contains habit-specific content (porn, gambling) in the preview text — show only generic "Anchor needs you" to protect privacy on lock screens

### Authentication

- Supabase Auth (email/password, Google OAuth, Apple Sign In)
- Anonymous accounts: allow full app use before requiring sign-up
- Biometric lock: Face ID / Touch ID for app open (important for privacy-sensitive addictions)
- "Panic close" (Phase 2): shake or hardware button combo to instantly close app and show a decoy screen

### Analytics

**Amplitude** (recommended) or PostHog (open source self-hosted):

- Track: onboarding completion funnel, feature adoption, retention cohorts, subscription conversion
- Never track: individual habit data in analytics (keep it in the app DB only)
- Privacy-preserving: no PII in analytics events

### Infrastructure & Scalability

- **CDN:** Cloudflare (edge caching for static assets)
- **AI Rate Limiting:** Per-user rate limits on Edge Functions to prevent abuse
- **DB Scaling:** Supabase handles Postgres connection pooling (PgBouncer built in)
- **Monitoring:** Sentry for error tracking, Supabase dashboard for DB
- **Cost at scale:** Supabase Pro ($25/mo) handles ~50k users; upgrade to dedicated compute at ~500k users

---

## 15. Database Schema

```sql
-- Users (extends Supabase auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id),
  display_name text,                        -- for partner display only
  community_username text unique,           -- e.g. TealFox#4821
  community_avatar_seed text,              -- deterministic avatar generation
  timezone text not null default 'UTC',
  check_in_time time,                      -- preferred daily check-in time
  premium boolean not null default false,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  category text not null,                  -- 'porn','nicotine','alcohol','gambling','social','shopping','custom'
  custom_name text,                        -- if category = 'custom'
  cost_per_unit numeric,                   -- for money savings calc
  time_per_unit_minutes integer,           -- for time reclaimed calc
  unit_label text,                         -- 'cigarette', 'drink', 'session', etc.
  is_active boolean default true,
  started_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Streaks
create table streaks (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references user_profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,                    -- null = current streak
  length_days integer,                     -- computed on close
  is_relapse boolean default false,
  created_at timestamptz default now()
);

-- Craving Logs
create table craving_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  habit_id uuid references habits(id),
  logged_at timestamptz default now(),
  intensity integer check (intensity between 1 and 10),
  trigger_tag text,                        -- 'bored','stressed','lonely','tired','social','physical','other'
  outcome text,                            -- 'resisted','relapsed','talked_it_through','used_sos'
  notes text,
  created_at timestamptz default now()
);

-- Mood Logs
create table mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  logged_at timestamptz default now(),
  mood integer check (mood between 1 and 5),    -- 1=bad, 5=great
  mood_emoji text,
  one_word text,
  had_cravings boolean
);

-- Journal Entries (encrypted at app level before storage)
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  prompt text,
  content_encrypted text not null,         -- AES-256 encrypted at client
  mood integer,
  word_count integer
);

-- AI Conversations (encrypted)
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  started_at timestamptz default now(),
  last_message_at timestamptz,
  messages_encrypted jsonb,               -- encrypted conversation array
  conversation_type text                  -- 'craving','check-in','relapse','milestone','general'
);

-- Community Posts
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  community_user_id uuid references user_profiles(id),  -- community identity only
  channel_id uuid references community_channels(id),
  content text not null,
  post_type text default 'text',          -- 'text','voice_note'
  voice_url text,
  reaction_counts jsonb default '{}',
  reply_count integer default 0,
  is_removed boolean default false,
  removal_reason text,
  report_count integer default 0,
  created_at timestamptz default now()
);

-- Community Channels
create table community_channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  habit_category text,                     -- null = general
  is_active boolean default true
);

-- Pact Partnerships
create table pact_partnerships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references user_profiles(id),
  user_b uuid references user_profiles(id),
  status text default 'pending',          -- 'pending','active','ended'
  started_at timestamptz,
  ended_at timestamptz,
  check (user_a < user_b)                 -- prevent duplicate pairs
);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  badge_key text not null,               -- e.g. 'streak_7','first_craving_logged'
  earned_at timestamptz default now(),
  xp_awarded integer not null,
  unique (user_id, badge_key)
);

-- User XP (denormalized for performance)
create table user_xp (
  user_id uuid primary key references user_profiles(id),
  total_xp integer default 0,
  level integer default 1,
  last_updated timestamptz default now()
);

-- Notifications Queue
create table notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id),
  type text not null,
  title text,
  body text,
  data jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text default 'pending'
);

-- RLS: All tables scoped by user_id = auth.uid()
-- Community posts: community_user_id accessible to all authenticated users for reading
-- No cross-user reads except community posts and pact partnership views
```

---

## 16. Monetization Strategy

### Freemium Model

**Free tier — genuinely useful, not crippled:**
- Full habit tracking (up to 2 habits)
- Basic AI companion (10 conversations/day, no persistent memory)
- Community access (read + post)
- Basic progress tracking (streak, money saved)
- Emergency SOS mode (always free — no paywalling crisis features)
- One accountability partner

**Premium — "Anchor Pro" (~$9.99/month or $59.99/year):**
- Unlimited habits
- Full AI companion with persistent memory and pattern awareness
- Voice AI conversations (Phase 2)
- Advanced analytics: craving heatmaps, trigger patterns, mood trends
- Personalized AI daily plans
- Extended journal (unlimited entries + AI-generated prompts)
- Priority community verification (verified recovery badges)
- Customizable themes (unlock calming visual themes)
- Up to 5 supporters (vs. 1 partner on free)
- Export all data as PDF/CSV

**Pricing philosophy:** Keep it below $10/month so it's accessible to people who may be recovering from financial harm (gambling, shopping addictions). Offer annual discount. Offer income-based reduced pricing in settings (trust system — no verification required).

### Conversion Strategy

- Free trial: 14 days of Pro automatically on sign-up
- Paywall moments: triggered naturally at feature discovery, not on first launch
- Upsell message: "Want Anchor to remember this conversation next time?" — not "Upgrade NOW"
- Partner co-purchase: if one partner upgrades, 30-day trial for their partner

### Future Revenue Streams (Phase 3+)

- **Anchor for Teams** — employers or insurers offering recovery tools as a benefit
- **Therapist partner portal** — licensed therapists can view a client's progress (with consent) and provide notes through the app
- **Marketplace** — curated third-party resources (books, courses, coaching) with affiliate revenue
- **White-label** — the platform licensed to rehab centers, insurance companies, employers

---

## 17. Retention Mechanics

### The Core Loop (Daily)

```
Wake up
  → Morning notification: gentle check-in
  → 15-second mood log
  → Daily mission displayed
  → [Throughout day] Craving log or AI chat if needed
  → Evening check-in / journal
  → Partner activity view
  → Sleep
```

This loop is designed to take <5 minutes total on a normal day, but be available for as long as needed on a hard day.

### Emotional Retention (strongest driver)

**The "someone notices" effect:**

- If a user misses check-in → AI sends: "Hey — just checking in. No pressure, whenever you're ready."
- If a user's streak is about to hit a milestone → AI mentions it conversationally
- If a partner hasn't checked in → both get gentle nudges
- Milestone days are events: special UI, AI message, badge unlock, community congratulations

**Identity formation:**
As users build streaks, the app reinforces the identity of "someone who is doing this":
- "You're now on Day 14. That's who you are."
- Level names reinforce: "You're a Level 5 — Growing Stronger."

### Habit Formation

- Same-time daily check-in creates a Pavlovian habit
- Streak visualization creates commitment to the chain
- Partner accountability creates social obligation (in the healthy sense)

### Churn Prevention

- 3-day inactivity: gentle AI message (not a notification guilt-trip)
- 7-day inactivity: one deeper message about the partner noticing
- 14-day inactivity: final message, then silence (no dark patterns)
- Re-engagement never uses shame: "Your streak isn't gone — let's talk."

### Network Effects

The app gets more valuable as:
- Users gain more context with the AI (memory grows)
- Partners build deeper accountability bonds
- Community builds its own culture and norms

These are slow-building but powerful retention moats.

---

## 18. MVP Roadmap

### Phase 1 — MVP (Weeks 1–12)

**Goal:** Validate core loop — habit tracking + AI companion + accountability partner

**Core features:**
- [ ] Onboarding flow (screens 1–8 above)
- [ ] Up to 2 habit types with streak tracking
- [ ] Relapse logging (compassionate UX)
- [ ] Daily mood check-in
- [ ] Basic AI companion (Claude API, 10 conversations/day, no persistent memory)
- [ ] Emergency SOS — breathing + grounding + crisis resources
- [ ] Accountability partner (invite link, shared streak view, SOS alert)
- [ ] Basic milestone badges (7d, 14d, 30d)
- [ ] Money saved / time reclaimed counters
- [ ] Community — read-only + posting (3 core channels: day-1, relapse-support, wins-today)
- [ ] Push notifications (check-in, partner SOS, milestone)
- [ ] Biometric app lock
- [ ] Supabase backend (auth + DB + realtime)
- [ ] React Native (Expo) app for iOS + Android

**Skip for MVP:**
- Voice AI
- Advanced analytics / craving heatmaps
- Matched partner system (manual invite only)
- Community moderation beyond auto-filter
- Gamification beyond basic badges
- Premium subscription

**MVP success metrics:**
- D7 retention ≥ 30%
- D30 retention ≥ 15%
- Daily active users check-in rate ≥ 40%
- Accountability partner pairing rate ≥ 25% of users
- App Store rating ≥ 4.5

### Phase 2 — Growth (Months 4–9)

- [ ] Premium subscription (Stripe or RevenueCat)
- [ ] AI persistent memory + pattern awareness
- [ ] Craving heatmap and trigger analysis
- [ ] Full gamification: XP, levels, journey map
- [ ] Daily missions
- [ ] Partner matching system (algorithm)
- [ ] Full community: all channels, voice notes
- [ ] Moderation system + volunteer moderator program
- [ ] Smart notifications (AI-driven, pattern-based)
- [ ] Journal with AI prompts
- [ ] All habit types (unlimited)
- [ ] Health improvements timeline per addiction type

### Phase 3 — Scale (Year 2)

- [ ] Voice AI conversations (real-time voice companion)
- [ ] Wearables integration (Apple Watch / Fitbit — heart rate during cravings, breathing guided by HRV)
- [ ] Therapist portal (view-only, consent-gated progress sharing)
- [ ] Group recovery circles (3–8 person closed groups)
- [ ] Real-world rewards ecosystem (Anchor Pro perks: gym discounts, meditation app trials)
- [ ] Employer / insurance B2B offering
- [ ] Web app for desktop journaling + analytics
- [ ] Multi-language support (Spanish, Portuguese, French priority)

---

## 19. Launch Strategy

### Pre-Launch (8 weeks before)

1. **Build a waitlist** — simple landing page with email capture
   - Headline: "Recovery support that doesn't shame you."
   - Collect: email + "what are you working on?" (habit type) — this seeds your first user segments
   - Target: 500–2,000 emails before launch

2. **Community building** — Reddit (r/NoFap, r/stopdrinking, r/problemgambling, r/nosurf, r/quitsmoking) — be genuinely helpful, not promotional. Soft mentions of the app.

3. **Accountability partner seeding** — reach out to 20–30 recovery coaches, counselors, and Reddit moderators. Offer Pro lifetime free in exchange for beta testing and authentic feedback.

4. **TestFlight / Google Play beta** — 200 users, 4 weeks before launch. Gather NPS and qualitative feedback.

### Launch

1. **App Store optimization:** keywords: recovery, addiction, accountability, habit, sobriety, clean streak
2. **PR angle:** "The first recovery app that's okay with relapse" — this is a genuine and provocative angle that will get coverage in wellness and mental health media
3. **Product Hunt launch** — coordinate with supportive community
4. **Reddit launch posts** — authentic, in the relevant communities, with mod permission

### Growth Channels

- **Organic / SEO (web):** Recovery content, "X days sober," addiction science explainers
- **Social (TikTok/Instagram Reels):** "Day 1 to Day 30" transformation stories (user-generated, anonymized with consent)
- **Partnership:** Recovery coaches, therapists, counselors as referral partners
- **Word of mouth:** The accountability partner system is a built-in viral loop — one user invites another

---

## 20. Future Expansion

### Potential Directions

1. **Anchor for Families** — family members of people with addiction get a companion tool for their own recovery and communication
2. **Anchor for Youth (16–22)** — adapted UX for social media / gaming / vaping — with parental insight options (teen-controlled, not surveillance)
3. **Anchor Enterprise** — corporate mental wellness / EAP replacement
4. **Research partnerships** — anonymized aggregate data (opt-in, consent-clear) available to addiction research institutions
5. **AI therapist matching** — Anchor as a funnel into real therapy: "Ready to go deeper? We'll match you with a recovery therapist."

### Technology Bets

- **Biometric emotional state detection** (HRV via wearables → AI knows you're stressed before you do, proactive check-in)
- **AR grounding exercises** (camera-based grounding — "look around you, name what you see" with AR overlays)
- **Offline-first AI** (on-device small model for SOS when no internet — critical for rural users)

---

## Summary — Prioritization Matrix

| Feature | User Impact | Build Effort | Priority |
|---|---|---|---|
| Habit tracking + streak | High | Low | MVP |
| AI companion (basic) | Very High | Medium | MVP |
| Emergency SOS | Very High | Low | MVP |
| Accountability partner | Very High | Medium | MVP |
| Relapse-compassionate UX | Very High | Low | MVP |
| Onboarding flow | High | Medium | MVP |
| Community (basic) | High | Medium | MVP |
| Gamification (basic) | Medium | Low | MVP |
| Premium subscription | High | Medium | Phase 2 |
| AI persistent memory | High | Medium | Phase 2 |
| Craving heatmaps | Medium | Medium | Phase 2 |
| Smart notifications | High | Medium | Phase 2 |
| Voice AI | Medium | High | Phase 3 |
| Wearables | Low | High | Phase 3 |
| Therapist portal | Low | High | Phase 3 |

---

*Document maintained on branch: `claude/recovery-app-design-2LG16`*
*Next step: validate persona assumptions with 10 user interviews before writing a single line of production code.*
