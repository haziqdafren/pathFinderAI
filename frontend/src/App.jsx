import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './utils/supabase';
import { Toaster } from 'sonner';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import AuthCallbackScreen from './screens/AuthCallbackScreen';
import ConversationScreen from './screens/ConversationScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultsScreen from './screens/ResultsScreen';
import ProjectWorkspaceScreen from './screens/ProjectWorkspaceScreen';
import SaveSheet from './components/SaveSheet';

function App() {
  useEffect(() => {
    // Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){window.dataLayer.push(arguments);}
      window.gtag('js', new Date());
      window.gtag('config', gaId);
    }

    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        sessionStorage.setItem('logged_in', 'true');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        sessionStorage.setItem('logged_in', 'true');
      } else {
        sessionStorage.removeItem('logged_in');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/project" element={<ProjectWorkspaceScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SaveSheet />
    </Router>
  );
}

export default App;
