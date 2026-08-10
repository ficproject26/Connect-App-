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

## Vendor to Customer Product & Listing Synchronization Workflow (IMMUTABLE)

### Core Rules
1. **Universal Item Display**:
   - ANY product, service, food item, stay accommodation, travel booking, daily needs item, or job posting created by ANY vendor MUST be immediately visible on the Customer Dashboard under its respective Level 1 Main Category tab (`Services`, `Products`, `Daily Needs`, `Food`, `Stay`, `Travel`, `Jobs`).
   - Category filtering (`matchesSubNavbar`, `filteredProducts`, `jobsList`) MUST ALWAYS check `product.subNavbarCategory` and `product.mainCategory` alongside `product.category`, `product.subcategory`, `product.subSubcategory`, `product.tag`, and `product.name`.

2. **Schema Default Field Isolation**:
   - Backend database default schema properties (such as default `foodType: "Veg"` or default `jobType: "Full-time"`) MUST NEVER be used in isolation to misclassify physical products (mobiles, sarees, toothbrushes, electronics) as Food or Jobs.
   - Physical products belong strictly under `Products` or `Daily Needs`, while `Food` and `Jobs` display only items explicitly assigned to those categories.
