import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { calculateStreak, calculateTrend } from '../utils/carbon.js';

const ProgressTrackerPropTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
  })).isRequired,
};

const ProgressTracker = memo(({ history }) => {
  const streak = useMemo(() => calculateStreak(history), [history]);
  const trend = useMemo(() => calculateTrend(history), [history]);

  if (!history || history.length === 0) {
    return null;
  }

  const isImproving = trend < 0;
  const trendText = isImproving ? 'lower' : 'higher';
  const trendAbs = Math.abs(trend).toFixed(1);

  return (
    <section className="progress-tracker" aria-label="Your tracking progress">
      <div className="progress-tracker__streak">
        <span className="progress-tracker__icon" role="img" aria-label="streak">🔥</span>
        <span className="progress-tracker__text">{streak} day streak</span>
      </div>
      
      {history.length >= 2 && (
        <div className="progress-tracker__trend">
          <span className="progress-tracker__text">
            Your footprint is {trendAbs}% {trendText} than last log
          </span>
        </div>
      )}
    </section>
  );
});

ProgressTracker.displayName = 'ProgressTracker';
ProgressTracker.propTypes = ProgressTrackerPropTypes;
export default ProgressTracker;
