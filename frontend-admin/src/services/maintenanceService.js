// src/services/maintenanceService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const maintenanceService = {
    async getMaintenances({ page = 1, limit = 10, car_id = "", type_maintenance = "" } = {}) {
        try {
            const res = await axios.get(`${API_URL}/api/admin/maintenance`, {
                params: { page, limit, car_id, type_maintenance },
                headers: authHeaders(),
            });
            return { success: true, data: res.data.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },

    async getMaintenanceStats() {
        try {
            const res = await axios.get(`${API_URL}/api/admin/stats/maintenance`, {
                headers: authHeaders(),
            });
            return { success: true, data: res.data.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },

    async createMaintenance(maintenanceData) {
        try {
            const res = await axios.post(`${API_URL}/api/admin/maintenance`, maintenanceData, {
                headers: authHeaders(),
            });
            return { success: true, data: res.data.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },

    async updateMaintenance(id, maintenanceData) {
        try {
            const res = await axios.put(`${API_URL}/api/admin/maintenance/${id}`, maintenanceData, {
                headers: authHeaders(),
            });
            return { success: true, data: res.data.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },

    async deleteMaintenance(id) {
        try {
            const res = await axios.delete(`${API_URL}/api/admin/maintenance/${id}`, {
                headers: authHeaders(),
            });
            return { success: true, data: res.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },
};

export default maintenanceService;
