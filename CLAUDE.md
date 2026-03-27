# AXIS — CLAUDE.md
## Complete product context, build plan, and bootstrap path
### Version 1.0 — Last updated: March 2026
### Author: Hendre (Dreyco Pty Ltd, Brisbane)

---

## READ THIS FIRST

This file is the single source of truth for the Axis project. Load it at the start of every Claude Code or Cursor session. Update it after every significant session — what changed, what broke, what was decided and why.

**Current status:** Pre-build. No code written. This document is the foundation.

**The constraint:** Solo founder (Python/FastAPI background), no Swift expertise, limited capital. Build must generate revenue before it can fund the iOS OS-layer work that creates the moat.

---

## 1. WHAT AXIS IS

### One sentence
Axis is an ambient AI agent layer that bonds to iOS at the OS level — reading emails, messages, Instagram, Snapchat, WhatsApp, calendar, health data, and every notification continuously — and communicates back through one persistent thread, the lock screen, and the Dynamic Island. You never manage it. It handles 90% silently and surfaces the one thing that needs you right now.

### The core insight
Every productivity app makes you more phone-dependent. They solve the problem by giving you another thing to manage. Axis inverts this. Your phone already has all the information needed to run your life. The product is the AI that reads it and handles it — not a new container for you to maintain.

**Before Axis:** You open 12 apps to check things. 96 phone pickups/day. 4.5 hours screen time. You are the operating system.

**After Axis:** Axis reads everything. You see 5 things from 340 inputs. 8 deliberate pickups/day. 12 minutes screen time. Axis is the operator. You are the executive.

### The slogan
**Be phone lazy. Be world productive.**

### Product score
**9.5/10** as a product concept. The 0.5 it doesn't get: Apple is building in this direction and the window is 18–24 months. This is a build-fast-to-exit strategy. The acquirer is Apple.

---

## 2. THE PRODUCT

### Core surfaces
| Surface | Tech | What it shows |
|---|---|---|
| Lock screen widget | WidgetKit | One signal — your next action, always visible |
| Dynamic Island | ActivityKit | Live agent status — what Axis is reading right now |
| Notification shelf | UNNotificationServiceExtension | Rewrites every notification with context + action buttons |
| The thread | SwiftUI / React | Persistent iMessage-style conversation with Axis |
| macOS menu bar | NSStatusBar | Current signal in one line, click to expand thread |
| Apple Watch | ClockKit complication | Current signal, one-tap done |
| Control Centre tile | ControlCentreExtension | All active agents + status |

### The thread is the product
One persistent conversation. Axis messages you — you don't go looking for it. Morning digest at 7AM. Proactive alerts when something needs you. Every message ends with a real-world action. Every session ends with "put the phone down."

**Example thread exchange:**
```
AXIS [7:02]: Morning read complete. 43 things came in overnight. 
You need to act on 3. Marcus replied — high intent, draft ready. 
Your 10AM location changed — they emailed at 11PM, you'd have missed it. 
Invoice reminder sent to Greenfield while you slept.
[Send Marcus reply] [What changed at 10AM] [What you handled]

AXIS [7:04]: Sarah DM'd on Instagram. 22 other DMs were noise — 
this one isn't. She's asking about the job you posted. Act today.
[Draft reply] [Queue for noon]

AXIS [7:06]: You're done. Next session at 12:30. 
Put the phone down and go do the real thing.
```

### Data sources Axis reads
| Source | API/Method | What it extracts |
|---|---|---|
| iMessage + WhatsApp | Notification parsing + Share Extension | Sender importance, urgency, draft replies |
| Gmail + Apple Mail | Mail extensions + notifications | Rank 200 emails to 3, draft replies in user voice |
| Instagram DMs | Notification content + Share Extension | Real opportunities buried in social noise |
| Snapchat | Notification + Story context | Cross-reference location with calendar |
| Calendar (all) | EventKit | Conflicts, prep tasks 30min before meetings, travel time |
| Health | HealthKit | Sleep → energy routing, movement gaps |
| Location | CoreLocation | GPS context switching — site mode, home mode |
| Slack / Teams | Notification parsing | Blocker detection, thread ranking |
| Banking / Stripe / Xero | Notification parsing | Overdue invoices, cash flow warnings |
| All notifications | UNNotificationServiceExtension | Filter 95% noise, re-rank remaining 5% |
| Voice / Siri | SiriKit Intents | Hands-free capture: "Add to Axis: call supplier Thursday" |

