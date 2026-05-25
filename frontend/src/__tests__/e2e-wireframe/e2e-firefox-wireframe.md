# E2E Test Wireframe — Firefox

## Overview

This document outlines the wireframe (structure and scenarios) for end-to-end tests of the PEVNStore
frontend application. The E2E tests target **Firefox** as the testing browser.

Tests are organized by feature area. Each section describes test scenarios without writing
implementation code. The wireframe assumes a test runner such as Playwright or Selenium WebDriver
configured with Firefox.

---

## Global Setup

| Step | Description |
|---|---|
| 1 | Launch Firefox browser instance (headless in CI, headed locally) |
| 2 | Start backend API server (or mock API responses) |
| 3 | Start the frontend dev server |
| 4 | Set viewport to desktop resolution (1920x1080) |
| 5 | Clear browser storage (cookies, localStorage, sessionStorage) before each test |

---

## 1. Home Page (`/`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| HP-01 | Home page loads with products | Navigate to `/`; wait for content | Products are displayed in a grid |
| HP-02 | Loading skeletons appear while fetching | Navigate to `/`; observe initial render | Skeleton placeholders are visible, then replaced by products |
| HP-03 | "No results" shown when backend returns empty | Mock API returns empty products array; navigate to `/` | "No results" message is displayed |
| HP-04 | Pagination — next page | Click "next page" button | URL updates with `?page=2`; new products load |
| HP-05 | Pagination — previous page | Navigate to page 2; click "previous page" | URL updates with `?page=1`; page 1 products load |
| HP-06 | Pagination — direct page click | Click page number "3" in pagination bar | URL updates with `?page=3`; page 3 products load |
| HP-07 | Add product to cart from home | Click "add to cart" on a product | Success toast appears; cart is updated |
| HP-08 | Add product to favourites (logged in) | Login; click star button on a product | Success toast; product added to favourites |
| HP-09 | Favourite button hidden when not logged in | Logout; navigate to `/` | Star icon is not visible on product cards |

---

## 2. Navigation & Theme

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| NV-01 | Hamburger menu opens category sidebar | Click hamburger menu icon | Category sidebar slides in from left |
| NV-02 | Hamburger menu closes category sidebar | Open sidebar; click hamburger again | Sidebar slides out |
| NV-03 | Dark mode toggle | Click moon icon | Page switches to dark theme; localStorage.theme = "dark" |
| NV-04 | Light mode toggle from dark | In dark mode; click moon icon | Page switches to light theme; localStorage.theme = "light" |
| NV-05 | Theme persists across page reload | Set dark mode; reload page | Page remains in dark mode |
| NV-06 | Theme follows system preference on first visit | Clear localStorage; system prefers dark; reload | Page renders in dark mode |
| NV-07 | Desktop shows inline search bar, mobile shows separate | Test at viewport 1920px; test at viewport 375px | Search bar placement matches design |
| NV-08 | Nav links point to correct pages | Click Cart, Favourites, Account icons | Navigate to `/cart`, `/favourites`, `/account` respectively |

---

## 3. Search

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| SR-01 | Live search autocomplete appears | Type "lap" in search bar | Autocomplete dropdown appears with matching products |
| SR-02 | Autocomplete hides on blur | Type "lap"; click outside search bar | Autocomplete disappears after 150ms delay |
| SR-03 | Autocomplete shows again on focus | Blur search; focus again | Autocomplete re-appears |
| SR-04 | Submit search navigates to search page | Type "laptop"; press Enter | Navigate to `/search/laptop`; autocomplete closes |
| SR-05 | Search resets filters and pagination | Apply filters; search "monitor" | Filters reset; pagination goes to page 1 |
| SR-06 | Search results page shows matching products | Navigate to `/search/phone` | Products matching "phone" are displayed |
| SR-07 | Empty search results | Navigate to `/search/xyznonexistent` | "No results" message |

---

## 4. Product Detail Page (`/product/:id`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| PD-01 | Product detail page loads | Click a product; wait for navigation | Product name, price, image, description visible |
| PD-02 | Product detail from URL | Navigate to `/product/1` | Product with id=1 is displayed |
| PD-03 | Add to cart from detail page | Click "add to cart" button | Success toast; cart item count increases |
| PD-04 | Add to favourites from detail page (logged in) | Click "add to favourites" | Success toast |
| PD-05 | Invalid product ID shows error | Navigate to `/product/999999` | Error message or redirect |

---

## 5. Category Page (`/category/:category`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| CT-01 | Category page filters products | Navigate to `/category/Electronics` | Only Electronics products shown |
| CT-02 | Category from sidebar link | Open sidebar; click "Electronics" | Navigate to `/category/Electronics` |
| CT-03 | Empty category | Navigate to `/category/NonExistentCat` | "No results" or empty state |
| CT-04 | `/category` redirects to `/` | Navigate to `/category` | Redirect to home page |

