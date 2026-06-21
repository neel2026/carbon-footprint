import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const FootprintChartPropTypes = {
  breakdown: PropTypes.shape({
    transport: PropTypes.number.isRequired,
    diet: PropTypes.number.isRequired,
    energy: PropTypes.number.isRequired,
    shopping: PropTypes.number.isRequired,
  }).isRequired,
  total: PropTypes.number.isRequired,
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip__label">{`${payload[0].name}: ${Number(payload[0].value).toFixed(1)} kg`}</p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array
};

const COLORS = {
  transport: '#F59E0B',
  diet: '#EF4444',
  energy: '#3B82F6',
  shopping: '#8B5CF6'
};

const FootprintChart = ({ breakdown, total }) => {
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    let startTime = null;
    const duration = 1000;
    const target = total;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedTotal(target * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedTotal(target);
      }
    };

    requestAnimationFrame(animate);
  }, [total]);

  const data = useMemo(() => {
    return [
      { name: 'Transport', value: breakdown.transport, color: COLORS.transport },
      { name: 'Diet', value: breakdown.diet, color: COLORS.diet },
      { name: 'Energy', value: breakdown.energy, color: COLORS.energy },
      { name: 'Shopping', value: breakdown.shopping, color: COLORS.shopping },
    ].filter(item => item.value > 0);
  }, [breakdown]);

  return (
    <div className="footprint-chart" aria-label="Carbon footprint breakdown chart">
      <div className="footprint-chart__total">
        <span className="footprint-chart__number">{animatedTotal.toFixed(1)}</span>
        <span className="footprint-chart__unit">kg CO₂</span>
      </div>
      <div className="footprint-chart__viz">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="footprint-chart__legend">
        {data.map((entry) => {
          const colorClass = `legend-color--${entry.name.toLowerCase()}`;
          return (
            <div key={entry.name} className="footprint-chart__legend-item">
              <span className={`footprint-chart__legend-color ${colorClass}`} />
              <span className="footprint-chart__legend-label">{entry.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

FootprintChart.propTypes = FootprintChartPropTypes;
export default FootprintChart;
