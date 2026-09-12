# CarbonX — Design System & UI Direction

> **Purpose:** Visual design specification for the CarbonX hackathon prototype.
>  
> **Reference direction:** Combine the supplied references' premium SaaS landing-page composition, analytical carbon dashboard, and modern enterprise/AI aesthetic. Do not copy any brand or screenshot literally.

---

## 1. Design North Star

CarbonX should feel like:

**Premium climate-tech infrastructure + modern B2B marketplace + intelligent data platform.**

Communicate three things immediately:

1. **Trust** — industrial companies can confidently trade a valuable resource.
2. **Intelligence** — matching and logistics are data-driven.
3. **Momentum** — captured CO₂ visibly moves through a circular ecosystem.

### Visual personality

- Clean
- Editorial
- Premium
- Industrial
- Technical
- Calm
- Data-rich
- Credible
- Minimal but not empty

### Avoid

- Generic green-startup visuals
- Excessive leaves/tree imagery
- Cartoon illustrations
- Bright neon green
- Heavy glassmorphism
- Excessive gradients
- Generic dashboard templates
- Dense tables everywhere
- Huge blocks of text

---

## 2. Reference Translation

### Reference A — Premium SaaS landing page

Take:

- Large rounded white content container
- Generous whitespace
- Minimal navigation
- Oversized headline
- Strong dark typography
- Clear CTA hierarchy
- Editorial left/right composition
- Floating metric cards
- Soft gray outer background

Adapt it to CarbonX with:

- CO₂ supply network visual
- Industrial/carbon imagery
- Floating cards for `500 t/month`, `99.2% purity`, `94% match`, `₹18,500 logistics`, `150 km`

### Reference B — Carbon analytics dashboard

Take:

- Left sidebar
- Large dashboard title
- Compact KPI cards
- Analytical charts
- Light blue/gray background
- Navy typography
- Status indicators

Adapt it to:

- CO₂ available
- CO₂ matched
- Active requests
- Active deals
- Potential value
- Logistics
- Regional supply/demand

### Reference C — Modern AI/enterprise landing page

Take:

- Centered hero composition
- Thin orbital/network lines
- Floating data cards
- Minimal black/white UI
- Small trust indicators
- Strong CTA

Adapt it into a **carbon network** rather than a generic AI graphic.

---

# 3. Brand

## Product

**CarbonX**

## Primary tagline

**Captured Carbon. Matched to Opportunity.**

## Hero alternative

**Turn captured CO₂ into a resource.**

## Logo direction

Simple geometric wordmark:

`CarbonX`

Optional symbol:

- Circular carbon atom
- Two connected nodes
- Circular-economy loop
- An X formed by supply/demand paths

Keep it simple.

---

# 4. Color System

Use mostly neutral colors with controlled blue/teal accents.

```text
Ink / Primary       #0B1220
Deep Navy           #102A43
Blue                #2563EB
Teal                #0F766E
Success Green       #16A34A
White               #FFFFFF
Off White           #F8FAFC
Surface             #F1F5F9
Border              #E2E8F0
Muted Text          #64748B
Secondary Text      #475569
Warning             #D97706
Danger              #DC2626
```

### Usage

- Navy: headings, navigation, important text
- Blue: primary actions and selected states
- Teal: carbon/circular-economy accents
- Green: positive status only
- Amber: pending/warning
- Red: errors/rejections
- Gray: supporting content

**Do not make the entire UI green.**

---

# 5. Backgrounds

### Marketing

Outer background:

`#F3F4F6`

Main content can sit inside large white rounded containers.

### Dashboard

Use:

`#F8FAFC`

Cards are white.

---

# 6. Typography

Primary font:

**Inter**

Optional display font:

**Geist / Inter Tight / Manrope**

Use no more than two font families.

### Marketing

```text
Hero:        64px, 600–700, line-height 0.95–1.05
H2:          42px, 600
H3:          24px, 600
Body:        16px, line-height 1.6
Small:       13–14px
```

### Dashboard

```text
Page title:  32–40px
KPI:         28–36px, 600
Card title:  15–17px, 600
Label:       11–13px
```

Use negative letter-spacing on large headings.

---

# 7. Layout

Use a 12-column responsive grid.

### Desktop

```text
Max content width: 1280–1440px
Page padding:      32px
Marketing spacing: 64–128px
Dashboard padding: 24–32px
```

### Tablet

`24px` horizontal padding.

### Mobile

`16px` horizontal padding.

---

# 8. Radius & Elevation

```text
Small:       8px
Buttons:     10–12px
Cards:       14–18px
Large cards: 24–32px
Hero:        28–36px
```

