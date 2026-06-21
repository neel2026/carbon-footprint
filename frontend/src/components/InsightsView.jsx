import { memo } from 'react';
import PropTypes from 'prop-types';
import FootprintChart from './FootprintChart';
import ActionCard from './ActionCard';
import AIInsight from './AIInsight';

const InsightsViewPropTypes = {
  insight: PropTypes.object.isRequired,
  handleBack: PropTypes.func.isRequired
};

export const InsightsView = memo(({ insight, handleBack }) => (
  <section className="insights-view" aria-live="polite" aria-label="Carbon footprint insights">
    <div className="insights-view__header">
      <h2>Your Insights</h2>
      <button onClick={handleBack} className="btn-secondary" type="button">Log another entry</button>
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
  </section>
));

InsightsView.displayName = 'InsightsView';
InsightsView.propTypes = InsightsViewPropTypes;
