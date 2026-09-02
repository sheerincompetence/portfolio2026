# Design in Depth

Source: https://andrewsheerin.com/work/design-in-depth.html
Description: Decision sheets from designing Antare's event card - delayed corrections, wrong jobs, and the weeds of information density.

---

Field notes · 9 design 'should haves'

# Design in depth: Antare's Event Card

Decisions I should have made earlier - and the evidence that explains why I didn't.

Subject: Antare's *Event Card*, the modular unit of a real-time security feed; a new component in a new system of a new product.

Result: Delayed corrections - wrong jobs, lazy affordances, ideas that looked right until real data arrived. For the editorial story of the feed, see [Compressing Reality](https://andrewsheerin.com/work/antare.html).

 Sheet 01

## Wireframes are maps, not designs

Should have questioned earlier: which of the information types actually serves understanding in a scan?

[Image: Early event card wireframes mapping title, categorisation, impact, workflow, activity and metadata]

Early mapping of the data space - physical relation of title (narrative), categorisation, prioritisation, impact, workflow state, activity, process options, metadata.

Metadata was assumed from day one: every DEMS system puts it front and centre. Then I stripped it when I realised much of it was an artefact of metrics-driven systems and that **understanding** was the card's primary job.

Interestingly, later, metadata came back. Length of clip, location, person involved: setting context before a second of video is watched.

 Sheet 02

## When a good model infects the wrong surface

Should have separated jobs sooner: feed is scan → confirm. Detail is investigate.

[Image: Early wireframes emphasising key moments structure on the event card]

*Key-moments thinking reaches the card.*

[Image: Incident detail page with key moments timeline highlighted]

*Where that model actually belongs - investigation, not the feed glance.*

After hundreds of bodyworn clips I saw a common structure: events aren't one smooth arc. They're a collection of meaningful beats. Warning signs. Exposition. Peaks with long dull stretches. Resolutions that flare again.

That moment-based model (rightly) drove the incident detail page - and then infected the event card for a while. The card tried to "agree" with detail. Useful belief, wrong job. Cards don't exist for navigating and investigating.

[Image: Early high-fidelity card built around a key moments list]

*Early card following the same nature - a mini analysis window pretending to be a feed item.*

 Sheet 03

## Expand was lazy design

Should have done the hard cull of what truly belongs on the card - instead of inventing a place to hide everything. This is the design equivalent of sweeping under the rug.

[Image: Contracted event card showing compact scan state before expand]

*The mechanism: a contracted card for scanning - expand when you want more.*

[Image: Colour-coded suggested click areas on the same contracted card and its expanded state]

*Same idea as a hit map - the overlays make how much work the surface was doing unmistakable.*

Early explorations obsess over compact + expanded versions of the same card. Best of all worlds: all the data, no overload - if users are interested, they expand is the justification.

In practice that was avoidance. I wasn't rationalising what **truly** belongs on the card; I was wrangling affordances so I wouldn't have to.

Drawing these click areas and colouring complexity on the page made the evasion obvious. I didn't fully redesign until after mobile forced the issue, but the doubt was planted.

 Sheet 04

## Workflow hitchhiked on "understanding the event"

Should have treated process as a system to integrate with events - not as chrome bolted onto the card.

[Image: Fully loaded event card with Resolve menu open - workflow actions circled]

*Competitors bolt basic workflow onto the card. So did I.*

It "makes sense." Everyone's DEMS does it. Wanting to process an incident in place is self-evident.

Workflow remained stubbornly present on many iterations because it was impossible to imagine a user doing *nothing* after seeing an important event. It wasn't until I gave myself permission to investigate the "thing users do after seeing important events" at a later date that I fully identified it as a separate system that needs integrating into events, not living *as* the event.

 Sheet 05

## Visually elegant. Operationally ridiculous.

Should have killed two-tier cards when the question "why show something that isn't worth noticing?" first arose - not four iterations later.

[Image: Higher-interest event card with video thumbnail]

*Above importance threshold = Earns a thumb.*

[Image: Lower-interest compact event card without thumbnail]

*Below importance threshold = No thumb.*

Same era of compression: metadata gone or hidden, workflow behind a menu, key moments behind expand. Deceptive feeling of success but this is just different skins on one problem - too much data for a card.

Demoting some events by stripping the thumbnail looked like a mixed-interest feed. Visually it worked. Operationally: why surface something that isn't worth noticing?

The two-tier structure survived four iterations. It took real data in the feed before the lesson stuck - synthetic data had made bad decisions feel plausible.

[Image: v5 card states still showing compact, rich, and expanded variants with annotations]

*v5 is cleaner - and still carrying two wrong ideas: two-tier events, and click-to-expand. Not forced to optimise yet.*

 Sheet 06

## Right alone, wrong in a list

Should have judged the 'impact lozenge in the feed earlier - not just in isolation.

[Image: Lozenge card with video thumbnail - impact colour sandwiched between image and title]

*Many components require constant zooming in and out to design successfully. Volume, context and environment change how they are perceived.*

A brief obsession with getting the cards to compress vertically as much as possible led me to float the image left but this ruined the scannability of the vital 'impact lozenge'. My fix worked nicely on one card but was hideous in aggregate.

[Image: Full feed mocked up with many large lozenge event cards]

*One lozenge looks scan-optimised. A stack of them shouts. More urgency theatre than confidence.*

Process footnote: a Figma plugin pulling dummy data from Sheets was how I stress-tested a single component at scale. Necessary a year ago; much easier now with AI. [Plugin in operation](https://andrewsheerin.com/assets/images/design-in-depth/figma-dummy-data-plugin.png)

 Sheet 07

## Mobile done last - still fed upstream

Should have used phone constraints earlier as a critique engine, even without a shipping app.

We didn't discover the need for an app until late in the process. Designing under its constraints forced bare-minimum thinking that 'fed upwards' into the console card.

[Image: Finished mobile event card]

*Every element has to earn its keep. Metadata collapses to the one shift-critical cue for supervisors: who shot it. Owner workflow rides higher here - the job during a shift is not the same as console post-review.*

Two personas, different jobs: guests own their events and often need to add context; supervisors watch many people. That split changes what the card carries.

Supervisor App

[Image: Supervisor mobile feed with events from multiple users]

*Own events plus the team: more data on the card because the feed spans many people.*

Guest App

[Image: Guest mobile feed showing the user's own events]

*Little reason to browse for nostalgia - they lived it. One vital job: add human context to what matters.*

Customisable cards

[Image: Guest feed result after applying options that reshape commented events]

*Two-tier presentation returns - this time for an operational reason, not space-saving. Hide the thumb after commenting and you can see at a glance which events already have context.*

[Image: Guest feed options controlling whether commented events show video thumbnails]

*A setting, not a redesign: users can reshape the card to match how they work the shift.*

Portable event components

[Image: Supervisor notifications using portable event card fragments]

*Same card ingredients, re-used in notifications so alerts still feel like events.*

[Image: Supervisor home screen surfacing events awaiting action]

*Outside the feed too: home surfaces events awaiting action before any scan begins.*

 Sheet 08

## Compressing the 'boring' essentials

Should have given earlier careful thought to micro-compression of smaller components rather than redesigning the whole card.

[Image: Five-state interaction with 3 jobs for incident ID copy: idle, hover, press, copied, return]

*Four jobs in the footprint of one quiet string: ID, copy ID, copy link, share.*

You don't always have to redesign the whole component. Thoughtful compression at the constituent level - idle stays quiet; hover becomes a multi-target; feedback is temporary - accrues across the card without turning the feed into a toolbar.

Important but not urgent information still has to live somewhere. This is how it earned its keep without looking urgent.

 Sheet 09

## Where the card settled - for now

Should've got here sooner. Real data; real compression; real time distribution; real randomness. These things hardened the settled version - for now.

[Image: Finished single event card with video, impact bar, title, summary and setting metadata]

[Image: Antare events feed showing stacked event cards in context]

*Atom, then habitat. Even "fully loaded" feels calm and scannable - and still has to hold up in the feed.*

[Image: Sheet of finished event card flavours and states for engineering handoff]

*Handoff: one modular, predictable card reacting to different locations and amounts of data.*

This is a record of corrections that arrived late - usually because I latched onto an elegant idea and the lack of real data or customers delayed the obvious questions.

**In my defence...** These things are easy to catch in hindsight. You could argue that it's only having knowledge of what the system is that allows you to identify what's failing the system. So many of these designs were me thinking my way to an understanding of that system through making and observing. At the start, I wasn't even sure I knew what constituted an event. By the end, I was asking questions about salience vs. urgency. And I'm sure in 6 months time I'll see even more mistakes I haven't realised I've made yet.