### Privacy architecture (non-negotiable)
Raw personal data — email content, message content, social DMs — **never leaves the device**. Only generated text and metadata hits the backend. The Claude API is called only for generation (drafting replies, synthesising context, morning digest). All classification and routing runs on-device. This is both the privacy story and the App Store review strategy.

---

## 3. SKILLS — THE AGENT LAYER

Each Skill is a specialist AI agent running continuously in the background. It reads one domain, acts silently where it can, and surfaces only what genuinely needs a human decision. Users can also talk directly to any Skill.

### Skill 1: Email Skill
**What it does:** Reads all inboxes. Ranks 200 emails to 3 that matter. Drafts replies in the user's voice. Sends with one-tap approval.
**Silent actions:** Sends low-stakes replies (meeting confirmations, acknowledgements) without prompting.
**Surfaces:** Urgent thread in Dynamic Island. Drafted reply in notification shelf. Summary in morning digest.
**Tier:** Core (free tier — limited, Pro — full)

### Skill 2: Social Skill
**What it does:** Reads Instagram, Snapchat, Twitter/X, TikTok. Filters 97% as noise. Surfaces DMs that are real opportunities. Cross-references Stories with calendar for conflicts.
**The viral feature:** Jake posts a Snap from Site B. Your calendar shows he has a meeting at Site A in 35 minutes. Axis catches it before you do.
**App intercept:** When user opens Instagram mid-deep-work, Axis intercepts: "Sarah replied — want to see just that and close?" 40 seconds instead of 25 minutes.
**Tier:** Pro

### Skill 3: Calendar Skill
**What it does:** Watches calendar + clock. Surfaces prep tasks 30 min before meetings. Blocks meeting requests during deep work. Detects conflicts. Factors in Maps travel time.
**Tier:** Core

### Skill 4: Health Skill
**What it does:** Reads Apple Health continuously. Sleep quality → adjusts task weighting. Below-threshold sleep = route to admin, not deep work. Movement gaps → surfaces walk reminder.
**Tier:** Core

### Skill 5: Finance Skill
**What it does:** Monitors banking apps, Stripe, Xero, QuickBooks via notifications. Tracks overdue invoices. Flags cash flow warnings. Drafts payment reminders.
**Tier:** Pro

### Skill 6: Site Skill (builders/tradespeople)
**What it does:** GPS-triggered context switch on arrival at site. Offline-first. Voice capture hands-free. Crew status and blocker detection. Delivery and inspection tracking.
**Key:** Works completely offline — syncs when connected. Built for on-site use.
**Tier:** Pro

### Skill 7: Study Skill (students)
**What it does:** Tracks assignments, deadlines, exam schedules. Builds revision plans automatically. Surfaces study sessions when energy and time align. Detects coverage gaps before exams.
**Tier:** Pro

### Skill 8: Team Skill (managers/business owners)
**What it does:** Monitors team task status. Surfaces blockers before they cause delays. Manager pushes a signal to a team member — they see it as their next action. No Slack thread needed.
**Tier:** Team plan

---

## 4. USER MODES

The mode switcher changes the default task vocabulary, energy framing, and AI context. GPS can trigger mode switches automatically (arrive at site → Site mode activates).

| Mode | Who | Auto-trigger |
|---|---|---|
| Personal | Default | — |
| Work | Office workers, solo devs | Arrive at workplace GPS |
| Builder | Tradespeople, construction | Arrive at job site GPS |
| Student | Students at any level | — |
| Military | Service personnel | Manual only |
| Team | Managers, business owners | — |

---

## 5. BUSINESS MODEL

### Pricing
| Tier | Price | What's included |
|---|---|---|
| Free | $0/mo | Thread, Signal, manual tasks, Calendar Skill (read), 5 AI actions/day |
| Pro | $9/mo | Everything + all Skills, unlimited AI, macOS app, Watch, app intercept |
| Team | $14/user/mo | Everything in Pro + signal sharing, manager dashboard, priority broadcast |

