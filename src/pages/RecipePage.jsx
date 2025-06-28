import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';
import { API_URL } from '../config';
import Particle from '../components/Particle';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const RecipePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const detectedVeggies = location.state?.detectedVeggies || [];
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [preferences, setPreferences] = useState({
    servingSize: 2,
    cuisine: 'Indian',
    mealType: 'Lunch',
    diet: 'Veg',
    allergy: '',
    lactose: 'Yes',
    diabetic: 'No',
    cookingTime: '<30 mins',
    healthGoal: '',
    spicyLevel: 2
  });

  const [recipe, setRecipe] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    if (lastRequestTime && now - lastRequestTime < 60000) { // Within last minute
      if (requestCount >= 55) {
        toast('Hang tight! Our CodeChefs are busy preparing your dishes. Please wait for a minute');
        return;
      }
    } else {
      // Reset counter if more than a minute has passed
      setRequestCount(0);
      setLastRequestTime(now);
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/recipe/generate`, {
        ingredients: detectedVeggies.map((d) => d.label),
        preferences
      });
      setRecipe(res.data.recipe);
      setRequestCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast('Failed to generate recipe');
    }
    setLoading(false);
  };

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const title = recipe.split('\n')[0];
      const res = await axios.post(
        `${API_URL}/api/recipe/save`,
        { title, content: recipe },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecipeId(res.data.recipe._id);
      toast('✅ Recipe saved successfully!');
    } catch (err) {
      console.error(err);
      toast('Please Login to save recipe');
    }
  };

  const handleStartCooking = async (language) => {
    try {
      const token = localStorage.getItem('token');
      const title = recipe.split('\n')[0];
      const content = recipe.split('\n').slice(1).join('\n');
      // Save to cook history
      await axios.post(
        `${API_URL}/api/recipe/cooked`,
        { 
          title, 
          content,
          language 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Set up localStorage progress for this recipe
      const recipeKey = title.replace(/\s+/g, '_');
      localStorage.setItem(
        `cookingProgress_${recipeKey}`,
        JSON.stringify({
          recipe: { title, content },
          currentStep: 0,
          lang: language,
          lastLeftAt: new Date().toISOString()
        })
      );
      localStorage.setItem('cookingProgress', JSON.stringify({
        recipe: { title, content },
        currentStep: 0,
        lang: language
      }));
      localStorage.setItem('cookingLang', language);
      // Navigate to cooking page
      navigate('/cook', { 
        state: { 
          recipe: { title, content },
          lang: language
        }
      });
    } catch (err) {
      console.error(err);
      toast('Please Login to start cooking');
    }
  };

  if (detectedVeggies.length === 0) {
    return (
      <RecipeWrapper>
        <div className="particle-bg">
          <Particle />
        </div>
        <div className="error-message">
          ❌ No vegetables detected. Please go back and scan first.
        </div>
      </RecipeWrapper>
    );
  }

  return (
    <RecipeWrapper>
      <div className="particle-bg">
        <Particle />
      </div>
      
      <div className="main-content">
        {/* Header Bar */}
        <div className="header-bar">
          <div className="header-content">
            <div className="header-left">
              <h1 className="greeting">
                {greeting}, {user?.name}! 🌱
              </h1>
              <div className="nav-buttons">
                <HomeButton />
                <SavedRecipesButton />
              </div>
            </div>
            <div className="header-right">
              <DarkModeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-area">
          <h1 className="page-title">🍳 Generate Recipe</h1>
          
          <div className="detected-veggies">
            <h2 className="section-title">Detected Vegetables:</h2>
            <div className="veggies-list">
              {detectedVeggies.map((veggie, index) => (
                <span key={index} className="veggie-tag">
                  {veggie.label} ({veggie.confidence}%)
                </span>
              ))}
            </div>
          </div>

          {!recipe ? (
            <div className="preferences-section">
              <h2 className="section-title">Set Your Preferences</h2>
              <PreferencesForm 
                preferences={preferences} 
                setPreferences={setPreferences} 
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          ) : (
            <div className="recipe-section">
              <div className="recipe-header">
                <h2 className="section-title">Your Recipe</h2>
                <div className="recipe-actions">
                  <button
                    onClick={handleSaveRecipe}
                    className="save-btn"
                    disabled={recipeId}
                  >
                    {recipeId ? '✅ Saved' : '💾 Save Recipe'}
                  </button>
                  <button
                    onClick={() => setShowLanguageSelect(true)}
                    className="cook-btn"
                  >
                    🍳 Start Cooking
                  </button>
                </div>
              </div>
              
              <div className="recipe-content">
                <pre className="recipe-text">{recipe}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageSelect && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Language</h2>
              <button
                onClick={() => setShowLanguageSelect(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Choose your preferred language for cooking instructions:</p>
              <div className="language-options">
                <button
                  onClick={() => {
                    handleStartCooking('en');
                    setShowLanguageSelect(false);
                  }}
                  className="lang-btn"
                >
                  English 🇬🇧
                </button>
                <button
                  onClick={() => {
                    handleStartCooking('hi');
                    setShowLanguageSelect(false);
                  }}
                  className="lang-btn"
                >
                  Hindi 🇮🇳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RecipeWrapper>
  );
};

export default RecipePage;

// Styled Components
const RecipeWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  position: relative;
  overflow-x: hidden;

  .particle-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .main-content {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 2px 16px 0 rgba(0,0,0,0.07);
    border-radius: 0 0 24px 24px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
  }

  .greeting {
    font-size: clamp(1.25rem, 4vw, 1.75rem);
    font-weight: 700;
    color: #22543d;
    margin: 0;
    white-space: nowrap;
  }

  .nav-buttons {
    display: flex;
    gap: 12px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .content-area {
    flex: 1;
    padding: 120px 24px 32px 24px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .page-title {
    font-size: clamp(2rem, 6vw, 2.5rem);
    font-weight: 700;
    color: #22543d;
    text-align: center;
    margin-bottom: 32px;
  }

  .error-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255,255,255,0.9);
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    font-size: 1.2rem;
    color: #e53e3e;
    text-align: center;
    z-index: 10;
  }

  .detected-veggies {
    background: rgba(255,255,255,0.7);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
  }

  .section-title {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 600;
    color: #22543d;
    margin-bottom: 16px;
  }

  .veggies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .veggie-tag {
    background: #38a169;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .preferences-section {
    background: rgba(255,255,255,0.7);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
  }

  .recipe-section {
    background: rgba(255,255,255,0.7);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;
  }

  .recipe-actions {
    display: flex;
    gap: 12px;
  }

  .save-btn,
  .cook-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .save-btn {
    background: #3182ce;
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: #2c5aa0;
    transform: translateY(-1px);
  }

  .save-btn:disabled {
    background: #48bb78;
    cursor: not-allowed;
  }

  .cook-btn {
    background: #38a169;
    color: white;
  }

  .cook-btn:hover {
    background: #2f855a;
    transform: translateY(-1px);
  }

  .recipe-content {
    background: rgba(247, 250, 252, 0.8);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }

  .recipe-text {
    white-space: pre-wrap;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #2d3748;
    margin: 0;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    color: #22543d;
    font-size: 1.25rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #f3f4f6;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-body p {
    margin-bottom: 20px;
    color: #4a5568;
  }

  .language-options {
    display: flex;
    gap: 12px;
  }

  .lang-btn {
    flex: 1;
    padding: 12px 16px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .lang-btn:hover {
    background: #2c5aa0;
    transform: translateY(-1px);
  }

  /* Tablet Styles */
  @media (max-width: 1024px) {
    .header-content {
      padding: 14px 20px;
    }
    
    .header-left {
      gap: 20px;
    }
    
    .content-area {
      padding: 100px 20px 24px 20px;
    }
    
    .recipe-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .recipe-actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .header-content {
      padding: 12px 16px;
    }
    
    .header-left {
      gap: 16px;
    }
    
    .greeting {
      font-size: 1.1rem;
    }
    
    .nav-buttons {
      gap: 8px;
    }
    
    .header-right {
      gap: 8px;
    }
    
    .content-area {
      padding: 90px 16px 20px 16px;
    }
    
    .page-title {
      font-size: 2rem;
      margin-bottom: 24px;
    }
    
    .detected-veggies,
    .preferences-section,
    .recipe-section {
      padding: 20px;
      border-radius: 12px;
    }
    
    .veggies-list {
      gap: 6px;
    }
    
    .veggie-tag {
      font-size: 0.8rem;
      padding: 4px 10px;
    }
    
    .recipe-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .save-btn,
    .cook-btn {
      width: 100%;
      padding: 12px 16px;
    }
  }

  /* Small Mobile Styles */
  @media (max-width: 480px) {
    .header-content {
      padding: 10px 12px;
    }
    
    .greeting {
      font-size: 1rem;
    }
    
    .nav-buttons {
      gap: 6px;
    }
    
    .header-right {
      gap: 6px;
    }
    
    .content-area {
      padding: 80px 12px 16px 12px;
    }
    
    .page-title {
      font-size: 1.75rem;
      margin-bottom: 20px;
    }
    
    .detected-veggies,
    .preferences-section,
    .recipe-section {
      padding: 16px;
      border-radius: 8px;
    }
    
    .section-title {
      font-size: 1.25rem;
      margin-bottom: 12px;
    }
    
    .veggie-tag {
      font-size: 0.75rem;
      padding: 3px 8px;
    }
    
    .recipe-text {
      font-size: 0.85rem;
    }
  }

  /* Landscape Mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .content-area {
      padding: 70px 16px 16px 16px;
    }
  }
`;
