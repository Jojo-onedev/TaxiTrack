// src/services/driverService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const driverService = {
  async getDrivers({ page = 1, limit = 10, search = "", availability = "" } = {}) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/drivers`, {
        params: { page, limit, search, availability },
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async getDriverById(id) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/drivers/${id}`, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async createDriver(driverData) {
    try {
      const res = await axios.post(`${API_URL}/api/admin/drivers`, driverData, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async updateDriver(id, driverData) {
    try {
      const res = await axios.patch(`${API_URL}/api/admin/drivers/${id}`, driverData, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async deleteDriver(id) {
    try {
      const res = await axios.delete(`${API_URL}/api/admin/drivers/${id}`, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },
};

export default driverService;
