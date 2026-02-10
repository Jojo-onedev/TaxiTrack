// src/services/clientService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const clientService = {
  async getClients({ page = 1, limit = 10, search = "" } = {}) {
    try {
      const res = await axios.get(`${API_URL}/api/admin/clients`, {
        params: { page, limit, search },
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async deleteClient(id) {
    try {
      const res = await axios.delete(`${API_URL}/api/admin/clients/${id}`, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },

  async getClientStats() {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats/clients`, {
        headers: authHeaders(),
      });
      return { success: true, data: res.data.data };
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || e.message };
    }
  },
};

export default clientService;
