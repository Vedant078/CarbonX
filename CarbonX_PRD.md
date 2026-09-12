# CarbonX — Product Requirements Document (PRD)

**Product Name:** CarbonX  
**Tagline:** Captured Carbon. Matched to Opportunity.  
**Product Type:** B2B Carbon Capture-to-Utilization Marketplace  
**Version:** Hackathon MVP / Complete Prototype  
**Primary Goal:** Build a fully interactive prototype that connects captured CO₂ supply with productive utilization demand, including matching, logistics estimation, requests, deals, and delivery tracking.

---

## 1. Executive Summary

CarbonX is a digital marketplace connecting industrial companies that capture CO₂ with companies that can utilize captured CO₂.

Industrial emitters such as cement plants, steel plants, power plants, and chemical facilities may capture significant amounts of CO₂ but lack visibility into potential buyers.

Potential CO₂ users—synthetic fuel companies, building-material manufacturers, greenhouse operators, algae farms, and chemical companies—need reliable sources of suitable captured CO₂.

CarbonX solves this coordination problem through:

1. Captured CO₂ marketplace listings
2. Buyer requirements
3. Search and filtering
4. Intelligent supply-demand matching
5. Explainable match scores
6. Logistics distance and cost estimation
7. Supply requests and deal management
8. Delivery tracking
9. Dashboards and analytics

### Core journey

**Capture → List → Discover → Match → Request → Accept → Transport → Utilize**

---

## 2. Problem Statement

Industrial carbon capture creates a potentially valuable resource: captured CO₂.

However, the ecosystem has a coordination problem.

### Supplier problem

- Who can use the captured CO₂?
- What quantity do they need?
- What purity do they require?
- Where are they located?
- What price will they pay?
- Can the CO₂ be transported economically?

### Buyer problem

- Where can suitable captured CO₂ be found?
- Is sufficient quantity available?
- Is the purity suitable?
- How far away is the supplier?
- What will transportation cost?
- Which supplier is the best economic match?

CarbonX creates a marketplace and matching layer between these two sides.

---

## 3. Product Vision

> Create digital infrastructure for the circular carbon economy by making captured CO₂ discoverable, matchable, tradable, and logistically actionable.

### Mission

> Turn captured carbon from a cost center into a traceable and tradeable industrial resource.

---

## 4. Target Users

### 4.1 Carbon Suppliers

Industrial companies that capture CO₂.

Examples:

- Cement plants
- Steel plants
- Power plants
- Chemical plants
- Refineries
- Waste-to-energy facilities

Goals:

- List available CO₂
- Find potential buyers
- Monetize captured CO₂
- Reduce storage/disposal costs
- Increase carbon utilization
- Track transactions

### 4.2 Carbon Buyers

Companies that utilize captured CO₂.

Examples:

- Synthetic fuel manufacturers
- Concrete/material companies
- Greenhouse operators
- Algae farming companies
- Chemical manufacturers
- Carbon utilization startups

Goals:

- Find suitable CO₂ supply
- Compare suppliers
- Find nearby supply
- Check purity and quantity
- Compare prices
- Request supply
- Estimate logistics

### 4.3 Secondary Users

#### Logistics providers

Future capabilities:

- View transportation requirements
- Provide transportation quotes
- Track shipments

#### Policy/regulatory users

Future capabilities:

- Monitor carbon utilization
- Analyze regional supply/demand
- View ecosystem statistics

Full workflows for these secondary users are out of MVP scope.

---

## 5. Product Goals

The MVP must:

1. Allow suppliers to create CO₂ listings.
2. Allow buyers to discover and filter CO₂ listings.
3. Allow buyers to create requirements.
4. Match buyer requirements with supplier listings.
5. Explain why a match is recommended.
6. Estimate transportation distance and cost.
7. Allow buyers to request supply.
8. Allow suppliers to accept/reject requests.
9. Create an active deal.
10. Show logistics and delivery status.
11. Provide dashboards and analytics.
12. Seed realistic demo data so the complete workflow works immediately.

---

## 6. Non-Goals

The hackathon MVP does not require:

- Real payment settlement
- Real carbon-credit certification
- Blockchain
- Complex ML infrastructure
- Production regulatory certification
- Real fleet integration
- Production payment processing
- Real-world carbon custody verification
- Full logistics-provider portal

