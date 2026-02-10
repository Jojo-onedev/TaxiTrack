// src/services/dashboardService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const dashboardService = {
    async getDriverStats() {
        try {
            const res = await axios.get(`${API_URL}/api/admin/stats/drivers`, {
                headers: authHeaders(),
            });
            return { success: true, data: res.data.data };
        } catch (e) {
            return { success: false, error: e?.response?.data?.message || e.message };
        }
    },

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

    async getAllStats() {
        try {
            const [drivers, vehicles, clients, maintenance] = await Promise.all([
                this.getDriverStats(),
                this.getVehicleStats(),
                this.getClientStats(),
                this.getMaintenanceStats(),
            ]);
            return {
                success: true,
                data: {
                    drivers: drivers.data,
                    vehicles: vehicles.data,
                    clients: clients.data,
                    maintenance: maintenance.data,
                },
            };
        } catch (e) {
            return { success: false, error: "Erreur lors de la récupération globale des statistiques" };
        }
    },
};

export default dashboardService;
