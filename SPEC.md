# Spend Wise - Technical Specification

## 1. Project Overview

**Project Name:** Spend Wise  
**Type:** Full-Stack Web Application  
**Core Functionality:** A finance tracking application for Indian expats in Europe, enabling expense management in Euro (€) with live Indian Rupee (₹) conversion.  
**Target Users:** Indian expatriates living in Europe who need to track finances in EUR while visualizing values in INR.

---

## 2. Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Google Auth
- **Database:** Firebase Firestore
- **Exchange Rate API:** ExchangeRate-API (free tier) or Frankfurter API
- **State Management:** React Context + useState/useEffect

---

## 3. UI/UX Specification

### 3.1 Color Palette (Fintech Theme)

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Deep Slate | `#1e293b` | Primary background, headers |
| Slate 800 | `#1e293b` | Cards, containers |
| Slate 700 | `#334155` | Secondary elements |
| Emerald 500 | `#10b981` | Primary accent, income, savings |
| Emerald 600 | `#059669` | Hover states |
| Red 500 | `#ef4444` | Expenses |
| Red 600 | `#dc2626` | Hover states |
| Amber 500 | `#f59e0b` | Warnings, highlights |
| White | `#ffffff` | Text on dark backgrounds |
| Slate 100 | `#f1f5f9` | Light backgrounds |
| Slate 200 | `#e2e8f0` | Borders, dividers |
| Slate 400 | `#94a3b8` | Secondary text |

### 3.2 Typography

- **Primary Font:** Inter (Google Fonts)
- **Headings:** Font weights 600-700
- **Body:** Font weights 400-500
- **Font Sizes:**
  - H1: 2.5rem (40px)
  - H2: 1.875rem (30px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)
  - XSmall: 0.75rem (12px)

### 3.3 Spacing System

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### 3.4 Responsive Breakpoints

- **Mobile:** < 640px (default)
- **Tablet:** >= 640px (sm)
- **Desktop:** >= 1024px (lg)
- **Large Desktop:** >= 1280px (xl)

---

## 4. Page Structure

### 4.1 Pages

1. **Landing Page** (`/`) - Login screen with Google Sign-In
2. **Onboarding** (`/onboarding`) - First-time user profile setup
3. **Dashboard** (`/dashboard`) - Main financial overview
4. **Transactions** (`/transactions`) - Full transaction list with CRUD
5. **Shopping Assistant** (`/shopping`) - Smart shopping list

### 4.2 Layout Components

- **Navbar:** Fixed top, logo, navigation links, user avatar
- **Sidebar:** Desktop-only, collapsible navigation
- **Main Content:** Centered container with max-width 1280px

---

## 5. Component Specifications

### 5.1 Authentication Components

#### LoginPage
- Full-screen centered card
- App logo and tagline
- "Sign in with Google" button (emerald green)
- Background: Gradient from slate-800 to slate-900

#### OnboardingModal
- Modal overlay with slide-up animation
- Progress indicator (step 1 of 2)
- Form fields:
  - Full Name (text input, required)
  - Age (number input, 18-120, required)
  - Date of Birth (date picker, required)
- "Continue" button

### 5.2 Dashboard Components

#### ExchangeRateDisplay
- Card showing current EUR/INR rate
- Last updated timestamp
- Auto-refresh every 10 minutes

#### SummaryCards
- Three cards in a row (stacked on mobile):
  - **Total Income** (emerald background)
  - **Total Expenses** (red background)
  - **Total Savings** (amber background)
- Each shows EUR amount with INR conversion below

#### TransactionForm
- Unified form for all transaction types
- Fields:
  - Type selector (Expense/Income/Savings)
  - Category dropdown
  - Date picker (default: today)
  - Amount in EUR (number input)
  - Note (textarea, optional)
- Live INR preview next to amount field

#### TransactionList
- Table/Card view toggle
- Columns: Date, Category, Type, Amount (EUR), Amount (INR), Note, Actions
- Edit and Delete buttons per row

#### EditTransactionModal
- Same as TransactionForm but pre-filled
- "Save Changes" and "Cancel" buttons

### 5.3 Shopping Assistant Components

#### ShoppingList
- Input field to add new item names
- List of checklist items with:
  - Checkbox
  - Item name
  - Unit Price input (EUR)
  - Quantity input
  - Line total (EUR + INR)
- Delete item button

#### CheckoutButton
- "Check out and Log" button
- Summary modal showing total in EUR and INR
- Confirmation creates expense entry in main transactions

---

## 6. Functionality Specification

### 6.1 Authentication Flow

1. User visits app → Check if authenticated
2. If not authenticated → Show LoginPage
3. User clicks "Sign in with Google"
4. On success → Check Firestore for user document
5. If no user document → Redirect to Onboarding
6. If user document exists → Redirect to Dashboard

