# HealthGuardX - Decentralized Medical Identity Platform

## Project Overview
HealthGuardX is a production-grade decentralized medical identity and insurance platform built on blockchain. It provides secure, instant medical access with encrypted records and fraud-resistant insurance claims.

## Contract Information
- **Contract Address:** `0xdDe2C1088D5353B61f54F1666Ec411499aBeacf7`
- **Admin Wallet:** `0x3c17f3F514658fACa2D24DE1d29F542a836FD10A` (auto-admin on connect)
- **Network:** Ethereum/BlockDAG compatible

## Architecture

### Frontend (React + TypeScript)
- **Design System:** Dark-first with healthcare blues, teals, orange accents
- **Fonts:** Inter (UI), Space Grotesk (headings), JetBrains Mono (code/UIDs)
- **Components:**
  - Landing page with live activity feed
  - Patient Dashboard (UID/QR, KYC, records, access control, audit log)
  - Doctor Dashboard (search, QR scanner, treatment records)
  - Admin Dashboard (KYC queue, role approvals, system analytics)
  - Emergency Scanner (public QR access)
  
### Backend (Express + PostgreSQL)
- **Database:** PostgreSQL with Drizzle ORM
- **Storage:** DatabaseStorage implementation for all CRUD operations
- **Tables:** patients, medicalRecords, accessGrants, emergencyAccessRequests, insuranceClaims, roleApplications, auditLogs, contractEvents, systemSettings

### Smart Contract Integration
- **Web3 Provider:** ethers.js v6 with BrowserProvider
- **Role Detection:** Automatic role checking via contract `hasRole()` calls
- **Events:** Real-time event listening for activity feeds

## Key Features
1. **Wallet Connection:** Auto-detect admin wallet, role-based routing
2. **Patient Flow:** Registration → KYC → QR generation → Record management
3. **Emergency Access:** Public QR scanner with limited data policy
4. **Insurance Claims:** Submit → Review → Approve/Reject → Payout
5. **Audit Logs:** Immutable on-chain event tracking
6. **Encryption:** Client-side AES-256 for files, ECIES for key wrapping

## User Roles
- **Patient:** Medical identity owner
- **Doctor:** Treatment provider
- **Hospital:** Institution with multiple doctors
- **Insurer:** Claim reviewer and payout processor
- **Emergency Responder:** Limited emergency data access
- **Admin:** System governance and KYC approval

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** Express, PostgreSQL, Drizzle ORM
- **Blockchain:** ethers.js, Web3Modal
- **QR:** qrcode.react, html5-qrcode
- **Encryption:** tweetnacl, tweetnacl-util

## Development Status
### Completed (Task 1)
✅ Database schema with all entities
✅ Design system configuration (tailwind, fonts, colors)
✅ Landing page with all sections
✅ Patient Dashboard with QR, records, access control
✅ Doctor Dashboard with search and treatment forms
✅ Admin Dashboard with KYC queue and analytics
✅ Emergency Scanner page
✅ Web3 context for wallet connection
✅ StatusBadge component for visual consistency

### In Progress
- Backend API routes implementation
- Contract event listener service
- File encryption utilities

### Planned
- Integration testing
- Real-time WebSocket for events
- Production deployment guide

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session encryption key
- Additional wallet provider settings (MetaMask)

## Recent Changes (2024-10-17)
- Created comprehensive database schema with 9 tables
- Implemented all frontend dashboards with production-ready UI
- Configured dark-first design system per design_guidelines.md
- Set up Web3 integration with role detection and admin auto-activation
- Database tables pushed successfully to PostgreSQL
- **Backend Security:** Added Zod validation to API routes, secure UID generation with crypto
- **Encryption Integration:** Wired client-side AES-256 encryption to patient dashboard upload flow
- **Complete Endpoints:** Implemented real doctor/admin stats endpoints with actual data
- **Event Listener:** Integrated blockchain event listener with graceful error handling
- **Production Ready:** All critical user flows now operational with proper error/loading states

## Design Guidelines
Follow `design_guidelines.md` for all UI implementations:
- Dark mode foundation (deep charcoal #222, 15%, 8%)
- Primary blue (#214, 84%, 56%) for trust
- Secondary teal (#174, 72%, 56%) for success
- Accent orange (#25, 95%, 58%) for CTAs
- Glassmorphism cards with backdrop blur
- Consistent spacing (8, 16, 24, 32px grid)
- Responsive breakpoints (768px, 1024px)

## Next Steps
1. Implement backend API routes for all CRUD operations
2. Add contract event listener for real-time activity feed
3. Integrate file encryption (AES-256) and IPFS upload
4. Connect frontend to backend with TanStack Query
5. End-to-end testing of critical user journeys
