import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CameraPage from './pages/CameraPage';
import RecipePage from './pages/RecipePage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import CookingPage from './pages/CookingPage';
import CookHistoryPage from './pages/CookHistoryPage';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import DarkModeToggle from './components/DarkModeToggle';
import SavedRecipesButton from './components/SavedRecipesButton';
import CookHistoryButton from './components/CookHistoryButton';
import HomeButton from './components/HomeButton';
import LogoutButton from './components/LogoutButton';
import CookingQuoteBanner from './components/CookingQuoteBanner';
import Particles from './components/Particle';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">
          {greeting}, {user?.name}! 🌱
        </h1>
        <div className="flex gap-2 items-center">
          <DarkModeToggle />
          <SavedRecipesButton />
          <CookHistoryButton />
          <HomeButton />
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
};

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <ToastContainer position="top-center" autoClose={4000} />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Layout><HomePage /></Layout>} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/recipe" element={<Layout><RecipePage /></Layout>} />
          <Route path="/saved" element={<SavedRecipesPage />} />
          <Route path="/cook" element={<CookingPage />} />
          <Route path="/cook/:id" element={<CookingPage />} />
          <Route path="/history" element={<CookHistoryPage />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