Where a production integration is unnecessary, use realistic deterministic simulation.

---

## 7. Core User Journey

The complete demo journey must be:

```text
SUPPLIER
   |
   v
Login
   |
   v
Dashboard
   |
   v
Create CO₂ Listing
   |
   v
Publish
   |
   v
MARKETPLACE
   |
   v
BUYER
   |
   v
Search / Filter
   |
   v
View Supply
   |
   v
MATCH ENGINE
   |
   v
94% Match
   |
   v
View Logistics
   |
   v
Request Supply
   |
   v
SUPPLIER
   |
   v
Accept Request
   |
   v
DEAL CREATED
   |
   v
LOGISTICS
   |
   v
In Transit
   |
   v
Delivered / Completed
```

This flow must work without manually editing the database during the demo.

---

## 8. Application Structure

```text
/
├── Landing Page
├── Authentication
│   ├── Login
│   └── Register
├── Dashboard
├── Marketplace
├── Carbon Listing
├── Create Listing
├── Matches
├── Requests
├── Deals
├── Logistics
├── Analytics
└── Settings
```

---

## 9. Navigation

### Public navigation

```text
CarbonX
Home
Marketplace
How It Works
Applications
Login
Get Started
```

### Authenticated navigation

```text
CARBONX

Overview

MARKETPLACE
  Discover CO₂
  My Listings
  Matches

TRANSACTIONS
  Requests
  Deals

LOGISTICS
  Active Shipments

INSIGHTS
  Analytics

SYSTEM
  Settings
```

---

# 10. Landing Page Requirements

The landing page must explain the product within 30 seconds.

## Hero

### Headline

> Turn Captured CO₂ Into a Resource.

### Subheading

> CarbonX connects industries that capture carbon with businesses that can put it to productive use—with intelligent matching, marketplace discovery, and logistics estimation built in.

### CTAs

- Explore Marketplace
- List Captured CO₂

## Ecosystem metrics

Display seeded metrics such as:

- 12,450 t CO₂ Available
- 38 Active Suppliers
- 24 Utilization Projects
- ₹4.2 Cr Potential Carbon Value

## How it works

```text
01 CAPTURE
Industrial facilities capture CO₂.

02 LIST
Publish quantity, purity, price, and location.

03 MATCH
Find compatible utilization demand.

04 DELIVER
Optimize logistics and complete the deal.
```

## Applications

Display:

- Synthetic Fuels
- Building Materials
- Greenhouses
- Algae Farming
- Chemical Production

## Final CTA

> Have captured CO₂?

Button: **List Your Carbon**

---

# 11. Marketplace

The marketplace is the primary discovery interface.

## Search

Search by:

- Location
- Source
- Application
- Supplier

Example placeholder:

> Search by location, source or application...

## Filters

### Source type

- Cement
- Steel
- Power
- Chemical
- Other

### Purity

Minimum purity range:

`95% — 100%`

### Quantity

Minimum quantity

### Price

Maximum price per tonne

### Application

- Synthetic Fuel
- Construction
- Greenhouse
- Algae
- Chemicals

## Listing card

Every listing should show:

```text
Source type
Supplier name
Location
Available quantity
Purity
Price / tonne
Availability status
Match score
View Details
```

Example:

```text
STEEL

Mumbai Steel Works
Mumbai, Maharashtra

500 t/month
99.2% purity

₹4,500 / tonne

● Available

Match Score: 94%

[ View Details ]
```

---

# 12. Marketplace Map

Provide an optional map view.

Supplier markers should show:

- Supplier
- Available quantity
- Purity

Use realistic demo coordinates.

Map integration can use Mapbox or another suitable mapping service.

If a real map API is unavailable, provide a polished simulated map rather than blocking the core workflow.

---

# 13. Carbon Listing Details

The listing detail page must show:

## Header

```text
Captured CO₂
Steel Manufacturing Facility

Mumbai, Maharashtra

● Available
```

## Supply

- Available supply: 500 tonnes/month
- Purity: 99.2%
- Price: ₹4,500 / tonne
- Availability: October 2026

## Technical information

- Source: Steel production
- Capture method: Amine-based capture
- Temperature
- Pressure

## Location

Show supplier location/map.

## Logistics estimate

```text
Mumbai → Pune

Distance
~150 km

Transport Mode
CO₂ Tanker

Estimated Cost
₹18,500

Cost / tonne
₹61.67

Estimated Delivery
2 days
```

