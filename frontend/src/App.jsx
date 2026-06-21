import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import FootprintForm from './components/FootprintForm';
import ErrorBoundary from './components/ErrorBoundary';
import FootprintChart from './components/FootprintChart';
import AIInsight from './components/AIInsight';
import ActionCard from './components/ActionCard';
import ProgressTracker from './components/ProgressTracker';
import { getProfile, saveProfile } from './utils/storage';
import { useFootprint } from './hooks/useFootprint';
import { useHistory } from './hooks/useHistory';
import './styles/main.css';

function App() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('loading');
  const { history, addEntry } = useHistory();
  const { submitFootprint, isLoading, error, insight } = useFootprint();

  useEffect(() => {
    const savedProfile = getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      setView('dashboard');
    } else {
      setView('onboarding');
    }
  }, []);

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

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  if (view === 'loading') {
    return <div className="app-container"><p>Loading...</p></div>;
  }

  if (view === 'onboarding') {
    return (
      <ErrorBoundary>
        <div className="app-container">
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Your Carbon Story</h1>
          <p className="app-greeting">Hello, {profile.name}</p>
        </header>

        <main className="app-main">
          {view === 'dashboard' && (
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
          )}

          {view === 'insights' && insight && (
            <div className="insights-view" aria-live="polite">
              <div className="insights-view__header">
                <h2>Your Insights</h2>
                <button onClick={handleBackToDashboard} className="btn-secondary">Log another entry</button>
              </div>
              <div className="insights-content">
                <FootprintChart breakdown={insight.currentEntry.breakdown} total={insight.currentEntry.total} />
                <ActionCard 
                  action={insight.action} 
                  estimatedSavingKg={insight.estimatedSavingKg} 
                  difficulty={insight.difficulty} 
                  category={insight.category} 
                />
                <AIInsight recommendation={insight.recommendation} explanation={insight.savingExplanation} />
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
