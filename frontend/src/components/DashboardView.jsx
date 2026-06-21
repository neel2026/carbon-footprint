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

export const DashboardView = ({ profile, handleFootprintSubmit, isLoading, error, history }) => (
  <div className="dashboard-view">
    <FootprintForm 
      onSubmit={handleFootprintSubmit} 
      isLoading={isLoading} 
      profile={profile} 
    />
    {error && <div className="app-error" role="alert">{error}</div>}
    {isLoading && <div className="app-loading" role="status" aria-label="Generating your insight">Generating your insight...</div>}
    <ProgressTracker history={history} />
  </div>
);

DashboardView.propTypes = DashboardViewPropTypes;
