import React from 'react';
import { useNavigate } from 'react-router-dom';

const KpiCard = ({ icon, title, value, subtitle, color, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div
      className={`kpiCard kpi-${color}`}
      onClick={handleClick}
      style={{ cursor: to ? 'pointer' : 'default' }}
    >
      <div className="kpiIconWrap">
        {icon}
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
};

export default KpiCard;
