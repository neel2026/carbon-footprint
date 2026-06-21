import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const OnboardingPropTypes = {
  onComplete: PropTypes.func.isRequired,
};

const Onboarding = memo(({ onComplete }) => {
  const [profile, setProfile] = useState({
    name: '',
    country: 'India',
    transportMode: 'car',
    dietType: 'omnivore'
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onComplete(profile);
  }, [onComplete, profile]);

  return (
    <section className="onboarding-container" aria-label="Onboarding setup">
      <h1 className="onboarding-title">Your Carbon Story</h1>
      <p className="onboarding-subtitle">Let's start with a few basics to personalize your experience.</p>
      <form onSubmit={handleSubmit} className="onboarding-form">
        <div className="form-group">
          <label htmlFor="name">What should we call you?</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            className="onboarding-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Where do you live?</label>
          <select id="country" name="country" value={profile.country} onChange={handleChange} className="onboarding-select">
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="transportMode">Primary transport mode?</label>
          <select id="transportMode" name="transportMode" value={profile.transportMode} onChange={handleChange} className="onboarding-select">
            <option value="car">Car (Petrol/Diesel)</option>
            <option value="bus">Bus</option>
            <option value="train">Train / Metro</option>
            <option value="bike">Bike / Walk</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dietType">Primary diet type?</label>
          <select id="dietType" name="dietType" value={profile.dietType} onChange={handleChange} className="onboarding-select">
            <option value="omnivore">Omnivore (Meat & Plants)</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
        <button type="submit" className="onboarding-submit-btn">Continue</button>
      </form>
    </section>
  );
});

Onboarding.displayName = 'Onboarding';
Onboarding.propTypes = OnboardingPropTypes;
export default Onboarding;