### Revenue milestones
| Users | MRR | What it unlocks |
|---|---|---|
| 500 Pro | $4.5K | Proof of life. Ramen. |
| 1,000 Pro | $9K | Sustainable solo ops. |
| 2,000 Pro + 50 teams | $18.7K | **HIRE TRIGGER — 2 Swift contractors** |
| 5,000 Pro + 200 teams | $47.8K | Full team + runway |
| 20,000 Pro + 1,000 teams | $194K | Series A territory |
| 50,000 Pro + 2,500 teams | $485K | Acquisition-ready |

### Conversion mechanic
The brain dump feature is the primary conversion hook. User types anxious stream of consciousness → Claude API returns ranked task list with reasoning → user sees the value instantly. Paywall triggers after first brain dump. Expected conversion: 15–25% of users who complete a brain dump.

### Acquisition target
**Primary: Apple.** Axis is what Apple Intelligence should be. The OS integration expertise, user behaviour data, and agent architecture are the asset. Target acquisition at $500K MRR / 100K MAU.

**Secondary:** Microsoft (Copilot mobile), Anthropic (consumer iOS product), Google (Assistant replacement).

---

## 6. TECHNICAL ARCHITECTURE

### The full stack
| Layer | Tool | Notes |
|---|---|---|
| iOS UI | SwiftUI + UIKit | Native only. No React Native, no Flutter. |
| OS surfaces | WidgetKit + ActivityKit | Lock screen widget, Dynamic Island |
| Notification layer | UNNotificationServiceExtension | Intercepts + rewrites every notification |
| Data access | EventKit, HealthKit, CoreLocation, SiriKit | Apple system frameworks |
| Local storage iOS | Core Data + CloudKit | Device storage + cross-device sync |
| On-device ML | CoreML (Phase 6) | Urgency classifier, relationship graph |
| Backend | FastAPI on Railway | Lightweight — most processing on-device |
| Database | Neon Postgres | Users, threads, subscriptions, team signals |
| Team sync | CloudKit | End-to-end encrypted signal sharing |
| AI | Anthropic Claude API (claude-sonnet-4-5) | Generation only — drafting, coaching, synthesis |
| Dev AI | Claude Code + Cursor IDE | Primary development environment |
| Auth | Sign in with Apple + Clerk | Apple required for App Store |
| Payments | RevenueCat (iOS) + Stripe (Team/web) | StoreKit wrapper for in-app purchases |
| Push | APNs direct | Axis-generated notifications |
| Email | Resend | Onboarding, digests, team invites |
| Analytics | PostHog | Behaviour only — no personal content |
| CI/CD | GitHub + Railway auto-deploy | Push to main → deploys |

### Repository structure
```
axis-backend/         ← FastAPI, Neon Postgres, Claude API
  CLAUDE.md           ← Backend context (update every session)
  src/
    main.py
    routes/
      thread.py
      signals.py
      agents.py
      auth.py
      payments.py
    services/
      claude_service.py
      morning_digest.py
      skills/
        email_skill.py
        calendar_skill.py
        finance_skill.py
        social_skill.py
        site_skill.py
        study_skill.py
        team_skill.py

axis-ios/             ← Swift, SwiftUI, all native iOS
  CLAUDE.md           ← iOS context (Cursor reads this)
  .cursorrules        ← Cursor-specific Axis context
  Axis/
    Views/
      ThreadView.swift
      SignalView.swift
      BrainDumpView.swift
      SkillsView.swift
      DayPlanView.swift
    Extensions/
      NotificationExtension/
      WidgetExtension/
      ShareExtension/
    Services/
      ClaudeAPIService.swift
      CloudKitService.swift
      HealthKitService.swift
      EventKitService.swift

axis-web/             ← React + Vercel (web prototype + web version)
  CLAUDE.md           ← Web context
  src/
    components/
      Thread/
      Signal/
      BrainDump/
      Skills/
```

### The CLAUDE.md rule
Every repository has a CLAUDE.md in the root. Every Cursor session reads .cursorrules. Both are updated after every significant session. This is non-negotiable. The compounding value is lost if they go stale. 5 minutes per session. This is the most important development habit in the build.

---

## 7. THE BOOTSTRAP PATH

### The core logic
You (Python/FastAPI founder, no Swift expertise) can build 70% of Axis to a shippable, revenue-generating standard using Cursor + Claude 3.5 Sonnet for Swift. That 70% is enough to get to $18K MRR. $18K MRR funds two senior Swift contractors who build the OS-level 30% that creates the moat. You keep 100% equity.

