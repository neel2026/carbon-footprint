import { memo } from 'react';
import PropTypes from 'prop-types';

const ActionCardPropTypes = {
  action: PropTypes.string.isRequired,
  estimatedSavingKg: PropTypes.number.isRequired,
  difficulty: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

const getCategoryIcon = (category) => {
  const map = {
    transport: '🚗',
    diet: '🥩',
    energy: '⚡',
    shopping: '📦'
  };
  return map[category] || '💡';
};

const ActionCard = memo(({ action, estimatedSavingKg, difficulty, category }) => (
  <article className="action-card action-card--highlight" aria-label={`Suggested action for ${category}`}>
    <div className="action-card__header">
      <span className="action-card__icon" role="img" aria-label={category}>
        {getCategoryIcon(category)}
      </span>
      <span className={`action-card__badge action-card__badge--${difficulty}`}>
        {difficulty}
      </span>
    </div>
    <h3 className="action-card__title">{action}</h3>
    <div className="action-card__saving">
      <span className="action-card__saving-number">{Number(estimatedSavingKg).toFixed(1)}</span>
      <span className="action-card__saving-text"> kg CO₂ savings</span>
    </div>
  </article>
));

ActionCard.displayName = 'ActionCard';
ActionCard.propTypes = ActionCardPropTypes;
export default ActionCard;
