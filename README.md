# SmartCart — Smart Electronics E-Commerce and Recommendation Platform

SmartCart is an existing MERN stack electronics catalog with personalized discovery, product comparison, price observations, and a simulated checkout workflow. Seed catalog prices are examples and are not current verified Indian retailer prices.

---

## 🌟 Key Capabilities

1. **Smart Preference-Based Product Finder**:
   - An interactive 6-step questionnaire that translates consumer requirements (use case, budget span, preferred brands, mandatory specs, and priority weights) into explainable 0–100 match scores.
   - Built with a transparent mathematical scoring formula: hard filtering, specification normalization, custom priority weighting, missing-data penalty, and automated pros/cons generation.
   - Graceful relaxation advice when zero products match strict boundaries.

2. **Side-by-Side Product Comparison Engine**:
   - Compares 2 to 4 products within the same category.
   - Mathematically highlights **Lowest Price**, **Highest Rated**, and **Best Value Ratio** (`ValueScore = ((SpecAggregate * 0.6 + Rating/5 * 0.4) / Price) * 1000`).
   - Automatically generates comparative takeaway bullet points across memory, battery, and price deltas.
   - Mobile-friendly horizontally scrollable table.

3. **Price Tracking & History Visualizations**:
   - Source-attributed retailer observations can be imported with verification timestamps.
   - History charts display recorded observations; the seed does not fabricate past prices.
   - Price watches are user preferences; automated notifications are not configured by default.

4. **Complete E-Commerce Workflow**:
   - Shopping cart with stock validation and server-side catalog price calculation. Tax and shipping policy require merchant configuration.
   - Guest cart support stored in `localStorage` that seamlessly synchronizes with account upon sign-in.
   - Checkout with saved address selector, simulated payment and order item snapshots.
   - Order history with step-by-step fulfillment status tracker (`pending` → `processing` → `shipped` → `delivered`).

5. **Customer Reviews & Verified Purchase Enforcement**:
   - 1-to-5 star rating system with aggregate score recalculation.
   - Verified Purchase badges granted exclusively when the user's completed order contains the reviewed item.
   - Helpful vote counters.

6. **Administrative Management Portal**:
   - Protected by role-based authorization middleware (`role: 'admin'`).
   - Executive KPI metrics (Total Revenue, Orders, Catalog SKUs, Registered Users).
   - Recharts sales revenue timeline and category distribution charts.
   - Low-stock inventory alert monitors.
   - Full Product CRUD with specs form and instant price history audit trail.
   - Customer Order processing and fulfillment status management.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom palette (navy `#0f172a`, electric sky `#0ea5e9`, teal `#14b8a6`)
- **Routing**: React Router v7
- **HTTP Client**: Axios with `withCredentials: true` (for HTTP-only JWT cookies)
- **State Management**: React Context API (`AuthContext`, `CartContext`, `CompareContext`, `WishlistContext`)
- **Icons**: Lucide React
- **Visual Analytics**: Recharts (price history line charts, sales bars, category breakdowns)