### What Cursor + Claude 3.5 can build (do this yourself)
| Feature | Buildable? | Notes |
|---|---|---|
| Thread UI — iMessage style | ✅ Yes | Web and SwiftUI |
| Signal screen — 3 tasks, battle plan | ✅ Yes | Web and SwiftUI |
| Brain dump → ranked task list | ✅ Yes | Pure Claude API — your strongest feature |
| 6 AI Skills — talk directly | ✅ Yes | Pure Claude API, system prompts |
| Daily brief + morning digest | ✅ Yes | Claude API generation |
| RevenueCat Pro paywall | ✅ Yes | Well-documented SDK |
| Sign in with Apple | ✅ Yes | Standard iOS pattern |
| Basic WidgetKit lock screen widget | ⚠️ Possible | Achievable, test on real device |
| EventKit calendar reads | ⚠️ Possible | Achievable with care |
| FastAPI backend | ✅ Yes | Your existing domain |
| Neon Postgres schema | ✅ Yes | Your existing domain |
| Claude API integration | ✅ Yes | Your existing domain |

### What requires Swift contractors (do NOT attempt solo)
| Feature | Why it needs experts |
|---|---|
| UNNotificationServiceExtension | Silently fails on device — impossible to debug without deep iOS knowledge |
| ActivityKit Dynamic Island | New API, thin training data, failure modes are invisible |
| Social Skill notification parsing | Complex multi-app integration, privacy edge cases |
| App intercept (Screen Time API) | Restricted API, easy to get rejected |
| On-device CoreML model | Requires ML + iOS expertise combination |
| Background battery optimisation | Requires Instruments profiling knowledge |

### The viability test
Before spending a dollar or writing a line of code, ask these questions honestly:

**Question 1:** Can you personally build the web prototype in 3 weeks? (React + FastAPI + Claude API = your existing stack)
→ If no: reconsider whether this project is viable for you right now.

**Question 2:** Are you willing to learn basic SwiftUI with Cursor + Claude 3.5 to build a simple iOS shell?
→ If no: you need capital to hire from day one, which changes the path significantly.

**Question 3:** Is $18K MRR achievable in 4 months on a web + basic iOS product with no OS moat?
→ Honest answer: possible but not certain. The brain dump feature is your best shot. If it doesn't convert, the OS moat features won't save you.

**Question 4:** Do you have 15–20 hours/week to build while still working as a carpenter's apprentice?
→ If no: timeline extends. 16-week sprint becomes 32 weeks. Apple's window starts closing at 24 months.

---

## 8. PHASE-BY-PHASE BUILD PLAN

### Phase 1: Web prototype (Weeks 1–4)
**Stack:** React + Vercel, FastAPI + Railway, Neon, Claude API, Clerk, Stripe
**What you build:** Thread UI, Signal screen, Brain Dump, 6 Skills, Daily Brief, mode switcher, Stripe $9/mo paywall
**Goal:** 200 free users. Validate thread model. Prove brain dump converts.
**You need:** Nothing new. This is your existing stack.
**Milestone:** Web app live. 50 people have used the brain dump. NPS measured.

### Phase 2: Basic iOS app (Weeks 5–10)
**Stack:** Cursor + Claude 3.5 Sonnet + SwiftUI
**What you build:** SwiftUI thread, signal screen, brain dump, skills, basic WidgetKit widget, Sign in with Apple, RevenueCat
**Goal:** App Store live. First 500 Pro subscribers ($4.5K MRR).
**You need:** Apple Developer account ($99), real iPhone for testing
**Milestone:** Live on App Store. Brain dump demo video posted. First paying users.

### Phase 3: Growth + Team plan (Weeks 11–12)
**Stack:** Same + CloudKit for team sync
**What you build:** Team signal sharing, manager view, Team plan at $14/user/mo, Google Calendar integration, morning digest cron job
**Goal:** $18K MRR trigger point. 2,000 Pro + 50 teams.
**Milestone:** Revenue hit. Swift contractors hired.

### Phase 4: OS moat — contractors build (Weeks 13–24)
**Stack:** 2 senior Swift contractors + you on backend
**What they build:** UNNotificationServiceExtension, ActivityKit Dynamic Island, Social Skill, app intercept, Health Skill deep integration
**What you build:** Backend agent processing, Claude API integration for social parsing, prompt engineering
**Milestone:** Social Skill live. Viral growth begins. Product becomes genuinely hard to copy.

