import { memo } from 'react';
import PropTypes from 'prop-types';
import FootprintForm from './FootprintForm';
import ProgressTracker from './ProgressTracker';

const DashboardViewPropTypes = {
  profile: PropTypes.object.isRequired,
  handleFootprintSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  history: PropTypes.array.isRequired
};

export const DashboardView = memo(({ profile, handleFootprintSubmit, isLoading, error, history }) => (
  <section className="dashboard-view" aria-label="Dashboard">
    <FootprintForm 
      onSubmit={handleFootprintSubmit} 
      isLoading={isLoading} 
      profile={profile} 
    />
    {error && <div className="app-error" role="alert" aria-live="assertive">{error}</div>}
    {isLoading && <div className="app-loading" role="status" aria-live="polite">Generating your insight...</div>}
    <ProgressTracker history={history} />
  </section>
));

DashboardView.displayName = 'DashboardView';
DashboardView.propTypes = DashboardViewPropTypes;
