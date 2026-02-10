  // src/services/vehicleService.js
  import axios from "axios";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const vehicleService = {
    // Récupérer tous les véhicules
    async getVehicles({ page = 1, limit = 10, search = "", status = "" } = {}) {
      try {
        const res = await axios.get(`${API_URL}/api/admin/cars`, {
          params: { page, limit, search, status },
          headers: authHeaders(),
        });
        return { success: true, data: res.data.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },

    // Récupérer un véhicule par ID
    async getVehicleById(id) {
      try {
        const res = await axios.get(`${API_URL}/api/admin/cars/${id}`, {
          headers: authHeaders(),
        });
        return { success: true, data: res.data.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },

    // Ajouter un véhicule
    async createVehicle(vehicleData) {
      try {
        const res = await axios.post(`${API_URL}/api/admin/cars`, vehicleData, {
          headers: authHeaders(),
        });
        return { success: true, data: res.data.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },

    // Modifier un véhicule
    async updateVehicle(id, vehicleData) {
      try {
        const res = await axios.patch(`${API_URL}/api/admin/cars/${id}`, vehicleData, {
          headers: authHeaders(),
        });
        return { success: true, data: res.data.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },

    // Supprimer un véhicule
    async deleteVehicle(id) {
      try {
        const res = await axios.delete(`${API_URL}/api/admin/cars/${id}`, {
          headers: authHeaders(),
        });
        return { success: true, data: res.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },

    // Statistiques véhicules
    async getVehicleStats() {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats/vehicles`, {
          headers: authHeaders(),
        });
        return { success: true, data: res.data.data };
      } catch (e) {
        return { success: false, error: e?.response?.data?.message || e.message };
      }
    },
  };

  export default vehicleService;
