# Customer Sub-Users & Permissions – Frontend Implementation

This document describes how the frontend implements **sub-users** and **module-based permissions** for **shippers and truckers**, as per the API contract in the main Customer Sub-Users & Permissions doc.

**For a task-oriented guide on working on trucker sub-user features (which files to touch, how to add modules, testing), see [TRUCKER_SUBUSER_FRONTEND_GUIDE.md](./TRUCKER_SUBUSER_FRONTEND_GUIDE.md).**

---

## Overview

- **Main shippers** and **main truckers** can create **sub-users** (name, email, password + permissions) and manage them from **Add User** (shipper: Add User; trucker: Add Users).
- Sub-users log in with the **same login endpoint**; the backend returns `isSubUser: true` and a `permissions` object.
- The frontend uses `permissions` to **show/hide sidebar items** and to **guard routes** so sub-users only access allowed modules. Same permission keys apply to both shipper and trucker.

---

## 1. Auth & permissions

- **Login** (`src/pages/auth/Login.jsx`): Unchanged. Uses `POST /api/v1/shipper_driver/login`. The backend response may include `user.isSubUser` and `user.permissions`; both are stored in auth state. Works for shipper and trucker (main and sub-user).
- **AuthContext** (`src/context/AuthContext.jsx`):
  - Exposes: `user`, `userType`, `isSubUser`, `permissions`, `refreshPermissions`.
  - On app load, if the user is a **shipper** or **trucker** and a token exists, it calls **GET** `/api/v1/shipper_driver/my-permissions` and merges `permissions` (and optionally `name`, `email`, `isSubUser`) into `user` and localStorage.
  - `refreshPermissions()` can be called to refetch and update `user.permissions`.

---

## 2. Permission keys and routes

- **Config** (`src/config/permissions.js`):
  - `PERMISSION_KEYS`: shared list of permission keys (shipper and trucker).
  - `SHIPPER_PERMISSION_TO_PATH` / `TRUCKER_PERMISSION_TO_PATH`: map from permission key to route path.
  - `PERMISSION_LABELS` (and `SHIPPER_PERMISSION_LABELS`): key → UI label (e.g. for User Permission modal).

Permission keys used in requests and UI:

- `dashboard`, `liveTracker`, `loadBoard`, `addUser`, `billing`, `consignment`, `email`, `report`, `loadCalculator`

---

## 3. Sidebar (Layout)

- **Layout** (`src/components/layout/Layout.jsx`):
  - For **shipper** and **trucker**, menu items that map to a module include a `permissionKey` (e.g. `dashboard`, `loadBoard`, `addUser`, `billing`).
  - If the user is a **sub-user** (`isSubUser` and `permissions` exist), the sidebar is filtered so only items with `permissions[permissionKey] === true` (or items without a key) are shown.
  - Main shippers and main truckers see all menu items.

---

## 4. Route protection

- **ProtectedRoute** (`src/components/auth/ProtectedRoute.jsx`):
  - Supports `requiredPermission` (e.g. `"dashboard"`, `"loadBoard"`).
  - If `requiredPermission` is set and the current user is a **sub-user** (shipper or trucker), the route is allowed only when `permissions[requiredPermission]` is true; otherwise the user is redirected to `/dashboard`.

- **App.jsx** shipper routes use both `userType="shipper"` and `requiredPermission`:
  - Dashboard: `requiredPermission="dashboard"`
  - Bills: `userType="shipper"` + `requiredPermission="billing"`
  - Load Board: `requiredPermission="loadBoard"`
  - Add User: `requiredPermission="addUser"`
  - Consignment, Email, Report: corresponding `requiredPermission` values.

- **App.jsx** trucker routes that are permission-gated use `userType="trucker"` and `requiredPermission` where applicable:
  - Add User Trucker: `requiredPermission="addUser"`
  - Billing: `requiredPermission="billing"`
  - Consignment, Email, Report, Load Calculator: same keys as shipper.

---

## 5. Add User (sub-users) pages

### Shipper: `src/pages/shipper/AddUserShipper.jsx`

- **Access**: Only for shippers; sub-users need `addUser` permission (enforced by ProtectedRoute).

### Trucker: `src/pages/trucker/AddUserTrucker.jsx`

- **Access**: Only for truckers; sub-users need `addUser` permission (enforced by ProtectedRoute).
- Uses the **same APIs** as shipper: `GET/POST/PUT/DELETE /api/v1/shipper_driver/my-sub-users` (and `/:subUserId`).

**APIs used (both shipper and trucker):**

| Action           | Method | Endpoint                                              |
|-----------------|--------|--------------------------------------------------------|
| List sub-users  | GET    | `/api/v1/shipper_driver/my-sub-users`                 |
| Create sub-user | POST   | `/api/v1/shipper_driver/my-sub-users`                 |
| Get one         | GET    | `/api/v1/shipper_driver/my-sub-users/:subUserId`      |
| Update          | PUT    | `/api/v1/shipper_driver/my-sub-users/:subUserId`     |
| Remove          | DELETE | `/api/v1/shipper_driver/my-sub-users/:subUserId`     |

- **List**: Table shows sub-users (name, email, status, actions). Search filters by name/email.
- **Add**: Dialog with name, email, password, and permission toggles (same keys as above). Submit sends **POST** with `name`, `email`, `password`, `permissions`.
- **Edit**: Same dialog opened with prefilled data; submit sends **PUT** with `name`, `email`, optional `password`, `permissions`.
- **User Permission modal**: Opens for a sub-user; toggles show current `permissions`. **Save** sends **PUT** with body `{ permissions }` only.
- **Delete**: Confirmation then **DELETE**; backend typically soft-deletes (e.g. sets inactive).

---

## 6. Login response usage

- Store `user` (including `token`, `userType`, `isSubUser`, `permissions`, `name`, `email`) in state and localStorage.
- Use `user.permissions` for sidebar and route checks.
- Optionally call **GET my-permissions** on app load (implemented in AuthContext) so sub-user permissions stay in sync after login.

---

## 7. Files touched

- `src/config/permissions.js` – permission keys, path map, labels (shared shipper/trucker).
- `src/context/AuthContext.jsx` – `isSubUser`, `permissions`, refresh on load, `refreshPermissions`, `updateUserFromProfile`; trucker profile fallback for permissions.
- `src/components/layout/Layout.jsx` – filter shipper and trucker menus by `permissions` (show item only when permission is true).
- `src/components/auth/ProtectedRoute.jsx` – `requiredPermission` for shipper and trucker sub-users.
- `src/App.jsx` – `requiredPermission` on shipper and trucker routes.
- `src/pages/shipper/AddUserShipper.jsx` – shipper sub-users CRUD and User Permission modal.
- `src/pages/trucker/AddUserTrucker.jsx` – trucker sub-users CRUD and User Permission modal (same APIs as shipper).
- `src/pages/profile/Profile.jsx` – merges profile response (including `permissions`) into auth via `updateUserFromProfile`.

For full request/response shapes and error handling, see the main **Customer Sub-Users & Permissions** API documentation.
