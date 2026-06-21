import { useState } from 'react';
import Onboarding from './components/Onboarding';
import ErrorBoundary from './components/ErrorBoundary';
import { DashboardView } from './components/DashboardView';
import { InsightsView } from './components/InsightsView';
import { getProfile, saveProfile } from './utils/storage';
import { useFootprint } from './hooks/useFootprint';
import { useHistory } from './hooks/useHistory';
import './styles/main.css';

function App() {
  const [profile, setProfile] = useState(() => getProfile());
  const [view, setView] = useState(() => getProfile() ? 'dashboard' : 'onboarding');
  const { history, addEntry } = useHistory();
  const { submitFootprint, isLoading, error, insight } = useFootprint();

  const handleOnboardingComplete = (data) => {
    saveProfile(data);
    setProfile(data);
    setView('dashboard');
  };

  const handleFootprintSubmit = async (inputs) => {
    const result = await submitFootprint(profile, inputs, history);
    if (result.success) {
      addEntry(result.entry);
      setView('insights');
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {view !== 'onboarding' && (
          <header className="app-header">
            <h1 className="app-title">Your Carbon Story</h1>
            <p className="app-greeting">Hello, {profile?.name}</p>
          </header>
        )}
        <main className="app-main">
          {view === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
          {view === 'dashboard' && <DashboardView profile={profile} handleFootprintSubmit={handleFootprintSubmit} isLoading={isLoading} error={error} history={history} />}
          {view === 'insights' && insight && <InsightsView insight={insight} handleBack={() => setView('dashboard')} />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