### Phase 5: Scale (Months 7–12)
**Stack:** Full team, potential backend hire
**What gets built:** Finance Skill, Site Skill deep, Study Skill, on-device CoreML classification starts
**Milestone:** $100K+ MRR. Series A fundable. Acquisition conversations warming.

### Phase 6: Acquisition ready (Months 13–18)
**What gets built:** On-device ML model, personalised voice model, full relationship graph, Apple Watch, macOS app polished
**Milestone:** $500K MRR, 100K MAU, on-device intelligence, full OS surface coverage.

---

## 9. SPRINT PLAN — WEEK BY WEEK (Phases 1–3)

### Week 1 — Foundation (no code)
- [ ] Create GitHub repos: axis-backend, axis-ios, axis-web
- [ ] Write CLAUDE.md for all three repos (this document as the base)
- [ ] Create .cursorrules for axis-ios
- [ ] Set up Railway project: axis-production
- [ ] Set up Neon DB: users, threads, signals, agents, subscriptions tables
- [ ] Set up Clerk auth
- [ ] Set up PostHog analytics
- [ ] Create Figma file: design system + all screens
- [ ] Create Linear project: all Phase 1 issues
- [ ] Register Apple Developer account ($99) — do this NOW, takes days
- [ ] Post Swift contractor brief on Upwork (even if not hiring yet — pipeline)

### Week 2–3 — Web prototype core
- [ ] FastAPI: /thread POST, GET (create and fetch messages)
- [ ] FastAPI: /signal GET (returns current top 3 tasks)
- [ ] FastAPI: /tasks POST, PATCH, DELETE
- [ ] FastAPI: /brain-dump POST (Claude API call, returns ranked list)
- [ ] FastAPI: /brief GET (daily brief generation)
- [ ] Claude API: thread system prompt (full Axis context)
- [ ] Claude API: brain dump → ranked task list prompt (test 10 variations)
- [ ] Claude API: morning digest generation prompt
- [ ] React: Thread screen — messages, Axis avatar, action buttons
- [ ] React: Signal screen — hero task, queue, battle plan expand
- [ ] React: Brain dump screen — textarea + ranked output
- [ ] Clerk: auth flow
- [ ] Stripe: $9/mo Pro paywall (triggers after first brain dump)

### Week 4 — Skills + launch
- [ ] 6 skill system prompts written and tested (Email, Calendar, Finance, Site, Study, Team)
- [ ] React: Skills screen — 6 cards, talk to each
- [ ] Claude API: skill conversation endpoints (each with different system prompt)
- [ ] React: Mode switcher (Personal, Work, Builder, Student, Military)
- [ ] React: Day plan screen — structured schedule
- [ ] Landing page: axis.app — one liner, waitlist, 3 screenshots
- [ ] Share with 50 people — get reactions specifically to brain dump
- [ ] PostHog events: brain_dump_used, brief_requested, task_done, skill_opened, converted_pro

### Week 5–7 — iOS app (Cursor + Claude 3.5)
- [ ] Xcode project setup, folder structure
- [ ] .cursorrules written with full iOS Axis context
- [ ] SwiftUI: Thread screen
- [ ] SwiftUI: Signal screen — hero task, queue, battle plan, Pomodoro timer
- [ ] SwiftUI: Brain dump screen
- [ ] SwiftUI: Skills screen — 6 skills, talk directly
- [ ] SwiftUI: Day plan screen
- [ ] Sign in with Apple
- [ ] RevenueCat iOS SDK — Pro paywall
- [ ] Basic WidgetKit lock screen widget — one signal, updates every 15min
- [ ] APNs push: morning digest arrives in thread at 7AM local time
- [ ] Real device testing — NEVER simulator only for WidgetKit

### Week 8 — TestFlight launch
- [ ] TestFlight submission + review pass
- [ ] Onboarding flow: name, mode, first 3 tasks
- [ ] Resend: welcome email → Day 3 → Day 7 sequences
- [ ] In-app NPS prompt at Day 7
- [ ] Invite 500 users: Twitter/X, Indie Hackers, personal network
- [ ] Crashlytics crash reporting
- [ ] Target: 50 Pro conversions from TestFlight = $450 MRR. First signal.