### Backend
- **Runtime**: Node.js v22+ (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT tokens stored in secure, HTTP-only `SameSite=lax` cookies
- **Password Security**: bcryptjs (cost factor 10)
- **Input Validation**: Zod request schema validation
- **HTTP Security**: Helmet headers, CORS credentials whitelist, express rate limiting on auth endpoints
- **Database Resilience**: Connects to MongoDB Atlas or local MongoDB; auto-provisions embedded in-memory database (`mongodb-memory-server`) if local MongoDB daemon is absent for 1-click developer onboarding.

---

## 🧮 Recommendation Algorithm Formula

The recommendation engine (`server/src/services/recommendationEngine.js`) follows an explainable 5-step pipeline:

1. **Hard Constraints Filtering**:
   - Category equality: $\text{product.category} = \text{criteria.category}$
   - Budget constraints: $\text{budgetMin} \le \text{price} \le \text{budgetMax}$
   - Mandatory specifications: $\text{RAM} \ge \text{minRam}$, $\text{Storage} \ge \text{minStorage}$, etc.

2. **Feature Normalization**:
   Within eligible products, continuous metrics (RAM, battery life, screen refresh rate, etc.) are min-max normalized to $[0, 1]$:
   $$\text{Norm}(x) = \frac{x - \min(X)}{\max(X) - \min(X)}$$
   For inverted metrics where lower is better (such as chassis weight):
   $$\text{Norm}_{\text{inv}}(x) = 1 - \frac{x - \min(X)}{\max(X) - \min(X)}$$
   *Missing specifications receive a penalty baseline of 0.35 rather than an unearned average.*

3. **Dynamic Priority Weighting**:
   Base use-case weights (Gaming, Programming, Office, Travel, Photography) are modulated by user priority sliders ($1$ to $5$):
   $$W_k = \text{BaseWeight}_k \times \frac{\text{Slider}_k}{3}, \quad \sum \tilde{W}_k = 1.0$$

4. **Composite Match Score (0 to 100)**:
   $$\text{Score} = \text{round}\Big(\big(0.50 \cdot S_{\text{specs}} + 0.25 \cdot S_{\text{value}} + 0.15 \cdot S_{\text{rating}} + 0.10 \cdot S_{\text{brand}}\big) \times 100\Big)$$
   Where:
   - $S_{\text{specs}} = \sum \tilde{W}_k \cdot \text{Norm}(x_k)$
   - $S_{\text{value}} = (S_{\text{specs}} \times 0.6) + (\text{BudgetEfficiency} \times 0.4)$
   - $S_{\text{rating}} = \frac{\text{Rating}}{5.0}$
   - $S_{\text{brand}} = 1.0$ (if brand matches user preference or preference is 'Any') else $0.7$

5. **Explainability Engine**:
   Evaluates top-performing hardware features against category benchmarks to output human-readable matching rationales and tailored pros and cons.

---

## 👥 Demo Accounts (Pre-Seeded)

The database includes pre-configured demo credentials:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smartcart.com` | `AdminPassword123!` | Management Dashboard, Product CRUD, Order Statuses, Review Moderation |
| **Shopper / User** | `alex@example.com` | `UserPassword123!` | Personalized Finder, Saved Addresses, Order History, Wishlist |
| **Shopper** | `sarah@example.com` | `UserPassword123!` | Shopping, wishlist, and comparison |

Demo seed catalog ratings and review counts start at zero. The seeder no longer creates fabricated reviews, orders, or historical price points.

*Tip: The Login Page includes 1-Click "Shopper Demo" and "Admin Demo" fill buttons.*

---

## 🚀 Local Installation & Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.11)
- **npm** v9+
- *(Optional)* Local MongoDB or MongoDB Atlas URI (if not present, an embedded MongoDB starts automatically for zero-config runs).

### 2. Setup Server

```bash
cd server
npm install
Copy `.env.example` to `.env` and set local secrets.
npm run seed     # Additive demo users and catalog only; preserves existing data
npm run dev      # Starts Express API at http://localhost:5000
```

### 3. Setup Client

In a separate terminal:

```bash
cd client
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

## Indian pricing and verified offers

The application formats catalog values in INR. The built-in sample product values are unverified catalog examples. No live retailer pricing integration is configured. To add a genuine offer, curate exact model and configuration fields, then follow [the verified price import guide](docs/PRODUCT_IMPORT_AND_PRICING.md). The import stores retailer observation separately from catalog checkout price. Do not present legacy `originalPrice` as verified MRP.

See [the project audit](docs/PROJECT_AUDIT.md) for inspected modules, findings and remaining work.

---

## 🧪 Running Unit Tests

The backend includes a native test suite:

```bash
cd server
node --test src/tests/recommendation.test.js src/tests/comparison.test.js src/tests/cartOrder.test.js
```

Covers:
- Recommendation hard constraints, category filtering, and budget ceilings
- Mandatory specification filtering (`minRam`, `minRefreshRate`)
- Priority weighting modulation across use cases (Travel vs. Gaming)
- Match score clamping (0–100) and explainability pros/cons
- Relaxation suggestions when no items match
- Comparison 2–4 product limit and single-category enforcement
- Comparison highlights (lowest price, highest rated, best value formula)
- Commercial order pricing, shipping threshold rules, and tax calculations.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create user account & set HTTP-only cookie
- `POST /api/auth/login` — Sign in & set HTTP-only cookie
- `POST /api/auth/logout` — Invalidate session cookie
- `GET /api/auth/me` — Return current authenticated user profile
- `PUT /api/auth/profile` — Update address book & saved preferences

### Products (`/api/products`)
- `GET /api/products` — Filterable, searchable, sorted, paginated catalog
- `GET /api/products/featured` — Featured and trending electronics
- `GET /api/products/categories` — Aggregated categories with item counts
- `GET /api/products/:identifier` — Product detail by slug or ID with related items
- `GET /api/products/:id/price-history` — Historical audited price data points
- `POST /api/products` — *(Admin)* Create new SKU with initial price record
- `PUT /api/products/:id` — *(Admin)* Update product & log price audit
- `DELETE /api/products/:id` — *(Admin)* Remove product and price history

### Smart Recommendations & Comparison
- `POST /api/recommendations` — 6-step questionnaire evaluation returning ranked candidates
- `POST /api/compare` — Multi-device side-by-side spec matrix & best value highlight

### Cart & Orders (`/api/cart`, `/api/orders`)
- `GET /api/cart` — User active shopping bag
- `POST /api/cart/items` — Add or increment SKU with stock check
- `PATCH /api/cart/items/:itemId` — Update quantity with stock ceiling check
- `DELETE /api/cart/items/:itemId` — Remove item from cart
- `POST /api/cart/sync` — Merge guest cart into user account
- `POST /api/orders` — Stock validation, price calculation, snapshot creation, order placement
- `GET /api/orders/my-orders` — User historical order receipts
- `GET /api/orders/:id` — Individual order status and tracking details

### Reviews (`/api/reviews`)
- `GET /api/reviews/products/:productId/reviews` — Paginated product reviews
- `POST /api/reviews/products/:productId/reviews` — Post review with verified purchase validation
- `POST /api/reviews/:id/vote` — Upvote helpful review

### Administration (`/api/admin`)
- `GET /api/admin/dashboard` — Key KPI metrics, revenue charts, low-stock alerts
- `GET /api/admin/orders` — Customer orders pipeline with status filter
- `PATCH /api/admin/orders/:id/status` — Update fulfillment status (`processing` → `delivered`)
