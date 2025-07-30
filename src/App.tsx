import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DelveMapProvider } from './context/DelveMapContext';
import { ErrorBoundary, ToastContainer } from './components/common';
import { useToast } from './hooks/useToast';
import DelveMapPage from './pages/DelveMapPage';
import { LibraryPage } from './pages/LibraryPage';
import './App.css';

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<DelveMapPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </Router>
      
      <ToastContainer 
        toasts={toasts} 
        onRemoveToast={removeToast}
        position="top-right"
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
      }}
    >
      <DelveMapProvider>
        <AppContent />
      </DelveMapProvider>
    </ErrorBoundary>
  );
}

export default App;