### Week 9–10 — App Store + growth
- [ ] App Store screenshots (all required sizes)
- [ ] Privacy nutrition labels — fill these out carefully
- [ ] App Store Connect: metadata, keywords, description
- [ ] App Store submission
- [ ] ProductHunt launch: "The AI that reads your anxious brain"
- [ ] Twitter/X: post brain dump demo video (45 sec screen recording)
- [ ] Gmail API integration (basic — reads labels, flags urgent)
- [ ] Target: 500 Pro users = $4.5K MRR

### Week 11–12 — Team plan + revenue milestone
- [ ] CloudKit: team signal sharing schema
- [ ] SwiftUI: Team signal push (manager sends task to team member)
- [ ] SwiftUI: Manager view — team task status
- [ ] RevenueCat: Team plan $14/user/mo
- [ ] Google Calendar API (web) — surface prep tasks
- [ ] Retention: daily habit streak, week progress dots
- [ ] Morning digest cron job — runs at 6:50AM user local time
- [ ] Target: 2,000 Pro + 50 teams = $18.7K MRR → HIRE CONTRACTORS

---

## 10. SWIFT CONTRACTOR BRIEF

When you hit $18K MRR, post this to Upwork, Toptal, and Twitter/X #iOSDev:

---

**Senior iOS Engineer — Axis (AI Agent OS Layer for iPhone)**

**Rate:** $150–180/hr · 20hrs/week
**Duration:** 3 months initial, ongoing if strong
**Location:** Remote · AUS/APAC timezone strongly preferred
**Hiring:** 2 contractors simultaneously — you will cross-review each other's implementations

**What Axis is:**
An ambient AI agent layer for iPhone that reads emails, messages, Instagram, Snapchat, calendar, and health data continuously. Communicates back through the lock screen, Dynamic Island, and a persistent thread. Think: what Siri should have been. Currently live on App Store with [X] paying users.

**What you'll build:**
- UNNotificationServiceExtension — intercepts and rewrites every notification with AI context and action buttons
- ActivityKit Live Activities — Dynamic Island showing live agent status
- Social Skill — Instagram + Snapchat notification parsing and cross-referencing
- Screen Time API app intercept — redirects distraction opens to specific content
- On-device CoreML urgency classifier (Phase 2)

**What's already built:**
Full SwiftUI app, thread UI, signal screen, brain dump, 6 skills, basic WidgetKit widget, RevenueCat, Sign in with Apple, CloudKit sync, FastAPI backend. You're building the OS-level moat on top of a working product with paying users.

**Stack:**
SwiftUI, WidgetKit, ActivityKit, UNNotificationServiceExtension, EventKit, HealthKit, CoreLocation, SiriKit, CoreML, CloudKit, RevenueCat iOS SDK, APNs. Backend: FastAPI + Neon Postgres on Railway.

**To apply:**
Send 2–3 examples of WidgetKit or notification extension work shipped to App Store. Describe the hardest background processing or notification bug you've debugged and how you found it. If you can't tell that story, you haven't done this in production.

---

**Why two contractors:**
We hire two senior iOS engineers and you cross-check each other on hard OS APIs. Where you disagree is where the hard problem is. The notification extension and Dynamic Island are the features that determine App Store approval and battery impact. Two sets of eyes is mandatory, not optional.

---

## 11. THE 10 RULES

1. **Never build Phase 2 until Phase 1 has NPS above 40.** Do not build the Email agent until 200 TestFlight users use the thread daily for 7 days. Agents are useless if the thread habit doesn't exist first.

2. **One repo per layer — never mix iOS and backend.** The interface between them is a documented API contract. Never let them bleed.

3. **Test every OS feature on a real device.** WidgetKit, ActivityKit, notification extensions, and background refresh all behave differently in the simulator. Real device testing is not optional.

4. **Privacy architecture is non-negotiable from day one.** Raw personal data never leaves the device. Only generated text and metadata hits the backend. This is the App Store strategy and the trust story.

5. **Battery impact must be measured before every TestFlight build.** Run Instruments battery profiling. Target: under 5% battery per day for all background agents combined. One-star reviews for battery drain kill apps.

6. **App Store review is a design constraint.** The notification interceptor and social reading features will face scrutiny. Frame every feature as explicit user benefit. Have privacy policy and data use declarations ready.

