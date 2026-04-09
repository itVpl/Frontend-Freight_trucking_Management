# Customer load invoice — frontend integration (`/add-load`)

This document describes how the **Add Load** page (`src/pages/trucker/AddLoad.jsx`) supports **Delivered** rows **generating/downloading an invoice PDF** and **emailing that invoice** to the billing contact.

> **Terminology:** For `CUSTOMER_DIRECT` loads, the API sends the invoice to **`customerLoadDetails.customerEmail`** (the customer you created the load for). Your product copy may say “customer” or “shipper”; the backend field is the customer contact on the load.

---

## When to show invoice actions

| Load field | Show “Generate invoice” (download PDF) | Show “Send invoice” |
|------------|----------------------------------------|---------------------|
| `status` is **Delivered** or **Completed** (after resolving / normalizing) | Yes | Yes (if you have a recipient email; see below) |
| Any other status | No | No |

The UI uses the same `load` object from `GET /api/v1/customer-load` (each row includes `status`, `_id`, `customerLoadDetails`, etc.). Invoice actions show when the resolved status is **Delivered** or **Completed** (case-insensitive; underscores normalized to spaces). Status is read from `status`, then `tracking.status`, then `loadStatus`, so it appears in the **Status** column even if the primary field is nested.

**Recipient for “Send invoice”**

- Default on the server: `customerLoadDetails.customerEmail`.
- Optional override: send `toEmail` in the POST body (the dialog lets the user edit the address).

If there is no valid email and the user does not override, the send API returns **400** — the UI blocks submit when both the field is empty and there is no billing email on the load.

---

## Auth (same as listing)

All requests:

- **Header:** `Authorization: Bearer <token>` (same token as customer-load list).

Base URL: `BASE_API_URL` from `src/apiConfig.js` (e.g. `http://localhost:4000`).

---

## 1. Download invoice PDF

**Request**

- **Method:** `GET`
- **URL:** `{BASE_API_URL}/api/v1/customer-load/{loadId}/invoice`
- **Headers:** `Authorization: Bearer <token>`

**Success**

- **Status:** `200`
- **Body:** raw PDF bytes
- **Headers:** `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="..."`

**Errors**

- `404` — load not found or not owned by this trucker
- `400` — load is not `Delivered`

The frontend uses `loadId = load.loadId || load._id` for `{loadId}`.

---

## 2. Send invoice by email

**Request**

- **Method:** `POST`
- **URL:** `{BASE_API_URL}/api/v1/customer-load/{loadId}/send-invoice`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body (optional):**

```json
{
  "toEmail": "optional-override@example.com"
}
```

Omit `toEmail` (empty JSON `{}`) to use `customerLoadDetails.customerEmail` from the load.

**Success (`200`)**

```json
{
  "success": true,
  "message": "Invoice emailed successfully",
  "data": {
    "recipient": "customer@example.com",
    "invoiceRef": "SHIP-12345",
    "filename": "CustomerLoad_Invoice_SHIP-12345.pdf"
  }
}
```

**Errors**

- `400` — not `Delivered`, or no valid recipient email
- `404` — not found / not authorized
- `5xx` / thrown — e.g. SES not configured (`sendEmail`); show a generic “Email failed” message and log details

---

## 3. What appears on the invoice PDF

The PDF is generated on the server and includes (when present):

- Bill-to: `customerLoadDetails` (name, email, phone)
- Carrier: `createdByTrucker` (name, email)
- Invoice # (prefers `shipmentNumber`, then `loadRef`, then id suffix)
- Load type, vehicle, container / PO / BOL, driver name, vehicle number
- Pickup and delivery stops from `origins` / `destinations`
- Charges from `rateDetails` (line haul, FSC %, other lines, total) or legacy `rate` / `rateType`

The list endpoint does not need to change; the PDF uses the full load document on the server when you hit the invoice routes.

---

## 4. Actions column layout

Existing: View / Edit / Assign / Delete (with current `status` rules).

For **`status` Delivered** (case-insensitive):

1. **Generate invoice** — `GET .../invoice` (download).
2. **Send invoice** — opens a dialog, then `POST .../send-invoice` (optional `toEmail`).

**View** is unchanged.

---

## 5. Server configuration (for “Send invoice”)

Sending uses `utils/sendEmail.js` (Amazon SES SMTP). Ensure env vars are set (e.g. `SES_SMTP_USER`, `SES_SMTP_PASS`, `SES_FROM_EMAIL`, etc.), matching your deployment docs. If SES is not configured, the send action will fail until those are set.
