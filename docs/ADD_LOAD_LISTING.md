# Add Load page — listed data

Route: `/add-load`  
Component: `src/pages/trucker/AddLoad.jsx`

## API

- **Method:** `GET`
- **URL:** `{BASE_API_URL}/api/v1/customer-load`  
  (`BASE_API_URL` is set in `src/apiConfig.js`, e.g. `http://localhost:4000`.)
- **Auth:** `Authorization: Bearer <token>` from `localStorage`.

## Response shape (what fills the table)

The UI expects JSON like:

```json
{
  "success": true,
  "data": {
    "loads": [ /* array of load objects */ ]
  }
}
```

Each row in the table is one element of `data.loads`. The backend may send more fields per load; the listing only **displays** the mappings below. View/Edit/Assign use additional fields (`_id`, `status`, nested `origins` / `destinations`, etc.).

## Table columns (what the user sees)

| Column     | Source on each load object (display logic) |
|-----------|---------------------------------------------|
| **Load Type** | `loadType` (badge; DRAYAGE vs other, e.g. OTR). Fallback: `N/A`. |
| **Pickup** | First origin address: `origins[0].addressLine1`, else `fromAddress`. Fallback: `N/A`. |
| **Delivery** | First destination address: `destinations[0].addressLine1`, else `toAddress`. Fallback: `N/A`. |
| **Weight** | `origins[0].weight`, else `weight`, with ` lbs` when a value exists. Fallback: `N/A`. |
| **Rate** | `rate`, formatted as currency (`$` + localized number). Fallback: `N/A`. |
| **Customer** | `customerLoadDetails.customerName`, else `customerName`. Fallback: `N/A`. |
| **Status** | `load.status`, else `load.tracking?.status`, else `load.loadStatus`. Fallback: `—`. |
| **Actions** | View / Edit / Assign / Delete (Edit/Assign/Delete disabled when status is **Assigned**, case-insensitive). **Generate invoice** / **Send invoice** only when status is **Delivered** or **Completed** (normalized, same sources as Status). See [CUSTOMER_LOAD_INVOICE_FRONTEND.md](./CUSTOMER_LOAD_INVOICE_FRONTEND.md). |

Row key in the DOM: `load._id`.

## Search box (filters the same list client-side)

If the user types in Search, rows are kept when the term matches **any** of:

- `loadType`
- resolved **Status** string (see Status column)
- `origins[0].addressLine1`
- `destinations[0].addressLine1`
- `customerLoadDetails.customerName`
- `origins[0].commodity`
- `containerNo`
- `poNumber`

(Search is case-insensitive; empty search shows all loaded rows.)

## Export CSV

“Export CSV” exports the **currently filtered** list (same search as above) with columns:

`Load Type`, `Pickup`, `Delivery`, `Weight (lbs)`, `Rate`, `Customer`, `Status`  
(`Status` from `load.status`.)

## Pagination

The table uses client-side pagination over `filteredData` (search-filtered `loadsData`).
