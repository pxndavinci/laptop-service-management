/**
 * There is no login yet: every order is logged against a fixed staff user.
 * Override via .env until authentication is added.
 */
export const ENTRY_USER_ID =
  import.meta.env.VITE_ENTRY_USER_ID || '612169bf-d71f-4eb1-8445-f1b126c73b02'

/** Role assigned to customers created from the order form. */
export const CUSTOMER_ROLE_ID = 1
