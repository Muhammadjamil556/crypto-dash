import { Routes, Route, useLocation } from 'react-router';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/home';
import AboutPage from './pages/about';
import NotFoundPage from './pages/not-found';
import CoinDetailsPage from './pages/coin-details';

const App = () => {
  // Unlike pathname, key also changes when navigating to the current page
  const { key } = useLocation();

  return (
    <>
      <Header />
      <ErrorBoundary resetKey={key}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/coin/:id' element={<CoinDetailsPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
};

export default App;