Primary CTA:

**Request Supply**

Secondary CTA:

**Place Bid** (optional P2 feature)

---

# 14. Supplier Dashboard

The supplier dashboard should show:

```text
Good morning, Mumbai Steel Works

Carbon Overview

Available CO₂
2,450 t

Requests
8

Matches
5

Potential Value
₹1.2 Cr
```

## My Carbon Listings

Each listing shows:

- Quantity
- Purity
- Price
- Status
- Request count
- Manage button

Primary CTA:

**+ List Captured CO₂**

---

# 15. Create CO₂ Listing

Use a four-step wizard.

## Step 1 — Source

Fields:

- Source type
- Facility name
- Capture method

Source options:

- Cement
- Steel
- Power
- Chemical
- Other

## Step 2 — Supply

Fields:

- Available quantity
- Unit
- Purity
- Price per tonne
- Availability date

## Step 3 — Location

Fields:

- Location
- Latitude
- Longitude

Display map.

## Step 4 — Review

Show:

- Source
- Quantity
- Purity
- Location
- Price
- Availability

CTA:

**Publish Listing**

On successful submission:

- Persist listing
- Show success state
- Redirect to listing detail or My Listings

---

# 16. Buyer Dashboard

Display:

```text
Welcome, GreenFuel Technologies

Your Requirements

300 t/month
Required CO₂

99%+
Minimum Purity

8
Potential Matches

3
Active Requests
```

Then show recommended supply.

Example:

```text
94% Match

Mumbai Steel Works

500 t/month
99.2% purity
150 km away

₹4,500/t

[ View Match ]
```

---

# 17. Buyer Requirement

Buyer can create a requirement.

Fields:

```text
Application
Synthetic Fuel

Required Quantity
300 tonnes/month

Minimum Purity
99%

Location
Pune

Maximum Distance
250 km

Maximum Price
₹5,000/t

Frequency
Monthly
```

Applications:

- Synthetic Fuel
- Construction
- Greenhouse
- Algae
- Chemicals
- Other

---

# 18. Matching Engine

The matching engine is the core product intelligence.

Create a reusable service:

```text
calculateMatch(listing, requirement)
```

## Scoring weights

| Factor | Weight |
|---|---:|
| Quantity compatibility | 30% |
| Purity compatibility | 25% |
| Distance | 20% |
| Price | 15% |
| Application compatibility | 10% |

Formula:

```text
Match Score =
  Quantity Score × 0.30
  + Purity Score × 0.25
  + Distance Score × 0.20
  + Price Score × 0.15
  + Application Score × 0.10
```

The algorithm must be deterministic and explainable.

## Required output

```json
{
  "score": 94,
  "quantityScore": 100,
  "purityScore": 98,
  "distanceScore": 90,
  "priceScore": 92,
  "applicationScore": 100
}
```

---

# 19. Match Explanation

Never display only the final score.

Display:

```text
94% MATCH

✓ Quantity compatible
✓ Purity exceeds requirement
✓ Within preferred distance
✓ Price within budget
✓ Application compatible
```

Also display the individual component scores.

This is important for trust and judge evaluation.

---

# 20. Match Page

Required layout:

```text
MATCH ANALYSIS

Mumbai Steel Works
        |
        v
      94%
   MATCH SCORE
        |
        v
GreenFuel Technologies

Supply
500 t/month

Required
300 t/month

Purity
99.2%

Required
99%

Distance
150 km

LOGISTICS

₹18,500 estimated transport

[ Request Supply ]
```

---

# 21. Supply Request

When buyer clicks **Request Supply**, open a modal or page.

Fields:

- Requested quantity
- Start date
- Duration
- Optional message

Show calculated economics:

```text
Estimated Carbon Value
₹13,50,000

Estimated Logistics
₹18,500

Estimated Total
₹13,68,500
```

CTA:

**Submit Request**

After submission:

- Create request
- Set status to `PENDING`
- Notify supplier in application
- Show confirmation to buyer

---

# 22. Supplier Request Management

Supplier request card:

```text
SUPPLY REQUEST

GreenFuel Technologies

Requested
300 tonnes/month

Purity
99%+

Duration
3 months

Estimated Value
₹13,50,000

[ Accept ] [ Reject ]
```

Accepting:

- Updates request status
- Creates a deal
- Creates logistics record
- Shows deal to both parties

Rejecting:

- Updates request status
- Keeps request history

---

# 23. Deal Management

Deal states:

```text
REQUESTED
    ↓
ACCEPTED
    ↓
PREPARING
    ↓
IN_TRANSIT
    ↓
DELIVERED
    ↓
COMPLETED
```

Deal detail page:

```text
DEAL ACTIVE

Mumbai Steel Works
        ↓
GreenFuel Technologies

300 tonnes/month

Contract Duration
3 months

Carbon Value
₹13,50,000

Logistics
₹18,500

Status
● Preparing Shipment
```

---

# 24. Logistics

Logistics must directly address the problem statement.

## Required calculations

Calculate:

- Distance
- Estimated transport cost
- Cost per tonne
- Estimated delivery time
- Transport mode

For MVP, deterministic simulation is acceptable.

Example:

```text
Mumbai → Pune

Distance: 150 km
Quantity: 300 tonnes
Transport: CO₂ Tanker

Estimated Cost: ₹18,500
Cost / tonne: ₹61.67
Delivery: 2 days
```

## Logistics page

Display:

```text
ACTIVE SHIPMENT

Mumbai Steel Works
        |
        | 150 km
        v
GreenFuel Technologies
Pune

Quantity
300 tonnes

Transport
CO₂ Tanker

Estimated Cost
₹18,500

Estimated Delivery
2 days

Status

✓ Deal confirmed
✓ Shipment prepared
● In transit
○ Delivered
```

---

# 25. Analytics

Provide dashboard charts for:

## Supply

- CO₂ available over time
- CO₂ by source type

## Demand

- Demand by application
- Demand by region

## Marketplace

- Active suppliers
- Active buyers
- Active matches
- Completed deals

## Financial

- Potential carbon value
- Estimated logistics value
- Average price per tonne

Use Recharts or another lightweight charting library.

---

# 26. Admin Dashboard

Admin should see:

```text
PLATFORM OVERVIEW

Users
62

Suppliers
38

Buyers
24

CO₂ Listed
12,450 tonnes

Active Matches
24

Completed Deals
11
```

Charts:

- Supply by region
- CO₂ by source
- Demand by application
- Monthly transactions

Admin functionality can remain lightweight.

---

# 27. AI Feature — CarbonX Assistant

Optional but recommended.

Allow a buyer to type natural language such as:

> I need 300 tonnes of CO₂ per month near Pune with at least 99% purity for synthetic fuel.

Extract:

```text
quantity = 300 tonnes/month
location = Pune
purity >= 99%
application = synthetic fuel
```

Then execute the matching engine.

Example response:

```text
I found 3 potential matches.

Best Match
94%

Mumbai Steel Works
500 tonnes/month
99.2% purity
150 km away
```

Important:

- AI must enhance discovery, not become a dependency for the core marketplace.
- If no external AI API is available, use a structured parser or deterministic simulation.

---

# 28. Database Schema

## users

```text
id
name
email
company
role
location
latitude
longitude
created_at
```

Roles:

```text
SUPPLIER
BUYER
ADMIN
```

## carbon_listings

```text
id
supplier_id
title
source_type
location
latitude
longitude
available_quantity
unit
purity
capture_method
temperature
pressure
availability_date
price_per_tonne
status
created_at
updated_at
```

## buyer_requirements

```text
id
buyer_id
required_quantity
required_purity
application
location
latitude
longitude
max_distance
max_price
frequency
status
created_at
```

## matches

```text
id
listing_id
requirement_id
overall_score
quantity_score
purity_score
distance_score
price_score
application_score
created_at
```

## supply_requests

```text
id
match_id
buyer_id
supplier_id
quantity
duration
start_date
message
status
created_at
```

## deals

```text
id
request_id
listing_id
buyer_id
supplier_id
quantity
price_per_tonne
total_carbon_value
logistics_cost
total_value
status
created_at
updated_at
```

## logistics

```text
id
deal_id
origin
destination
distance
transport_mode
estimated_cost
cost_per_tonne
estimated_delivery_days
status
created_at
```

---

# 29. API Requirements

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

## Carbon

```text
GET    /api/carbon
POST   /api/carbon
GET    /api/carbon/:id
PUT    /api/carbon/:id
DELETE /api/carbon/:id
```

