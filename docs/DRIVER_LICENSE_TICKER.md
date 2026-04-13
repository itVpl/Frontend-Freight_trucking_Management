# Driver license expiry ticker — API & implementation contract

Horizontal marquee data: **driver name** + **license expiry**, with server-derived status for UI colors:

| `tickerStatus`   | UI text color |
|------------------|---------------|
| `expired`        | **Red**       |
| `expiring_soon`  | **Yellow**    |

License field persistence is described in [DRIVER_LICENSE_EXPIRY.md](./DRIVER_LICENSE_EXPIRY.md).

`BASE_API_URL` is set in `src/apiConfig.js` (e.g. `http://localhost:4000`).

---

## 1. Endpoint & mounting

| Item | Value |
|------|--------|
| **Path** | `GET /api/v1/driver/license-expiry-ticker` |
| **Mount** | `app.js` mounts driver routes at `/api/v1/driver`; route is registered in **`driverRoutes.js`** (see §8). |
| **Order** | Register this route **before** any `/:driverId/...` (or similar param) routes so `license-expiry-ticker` is not captured as an id. |

---

## 2. Authentication & authorization

- **Header:** `Authorization: Bearer <token>` (same pattern as `GET /api/v1/driver/my-drivers`).
- **Middleware:** `isAuthenticatedUser` (or equivalent) validates the token.
- **Handler:** After auth, require **`userType === 'trucker'`**. Otherwise respond **`403 Forbidden`**.

---

## 3. Query parameter `window`

| Value | Meaning |
|-------|---------|
| `calendar_month` | **Default.** Expiring-soon window per §4.2. |
| `days_30` | Expiring-soon window per §4.3. |

Any **other** value (missing, typo, etc.) **falls back** to **`calendar_month`**.

Example:

```http
GET /api/v1/driver/license-expiry-ticker
GET /api/v1/driver/license-expiry-ticker?window=days_30
```

---

## 4. Data scope & Mongo filter

**Scope** must match **`GET /api/v1/driver/my-drivers`** — the same **two** sets:

1. **Company drivers:** your company’s drivers (`truckerId` / equivalent) that are **not** shared-pool-only, and  
2. **Shared pool drivers:** any shared-pool rows that `my-drivers` already returns for this trucker.

Only drivers whose expiry is stored as a **BSON date** (`$type: 'date'`) on either:

- **`licenseExpiryDate`** (canonical), or  
- legacy **`driverLicenseExpiryDate`**

should be candidates for evaluation. Rows with missing or non-date values are **omitted** from `items` after evaluation (see §5).

---

## 5. Date logic (server-side, UTC)

**Reference date `asOf`:** derive **UTC calendar date** strings (`YYYY-MM-DD`) using **`Date.UTC`** (year, month, day), consistent with storing expiry at **UTC noon** in the database.

All comparisons use **UTC calendar dates** built from those `YYYY-MM-DD` values (no local-timezone drift for “today”).

**Canonical expiry for each driver:** use **`licenseExpiryDate`** if present as a date; otherwise **`driverLicenseExpiryDate`**.

### 5.1 `expired` → `tickerStatus: "expired"` (UI **red**)

```
expiryDateUTC < asOf
```

### 5.2 `expiring_soon` → `tickerStatus: "expiring_soon"` (UI **yellow**)

Driver is **not** expired (`expiryDateUTC >= asOf`), **and**:

| `window` | Rule |
|----------|------|
| **`calendar_month`** | `expiryDateUTC` ≤ **last day of the next calendar month** after `asOf`. Example: `asOf = 2026-04-13` → include through **`2026-05-31`** inclusive. |
| **`days_30`** | `expiryDateUTC` ≤ **`asOf` + 30 calendar days** (inclusive). |

If a row could match both definitions, **`expired` takes precedence** (only `expired` is returned for that row).

### 5.3 Omissions

- Missing or **unparseable** expiry → **omit** from `items` (do not error the whole response for one bad row unless you choose strict mode).

---

## 6. `daysUntilExpiry`

Integer: **whole UTC calendar days** from **`asOf`** to the expiry calendar date.

- **Negative** if expired (e.g. `-134`).
- **Non-negative** if not yet expired on `asOf`.

---

## 7. Sorting

1. **`expired`** first, then **`expiring_soon`**.  
2. Within each group: ascending by **`licenseExpiryDate`** (canonical date used for display).

---

## 8. Backend code locations (reference)

| Area | Location |
|------|-----------|
| Handler | **`driverController.js`** — e.g. **`getLicenseExpiryTicker`** with **JSDoc** on the handler describing the **UTC calendar date** rules. |
| Helpers | Small **UTC date helpers** in the same controller file (or a shared `dateUtils` module). |
| Route | **`driverRoutes.js`** — register **`GET /license-expiry-ticker`** (or full path relative to mount) **before** `/:driverId` routes (typical lines **41–42** in your repo; adjust if line numbers shift). |

---

## 9. HTTP caching

Set on the success response:

```http
Cache-Control: private, max-age=60
```

Supports light polling from the SPA without hammering the origin.

---

## 10. Response JSON

```json
{
  "success": true,
  "data": {
    "asOf": "2026-04-13",
    "window": "calendar_month",
    "items": [
      {
        "driverId": "67a1b2c3d4e5f6789012346",
        "driverName": "John Smith",
        "licenseExpiryDate": "2025-12-01",
        "tickerStatus": "expired",
        "daysUntilExpiry": -134
      },
      {
        "driverId": "67a1b2c3d4e5f6789012345",
        "driverName": "Jane Doe",
        "licenseExpiryDate": "2026-04-28",
        "tickerStatus": "expiring_soon",
        "daysUntilExpiry": 15
      }
    ]
  }
}
```

Field meanings align with §5–§7. `licenseExpiryDate` in each item should be the **canonical** `YYYY-MM-DD` (or ISO date string sliceable to date) used for display.

---

## 11. Errors

| HTTP | When |
|------|------|
| `401` | Missing or invalid token (`isAuthenticatedUser`). |
| `403` | Authenticated user is not **`trucker`**. |
| `500` | Server error; optional `{ "success": false, "message": "..." }` per your API conventions. |

---

## 12. Frontend integration

**Request:**

```http
GET ${BASE_API_URL}/api/v1/driver/license-expiry-ticker
Authorization: Bearer <token>
```

Optional query:

```http
GET ${BASE_API_URL}/api/v1/driver/license-expiry-ticker?window=days_30
```

**Response handling:**

- Read `data.items` (or your envelope equivalent).
- Map colors:
  - `tickerStatus === "expired"` → **red** text.
  - `tickerStatus === "expiring_soon"` → **yellow** text.

**Implementation in this repo:** trucker shell (`Layout.jsx`) mounts **`LicenseExpiryTicker`** below the main content `Toolbar`, which calls the endpoint above on an interval aligned with **`max-age=60`**.

**Deep link to Driver list:** each ticker entry links to **`/driver?search=<driverName>`** (URL-encoded). The Driver page (`Driver.jsx`) reads **`search`** from the query string on load and sets the search field so the table filters to that driver (same client-side filter as typing in Search).

---

## 13. Relation to other endpoints

| Endpoint | Role |
|----------|------|
| `GET /api/v1/driver/my-drivers` | Full driver grid; same **scope** as ticker. |
| **`GET /api/v1/driver/license-expiry-ticker`** | **Filtered list** + **`tickerStatus`** + **`daysUntilExpiry`** for the marquee only. |