7. **Update CLAUDE.md and .cursorrules after every significant session.** What changed, what broke, what was decided. 5 minutes per session. Non-negotiable.

8. **Ship the Social Skill before Month 6.** It's the viral feature — the one people show their friends. Don't miss this window.

9. **Don't enter acquisition conversations before $500K MRR.** Strong revenue = strong negotiating position. Apple pays more for proven products.

10. **This is an 18-month sprint, not a 10-year company.** Every decision optimises for: getting to acquisition conversations with Apple, or building the moat that makes you worth acquiring.

---

## 12. THE VIABILITY DECISION

### Scenario A: Bootstrap (recommended if possible)
**Requirement:** 15–20 hrs/week available after carpentry. 3–4 months runway on living expenses.
**Path:** Web prototype → basic iOS → $18K MRR → hire contractors.
**Risk:** Time constraint. If 15 hrs/week isn't realistic, everything extends and the window closes.
**Verdict:** Viable if you have the time. The brain dump feature alone is strong enough to get to revenue without the OS moat.

### Scenario B: Raise $50–80K first
**Requirement:** Angel round or savings. Hire 2 Swift contractors from day one.
**Path:** Web prototype (3 weeks) → full native iOS with contractors from week 4.
**Risk:** Finding angel capital in Brisbane for a pre-revenue product.
**Verdict:** Faster path to the moat. Worth pursuing alongside bootstrap.
**How:** YC application (Apply now — next batch deadline). Blackbird Ventures (AU). Startmate. If none work, bootstrap.

### Scenario C: Not viable right now
**Signs it's not viable:**
- Less than 10 hours/week available consistently
- No savings runway — need income from the product in 60 days
- Not willing to learn basic SwiftUI with Cursor assistance

**What to do instead:** Sell the concept. Write the full product spec as a deck. Find a technical co-founder or a company that could build this. The concept is genuinely valuable — it doesn't have to be you who builds it.

### The honest question
The window is 18–24 months before Apple builds this natively. Every month of delay is a month closer to the window closing. If you're going to do this, the decision needs to be made this week, not next month.

---

## 13. CONTACTS AND RESOURCES

### Where to find Swift contractors
- Upwork: search "senior iOS developer SwiftUI WidgetKit" — filter 90%+ rating, 5+ years
- Toptal iOS: more expensive ($200+/hr), pre-vetted
- Twitter/X: post in #iOSDev, #Swift, #iOS
- CocoaHeads AU: Melbourne and Sydney iOS developer meetups
- LinkedIn: Brisbane + Sydney + Melbourne "senior iOS SwiftUI"

### Key Apple documentation
- WidgetKit: developer.apple.com/documentation/widgetkit
- ActivityKit: developer.apple.com/documentation/activitykit
- UNNotificationServiceExtension: developer.apple.com/documentation/usernotifications
- EventKit: developer.apple.com/documentation/eventkit
- SiriKit: developer.apple.com/documentation/sirikit

### Key third-party services
- RevenueCat: revenuecat.com (in-app subscriptions)
- PostHog: posthog.com (analytics, privacy-first)
- Railway: railway.app (backend hosting — you already use this)
- Neon: neon.tech (Postgres — you already use this)
- Clerk: clerk.com (auth — you already use this)
- Resend: resend.com (email — you already use this)
- Anthropic API: anthropic.com/api (claude-sonnet-4-5 for in-app)

---

## 14. CURRENT STATUS

**Date:** March 2026
**Phase:** 0 — Pre-build
**Next action:** Make the viability decision (Scenario A, B, or C above). If A or B: create Apple Developer account, create GitHub repos, write .cursorrules for iOS repo, start web prototype.

**What's been decided:**
- Product name: Axis
- Slogan: Be phone lazy. Be world productive.
- Core tech: FastAPI + Neon + Claude API (backend) + SwiftUI (iOS)
- Dev tools: Cursor + Claude 3.5 Sonnet (Swift), Claude Code (backend)
- Business model: Free / $9 Pro / $14 Team
- Acquisition target: Apple
- Timeline: 18 months

**What's NOT decided yet:**
- Bootstrap vs raise capital
- Solo vs co-founder
- Full-time vs part-time build

---

*Update this section after every session. Date, what shipped, what changed, what's next.*

---

**END OF AXIS CLAUDE.md v1.0**
*This document is the single source of truth. Load it at the start of every session.*
