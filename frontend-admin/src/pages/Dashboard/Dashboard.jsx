import React, { useEffect, useState } from 'react';
import { FaUsers, FaCar, FaUserTie, FaTools } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import KpiCard from '../../components/KpiCard';
import dashboardService from '../../services/dashboardService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import './dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    drivers: { overview: { total_drivers: 0 }, top_drivers: [] },
    vehicles: { overview: { total_vehicles: 0 }, by_type: [], maintenance_needed: [] },
    clients: { overview: { total_clients: 0 }, new_clients_trend: [] },
    maintenance: { overview: { total_maintenances: 0 }, by_type: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const result = await dashboardService.getAllStats();
    if (result.success) {
      setStats({
        drivers: result.data.drivers || { overview: {} },
        vehicles: result.data.vehicles || { overview: {} },
        clients: result.data.clients || { overview: {} },
        maintenance: result.data.maintenance || { overview: {} }
      });
    }
    setLoading(false);
  };

  const clientTrendData = stats.clients.new_clients_trend?.slice(0, 7).reverse().map(item => ({
    name: item.month.split('-')[1],
    clients: parseInt(item.new_clients, 10)
  })) || [];

  const vehicleDistributionData = stats.vehicles.by_type?.slice(0, 5).map(item => ({
    name: item.type_vehicule,
    count: parseInt(item.count, 10)
  })) || [];

  return (
    <Layout>
      <div className="dashboard-content">
        {/* KPI Cards */}
        <div className="kpiGrid kpiAnimated">
          <KpiCard
            icon={<FaUsers className="kpi-icon" />}
            title="Drivers"
            value={stats.drivers.overview?.total_drivers || 0}
            subtitle={stats.drivers.overview?.drivers_with_car ? `${stats.drivers.overview.drivers_with_car} assignés` : "Just updated"}
            color="dark"
            to="/drivers"
          />
          <KpiCard
            icon={<FaCar className="kpi-icon" />}
            title="Vehicles"
            value={stats.vehicles.overview?.total_vehicles || 0}
            subtitle={stats.vehicles.overview?.active_vehicles ? `${stats.vehicles.overview.active_vehicles} actifs` : "Just updated"}
            color="blue"
            to="/vehicles"
          />
          <KpiCard
            icon={<FaUserTie className="kpi-icon" />}
            title="Clients"
            value={stats.clients.overview?.total_clients || 0}
            subtitle={stats.clients.overview?.active_last_30_days ? `${stats.clients.overview.active_last_30_days} actifs (30j)` : "Just updated"}
            color="green"
            to="/clients"
          />
          <KpiCard
            icon={<FaTools className="kpi-icon" />}
            title="Maintenance"
            value={stats.maintenance.overview?.total_maintenances || 0}
            subtitle={stats.maintenance.overview?.total_cost ? `${Math.round(stats.maintenance.overview.total_cost).toLocaleString()} FCFA` : "Just updated"}
            color="pink"
            to="/maintenance"
          />
        </div>

        {/* Charts */}
        <div className="grid2">
          {/* Client Growth Chart */}
          <div className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">New Clients Trend</div>
                <div className="panelSub">Monthly registration overview</div>
              </div>
            </div>

            <div className="chartBox" style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientTrendData}>
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="clients" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorClients)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vehicle Fleet Distribution */}
          <div className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">Vehicle Fleet</div>
                <div className="panelSub">Distribution by type</div>
              </div>
            </div>

            <div className="chartBox" style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {vehicleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


