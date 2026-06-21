import { useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Onboarding from './components/Onboarding';
import { DashboardView } from './components/DashboardView';
import { InsightsView } from './components/InsightsView';
import { getProfile, saveProfile } from './utils/storage';
import { useFootprint } from './hooks/useFootprint';
import { useHistory } from './hooks/useHistory';

const initialProfile = getProfile();

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [view, setView] = useState(initialProfile ? 'dashboard' : 'onboarding');
  const { history, addEntry } = useHistory();
  const { submitFootprint, isLoading, error, insight } = useFootprint();

  const handleOnboardingComplete = useCallback((data) => {
    saveProfile(data);
    setProfile(data);
    setView('dashboard');
  }, []);

  const handleFootprintSubmit = useCallback(async (inputs) => {
    const result = await submitFootprint(profile, inputs, history);
    if (result.success) {
      addEntry(result.entry);
      setView('insights');
    }
  }, [profile, history, submitFootprint, addEntry]);

  const handleBack = useCallback(() => {
    setView('dashboard');
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {view !== 'onboarding' && (
          <header className="app-header">
            <h1 className="app-title">Your Carbon Story</h1>
            <p className="app-greeting">Hello, {profile?.name}</p>
          </header>
        )}
        <main id="main-content" className="app-main" role="main" tabIndex="-1">
          {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
          {view === 'dashboard' && <DashboardView profile={profile} handleFootprintSubmit={handleFootprintSubmit} isLoading={isLoading} error={error} history={history} />}
          {view === 'insights' && insight && <InsightsView insight={insight} handleBack={handleBack} />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