Prefer borders over heavy shadows.

```text
Card shadow:
0 1px 2px rgba(15, 23, 42, 0.04)

Elevated:
0 8px 30px rgba(15, 23, 42, 0.08)

Floating:
0 18px 45px rgba(15, 23, 42, 0.12)
```

---

# 9. Marketing Navigation

Desktop:

```text
CarbonX      Marketplace   Solutions   How It Works   Insights

                                      Sign In   Get Started
```

Height: `72–80px`.

Keep it minimal.

Primary CTA:

**Get Started**

Secondary:

**Explore Marketplace**

---

# 10. Landing Page

Structure:

```text
Header
Hero
Ecosystem Metrics
How CarbonX Works
Marketplace Preview
Matching Intelligence
Logistics Intelligence
Applications
Analytics Preview
Final CTA
Footer
```

The page should feel like premium B2B SaaS, not a climate NGO website.

---

# 11. Hero

### Eyebrow

`THE CARBON UTILIZATION MARKETPLACE`

### Headline

**Turn captured CO₂ into a resource.**

### Supporting copy

> CarbonX connects industrial CO₂ suppliers with businesses that can put captured carbon to productive use—with intelligent matching, marketplace discovery, and logistics built in.

### CTA

`Explore Marketplace →`

Secondary:

`List Captured CO₂`

### Composition

Use a large rounded visual on the right.

Central node:

```text
CO₂
500 t
```

Connected nodes:

```text
STEEL
500 t/month

CEMENT
800 t/month

SYNTHETIC FUEL
300 t/month

CONCRETE
450 t/month
```

Floating cards:

```text
94% Match
99.2% Purity
150 km
₹18,500 Logistics
```

Use thin curved network lines.

---

# 12. Hero Motion

Keep animation understated:

- Nodes pulse slowly
- Lines animate gradually
- Match score counts up
- Floating cards move subtly
- A carbon particle can travel along a route

Use `150–800ms` micro-interactions and `4–8s` ambient loops.

Respect:

`prefers-reduced-motion`.

---

# 13. Ecosystem Metrics

Replace fake customer logos with truthful product/demo metrics.

```text
12,450 t
CO₂ Available

38
Active Suppliers

24
Utilization Projects

₹4.2 Cr
Potential Carbon Value
```

Secondary ecosystem strip:

```text
CEMENT   STEEL   POWER   FUELS   MATERIALS   GREENHOUSES
```

---

# 14. How It Works

Four steps:

```text
01 CAPTURE
Capture CO₂ from industrial processes.

02 LIST
Publish quantity, purity, price and location.

03 MATCH
Find compatible utilization demand.

04 DELIVER
Estimate logistics and complete the transaction.
```

Desktop: horizontal flow.

Mobile: vertical flow.

---

# 15. Marketplace Preview

Headline:

**A marketplace for captured carbon.**

Supporting copy:

> Find supply by quantity, purity, location, application and price.

Show 3–4 realistic listing cards.

Example:

```text
STEEL                                      ● ACTIVE

Mumbai Steel Works
Mumbai, Maharashtra

500 t/month        99.2% purity

₹4,500 / tonne

[ 94% Match ]                    View Supply →
```

---

# 16. Match Intelligence Section

Split layout.

Left:

**Find the right carbon, not just any carbon.**

Copy:

> CarbonX evaluates quantity, purity, distance, price and application compatibility to rank the most useful supply.

Right:

```text
┌───────────────────────────┐
│           94%             │
│          MATCH            │
│                           │
│ Mumbai Steel Works        │
│ → GreenFuel Technologies  │
│                           │
│ ✓ Quantity compatible     │
│ ✓ Purity exceeds need     │
│ ✓ Within preferred range  │
│ ✓ Price within budget     │
│ ✓ Application compatible  │
└───────────────────────────┘
```

Make the match score a signature CarbonX visual.

---

# 17. Logistics Section

Headline:

**The best match is also the one you can move.**

Visual:

```text
MUMBAI
  │
  │ 150 km
  │
  ▼
PUNE
```

Information card:

```text
CO₂ Tanker
300 tonnes

Estimated cost
₹18,500

₹61.67 / tonne

2 day delivery
```

Make logistics part of the product story, not an afterthought.

---

# 18. Dashboard Preview

Use the supplied carbon-dashboard visual language.

