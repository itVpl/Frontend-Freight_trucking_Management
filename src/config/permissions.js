/**
 * Permission keys for shipper sub-users (9 modules).
 * Used for sidebar filtering, route protection, and Add User Shipper permission toggles.
 */
export const PERMISSION_KEYS = [
  'dashboard',
  'liveTracker',
  'loadBoard',
  'addUser',
  'billing',
  'consignment',
  'email',
  'report',
  'loadCalculator',
];

/**
 * All permission keys for trucker sub-users (16 modules).
 * Matches all sidebar modules so Permissions modal can control each one.
 */
export const TRUCKER_PERMISSION_KEYS = [
  'dashboard',
  'liveTracker',
  'addLoad',
  'addUser',
  'addCustomer',
  'driver',
  'fleet',
  'billing',
  'consignment',
  'bidManagement',
  'payments',
  'yard',
  'yardDropContainer',
  'email',
  'report',
  'loadCalculator',
];

/** @deprecated Use PERMISSION_KEYS */
export const SHIPPER_PERMISSION_KEYS = PERMISSION_KEYS;

/** Permission key -> route path for shipper */
export const SHIPPER_PERMISSION_TO_PATH = {
  dashboard: '/dashboard',
  liveTracker: '/live-tracker',
  loadBoard: '/loadboard',
  addUser: '/add-user-shipper',
  billing: '/bills',
  consignment: '/consignment',
  email: '/email',
  report: '/reports',
  loadCalculator: '/loadcalculator',
};

/** Route path -> permission key (for Layout filtering) */
export const SHIPPER_PATH_TO_PERMISSION = Object.fromEntries(
  Object.entries(SHIPPER_PERMISSION_TO_PATH).map(([k, v]) => [v, k])
);

/** Labels for permission toggles - shared keys */
export const PERMISSION_LABELS = {
  dashboard: 'Dashboard',
  liveTracker: 'Live Tracker',
  loadBoard: 'Load Board',
  addUser: 'Add User',
  billing: 'Billing',
  consignment: 'Consignment',
  email: 'Email',
  report: 'Report',
  loadCalculator: 'Load Calculator',
  // Trucker-only module labels
  addLoad: 'Add Load',
  addCustomer: 'Add Customer',
  driver: 'Driver',
  fleet: 'Fleet',
  bidManagement: 'Bid Management',
  payments: 'Payments',
  yard: 'Yard',
  yardDropContainer: 'Yard Drop Container',
};

/** @deprecated Use PERMISSION_LABELS */
export const SHIPPER_PERMISSION_LABELS = PERMISSION_LABELS;

/** Permission key -> route path for trucker (all 16 modules) */
export const TRUCKER_PERMISSION_TO_PATH = {
  dashboard: '/dashboard',
  liveTracker: '/live-tracker',
  addLoad: '/add-load',
  addUser: '/add-user-trucker',
  addCustomer: '/add-customer',
  driver: '/driver',
  fleet: '/fleet',
  billing: '/billing',
  consignment: '/consignment',
  bidManagement: '/bid-management',
  payments: '/payments',
  yard: '/yard',
  yardDropContainer: '/yard-drop-container',
  email: '/email',
  report: '/reports',
  loadCalculator: '/loadcalculator',
};
