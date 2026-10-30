# Changelog

All notable changes to the Customer Website & Backend are documented here.

## [Unreleased] - 2026-10-30

### Fixed
- **Unified Customer Cart & Cross-Platform Category Synchronization (Modules 1–6)**:
  - **Cart Metadata Display in Website Cart Drawer (`Dashboard.jsx`)**: Enhanced the Website cart drawer to render booking dates (`📅 Date • Time`), check-in/out dates, and vehicle/bus registration numbers when customer items are added from Mobile or Web. Added resilient fallbacks for `item.name || item.title` and `item.image || item.imageUrl || item.images`.
  - **Cart State Overwrite Safeguard (`Dashboard.jsx`)**: Protected `isCartInitializedRef.current` so it only flags true when `Array.isArray(dbUser.cart)` is verified, preventing premature empty-cart syncs from wiping active carts.
  - **EC2 Deployment Target Host (`.github/workflows/deploy.yml`)**: Updated EC2 deploy workflow to target active host `3.110.88.42` (`api.ficapp.in`).
  - **Backend Cart & Favorites Persistence (`backend/src/routes/auth.ts`)**: Added `cart` and `favorites` arrays into `finalProfile` returned by `PUT /api/auth/customer-profile` so that client stores receive authoritative persisted cart state on profile updates.
  - **Compiled Backend Dist Build (`backend/dist/routes/auth.js`)**: Compiled all backend routes via `npm run build` (`tsc`) ensuring server runs synchronized IDOR protection, websocket room registrations, and cart persistence handlers.
  - **Jobs Application-Only Invariant**: Protected job applications to remain application-only without cart addition.
  - **Bidirectional Cart Sync Verified**: Verified that cart items (Products, Services, Stay, Travel) synchronize reliably between Mobile App and Website for authenticated customer `FIC-CUS-OCT-2026-000019`.

## [Unreleased] - 2026-10-29

### Fixed
- **Permanent Customer Website ↔ Mobile App Cart Synchronization Fix**:
  - Fixed `src/routes/auth.ts` IDOR validation in `GET /customer-profile`.
  - Joined sockets to `customer:${userId}` and `customer:${customerId}` in `wsServer.ts`.
  - Unblocked `isCartInitializedRef` in `Dashboard.jsx`.

