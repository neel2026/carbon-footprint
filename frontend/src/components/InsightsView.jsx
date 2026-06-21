import React, { memo, Suspense } from 'react';
import PropTypes from 'prop-types';
const FootprintChart = React.lazy(() => import('./FootprintChart'));
import { getHighestImpactCategory, compareToAverage } from '../utils/carbon';
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
      <Suspense fallback={<div className="footprint-chart footprint-chart--loading">Loading chart...</div>}>
        <FootprintChart breakdown={insight.currentEntry.breakdown} total={insight.currentEntry.total} />
      </Suspense>
      <div className="insights-view__comparison">
        <p>You are using <strong>{insight.currentEntry.total.toFixed(1)} kg CO₂</strong>.</p>
        <p>This is <strong>{getHighestImpactCategory(insight.currentEntry.breakdown)}</strong>-heavy, which is <strong>{compareToAverage(insight.currentEntry.total).percentile.toLowerCase()}</strong> compared to the average.</p>
      </div>
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
