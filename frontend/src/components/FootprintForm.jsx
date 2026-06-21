import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { validateKm, validateMeals, validateEnergy, validatePurchases } from '../utils/validation.js';

const FootprintFormPropTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  profile: PropTypes.shape({
    transportMode: PropTypes.string.isRequired,
    dietType: PropTypes.string.isRequired,
  }).isRequired,
};

const FootprintForm = memo(({ onSubmit, isLoading, profile }) => {
  const [inputs, setInputs] = useState({
    transportKm: '',
    meatMeals: '',
    energyKwh: '',
    purchases: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const kmCheck = validateKm(inputs.transportKm);
    const mealsCheck = profile.dietType === 'omnivore' ? validateMeals(inputs.meatMeals) : { valid: true };
    const energyCheck = validateEnergy(inputs.energyKwh);
    const purchasesCheck = validatePurchases(inputs.purchases);
    
    const newErrors = {};
    if (!kmCheck.valid) newErrors.transportKm = kmCheck.error;
    if (profile.dietType === 'omnivore' && !mealsCheck.valid) newErrors.meatMeals = mealsCheck.error;
    if (!energyCheck.valid) newErrors.energyKwh = energyCheck.error;
    if (!purchasesCheck.valid) newErrors.purchases = purchasesCheck.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      transportKm: Number(inputs.transportKm),
      transportMode: profile.transportMode,
      meatMeals: profile.dietType === 'omnivore' ? Number(inputs.meatMeals) : 0,
      dietType: profile.dietType,
      energyKwh: Number(inputs.energyKwh),
      purchases: Number(inputs.purchases)
    };

    if (payload.transportKm === 0 && payload.meatMeals === 0 && payload.energyKwh === 0 && payload.purchases === 0) {
      setErrors({ form: 'Log at least one activity to get insights' });
      return;
    }

    onSubmit(payload);
  }, [inputs, profile, onSubmit]);

  return (
    <section className="footprint-form" aria-label="Weekly carbon footprint form">
      <form onSubmit={handleSubmit}>
        <h2 className="footprint-form__title">Log Your Week</h2>
        
        {errors.form && <div className="footprint-form__error footprint-form__error--global" role="alert">{errors.form}</div>}
        
        <div className="footprint-form__group">
          <label htmlFor="transportKm" className="footprint-form__label">Distance traveled ({profile.transportMode}) in km</label>
          <input
            type="number"
            id="transportKm"
            name="transportKm"
            value={inputs.transportKm}
            onChange={handleChange}
            className={`footprint-form__input ${errors.transportKm ? 'footprint-form__input--error' : ''}`}
            disabled={isLoading}
            min="0"
            max="2000"
            step="1"
            aria-invalid={!!errors.transportKm}
            aria-describedby={errors.transportKm ? 'transportKm-error' : undefined}
          />
          {errors.transportKm && <span id="transportKm-error" className="footprint-form__error" role="alert">{errors.transportKm}</span>}
        </div>

        {profile.dietType !== 'vegan' && profile.dietType !== 'vegetarian' && (
          <div className="form-group footprint-form__group fade-in" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="meatMeals">
              Meat-based meals
              <span className="form-label-hint">This week (max 21)</span>
            </label>
            <input
              type="number"
              id="meatMeals"
              name="meatMeals"
              value={inputs.meatMeals}
              onChange={handleChange}
              className={`footprint-form__input ${errors.meatMeals ? 'footprint-form__input--error' : ''}`}
              disabled={isLoading}
              min="0"
              max="21"
              step="1"
              aria-invalid={!!errors.meatMeals}
              aria-describedby={errors.meatMeals ? 'meatMeals-error' : undefined}
            />
            {errors.meatMeals && <span id="meatMeals-error" className="footprint-form__error" role="alert">{errors.meatMeals}</span>}
          </div>
        )}

        <div className="form-group footprint-form__group fade-in" style={{ animationDelay: '0.2s' }}>
          <label htmlFor="energyKwh">
            Electricity usage
            <span className="form-label-hint">kWh this week</span>
          </label>
          <input
            type="number"
            id="energyKwh"
            name="energyKwh"
            value={inputs.energyKwh}
            onChange={handleChange}
            className={`footprint-form__input ${errors.energyKwh ? 'footprint-form__input--error' : ''}`}
            disabled={isLoading}
            min="0"
            max="10000"
            step="1"
            aria-invalid={!!errors.energyKwh}
            aria-describedby={errors.energyKwh ? 'energyKwh-error' : undefined}
          />
          {errors.energyKwh && <span id="energyKwh-error" className="footprint-form__error" role="alert">{errors.energyKwh}</span>}
        </div>

        <div className="form-group footprint-form__group fade-in" style={{ animationDelay: '0.3s' }}>
          <label htmlFor="purchases">
            Online purchases
            <span className="form-label-hint">Deliveries this week</span>
          </label>
          <input
            type="number"
            id="purchases"
            name="purchases"
            value={inputs.purchases}
            onChange={handleChange}
            className={`footprint-form__input ${errors.purchases ? 'footprint-form__input--error' : ''}`}
            disabled={isLoading}
            min="0"
            max="100"
            step="1"
            aria-invalid={!!errors.purchases}
            aria-describedby={errors.purchases ? 'purchases-error' : undefined}
          />
          {errors.purchases && <span id="purchases-error" className="footprint-form__error" role="alert">{errors.purchases}</span>}
        </div>

        <button 
          type="submit" 
          className="footprint-form__submit-btn"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Get Insight'}
        </button>
      </form>
    </section>
  );
});

FootprintForm.displayName = 'FootprintForm';
FootprintForm.propTypes = FootprintFormPropTypes;
export default FootprintForm;