### 6.2 Onboarding Flow

1. User fills: Full Name, Age, DOB
2. Validation: All fields required, Age 18-120
3. Submit → Create user document in Firestore
4. Redirect to Dashboard

### 6.3 Exchange Rate Integration

- **API:** Frankfurter API (free, no key required)
- **Endpoint:** `https://api.frankfurter.app/latest?from=EUR&to=INR`
- **Caching:** Store in localStorage for 10 minutes
- **Fallback:** Use cached rate if API fails

### 6.4 Transaction Management

#### Create
- Form validation
- Generate unique ID
- Store in Firestore `transactions` collection
- Fields: id, userId, type, category, date, amountEUR, amountINR, note, createdAt

#### Read
- Fetch all user transactions
- Sort by date descending
- Calculate totals

#### Update
- Open edit modal with pre-filled data
- Update in Firestore
- Recalculate INR amount

#### Delete
- Confirmation dialog
- Remove from Firestore

### 6.5 Shopping Assistant Flow

1. User adds items to checklist
2. For each item, enters price and quantity
3. Live calculation: Price × Quantity = Line Total
4. Line total shows EUR and INR
5. On checkout:
   - Sum all line totals
   - Create expense transaction with category "Shopping"
   - Clear shopping list
   - Show success message

---

## 7. Data Models

### 7.1 User Document (Firestore)

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  fullName: string;
  age: number;
  dateOfBirth: string; // ISO date
  createdAt: timestamp;
}
```

### 7.2 Transaction Document (Firestore)

```typescript
interface Transaction {
  id: string;
  userId: string;
  type: 'expense' | 'income' | 'savings';
  category: string;
  date: string; // ISO date
  amountEUR: number;
  amountINR: number;
  note: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 7.3 Shopping Item (Local State)

```typescript
interface ShoppingItem {
  id: string;
  name: string;
  unitPriceEUR: number;
  quantity: number;
  lineTotalEUR: number;
  lineTotalINR: number;
}
```

---

## 8. Categories

### Expense Categories
- Food & Groceries
- Rent
- Utilities
- Transportation
- Shopping
- Entertainment
- Healthcare
- Other

### Income Categories
- Salary
- Freelance
- Investment
- Gift
- Other

### Savings Categories
- Emergency Fund
- Investment
- Travel
- Other

---

## 9. Number Formatting

### Indian Numbering System
- 1,00,000 = One Lakh
- 10,00,000 = Ten Lakhs
- 1,00,00,000 = One Crore

**Implementation:**
```javascript
function formatINR(number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
}

function formatEUR(number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}
```

---

## 10. Animations & Transitions

- **Page transitions:** Fade in (200ms)
- **Card hover:** Scale 1.02, shadow increase (150ms ease)
- **Button hover:** Background color shift (150ms)
- **Modal:** Slide up + fade (250ms ease-out)
- **List items:** Stagger fade-in on load (50ms delay each)
- **Form validation:** Shake animation on error

---

## 11. Acceptance Criteria

### Authentication
- [ ] User can sign in with Google
- [ ] First-time users are redirected to onboarding
- [ ] Returning users go directly to dashboard

### Onboarding
- [ ] All three fields are required
- [ ] Age must be between 18-120
- [ ] Data is saved to Firestore
- [ ] User can proceed to dashboard after completion

### Dashboard
- [ ] Shows current EUR/INR exchange rate
- [ ] Displays total income, expenses, and savings
- [ ] All amounts shown in both EUR and INR

### Transactions
- [ ] User can create expense, income, or savings entries
- [ ] Live INR preview updates as user types EUR amount
- [ ] Transaction list shows all entries with both currencies
- [ ] User can edit any transaction
- [ ] User can delete any transaction

### Shopping Assistant
- [ ] User can add items to shopping list
- [ ] User can enter unit price and quantity
- [ ] Line totals calculate automatically in EUR and INR
- [ ] Checkout creates expense entry in main transactions

### Design
- [ ] Dark fintech theme applied
- [ ] Mobile-first responsive design
- [ ] Indian numbering system for INR
- [ ] Clean, professional aesthetic

---

## 12. File Structure

```
spend-wise/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Login)
│   ├── onboarding/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   └── shopping/
│       └── page.tsx
├── components/
│   ├── auth/
│   │   ├── GoogleSignIn.tsx
│   │   └── OnboardingForm.tsx
│   ├── dashboard/
│   │   ├── ExchangeRate.tsx
│   │   ├── SummaryCards.tsx
│   │   └── TransactionForm.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   └── EditTransactionModal.tsx
│   ├── shopping/
│   │   ├── ShoppingList.tsx
│   │   └── CheckoutModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Card.tsx
├── lib/
│   ├── firebase.ts
│   ├── exchangeRate.ts
│   └── utils.ts
├── contexts/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```
