# Driver license expiry date — API contract

The Driver page (`/driver`, `src/pages/trucker/Driver.jsx`) collects **license expiry** and sends it to the backend as **`licenseExpiryDate`**.

`BASE_API_URL` is defined in `src/apiConfig.js` (for example `http://localhost:4000`).

---

## Field definition

| Property             | Type   | Required (UI) | Description |
|----------------------|--------|-----------------|-------------|
| `licenseExpiryDate`  | string | Yes (add & edit) | Calendar date only: **`YYYY-MM-DD`** (same value the browser sends for `<input type="date">`). |

**Canonical name:** `licenseExpiryDate` (camelCase), aligned with existing `driverLicense`.

**Optional legacy alias (read-only tolerance):** If older records used `driverLicenseExpiryDate`, the UI can pre-fill the edit form from either field. Prefer returning **`licenseExpiryDate`** from the API for new work.

---

## 1. Register driver — `POST /api/v1/driver/register`

- **Content-Type:** `multipart/form-data` (same as today: text fields + optional `driverPhoto`, `cdlDocument`).
- **Auth:** `Authorization: Bearer <token>`.

### New multipart field

| Part name              | Example value   |
|------------------------|-----------------|
| `licenseExpiryDate`    | `2027-03-15`    |

### Backend checklist

1. **Parser:** Ensure the register route reads `licenseExpiryDate` from `req.body` (with `multer`/`upload.fields`, non-file fields remain on `req.body`).
2. **Validation:** Require non-empty string; optionally ensure it matches `/^\d{4}-\d{2}-\d{2}$/` and parses to a real calendar date.
3. **Persistence:** Store on the driver document, for example:
   - **MongoDB / Mongoose:** `licenseExpiryDate: { type: Date }` — set with `new Date(value + 'T12:00:00.000Z')` or parse in UTC to avoid timezone off-by-one, **or** store as string if you intentionally keep date-only without time.
4. **Response:** Return the created driver JSON including `licenseExpiryDate` in the same format you use for `GET` (ISO date string or `YYYY-MM-DD` is fine as long as it is consistent).

---

## 2. Update driver — `PUT /api/v1/driver/:id`

- **Content-Type:** `application/json`
- **Auth:** `Authorization: Bearer <token>`.

### JSON body (partial list — include new field)

```json
{
  "fullName": "...",
  "driverLicense": "...",
  "licenseExpiryDate": "2027-03-15",
  "gender": "...",
  "country": "...",
  "state": "...",
  "city": "...",
  "zipCode": "...",
  "fullAddress": "..."
}
```

Apply the same validation and storage rules as on register.

---

## 3. List drivers — `GET /api/v1/driver/my-drivers`

Each driver object returned to the client should include **`licenseExpiryDate`** when set, so the table and CSV export can show it.

Example shape (abbreviated):

```json
{
  "_id": "...",
  "fullName": "...",
  "driverLicense": "...",
  "licenseExpiryDate": "2027-03-15",
  "email": "...",
  "phone": "...",
  "gender": "...",
  "country": "...",
  "state": "...",
  "city": "...",
  "zipCode": "...",
  "fullAddress": "..."
}
```

If the field is missing on old documents, the UI shows **—** until the record is edited or migrated.

---

## 4. Database migration (MongoDB example)

Add the field to the driver schema and optionally backfill from manual data or leave null:

```js
licenseExpiryDate: { type: Date, default: null },
```

For existing deployments, run a one-off migration or accept `null` until users edit drivers.

---

## 5. Summary for backend developers

| Endpoint                         | Method | Where `licenseExpiryDate` appears        |
|----------------------------------|--------|------------------------------------------|
| `/api/v1/driver/register`       | POST   | `multipart/form-data` part               |
| `/api/v1/driver/:id`             | PUT    | JSON body property                       |
| `/api/v1/driver/my-drivers`      | GET    | Each driver in the response array/object |

Frontend sends and expects **`licenseExpiryDate`** as **`YYYY-MM-DD`**.
