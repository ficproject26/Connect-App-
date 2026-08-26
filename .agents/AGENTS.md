# Project Guidelines & Architectural Rules

## Strict Workflow Preservation & Admin Portal Stability

### Core Directive (NEVER ALTER WITHOUT EXPLICIT USER INSTRUCTION)
1. **Preserve Current Admin Flow**:
   - The overall workflow, UI layouts, navigation structures, and data handling of the Admin Portal are fully correct and locked.
   - NEVER refactor, remove, or modify existing working features, modals, navigation tabs, directory flows, or backend handlers unless explicitly asked by the USER for a targeted bug fix or new requirement.

## Strict Admin-to-Customer Category Hierarchy Authority & Synchronization Rules

### Core Immutable Directive (NEVER ALTER OR OVERWRITE)
1. **Absolute Database Authority & Zero Hardcoded Data**:
   - The Database (MongoDB `categories` collection via `/api/admin/categories`) is the SINGLE, SOLE authoritative source of truth for all categories across Admin and Customer portals.
   - ALL hardcoded, mock, prebuilt, duplicate, fallback, or outdated category arrays (such as `defaultTaxonomies`) are strictly forbidden. Any category, subcategory, or child category that does not exist in the active Admin Category Management database MUST NOT BE DISPLAYED on the Customer Website.

2. **Strict 3-Tier Hierarchy Mapping**:
   - **Level 1 (Main Category)**: Fixed system canonical categories (`Services`, `Products`, `Daily Needs`, `Food`, `Stay`, `Travel`, `Jobs`). Main Categories must NEVER be treated as Subcategories or Child Categories.
   - **Level 2 (Subcategory)**: Created by Admin under a Main Category (e.g., `Electronics`, `Computers`). Displayed ONLY on the left-side sidebar (`MAIN CATEGORIES`) under its respective Main Category tab. Subcategories must NEVER be displayed as Main Categories or Child Categories.
   - **Level 3 (Child Category)**: Created by Admin under a specific Subcategory (e.g., `Power Bank`, `Smartphones`, `Laptop`, `Tablets`, `Bluetooth Headphones`). Displayed ONLY on the right-side content grid (`ALL CHILD CATEGORIES` / `[SUBCATEGORY] CHILD CATEGORIES`). Child categories must NEVER be displayed as Subcategories or Main Categories.

3. **Parent-Child Integrity & Scoping Rules**:
   - When "ALL" is selected on the left sidebar, display ALL active Level 3 Child Categories belonging to that Main Category.
   - When a specific Level 2 Subcategory (e.g. `Electronics`) is selected, display ONLY the active Level 3 Child Categories belonging to `Electronics`.
   - The Child Categories section must NEVER display the selected Subcategory name itself, the Main Category name, or unrelated categories.

4. **Integration Protocol for Future Features**:
   - This category hierarchy structure, data mapping (`buildActiveCategoryTree`), and DB-first filtering logic are core system invariants. Any new feature added to the application MUST strictly integrate with this existing hierarchy without altering its structure, filtering rules, or database data source.

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

5. **Approved Agent Directory Scoping & Safe Territory Resolution**:
   - The active Agent Directory (`Tree View`, `Grid View`, `List View`) and level filter tabs MUST strictly show approved/active agents (`isApprovedAgent(agent)`). Unapproved, pending, or under-verification agents MUST NOT render in active directory views until approved by Admin.
   - `getAgentTerritoryDetail(agent)` MUST safely return a valid `{ label: string, value: string }` object for all agent levels (State, District, Division, Pincode) and default fallbacks with optional chaining (`terrInfo?.label`, `terrInfo?.value`) to prevent portal rendering errors.

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

## Multi-Vendor Business & Listing Visibility Flow

### Mandatory Principles (NEVER CHANGE THIS WORKFLOW)
1. **Dynamic Multi-Vendor & Business Relationship Binding**:
   - Every product, service, job, food item, or listing added by any vendor MUST be dynamically linked to `vendorId`, `vendorEmail`, `vendorPhone`, `vendorName`, `businessId`, `businessName`, `vendorStatus`, and `businessStatus`.
   - Never hardcode vendor IDs, business IDs, category IDs, or sample company names in backend endpoints or frontend filters.

2. **Customer Visibility Rule**:
   - A listing MUST appear on the Customer Website (`/api/public/products`, `/api/products`) ONLY when: `Vendor == ACTIVE` AND `Business Outlet == ACTIVE` AND `Listing == ACTIVE`.
   - If a specific business outlet of a vendor is suspended (`status: 'Suspended'`), ONLY items belonging to that suspended business outlet MUST be hidden. Other active business outlets of that same vendor and all other active vendors MUST remain completely unaffected and visible.
   - When a suspended business outlet is re-activated by Admin, its listings MUST immediately become visible on the Customer Website again.
