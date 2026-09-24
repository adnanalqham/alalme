// ============================================================================
// api/index.ts — unified API facade (mirrors /api/v1 routing)
// Swap this layer for real Laravel endpoints without touching components.
// ============================================================================

export * from './security';
export * from './session';
export * from './db';
export * from './services';
export * from './servicesOrders';
export * from './servicesAdmin';

export { api } from './servicesAdmin';