## Requirements

```text
GET  /api/requirements
POST /api/requirements
GET  /api/requirements/:id
PUT  /api/requirements/:id
```

## Matches

```text
GET  /api/matches
POST /api/matches/calculate
GET  /api/matches/:id
```

## Requests

```text
GET  /api/requests
POST /api/requests
PUT  /api/requests/:id
```

## Deals

```text
GET /api/deals
GET /api/deals/:id
PUT /api/deals/:id
```

## Logistics

```text
GET  /api/logistics/:dealId
POST /api/logistics/estimate
```

## Dashboard

```text
GET /api/dashboard
```

---

# 30. Authentication & Authorization

Support:

```text
SUPPLIER
BUYER
ADMIN
```

Redirect:

```text
SUPPLIER → /dashboard
BUYER    → /dashboard
ADMIN    → /admin
```

Requirements:

- Protected routes
- Role-based authorization
- Server-side validation
- Input validation
- Secure database access

Do not trust client-side role information.

---

# 31. Seed Data

The marketplace must never be empty during the demo.

## Suppliers

```text
Mumbai Steel Works
Mumbai, Maharashtra

Gujarat Cement
Ahmedabad, Gujarat

Maharashtra Power
Nashik, Maharashtra

Pune Chemical Industries
Pune, Maharashtra
```

## Buyers

```text
GreenFuel Technologies
Pune, Maharashtra

CarbonBuild
Mumbai, Maharashtra

AlgaeX
Gujarat

EcoConcrete
Ahmedabad, Gujarat
```

Create at least:

- 10 carbon listings
- 8 buyer requirements
- 10 matches
- 5 supply requests
- 3 active deals

---

# 32. Required Demo Scenario

Seed the following scenario.

## Supplier

```text
Mumbai Steel Works

500 tonnes/month
99.2% purity
₹4,500/t
```

## Buyer

```text
GreenFuel Technologies

Needs:
300 tonnes/month
99%+ purity
Pune
₹5,000/t maximum
```

## Match

```text
94% MATCH
```

## Logistics

```text
Distance: 150 km
Estimated logistics: ₹18,500
Carbon value: ₹13,50,000
Estimated total: ₹13,68,500
```

## Workflow

```text
Buyer → Request Supply
Supplier → Accept
Deal → Active
Shipment → In Transit
Shipment → Delivered
Deal → Completed
```

---

# 33. UI/UX Requirements

The product should feel like a:

> Modern B2B climate-tech platform

Visual qualities:

- Professional
- Industrial
- Data-driven
- Premium
- Trustworthy
- Modern

Avoid:

- Generic green environmental templates
- Excessive leaves
- Cartoonish illustrations
- Overly bright colors
- Excessive gradients

Preferred visual direction:

**Bloomberg Terminal + Stripe + modern climate-tech SaaS**

---

# 34. Design System

## Colors

Suggested palette:

```text
Primary: Deep Navy / Blue
Secondary: Teal
Success: Green
Background: Off-white / Light Gray
Cards: White
Text: Dark Navy / Charcoal
Borders: Light Gray
```

Use design tokens.

Avoid hardcoding colors throughout components.

## Typography

Use a clean modern sans-serif such as:

**Inter**

Suggested hierarchy:

```text
H1: 48–64px
H2: 32–40px
H3: 20–24px
Body: 14–16px
```

Dashboard UI should be compact.

---

# 35. Responsive Design

The application must support:

- Desktop
- Tablet
- Mobile

Desktop is the primary hackathon presentation target.

Mobile requirements:

- Collapsible sidebar
- Responsive cards
- Stacked dashboard sections
- Responsive forms
- Horizontal scrolling for wide tables when required

---

# 36. Loading States

Every asynchronous operation must have a loading state.

Examples:

```text
Loading marketplace...
Loading matches...
Calculating logistics...
Creating listing...
Submitting request...
```

Use skeleton loaders where appropriate.

---

# 37. Empty States

Example:

```text
No CO₂ listings found.

Try changing your filters or
searching a wider location.

[ Clear Filters ]
```

---

# 38. Error States

Example:

```text
Something went wrong.

We couldn't calculate the logistics estimate.

[ Try Again ]
```

Never leave blank screens.

---

# 39. Notifications

In-app notifications should support:

```text
New supply request received
Your request was accepted
New 94% match found
Shipment is now in transit
Deal completed
```

Real-time notifications are optional.

---

# 40. Technical Stack

Recommended stack:

```text
Frontend:
Next.js
TypeScript
Tailwind CSS
shadcn/ui

Backend:
Next.js API routes / Server Actions

Database:
Supabase PostgreSQL

Charts:
Recharts

Maps:
Mapbox

Deployment:
Vercel
```

Use Prisma only if it provides a clear benefit; otherwise Supabase can be used directly.

---

# 41. Code Architecture

Recommended structure:

```text
/app
  /(public)
  /(auth)
  /(dashboard)
  /admin
  /api

/components
  /ui
  /layout
  /dashboard
  /marketplace
  /listing
  /matches
  /logistics
  /forms

/lib
  auth.ts
  db.ts
  matching.ts
  logistics.ts
  validation.ts
  utils.ts

/types
  user.ts
  listing.ts
  match.ts
  deal.ts

/data
  seed.ts
```

Business logic must remain separate from UI components.

---

# 42. Matching Service

Create:

```text
/lib/matching.ts
```

Functions:

```text
calculateQuantityScore()
calculatePurityScore()
calculateDistanceScore()
calculatePriceScore()
calculateApplicationScore()

calculateMatch()

findBestMatches()
```

---

# 43. Logistics Service

Create:

```text
/lib/logistics.ts
```

Functions:

```text
calculateDistance()
calculateTransportCost()
calculateCostPerTonne()
estimateDeliveryTime()
generateLogisticsEstimate()
```

For MVP:

```text
transportCost =
  distance × quantity × transportRate
```

Use configurable transport rates.

---

# 44. Priority Matrix

## P0 — Required

```text
Authentication
Dashboard
Carbon listings
Marketplace
Search/filter
Listing details
Matching engine
Match score
Supply request
Deal management
Logistics estimate
Seed data
```

## P1 — Important

```text
Map
Analytics
Notifications
Buyer requirements
Admin dashboard
Responsive UI
```

## P2 — Nice to have

```text
AI assistant
Bidding
Real-time notifications
Advanced analytics
```

## P3 — Future

```text
Payments
Carbon credits
Blockchain
Verification
IoT integrations
ERP integrations
Real logistics APIs
Regulatory reporting
```

---

# 45. Acceptance Criteria

## Authentication

- [ ] User can register.
- [ ] User can log in.
- [ ] User role is stored.
- [ ] Protected routes work.
- [ ] Unauthorized users cannot access restricted functionality.

## Supplier

- [ ] Supplier can create listing.
- [ ] Supplier can edit listing.
- [ ] Supplier can view listings.
- [ ] Supplier receives requests.
- [ ] Supplier can accept/reject requests.

## Buyer

- [ ] Buyer can create requirement.
- [ ] Buyer can search listings.
- [ ] Buyer can filter listings.
- [ ] Buyer can view listing details.
- [ ] Buyer can request supply.

## Matching

- [ ] Matches are calculated.
- [ ] Match score is displayed.
- [ ] Score breakdown is displayed.
- [ ] Recommended matches are displayed.
- [ ] Match calculation is deterministic.

## Logistics

- [ ] Distance is calculated.
- [ ] Transport cost is estimated.
- [ ] Cost per tonne is displayed.
- [ ] Delivery time is estimated.

## Deals

- [ ] Request creates transaction.
- [ ] Supplier can accept/reject.
- [ ] Accepted request creates a deal.
- [ ] Deal status can change.
- [ ] Logistics status is visible.

## Analytics

- [ ] Supply metrics render.
- [ ] Demand metrics render.
- [ ] Match metrics render.
- [ ] Charts render correctly.

---

# 46. Definition of Done

The MVP is complete when a judge can perform this sequence without developer intervention:

```text
1. Login as supplier
2. Create a CO₂ listing
3. Publish it
4. Switch to buyer
5. Search for CO₂
6. Filter by purity/location
7. Open listing
8. See match score
9. See match explanation
10. See logistics cost
11. Request supply
12. Switch to supplier
13. Accept request
14. Open deal
15. See shipment
16. Change status to In Transit
17. Change status to Delivered
18. Complete deal
```

---

# 47. Hackathon Product Narrative

Do not pitch CarbonX as simply:

> “A website where people buy and sell CO₂.”

