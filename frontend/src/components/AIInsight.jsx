import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AIInsightPropTypes = {
  recommendation: PropTypes.string.isRequired,
  explanation: PropTypes.string.isRequired,
};

const AIInsight = ({ recommendation, explanation }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    
    // Typewriter effect using requestAnimationFrame to avoid setInterval issues
    let lastTime = 0;
    let reqId;

    const step = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      // Type roughly 1 char per 30ms
      if (timestamp - lastTime > 30) {
        lastTime = timestamp;
        if (index < recommendation.length) {
          setDisplayedText(recommendation.slice(0, index + 1));
          index++;
        }
      }
      if (index < recommendation.length) {
        reqId = requestAnimationFrame(step);
      }
    };

    reqId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(reqId);
  }, [recommendation]);

  return (
    <div className="ai-insight">
      <h3 className="ai-insight__title">AI Coach</h3>
      <p className="ai-insight__recommendation">{displayedText}</p>
      {displayedText.length === recommendation.length && (
        <p className="ai-insight__explanation">{explanation}</p>
      )}
    </div>
  );
};

AIInsight.propTypes = AIInsightPropTypes;
export default AIInsight;
