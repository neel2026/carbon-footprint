import PropTypes from 'prop-types';
import FootprintChart from './FootprintChart';
import ActionCard from './ActionCard';
import AIInsight from './AIInsight';

const InsightsViewPropTypes = {
  insight: PropTypes.object.isRequired,
  handleBack: PropTypes.func.isRequired
};

export const InsightsView = ({ insight, handleBack }) => (
  <div className="insights-view" aria-live="polite">
    <div className="insights-view__header">
      <h2>Your Insights</h2>
      <button onClick={handleBack} className="btn-secondary">Log another entry</button>
    </div>
    <div className="insights-content">
      <FootprintChart breakdown={insight.currentEntry.breakdown} total={insight.currentEntry.total} />
      <ActionCard 
        action={insight.action} 
        estimatedSavingKg={insight.estimatedSavingKg} 
        difficulty={insight.difficulty} 
        category={insight.category} 
      />
      <AIInsight recommendation={insight.recommendation} explanation={insight.savingExplanation} />
    </div>
  </div>
);

InsightsView.propTypes = InsightsViewPropTypes;