Pitch it as:

> **CarbonX turns captured CO₂ from an industrial cost stream into a searchable, matchable resource by connecting supply, utilization demand, matching intelligence, and logistics in one marketplace.**

The three key innovations are:

### 1. Carbon Marketplace

Make captured CO₂ discoverable like a commodity.

### 2. Intelligent Matching

Match based on:

- Quantity
- Purity
- Location
- Price
- Application

### 3. Logistics-Aware Matching

A theoretically perfect match far away may be worse than a slightly weaker match nearby.

CarbonX makes this economic trade-off visible.

---

# 48. Recommended Demo Script

Start with the problem:

> “A steel plant has captured 500 tonnes of CO₂, but finding someone who can actually use it is difficult.”

Then demonstrate:

### Step 1 — Supply

```text
500 tonnes
99.2% purity
Mumbai
₹4,500/t
```

### Step 2 — Demand

```text
300 tonnes
99% purity
Pune
```

### Step 3 — Matching

```text
94% MATCH
```

### Step 4 — Logistics

```text
150 km
₹18,500 estimated transport
```

### Step 5 — Transaction

```text
Request Supply
→ Accept
→ Deal Active
```

### Step 6 — Delivery

```text
Preparing
→ In Transit
→ Delivered
→ Completed
```

Final statement:

> **CarbonX closes the gap between capturing carbon and actually putting it to productive use.**

---

# 49. Implementation Phases

Antigravity should implement in this order.

## Phase 1 — Foundation

1. Inspect repository.
2. Create implementation plan.
3. Set up Next.js/TypeScript.
4. Set up Tailwind/shadcn.
5. Create design system.
6. Configure Supabase.
7. Create database schema.
8. Create seed data.
9. Create application shell.

## Phase 2 — Authentication

10. Login.
11. Registration.
12. Role selection.
13. Protected routes.
14. Role-based access.

## Phase 3 — Supplier

15. Supplier dashboard.
16. Carbon listing creation.
17. Listing management.
18. Listing details.

## Phase 4 — Marketplace

19. Marketplace page.
20. Search.
21. Filters.
22. Listing cards.
23. Listing details.
24. Map view.

## Phase 5 — Buyer

25. Buyer dashboard.
26. Buyer requirements.
27. Recommended listings.

## Phase 6 — Matching

28. Matching service.
29. Match score.
30. Score breakdown.
31. Match page.
32. Recommended matches.

## Phase 7 — Transactions

33. Supply request.
34. Supplier request management.
35. Accept/reject.
36. Deal creation.
37. Deal status.

## Phase 8 — Logistics

38. Distance calculation.
39. Logistics cost.
40. Delivery estimate.
41. Shipment status.

## Phase 9 — Analytics

42. Dashboard metrics.
43. Supply charts.
44. Demand charts.
45. Transaction analytics.

## Phase 10 — Polish

46. Loading states.
47. Error states.
48. Empty states.
49. Responsive design.
50. Animations.
51. Accessibility.
52. Performance optimization.
53. Final end-to-end testing.

---

# 50. Implementation Directive for Antigravity

Treat this document as the **single source of truth** for the CarbonX hackathon MVP.

Do not build a static mockup.

Build a fully interactive prototype with:

- Real navigation
- Real forms
- Real state management
- Real database persistence
- Authentication
- Role-based access
- API endpoints
- Matching calculations
- Logistics calculations
- Supply requests
- Deal management
- Delivery status
- Seeded demo data

Prioritize the complete end-to-end working flow over unnecessary features.

Do not leave TODO placeholders for core functionality.

Do not create buttons that have no functionality.

Where a production integration is unnecessary for the hackathon, implement a realistic deterministic simulation.

Keep business logic separate from UI.

Use reusable components.

Handle loading, empty, success, and error states.

Maintain a consistent design system.

Before implementing:

1. Inspect the existing repository.
2. Create an implementation plan.
3. Identify reusable components.
4. Avoid unnecessary rewrites.
5. Implement in logical phases.
6. Test each phase.
7. Fix TypeScript/build/runtime errors.
8. Verify the complete end-to-end demo flow.

## Final requirement

A judge must be able to go from:

**CO₂ SUPPLY → MARKETPLACE → MATCH → LOGISTICS → REQUEST → ACCEPT → DEAL → DELIVERY**

without developer intervention.