```text
┌────────────┬─────────────────────────────────────────┐
│ CarbonX    │ Overview                                │
│            │                                         │
│ Dashboard  │ KPI   KPI   KPI   KPI                   │
│ Market     │                                         │
│ Matches    │ ┌─────────────────────────────────────┐ │
│ Requests   │ │ Supply / Demand chart              │ │
│ Deals      │ └─────────────────────────────────────┘ │
│ Analytics  │                                         │
│            │ ┌────────────────┐ ┌─────────────────┐ │
│ Settings   │ │ Top Matches    │ │ CO₂ by Source   │ │
│            │ └────────────────┘ └─────────────────┘ │
└────────────┴─────────────────────────────────────────┘
```

---

# 19. Application Dashboard Shell

### Sidebar

Width: `240–260px`.

White background.

```text
CARBONX

OVERVIEW
  Dashboard

MARKETPLACE
  Discover CO₂
  My Listings
  Matches

TRANSACTIONS
  Requests
  Deals

LOGISTICS
  Shipments

INSIGHTS
  Analytics

SYSTEM
  Settings
```

Bottom:

```text
User profile
Company
Role
```

Active item:

- Filled blue/light-blue surface
- Slightly rounded
- Small icon
- Clear contrast

---

# 20. Dashboard Header

Top:

```text
Search or ask CarbonX AI...

                    Notifications
                    Company / User
```

Page heading:

```text
Overview

Monitor your carbon supply,
matches and transactions.
```

Right:

`+ List CO₂`

---

# 21. KPI Cards

Use four primary cards.

```text
AVAILABLE CO₂
2,450 t
+12.5% vs last month
```

```text
ACTIVE MATCHES
24
+8 this month
```

```text
ACTIVE REQUESTS
8
3 awaiting action
```

```text
POTENTIAL VALUE
₹1.2 Cr
+18.4% vs last month
```

Include subtle trend indicators.

---

# 22. Marketplace UI

Search:

```text
⌕ Search by supplier, location, application...
```

Filter chips:

```text
Source
Purity
Quantity
Price
Distance
Application
```

Keep filters horizontally aligned on desktop.

On mobile, collapse into a filter button/drawer.

---

# 23. Listing Card

```text
┌─────────────────────────────────────────────┐
│ STEEL                              ● ACTIVE │
│                                             │
│ Mumbai Steel Works                          │
│ Mumbai, Maharashtra                         │
│                                             │
│ 500 t/month       99.2% purity              │
│                                             │
│ ₹4,500 / tonne                              │
│                                             │
│ ┌─────────────┐                             │
│ │ 94% Match   │             View Details → │
│ └─────────────┘                             │
└─────────────────────────────────────────────┘
```

The match badge is a key differentiator.

---

# 24. Listing Detail

Header:

```text
← Back to Marketplace

Steel
Captured CO₂

Mumbai Steel Works
Mumbai, Maharashtra

● Available
```

Main:

```text
SUPPLY DETAILS                  MATCH

500 t/month                     94%
99.2% purity                    Excellent match
₹4,500 / tonne
```

Then:

```text
Technical Details
Location
Logistics Estimate
Available Dates
```

Sticky action:

```text
₹13,50,000 estimated carbon value

[ Request Supply ]
```

---

# 25. Create Listing

Use a four-step wizard:

```text
1 Source ─── 2 Supply ─── 3 Location ─── 4 Review
```

### Step 1

- Source type
- Facility name
- Capture method

### Step 2

- Available quantity
- Unit
- Purity
- Price per tonne
- Availability date

### Step 3

- Location
- Latitude
- Longitude
- Map

### Step 4

Show complete summary.

CTA:

**Publish Listing**

---

# 26. Buyer Requirement

Form:

```text
What are you looking for?

Application
[ Synthetic Fuel ]

Required quantity
[ 300 ] tonnes / month

Minimum purity
[ 99 ] %

Preferred location
[ Pune ]

Maximum distance
[ 250 ] km

Maximum price
[ ₹5,000 ] / tonne
```

CTA:

**Find Matches →**

---

# 27. Match Page

This is a judge-facing priority screen.

```text
MATCH ANALYSIS

SUPPLY                         DEMAND

Mumbai Steel Works             GreenFuel Technologies

500 t/month                    300 t/month
99.2% purity                   99% required

             ┌─────────────┐
             │     94%     │
             │    MATCH    │
             └─────────────┘
```

Breakdown:

```text
Quantity       ██████████ 100
Purity         █████████▊ 98
Distance       █████████  90
Price          █████████▏ 92
Application    ██████████ 100
```

---

# 28. Request Modal

Title:

**Request CO₂ Supply**

Fields:

```text
Requested quantity
[ 300 tonnes ]

Start date
[ 01 Oct 2026 ]

Duration
[ 3 months ]

Message
[ Optional message... ]
```

Economics:

```text
Carbon value
₹13,50,000

Logistics
₹18,500

Estimated total
₹13,68,500
```

Primary:

**Submit Request**

---

# 29. Requests

Tabs:

```text
All
Pending
Accepted
Rejected
```

Show:

```text
Company
Quantity
Value
Date
Status
Action
```

Use compact status badges.

---

# 30. Deal Detail

Header:

```text
DEAL #CX-1042

● IN TRANSIT
```

Main:

```text
Mumbai Steel Works
          ↓
GreenFuel Technologies
```

Economics:

```text
300 tonnes
₹4,500/t
₹13,50,000 carbon value
₹18,500 logistics
₹13,68,500 total
```

Timeline:

```text
✓ Request submitted
✓ Supplier accepted
✓ Shipment prepared
● In transit
○ Delivered
○ Completed
```

---

# 31. Status Badges

```text
AVAILABLE    Green
PENDING      Amber
ACCEPTED     Blue
IN TRANSIT   Blue
DELIVERED    Teal/Green
COMPLETED    Green
REJECTED     Red
DRAFT        Gray
```

Format:

`● Available`

Do not rely on color alone.

---

# 32. Analytics

Header:

```text
Carbon Analytics

Track supply, utilization,
transactions and logistics.
```

Filters:

```text
Last 30 days
Last 90 days
This year
```

Metrics:

```text
CO₂ Listed
12,450 t

CO₂ Utilized
8,920 t

Average Match
87%

Average Logistics
₹72/t
```

Charts:

1. CO₂ supply over time
2. Demand by application
3. Supply by source
4. Regional activity
5. Transaction value

Use Recharts.

---

# 33. AI Search Assistant

Primary search input:

`⌕ Search or ask CarbonX AI...`

Example:

> I need 300 tonnes of CO₂ per month near Pune with 99%+ purity for synthetic fuel.

Extract:

```text
quantity = 300 tonnes/month
location = Pune
purity >= 99%
application = synthetic fuel
```

Response:

```text
I found 3 potential matches.

BEST MATCH

94%
Mumbai Steel Works

500 t/month
99.2% purity
150 km
₹4,500/t

View Match →
```

The assistant is an enhancement. Core marketplace functionality must work without an external AI API.

---

# 34. Tables

Use tables only when comparison is useful.

Header:

```text
SUPPLIER
LOCATION
SUPPLY
PURITY
PRICE
MATCH
STATUS
```

Avoid vertical borders.

Use subtle horizontal dividers.

---

# 35. Buttons

### Primary

Dark navy/blue filled.

```text
Get Started →
```

Height: `44–48px`.

Radius: `10–12px`.

### Secondary

White/light background + border.

### Ghost

For back/cancel/secondary actions.

### Destructive

Red only when necessary.

---

# 36. Icons

Use **Lucide React**.

Useful icons:

```text
Search
MapPin
Factory
Wind
Truck
Route
ChartNoAxesCombined
ArrowUpRight
Check
X
Bell
Settings
ChevronRight
Plus
Filter
SlidersHorizontal
Package
CircleDollarSign
```

Typical size:

`16–20px`.

---

# 37. Imagery

If imagery is used, prefer:

- Steel/cement plants
- Industrial facilities
- Carbon capture infrastructure
- CO₂ pipelines/tankers
- Modern industrial teams

Use:

- Large rounded corners
- Natural lighting
- Neutral color grading
- Minimal overlays

Avoid:

- Handshake stock photos
- Random nature photography
- Obvious environmental clichés

---

# 38. Decorative Network Language

Use thin network/orbital lines:

```text
stroke: 1px
opacity: 10–20%
```

Shapes:

- Circular orbits
- Curved routes
- Supply-demand connections

Purpose:

**Suggest infrastructure and connectivity.**

Keep it subtle, not sci-fi.

---

# 39. Responsive Design

### Desktop ≥1024px

- Sidebar
- Multi-column dashboard
- Full filters
- Large hero
- Floating visual cards

### Tablet 768–1023px

- Reduced sidebar
- 2-column cards
- Simplified hero
- Flexible filters

### Mobile <768px

- Top header/hamburger
- Single column
- Full-width buttons
- Stacked cards
- Collapsible filters
- No obstructive floating cards

Mobile hero:

```text
Headline
Description
CTA
Visual
```

---

# 40. Motion

Use motion to communicate relationships.

```text
Page enter:
opacity 0 → 1
translateY 8px → 0

Card hover:
translateY(-2px)

Button:
subtle background transition

Match:
animated number/ring

Route:
subtle moving pulse
```

Do not animate every component.

---

# 41. Accessibility

Required:

- Strong contrast
- Keyboard navigation
- Visible focus states
- Semantic HTML
- Proper form labels
- ARIA labels for icon-only controls
- Status communicated with text + color
- Reduced-motion support

---

# 42. Design Tokens

Create central tokens.

```css
--background
--foreground
--surface
--surface-muted
--border
--primary
--primary-hover
--secondary
--success
--warning
--danger

--radius-sm
--radius-md
--radius-lg
--radius-xl

--shadow-sm
--shadow-md
--shadow-lg

--container-width
```

Do not scatter hardcoded design values throughout components.

---

# 43. Component Library

Create reusable components:

```text
Button
Badge
Card
MetricCard
Input
Select
Textarea
Modal
Dialog
Tabs
Tooltip
Dropdown
Sidebar
Header
Breadcrumb
SearchBar
FilterBar
ListingCard
MatchScore
MatchBreakdown
RouteCard
Timeline
StatusBadge
ChartCard
EmptyState
LoadingSkeleton
Toast
```

---

# 44. Empty State

Example:

```text
No matches yet

Create a carbon requirement to
start discovering compatible supply.

[ Create Requirement ]
```

Use simple line icons.

---

# 45. Loading State

Prefer skeletons over full-page spinners.

Example:

```text
┌─────────────────────────────┐
│ █████████                  │
│ ███████████████            │
│                             │
│ ███████    ███████         │
└─────────────────────────────┘
```

---

# 46. Error State

Example:

```text
Unable to calculate logistics

We couldn't calculate the route right now.
Your request has not been lost.

[ Try Again ]
```

Never show blank screens.

---

# 47. Success State

Listing:

```text
✓ CO₂ listing published

Your 500 t/month supply is now visible
to compatible buyers.

[ View Listing ]
```

Request:

```text
✓ Request sent

Mumbai Steel Works has received your
request for 300 tonnes/month.

[ View Request ]
```

---

# 48. Demo Mode

Seed realistic demo accounts:

```text
Supplier Demo
Mumbai Steel Works

Buyer Demo
GreenFuel Technologies

Admin Demo
CarbonX Admin
```

Optional login shortcuts:

```text
[ Supplier Demo ]
[ Buyer Demo ]
[ Admin Demo ]
```

Clearly label these as demo functionality.

---

# 49. Judge-Facing UX

The judge should understand the product in seconds.

The first dashboard should answer:

```text
How much carbon?
Who has it?
Who needs it?
What's the best match?
Can it be moved?
What is the deal worth?
```

Do not force setup before showing value.

Seed demo data.

---

# 50. Design Quality Checklist

Before declaring a screen complete:

- [ ] Looks like one coherent CarbonX product
- [ ] Clear visual hierarchy
- [ ] Primary action is obvious
- [ ] Cards align correctly
- [ ] Spacing is consistent
- [ ] Typography is consistent
- [ ] Status colors are semantic
- [ ] Page feels premium
- [ ] UI communicates carbon infrastructure
- [ ] Economic value is visible
- [ ] Loading/empty/error/success states exist
- [ ] Responsive layout works
- [ ] Keyboard/focus behavior works

---

# 51. Do Not

Do not:

- Copy supplied screenshots literally
- Copy another company's branding
- Use random SaaS templates
- Make everything green
- Add unnecessary gradients
- Overuse glass effects
- Build a static mockup
- Create dead buttons
- Use lorem ipsum
- Use fake customer logos
- Claim unsupported traction such as "trusted by 200,000 users"

Demo numbers must be understood as seeded prototype data.

---

# 52. Final Antigravity Design Directive

Build CarbonX as if it were a real venture-backed climate-tech infrastructure company preparing for a high-stakes product demo.

The visual formula is:

```text
Premium SaaS
      +
Industrial Data Platform
      +
Carbon Marketplace
      +
Logistics Network
```

The resulting experience should be:

**minimal on the surface, sophisticated underneath.**

The signature product story is:

```text
Captured CO₂
     ↓
Discoverable Supply
     ↓
Intelligent Match
     ↓
Economic Logistics
     ↓
Productive Utilization
```

Every major screen should reinforce this circular flow.

## Implementation priority

1. Establish design tokens.
2. Build marketing shell and hero.
3. Build dashboard shell.
4. Build marketplace/listing cards.
5. Build match-score visual.
6. Build logistics visual.
7. Build forms and transaction screens.
8. Add responsive behavior.
9. Add loading/error/empty/success states.
10. Polish motion and accessibility.

**Use this file together with `CarbonX_PRD.md`.**

`CarbonX_PRD.md` defines **what the product does**.

`design.md` defines **how the product should look and feel**.
