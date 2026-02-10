import React from 'react';
<<<<<<< HEAD
import { FaUsers, FaCar, FaUserTie, FaTools } from 'react-icons/fa'; 
=======
>>>>>>> origin/frontend-admin
import Layout from '../../components/Layout/Layout';
import KpiCard from '../../components/KpiCard';
import './dashboard.css';

export default function Dashboard() {
  return (
    <Layout>
      <div className="dashboard-content">
<<<<<<< HEAD
        <div className="kpiGrid kpiAnimated">
          <KpiCard
            icon={<FaUsers className="kpi-icon" />}
=======
        {/* KPI Cards */}
        <div className="kpiGrid kpiAnimated">
          <KpiCard
            icon="🚕"
>>>>>>> origin/frontend-admin
            title="Drivers"
            value="281"
            subtitle="+55% than last week"
            color="dark"
            to="/drivers"
          />
          <KpiCard
<<<<<<< HEAD
            icon={<FaCar className="kpi-icon" />}
=======
            icon="🚗"
>>>>>>> origin/frontend-admin
            title="Vehicles"
            value="2,300"
            subtitle="+3% than last month"
            color="blue"
            to="/vehicles"
          />
          <KpiCard
<<<<<<< HEAD
            icon={<FaUserTie className="kpi-icon" />}
=======
            icon="👥"
>>>>>>> origin/frontend-admin
            title="Users"
            value="34k"
            subtitle="+1% than yesterday"
            color="green"
            to="/clients"
          />
          <KpiCard
<<<<<<< HEAD
            icon={<FaTools className="kpi-icon" />}
=======
            icon="🛠️"
>>>>>>> origin/frontend-admin
            title="Maintenance"
            value="+91"
            subtitle="Just updated"
            color="pink"
            to="/maintenance"
          />
<<<<<<< HEAD
        </div>
        
=======
          <KpiCard
            icon="💬"
            title="Feedbacks"
            value="+91"
            subtitle="Just updated"
            color="feedback"
            to="/feedback"
          />
        </div>
        
        {/* Charts */}
>>>>>>> origin/frontend-admin
        <div className="grid2">
          <div className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">Total Revenue</div>
                <div className="panelSub">Monthly overview</div>
              </div>
              <div className="segmented">
                <button className="segBtn">Day</button>
                <button className="segBtn active">Week</button>
                <button className="segBtn">Month</button>
              </div>
            </div>
<<<<<<< HEAD
=======

>>>>>>> origin/frontend-admin
            <div className="chartBox">
              <div className="lineChart">
                <div className="lineArea" />
                <div className="lineStroke" />
              </div>
              <div className="chartAxis">
<<<<<<< HEAD
                <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
=======
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
>>>>>>> origin/frontend-admin
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">Profit this week</div>
                <div className="panelSub">Sales vs Revenue</div>
              </div>
              <select className="select">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
<<<<<<< HEAD
=======

>>>>>>> origin/frontend-admin
            <div className="chartBox">
              <div className="barChart">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div className="barCol" key={d + i}>
                    <div className="barWrap">
<<<<<<< HEAD
                      <div className="bar barA" style={{ height: `${30 + i * 7}%` }} />
                      <div className="bar barB" style={{ height: `${20 + i * 5}%` }} />
=======
                      <div
                        className="bar barA"
                        style={{ height: `${30 + i * 7}%` }}
                      />
                      <div
                        className="bar barB"
                        style={{ height: `${20 + i * 5}%` }}
                      />
>>>>>>> origin/frontend-admin
                    </div>
                    <div className="barLabel">{d}</div>
                  </div>
                ))}
              </div>
              <div className="legend">
                <span className="dot a" /> Sales
                <span className="dot b" /> Revenue
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
