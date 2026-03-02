# Trucker Sub-User – Frontend Developer Guide

This guide is for frontend developers working on **trucker sub-user** behaviour: who they are, where permissions come from, which files to touch, and how to add or change modules.

---

## 1. What is a trucker sub-user?

- A **main trucker** (company account) can create **sub-users** (e.g. staff) with their own login (email + password).
- Sub-users log in via the **same login** as main truckers: `POST /api/v1/shipper_driver/login`.
- The backend returns `userType: "trucker"`, plus:
  - **`isSubUser: true`**
  - **`permissions`** – object with one key per module; only allowed modules are `true`.
- The frontend must **only show menu items and routes** for which `permissions[moduleKey] === true`. Main truckers get all permissions `true`.

---

## 2. Where do permissions come from?

The app can get `permissions` (and `isSubUser`) from three places. Use whichever the backend provides; the frontend merges them into auth state.

| Source | When | Used for |
|--------|------|----------|
| **Login response** | Right after `POST .../login` | Initial `user.permissions` and `user.isSubUser` |
| **GET my-permissions** | On app load (AuthContext) | Refresh / resolve permissions for both main and sub-user |
| **GET .../trucker (profile)** | When profile is fetched (e.g. Profile page or on load fallback) | Trucker profile now returns `isSubUser`, `permissions`, `displayName`, `displayEmail` |

- **AuthContext** tries **GET my-permissions** first; for truckers, if that fails it falls back to **GET /api/v1/shipper_driver/trucker** and merges `permissions` and `isSubUser` from the response.
- **Profile page** (`src/pages/profile/Profile.jsx`), when it fetches the trucker profile, calls **`updateUserFromProfile(profileData)`** so that any new fields (including `permissions`) from the profile are merged into auth.

Rule: **only show a menu item or allow a route if the matching permission is `true`** (e.g. show Dashboard only if `permissions.dashboard === true`).

---

## 3. Permission keys (use these everywhere)

These keys are the single source of truth for “which module” in APIs and UI. Use them exactly as below.

| Permission key     | UI label        | Trucker route           |
|--------------------|-----------------|-------------------------|
| `dashboard`        | Dashboard       | `/dashboard`             |
| `liveTracker`      | Live Tracker    | `/live-tracker`         |
| `loadBoard`         | Load Board      | `/loadboard`            |
| `addUser`           | Add User        | `/add-user-trucker`     |
| `billing`           | Billing        | `/billing`              |
| `consignment`       | Consignment    | `/consignment`          |
| `email`             | Email          | `/email`                |
| `report`            | Report         | `/reports`              |
| `loadCalculator`    | Load Calculator| `/loadcalculator`       |

- Config: **`src/config/permissions.js`** – `PERMISSION_KEYS`, `PERMISSION_LABELS`, `TRUCKER_PERMISSION_TO_PATH`.
- Do **not** invent new keys in the UI; add new ones in the config (and coordinate with backend) if a new module is introduced.

---

## 4. File map – what to touch for trucker sub-user

| File | Responsibility |
|------|----------------|
| **`src/config/permissions.js`** | Permission keys, labels, and trucker path map. Add new modules here and use in Layout + routes. |
| **`src/context/AuthContext.jsx`** | Holds `user`, `permissions`, `isSubUser`. Fetches my-permissions (and trucker profile fallback) on load. Exposes `updateUserFromProfile()` so profile response can merge permissions. |
| **`src/components/layout/Layout.jsx`** | Builds trucker menu; **filters items by `permissions`**: show item only if `permissions[permissionKey] === true`. Items without `permissionKey` are shown to everyone. |
| **`src/components/auth/ProtectedRoute.jsx`** | For routes with `requiredPermission`, allows access only if `permissions[requiredPermission]` is true (for both shipper and trucker sub-users). |
| **`src/App.jsx`** | Declares trucker routes; use `requiredPermission="<key>"` for any route that must be gated by that module (e.g. `addUser` for Add User, `billing` for Billing). |
| **`src/pages/profile/Profile.jsx`** | After fetching trucker (or shipper) profile, calls `updateUserFromProfile(...)` so sidebar and guards use latest `permissions` / `isSubUser` from profile. |
| **`src/pages/trucker/AddUserTrucker.jsx`** | Main trucker-only page to list/create/edit/delete sub-users and set their permissions. Uses `GET/POST/PUT/DELETE /api/v1/shipper_driver/my-sub-users`. Sub-users need `addUser` permission to see this page. |

---

## 5. How to show/hide a trucker menu item

