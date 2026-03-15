# CultureCall — 5-Minute Video Script

**Target length:** ~5:00  
**Recording style:** Screen recording + voiceover with product demo  
**Demo mode:** Solo Demo on `http://localhost:3000` (reliable for judges)

---

## 0:00–0:25 — Real problem: The $500K deal that died

**Voiceover:**
"I was working on Microsoft's global sales ops team, and one Tuesday afternoon, a deal just vanished. A Tokyo-based fintech—$500K+ contract—was ghosted. So I pulled the transcript.

*'This is very interesting. We'll discuss internally and get back to you.'*

Our rep Sarah read that as interest. She kept pushing. But in Tokyo business culture, 'very interesting' is actually a polite brush-off. With every follow-up, Sarah made it *less* likely they'd ever come back.

$500K lost. Not because the product was bad. Not because Sarah was a bad rep. Because no one in that room understood what the other person actually *meant*."

**On screen:**
- Show the CultureCall landing page briefly
- Optional: pull up Medium article title for 2 seconds

---

## 0:25–0:50 — The pattern I found everywhere

**Voiceover:**
"I started digging. Three patterns jumped out:

**Pattern 1 — The Tokyo Trap:** US reps misreading politeness as interest in Asia.  
**Pattern 2 — Hiring bias:** Brazilian candidates penalized for leading with relationship-building instead of jumping straight to the point.  
**Pattern 3 — PM/Engineer friction:** A German engineer's direct feedback read as a personal attack instead of precision-based trust.

The same thing every time: *the transcript looked fine, but the relationship was already broken.*"

**On screen:**
- Stay on landing page, optional: Show the three scenario cards if they exist

---

## 0:50–1:15 — Enter CultureCall + Lingo.dev

**Voiceover:**
"So we built **CultureCall**—a real-time cultural intelligence co-pilot powered by **Lingo.dev**.

Here's the key: instead of betting everything on an LLM, we built on version-controlled *cultural glossaries* plus six Lingo.dev SDK methods working together.

One message goes in. It gets matched against Lingo.dev's cultural patterns. Face-threatening language gets flagged. The message gets auto-translated for the other participant via `localizeText()`. The language is auto-detected via `recognizeLocale()`. Coaching insights get localized into each participant's language. All in real time."

**On screen:**
- Show the architecture diagram: highlight Lingo.dev in the center with all SDK methods labeled
- Hover over the flow briefly (not clicking yet)

---

## 1:15–1:45 — Why Lingo.dev is the difference

**Voiceover:**
"Here's why this actually works as a product:

**First:** No black box. Every insight is traceable to a Lingo.dev glossary entry—not a mystery LLM layer.
**Second:** Fast. Rules matching is sub-1ms. Reliable. No API quota limits.
**Third:** Truly inclusive. Every message gets translated for the other party. Every coaching insight appears in *both* languages. The Japanese prospect sees coaching in Japanese, not just English.
**Fourth:** Developer-friendly. We ship a Lingo.dev MCP server so AI coding assistants get structured i18n knowledge—no hallucinated APIs when extending the app.

Six SDK methods. Zero black boxes."

**On screen:**
- Quick show of `locales/cultural/` folder structure in Explorer
- Show one glossary file (e.g., `en-sales.json`) for 3 seconds to show it's real structured data
- Flash the `.vscode/mcp.json` config briefly
- Then switch back to the app

---

## 1:45–4:00 — Live Product Demo (Solo Demo)

**Voiceover:**
"Let me show you how this works with a real demo—using the Sales scenario from our Medium article."

### Demo Setup

**On screen:**
- Navigate to `http://localhost:3000`
- Click **Solo Demo**
- Select **Sales: US Rep ↔ Tokyo Prospect (EN↔JA)**
- Click **Play Script**

**Voiceover:**
"In Solo Demo, we replay pre-recorded conversation scripts so you see consistent cultural moments every time—no surprises on video."

### Feature 1 — Pre-Call Cultural Briefing

**Voiceover:**
"First: **Pre-Call Cultural Briefing**. Before the conversation starts, we show what to watch for. Not a lecture—just practical prevention: 'Avoid pushing for instant decisions. Consensus matters here. Watch for indirect rejection signals.'

30 seconds. Changes your first message. In global calls, the first 30 seconds sets everything."

**On screen:**
- Show or let the briefing auto-display
- Point to the key watch-for item

### Feature 2 — Live Insights from Lingo.dev

**Voiceover:**
"Now as the script plays, watch the insights panel. Every message is being matched against Lingo.dev's Japanese cultural glossary.

Here—'nemawashi' detected. That's 'building consensus before announcing.' Our rep should slow down and listen, not push.

