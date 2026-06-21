import { memo } from 'react';
import PropTypes from 'prop-types';

const AIInsightPropTypes = {
  recommendation: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
};

const AIInsight = memo(({ recommendation, explanation }) => (
  <section className="ai-insight" aria-label="AI coaching recommendation">
    <h3 className="ai-insight__title">AI Coach</h3>
    <p className="ai-insight__recommendation fade-in">{recommendation}</p>
    <p className="ai-insight__explanation fade-in delay-1">{explanation}</p>
  </section>
));

AIInsight.displayName = 'AIInsight';
AIInsight.propTypes = AIInsightPropTypes;
export default AIInsight;