- In **Layout.jsx**, each trucker menu entry that is permission-gated has a **`permissionKey`** (e.g. `permissionKey: 'billing'`).
- The sidebar filters with: **only show if `!item.permissionKey` or `permissions[item.permissionKey] === true`**.
- So:
  - To **gate an existing item** by a module: set `permissionKey` to the correct key from the table above.
  - To **add a new gated item**: add an entry with `path` and `permissionKey`; ensure that key exists in `src/config/permissions.js` and in the backend.
- Items **without** `permissionKey` (e.g. Add Load, Fleet, Yard) are shown to all truckers; only add a key if that module is part of the permission set.

---

## 6. How to protect a trucker route

- In **App.jsx**, wrap the route with **`ProtectedRoute`** and set **`userType="trucker"`** and **`requiredPermission="<key>"`** (e.g. `requiredPermission="billing"` for Billing).
- **ProtectedRoute** allows access only if the user is a trucker and either they are not a sub-user or `permissions[requiredPermission] === true`. Otherwise it redirects (e.g. to dashboard).

Example:

```jsx
<Route path="/billing" element={
  <ProtectedRoute userType="trucker" requiredPermission="billing">
    <Billing />
  </ProtectedRoute>
} />
```

---

## 7. How to add a new permission-gated module for trucker

1. **Backend** – Ensure the new key (e.g. `newModule`) is returned in `permissions` for trucker (login, my-permissions, and/or GET trucker profile).
2. **Config** – In **`src/config/permissions.js`**:
   - Add the key to **`PERMISSION_KEYS`**.
   - Add label to **`PERMISSION_LABELS`** and path to **`TRUCKER_PERMISSION_TO_PATH`**.
3. **Layout** – In **`src/components/layout/Layout.jsx`**, add the new trucker menu item with **`permissionKey: 'newModule'`** and the correct `path`.
4. **App.jsx** – Add the route with **`ProtectedRoute userType="trucker" requiredPermission="newModule"`**.
5. **AddUserTrucker** – The sub-user form uses **`PERMISSION_KEYS`** and **`PERMISSION_LABELS`** from config, so the new toggle will appear automatically for “Add User” / “User Permission” once the key is in config.

---

## 8. Sub-user management (Add User – trucker)

- **Who can open it:** Only **main truckers** (or sub-users with **`addUser`** permission). Route is protected with `requiredPermission="addUser"`.
- **APIs:** Same as shipper sub-users:
  - List: **GET** `/api/v1/shipper_driver/my-sub-users`
  - Create: **POST** `/api/v1/shipper_driver/my-sub-users` (body: `name`, `email`, `password`, `permissions`)
  - Get one: **GET** `/api/v1/shipper_driver/my-sub-users/:subUserId`
  - Update: **PUT** `/api/v1/shipper_driver/my-sub-users/:subUserId` (body can include `permissions`, `name`, `email`, `password`, `isActive`)
  - Remove: **DELETE** `/api/v1/shipper_driver/my-sub-users/:subUserId`
- **Permissions object:** Use the same keys as in the table above; only keys set to `true` are allowed for that sub-user.

---

## 9. Testing trucker sub-user behaviour

1. Log in as a **main trucker**, go to **Add Users**, create a sub-user and give them only a few permissions (e.g. Dashboard + Billing).
2. Log out and log in as that **sub-user** (same login endpoint, sub-user email/password).
3. Check:
   - Sidebar shows **only** the allowed modules (e.g. Dashboard, Billing).
   - Navigating directly to a URL they don’t have permission for (e.g. `/add-user-trucker`) redirects to dashboard.
4. Optional: Open **Profile** and confirm that after profile load, sidebar still reflects the same permissions (via `updateUserFromProfile`).

---

## 10. Common pitfalls

- **Using a different key in UI than in API** – Always use the keys from **`src/config/permissions.js`** (e.g. `liveTracker` not `live_tracker`).
- **Forgetting `requiredPermission` on a route** – If a route is a permission-gated module, add `requiredPermission="<key>"` so sub-users without that permission cannot open it.
- **Filtering only when `isSubUser` is true** – The app filters the sidebar whenever **`permissions`** is present (not only when `isSubUser`). So if the backend sends `permissions` for main trucker (all true), behaviour stays correct.
- **Assuming profile is the only source** – Permissions can come from login or my-permissions; profile is merged when it’s fetched so that trucker sub-users get the correct data from **GET /api/v1/shipper_driver/trucker** when that’s used.

---

## 11. Related docs

- **FRONTEND_SUBUSER_PERMISSIONS.md** – Full frontend implementation for both shipper and trucker sub-users, APIs, and route list.
- Backend/API doc for **Customer Sub-Users & Permissions** – Request/response shapes and error handling for login, my-permissions, profile, and my-sub-users.