And notice the `🌐` translation subtitles under each message—Lingo.dev's `localizeText()` translated the rep's English into Japanese for the prospect, and vice versa. Plus the `[ja]` badge—that's `recognizeLocale()` confirming the detected language."

**On screen:**
- Messages play in sequence
- Point to cultural insight cards as they populate
- Point to the translation subtitle below a message bubble
- Point to the `[ja]` language badge next to sender name
- Show severity color-coding (critical vs. warning vs. info)

### Feature 3 — Face-Threat Detection (Politeness Analysis)

**Voiceover:**
"Next, we catch **face-threatening moments**—language that adds pressure even if it's technically polite.

For example: 'I need a decision by Friday' or 'Just give me a yes or no'—in a consensus culture, that feels demanding, not direct."

**On screen:**
- If the demo naturally triggers an FTA (face-threat) flag, great. Point to it.
- If not, optionally pause the demo and type a manual message to show the detection

### Feature 4 — Conversation Health Score

**Voiceover:**
"On the right: **Conversation Health Score**. This updates live with four dimensions: Trust, Communication Fit, Engagement, and Risk Level.

You don't have to read every insight—just glance at the score. Are we trending safer or riskier? That's your real-time signal."

**On screen:**
- Point to the Health Score gauge
- Show it updating as new messages come in
- If risk goes up, point that out: *"See—we just triggered a risk moment."*

### Feature 5 — Glossary Viewer (Transparency)

**Voiceover:**
"Now click the **Glossary** tab. Here's the radical part: you can see *exactly* which Lingo.dev entries are behind these insights. No black box.

These are curated cultural concepts from this scenario—*tatemae vs. honne*, formality expectations, rhythm of decision-making—the actual knowledge base."

**On screen:**
- Click the **Glossary** tab
- Scroll through 2-3 key terms
- Show the descriptions and usages

### Feature 6 — Bilingual Insight Cards

**Voiceover:**
"Look at the insight cards. Notice the `🌐` lines below each observation, framework, and suggestion? That's `localizeObject()` translating the coaching text into the prospect's language.

This matters. If your Japanese prospect can't read the cultural coaching, it's a one-way tool. With Lingo.dev, both sides get guidance in their language."

**On screen:**
- Point to an InsightCard showing bilingual text
- Show the English observation with the Japanese `🌐` line below it

### Feature 7 — Linguistic DNA Report

**Voiceover:**
"Finally, **Linguistic DNA**. After the conversation, you get a profile: How formal was the communication? How direct? How much face-saving?

Then we compare that to the target for *this scenario* and surface: strengths, gaps, and coaching. That's where 'be culturally aware' becomes measurable."

**On screen:**
- Click the **DNA** tab
- Point to the radar/bar charts showing Formality, Directness, Face-Saving
- Show the target line and where the conversation landed
- Scroll to Strengths/Gaps section

---

## 4:00–4:25 — What this actually saves (concrete numbers)

**Voiceover:**
"Why does this matter in real life? Money.

**Sales:** Prevent one $500K deal from dying silently—you've paid for the product for a year.

**Recruiting:** Reduce one communication-style false negative per year—saves $150K–250K in mis-hire costs.

**Meetings:** Eliminate just a couple hours per month of rework from PM/Eng friction—saves $6K–12K annually.

Add it up: teams lose half a million to a million per year on these exact dynamics. CultureCall isn't expensive. It's what you're already bleeding."

**On screen:**
- Optional: Show a quick mental math or the Medium article's business section for context

---

## 4:25–4:50 — What's next (Future Scope)

**Voiceover:**
"This is a hackathon demo. But the roadmap is clear:

**One:** Real transcript ingestion—hook into Zoom, Teams, meet captions instead of just chat.

**Two:** Org-specific Lingo.dev playbooks—every company has its own culture beneath the national culture. Teams should version-control their own cultural guidelines.

**Three:** Outcome tracking—measure what actually improved. Pipeline movement. Interview pass-through. Meeting action completion.

**Four:** Privacy controls—because companies won't use this without clear data governance.

And the Lingo.dev MCP server already makes extending the app easier—AI assistants get structured i18n patterns, not hallucinated guesses.

The moat is Lingo.dev. The product is CultureCall. Together, they solve something real."

**On screen:**
- Close the demo, show the home page again
- Optional: Show the roadmap section from the Medium article

---

## 4:50–5:00 — Close: Make global collaboration human again

**Voiceover:**
"I started this because I was tired of watching smart people burn trust with other smart people over miscommunication.

If software can help teams *see* what's really happening in a conversation—while it's still fixable—then deals don't die quietly. Hiring gets fairer. Teams actually connect.

Six Lingo.dev SDK methods. One MCP server. Zero black boxes. That's CultureCall. Built on Lingo.dev."

**On screen:**
- End on a clean view of the app showing insights + translation subtitles
- Optional fade to black or to the Medium article conclusion
