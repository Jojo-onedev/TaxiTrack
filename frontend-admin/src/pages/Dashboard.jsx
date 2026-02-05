import "./dashboard.css";
import logo from "../assets/logo.png";

export default function Dashboard() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img className="brandLogo" src={logo} alt="TaxiTracker logo" />
          <div className="brandText">
            <div className="brandName">TaxiTracker</div>
            <div className="brandTag">Admin Panel</div>
          </div>
        </div>

        <div className="navSection">MENU</div>

        <nav className="nav">
          <a className="navItem active" href="#dashboard">
            Dashboard
          </a>
          <a className="navItem" href="#drivers">
            Drivers
          </a>
          <a className="navItem" href="#vehicles">
            Vehicles
          </a>
          <a className="navItem" href="#clients">
            Clients
          </a>
          <a className="navItem" href="#maintenance">
            Maintenance
          </a>
          <a className="navItem" href="#feedback">
            Feedback
          </a>
          <a className="navItem" href="#messages">
            Messages
          </a>
          <a className="navItem" href="#inbox">
            Inbox
          </a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="searchWrap">
            <input className="search" placeholder="Type to search..." />
          </div>

          <div className="topbarRight">
            <button className="iconBtn" aria-label="Notifications">
              🔔
            </button>
            <button className="iconBtn" aria-label="Settings">
              ⚙️
            </button>
            <div className="profile">
              <div className="avatar">TA</div>
              <div className="profileText">
                <div className="profileName">Admin</div>
                <div className="profileRole">Dispatcher</div>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          {/* TOP STATS CARDS */}
          <div className="kpiGrid kpiAnimated">
            <KpiCard
              icon="🚕"
              title="Drivers"
              value="281"
              subtitle="+55% than last week"
              color="dark"
            />
            <KpiCard
              icon="🚗"
              title="Vehicles"
              value="2,300"
              subtitle="+3% than last month"
              color="blue"
            />
            <KpiCard
              icon="👥"
              title="Users"
              value="34k"
              subtitle="+1% than yesterday"
              color="green"
            />
            <KpiCard
              icon="🛠️"
              title="Maintenance"
              value="+91"
              subtitle="Just updated"
              color="pink"
            />
            <KpiCard
              icon="💬"
              title="Feedbacks"
              value="+91"
              subtitle="Just updated"
              color="feedback"
            />
          </div>

          {}
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

              <div className="chartBox">
                <div className="lineChart">
                  <div className="lineArea" />
                  <div className="lineStroke" />
                </div>
                <div className="chartAxis">
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

              <div className="chartBox">
                <div className="barChart">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div className="barCol" key={d + i}>
                      <div className="barWrap">
                        <div
                          className="bar barA"
                          style={{ height: `${30 + i * 7}%` }}
                        />
                        <div
                          className="bar barB"
                          style={{ height: `${20 + i * 5}%` }}
                        />
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
        </section>
      </main>
    </div>
  );
}

function KpiCard({ icon, title, value, subtitle, color }) {
  return (
    <div className={`kpiCard kpi-${color}`}>
      <div className="kpiIconWrap">
        <div className="kpiIcon">{icon}</div>
      </div>

      <div className="kpiMain">
        <div className="kpiHeader">
          <div className="kpiTitle">{title}</div>
          <div className="kpiValue">{value}</div>
        </div>
        <div className="kpiSubtitle">{subtitle}</div>
      </div>

      <div className="kpiGlow" />
    </div>
  );
}

function MiniItem({ title, text }) {
  return (
    <div className="miniItem">
      <div className="miniTitle">{title}</div>
      <div className="miniText">{text}</div>
    </div>
  );
}