---

## 6. Cart Page (`/cart`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| CA-01 | Cart page shows items | Add item to cart; navigate to `/cart` | Item is listed with name, price, quantity |
| CA-02 | Increase quantity | Click "+" on cart item | Quantity increments by 1 |
| CA-03 | Decrease quantity | Click "-" on cart item when quantity > 1 | Quantity decrements by 1 |
| CA-04 | Remove item from cart | Click remove/delete button on item | Item disappears from cart |
| CA-05 | Clear empty cart | Open empty cart; click "clear cart" | Warning toast: "Cart is empty" |
| CA-06 | Clear cart with items | Click "clear cart" | All items removed; success toast |
| CA-07 | Empty cart redirect message | Visit `/cart?empty=true` after Stripe checkout | Shows "Cart is empty" response |
| CA-08 | Guest cart persists in session | Add items; no login; reload page | Cart items persist via session cookie |

---

## 7. Favourites Page (`/favourites`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| FV-01 | Favourites page shows saved items | Login; favourite some products; navigate to `/favourites` | Favourited products listed |
| FV-02 | Remove from favourites | Click remove/delete on a favourite item | Item disappears; success toast |
| FV-03 | Empty favourites state | Navigate to `/favourites` with no favourites | Empty state message |
| FV-04 | Favourites require login | Logout; navigate to `/favourites` | Redirect to login or empty state |

---

## 8. Account Page (`/account`)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| AC-01 | Sign up form validation | Navigate to `/account`; submit empty form | Validation errors shown |
| AC-02 | Successful sign up | Fill username/email/password; submit | "Sign up successful" message |
| AC-03 | Duplicate sign up | Sign up with existing credentials | Error message displayed |
| AC-04 | Successful login | Fill credentials; submit | "Log in successful"; user state updated |
| AC-05 | Failed login | Fill wrong credentials; submit | Error message displayed |
| AC-06 | Successful logout | Login; click logout | "Log out successful"; user state cleared |
| AC-07 | Session persistence | Login; reload page | User remains logged in |
| AC-08 | Password field masked | Navigate to `/account` | Password input type is "password" |

---

## 9. Filters

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| FL-01 | Date range filter | Set from date and to date | Products within date range loaded |
| FL-02 | Price range filter — predefined | Select "$0 - $50" price range | Only products in that range load |
| FL-03 | Price range filter — multiple | Select "$0 - $50" and "$51 - $100" | Products in 0-100 range loaded |
| FL-04 | Rating filter | Set minimum rating to 4 | Only products rated >=4 load |
| FL-05 | Sort by price ascending | Select order by "product_price" ASC | Products sorted by price low → high |
| FL-06 | Sort by release date descending | Select order by "release_date" DESC | Products sorted newest → oldest |
| FL-07 | Load amount change | Change items per page to 24 | Page shows 24 products; URL updated |
| FL-08 | Reset filters | Apply multiple filters; click reset | All filters return to defaults |

---

## 10. Cross-cutting / Edge Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| CC-01 | API error — network failure | Disconnect network; navigate to `/` | Graceful error handling; no white screen |
| CC-02 | API error — server 500 | Mock API returns 500; perform action | Error toast displayed |
| CC-03 | Concurrent cart operations | Rapidly click "add to cart" on multiple products | No duplicate or corrupted state |
| CC-04 | Browser back/forward navigation | Navigate through pages; use browser back/forward | Routes and data load correctly |
| CC-05 | Session expiry during action | Setup expiring session; perform authenticated action | Proper redirect to login or error message |

---

## 11. Firefox-Specific Considerations

| ID | Consideration |
|---|---|
| FF-01 | Test with Firefox's built-in tracking protection enabled (Standard and Strict modes) — ensure cookies and localStorage still work for session/auth |
| FF-02 | Verify SVG rendering (hamburger menu icon, loading placeholder) renders correctly in Firefox's SVG engine |
| FF-03 | Test with `privacy.resistFingerprinting = true` to ensure theme detection (prefers-color-scheme) still works correctly |
| FF-04 | Verify form autofill behavior in Firefox does not interfere with signup/login forms |
| FF-05 | Test with Firefox's Enhanced Tracking Protection blocking cross-site cookies — ensure `withCredentials: true` still works for API calls when frontend and backend are on different origins |

---

## Execution Notes

1. Tests should be run sequentially (not in parallel) to avoid database/state conflicts when using
   a real backend.
2. Each test should clean up after itself (remove test data created during the test).
3. Use `data-testid` attributes in the Vue components as selectors to make tests resilient to CSS
   changes.
4. For Firefox headless mode, use `MOZ_HEADLESS=1` environment variable.
5. Record videos of test runs for debugging failures.
