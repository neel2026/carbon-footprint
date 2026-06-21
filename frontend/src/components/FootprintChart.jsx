import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_INNER_RADIUS, CHART_OUTER_RADIUS } from '../utils/constants';

const COLORS = { transport: '#F59E0B', diet: '#EF4444', energy: '#3B82F6', shopping: '#8B5CF6' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip__label">{`${payload[0].name}: ${Number(payload[0].value).toFixed(1)} kg`}</p>
    </div>
  );
};
CustomTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const ChartLegend = memo(({ data }) => (
  <ul className="footprint-chart__legend" aria-label="Chart legend">
    {data.map(entry => (
      <li key={entry.name} className="footprint-chart__legend-item">
        <span className={`footprint-chart__legend-color legend-color--${entry.name.toLowerCase()}`} aria-hidden="true" />
        <span className="footprint-chart__legend-label">{entry.name}</span>
      </li>
    ))}
  </ul>
));
ChartLegend.displayName = 'ChartLegend';
ChartLegend.propTypes = { data: PropTypes.array.isRequired };

const ChartViz = memo(({ data }) => (
  <div className="footprint-chart__viz">
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} innerRadius={CHART_INNER_RADIUS} outerRadius={CHART_OUTER_RADIUS} paddingAngle={5} dataKey="value">
          {data.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  </div>
));
ChartViz.displayName = 'ChartViz';
ChartViz.propTypes = { data: PropTypes.array.isRequired };

const FootprintChart = memo(({ breakdown, total }) => {
  const data = useMemo(() => [
    { name: 'Transport', value: breakdown.transport, color: COLORS.transport },
    { name: 'Diet', value: breakdown.diet, color: COLORS.diet },
    { name: 'Energy', value: breakdown.energy, color: COLORS.energy },
    { name: 'Shopping', value: breakdown.shopping, color: COLORS.shopping },
  ].filter(item => item.value > 0), [breakdown]);

  return (
    <section className="footprint-chart fade-in" role="region" aria-label="Carbon footprint breakdown chart">
      <div className="footprint-chart__total">
        <span className="footprint-chart__number">{total.toFixed(1)}</span>
        <span className="footprint-chart__unit">kg CO₂ this week</span>
      </div>
      <ChartViz data={data} />
      <ChartLegend data={data} />
    </section>
  );
});

FootprintChart.displayName = 'FootprintChart';
FootprintChart.propTypes = {
  breakdown: PropTypes.shape({ transport: PropTypes.number.isRequired, diet: PropTypes.number.isRequired, energy: PropTypes.number.isRequired, shopping: PropTypes.number.isRequired }).isRequired,
  total: PropTypes.number.isRequired,
};

export default FootprintChart;
