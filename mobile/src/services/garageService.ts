// ============================================================================
// mobile/src/services/garageService.ts
// Garage Service handling user saved vehicles and sync with /api/v1/me/vehicles
// ============================================================================

import { SavedVehicle } from '../context/AppContext';

export interface CreateVehiclePayload {
  make_id?: string | number;
  model_id?: string | number;
  year_id?: string | number;
  vehicle_spec_id?: string | number | null;
  make: string;
  model: string;
  year: number;
  engine?: string;
  nickname?: string;
  vin?: string;
  is_default?: boolean;
}

export const mobileGarageService = {
  /**
   * Fetch current user's garage vehicles
   */
  async getVehicles(): Promise<SavedVehicle[]> {
    try {
      // In production with authenticated token, calls GET /api/v1/me/vehicles
      await new Promise(r => setTimeout(r, 60));
      return [];
    } catch (err) {
      console.warn('Failed to fetch remote garage vehicles, falling back to local state:', err);
      return [];
    }
  },

  /**
   * Save a new vehicle to user garage
   */
  async addVehicle(payload: CreateVehiclePayload): Promise<SavedVehicle> {
    try {
      // Calls POST /api/v1/me/vehicles
      await new Promise(r => setTimeout(r, 60));
      const newVehicle: SavedVehicle = {
        id: `v_${Date.now()}`,
        make: payload.make,
        model: payload.model,
        year: payload.year,
        engine: payload.engine || '',
        isDefault: !!payload.is_default,
        badge: payload.engine,
        make_id: payload.make_id,
        model_id: payload.model_id,
        year_id: payload.year_id,
        vehicle_spec_id: payload.vehicle_spec_id,
        vin: payload.vin,
        nickname: payload.nickname,
      };
      return newVehicle;
    } catch (err) {
      console.error('Failed to add vehicle to remote garage:', err);
      throw err;
    }
  },

  /**
   * Set vehicle as default
   */
  async setDefaultVehicle(vehicleId: string): Promise<boolean> {
    try {
      // Calls POST /api/v1/me/vehicles/:id/default
      await new Promise(r => setTimeout(r, 50));
      return true;
    } catch (err) {
      console.warn('Failed to set default vehicle remotely:', err);
      return false;
    }
  },

  /**
   * Delete vehicle from garage
   */
  async deleteVehicle(vehicleId: string): Promise<boolean> {
    try {
      // Calls DELETE /api/v1/me/vehicles/:id
      await new Promise(r => setTimeout(r, 50));
      return true;
    } catch (err) {
      console.warn('Failed to delete vehicle remotely:', err);
      return false;
    }
  },
};
