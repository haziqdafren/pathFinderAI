import { useState } from 'react';
import { analyzeProfile } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export function useAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startAnalysis = async (answers, lang) => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      // To simulate progress and fast navigation to loading screen,
      // actual API call should happen or be tracked during loading screen.
      // We return the promise so the caller can await or just navigate.
      const resultPromise = analyzeProfile(answers, sessionId, lang);
      
      // Save promise to window or context in real app, but for simplicity
      // we await it here and store after.
      return { resultPromise, sessionId };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return { startAnalysis, loading, error };
}
