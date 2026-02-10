// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Ajoute automatiquement le token si tu l’as stocké
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // adapte si ton app utilise un autre nom
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
