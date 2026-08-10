# Project Guidelines & Architectural Rules

## Admin to Customer Category Hierarchy Synchronization Flow

### Core Principles
1. **Database Authority**:
   - The Database (MongoDB `categories` collection via `/api/admin/categories`) is the single authoritative source of truth for categories.
   - When an Admin configures subcategories (Level 2) or child categories (Level 3) for a main category (Level 1), default static baseline subcategories for that main category MUST be cleared and overridden by the database configuration.

2. **3-Tier Hierarchy Mapping**:
   - **Main Category (Level 1)**: `Services`, `Products`, `Daily Needs`, `Food`, `Stay`, `Travel`, `Jobs`.
   - **Subcategory (Level 2)**: Stored in DB records as `subcategory` (e.g. `Electronics`).
   - **Child Category (Level 3)**: Stored in DB records as `subSubcategory` (e.g. `Mobiles`).

3. **Flat Record & Hierarchical Parser Rules**:
   - In `categoryService.js` (`buildActiveCategoryTree`) and `Dashboard.jsx` (`mergeDbCategories`), always check if `level === 'main'` records contain a populated `.children` array (`Array.isArray(m.children) && m.children.length > 0`).
   - If `.children` is absent or empty (flat DB structure), process flat subcategory (`subcategory`) and child category (`subSubcategory`) records so child items like `Mobiles` are correctly grouped under their subcategory `Electronics`.

4. **Consistency Across Customer Touchpoints**:
   - All customer interface components — including Top Navbar mega menus, category dropdowns, sub-navbar filter pills, Dashboard category cards, and `CategoryDetails` pages — MUST strictly consume the dynamic category tree built by `buildActiveCategoryTree` / `mergeDbCategories`.
   - Never re-introduce hardcoded fallback subcategories when database subcategory records exist for a main category.

## Vendor Product Display & Response Parsing Flow

### Mandatory Principles (NEVER CHANGE THIS FLOW)
1. **Direct Array Response Parsing**:
   - `productService.getProducts()` MUST support direct array responses `Array.isArray(data)` returned by backend `/api/public/products` as well as `{ products: [...] }` formats.
   - All live products added by vendors MUST be parsed by `sanitizeProduct` and retained by `isRealVendorProduct` so every newly added item displays immediately on the customer dashboard.

2. **Category Isolation & SubNavbar Preservation**:
   - Vendor products added under any main category (`Products`, `Services`, `Daily Needs`, `Food`, `Stay`, `Travel`, `Jobs`) MUST display strictly under their respective `activeTab` and sub-navbar filters.
   - In `Dashboard.jsx`, `matchesSubNavbar` MUST check `product.subNavbarCategory` and `product.mainCategory` in addition to `category`, `subcategory`, `subSubcategory`, `tag`, and `name`.
   - Mongoose default schema properties (such as `jobType: "Full-time"` or `foodType: "Veg"`) MUST NEVER be used to misclassify physical products into Jobs or Food.

## Territory Hierarchy & Multi-Agent Directory Flow

### Mandatory Principles (NEVER CHANGE THIS WORKFLOW)
1. **Array-Based Multi-Agent Hierarchy Mapping**:
   - In the Agent Directory, the Territory Hierarchy Tree View MUST map state, district, and division nodes using **arrays** (`stateAgents: []`, `districtAgents: []`, `divisionAgents: []`, `pincodeAgents: []`).
   - NEVER store state, district, or division agents as single object fields (`stateAgent: null`, `districtAgent: null`, `divisionAgent: null`) in `hierarchyMap`. Doing so causes agents sharing the same territory (such as multiple District Agents in the same district) to overwrite each other and disappear from the UI.

2. **Complete Territory & Agent Rendering**:
   - All agents present in the filtered list (`filteredAgents`) MUST be rendered in the Territory Hierarchy Tree View without exception.
   - For every state, district, and division group, iterate over the agent arrays (`stObj.stateAgents.map`, `distObj.districtAgents.map`, `divObj.divisionAgents.map`, `divObj.pincodeAgents.map`) so each assigned agent displays their own distinct agent card and profile actions.

3. **Fallback & Unassigned Territory Grouping**:
   - Agents without explicit territory fields (`assignedState`, `assignedDistrict`, `assignedArea`) MUST be grouped into clean, explicit fallback headers (e.g. `General State`, `General District`, `General Division`) rather than hardcoded to a single specific region.
   - Every level count header (e.g. `DISTRICT AGENTS (N)`, `DIVISIONAL AGENTS (N)`) MUST dynamically reflect the sum of all agents in that sub-hierarchy (`reduce((sum, item) => sum + item.agents.length, 0)`).

4. **Multi-View Parity**:
   - All 3 directory view modes — **Tree View** (`tree`), **Grid View** (`grid`), and **List View** (`list`) — MUST remain 100% synchronized and display the exact same total count of non-rejected agents.

## Direct Registration Requests & Onboarding Approval Flow

### Mandatory Principles (NEVER CHANGE THIS WORKFLOW)
1. **Unified Registration Requests & Status Compatibility**:
   - Direct registration requests (Vendors and Agents) submitted from registration portals MUST be queried and rendered without dropping records due to status string formatting.
   - All pending status variants (`pending`, `pending_approval`, `pending approval`, `under_verification`, `under verification`, `in_review`, `pending_verification`, `requested`) MUST be captured by backend endpoints (`GET /api/admin/vendors/requests`, `GET /api/admin/agents`) and displayed in the Admin Direct Registration Requests modal.

2. **Multi-Role Onboarding Support**:
   - The Direct Registration Requests modal MUST display both incoming Vendor applications and Agent onboarding applications (State Agent, District Agent, Divisional Agent, Pincode Agent) with role badges and 1-click Direct Approval/Reject actions.

3. **Suspended Vendor & Product Isolation**:
   - Suspended, inactive, or rejected vendors MUST NOT have their products, services, or category items rendered across customer dashboard, category pages, or public API endpoints (`/api/public/products`, `/api/products`).
   - When a vendor's status is modified in the Admin panel, matching product documents in MongoDB MUST automatically synchronize `vendorStatus`, `isVendorSuspended`, and `isActive` properties.
