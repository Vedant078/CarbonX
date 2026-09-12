# CarbonX

CarbonX is a B2B carbon marketplace designed to connect industrial CO₂ capture sources with commercial buyers, trade intermediaries, and specialized logistics providers. The platform enables industrial entities to list captured CO₂ supply, buyer organizations to discover compatible supply and submit demand requirements, dealers to negotiate commercial proposals, and logistics providers to coordinate verified CO₂ transport.

---

## Features

- **Role-Based Authentication:** Secure, backend-verified session management with database role access control (`BUYER`, `DEALER`, `LOGISTICS_PROVIDER`).
- **Buyer Workspace:** Industrial requirement creation, marketplace discovery, interactive proposal acceptance, and active deal tracking.
- **Dealer Workspace:** Supply and demand match orchestration, commercial deal proposal creation, commission management, and bidding opportunity publishing.
- **Logistics Workspace:** Shipment assignment, transport status management, driver and vehicle fleet tracking, and delivery route management.
- **CO₂ Marketplace:** High-purity industrial carbon listings featuring capture methods, location coordinates, purity percentages, and available volume.
- **CO₂ Competitive Bidding System:** Live auction room for spot CO₂ supply with real-time bid updates, atomic outbid handling, minimum increment enforcement, and winner-to-proposal conversion.
- **Supply & Demand Matching:** Score-based matching engine pairing industrial carbon specifications with buyer application requirements.
- **Commercial Proposals & Deals:** Multi-stage deal pipeline tracking (Identified → Matched → Proposed → Negotiating → Confirmed → Completed).
- **Logistics & Shipment Management:** Route estimation, freight cost calculations, shipment tracking codes, and status updates (Dispatched, In Transit, Delivered).
- **Responsive B2B Interface:** Swiss-style typographic interface built for desktop and mobile performance.

---

## User Roles

### Buyer
- Searches for captured CO₂ supply across industrial facilities.
- Creates and manages CO₂ demand requirements (volume, purity, application, location).
- Places bids in live CO₂ supply auctions or requests direct supply.
- Reviews incoming dealer proposals and confirms transactions.
- Tracks active contracts, delivery schedules, and CO₂ shipments.

### Dealer
- Connects captured CO₂ supply entities with buyer requirements.
- Reviews high-potential compatibility matches.
- Launches competitive CO₂ supply auctions with minimum bid increments and duration controls.
- Creates and sends commercial deal proposals from direct matches or winning auction bids.
- Tracks deal pipelines and calculated brokerage commissions.
- *Does not purchase or transport CO₂ directly.*

### Logistics
- Manages CO₂ transportation and specialized tank logistics.
- Accepts and claims pending shipment requests.
- Manages transport vehicles, drivers, and delivery routes.
- Updates shipment status (Dispatched, In Transit, Delivered).
- *Does not create commercial bids or negotiate deal terms.*

---

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Vanilla CSS Design System
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Database:** PostgreSQL (`pg` connection pool)
- **Authentication:** Server-side sessions with Bcryptjs password hashing
- **Client Utilities:** Class Variance Authority (`clsx`, `tailwind-merge`)

---

## Getting Started

### Prerequisites

Ensure you have Node.js (v18+ recommended) and a running PostgreSQL instance on your system.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vedant078/CarbonX.git
   cd CarbonX
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a local `.env` file in the root directory:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/carbonx
   ```

4. **Initialize and seed the PostgreSQL database:**
   Run the database setup script to create tables and seed demo accounts:
   ```bash
   npx tsx src/lib/init-db.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

The application requires a single server-side database configuration variable stored in `.env`:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL (`postgresql://user:password@host:port/dbname`) |

> **Note:** Never commit `.env` or expose database credentials in client components or code repositories.

---

## Available Scripts

In the project directory, you can run:

- `npm run dev` — Starts the Next.js development server.
- `npm run build` — Builds the application for production deployment.
- `npm run start` — Starts the Next.js production server.
- `npm run lint` — Runs ESLint to check for code issues.

---

## Project Structure

```text
CarbonX/
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Role-based dashboard layouts (/buyer, /dealer, /logistics)
│   │   ├── (public)/           # Public landing, login, and registration pages
│   │   ├── api/                # Backend API routes (/auth, /bidding, /deals, /health, etc.)
│   │   ├── globals.css         # Main stylesheet & Tailwind configuration
│   │   └── layout.tsx          # Root application layout & AuthProvider
│   ├── components/             # Reusable UI cards, badges, buttons, and navigation
│   ├── context/                # AuthContext for session management
│   ├── lib/
│   │   ├── postgres.ts         # PostgreSQL database connection pool
│   │   ├── server-db.ts        # Server-side database access layer
│   │   ├── init-db.ts          # Schema initialization & seeding script
│   │   └── schema.sql          # PostgreSQL table schemas
│   └── types/                  # Shared TypeScript interfaces & types
├── public/                     # Static assets and media
├── .env                        # Local environment configuration (git-ignored)
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## Application Flow

```text
Buyer Requirement / Marketplace Supply
       │
       ▼
Matching Engine / Live CO₂ Bidding Auction
       │
       ▼
Dealer Commercial Proposal Creation
       │
       ▼
Buyer Proposal Acceptance & Deal Confirmation
       │
       ▼
Logistics Assignment & Shipment Route Tracking
```

---

## Deployment

CarbonX can be deployed to any Next.js-compatible hosting platform such as Vercel or Render.

1. Connect the repository to your hosting provider.
2. Set the `DATABASE_URL` environment variable in your provider's deployment settings to point to your managed PostgreSQL database (e.g., Supabase, Neon, or AWS RDS).
3. Ensure database migrations and seed scripts are executed on your production database before launching.

---

## Project Status

CarbonX was created as a hackathon prototype demonstrating an end-to-end B2B carbon marketplace workflow. Production deployment would require additional hardening, rate-limiting, error reporting, automated testing, and infrastructure monitoring.

---

## Disclaimer

CarbonX is a demonstration project created for a hackathon. Company names, listings, bids, transactions, driver records, and logistics information displayed within the platform are simulated for presentation purposes.
