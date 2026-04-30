import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import './index.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Contact = lazy(() => import('./pages/Contact'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load heavy 3D components
const AnimatedSphere = lazy(() => import('./components/AnimatedSphere'));
const AnimatedSolarSystem = lazy(() => import('./components/AnimatedSolarSystem'));
const AnimatedEarth = lazy(() => import('./components/AnimatedEarth'));
const OrbitingSkills = lazy(() => import('./components/OrbitingSkills'));

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <div className="min-h-screen relative">
          <div className="aurora-bg" />
          <Navbar />
          <Suspense fallback={<LoadingScreen />}>
            <Home />
            <About />
            <Portfolio />
            <Contact />
          </Suspense>
          <footer className="py-6 text-center border-t border-white/10">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Kyaw Shein. All rights reserved.
            </p>
          </footer>
        </div>
      )}
    </>
  );
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />}
        />
        <Route
          path="/project/:id"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ProjectDetail />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
