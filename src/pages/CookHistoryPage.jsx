import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import Modal from 'react-modal';
import Particles from '../components/Particle';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import styled from 'styled-components';
import { FiMenu, FiX, FiGlobe } from 'react-icons/fi';

Modal.setAppElement('#root');

const CookHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [cookingHistory, setCookingHistory] = useState([]);
  const [language, setLanguage] = useState({});
  const [inlineLangModal, setInlineLangModal] = useState({ 
    show: false, 
    recipeId: null, 
    step: 0, 
    defaultLang: 'en', 
    recipe: null 
  });
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const recipeRefs = useRef({});
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/cooked`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCookingHistory(res.data.history);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load cook history');
      }
    };
    fetchHistory();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = (id) => {
    setLanguage((prev) => {
      const newLang = prev[id] === 'hi' ? 'en' : 'hi';
      setLangPref(newLang);
      return {
        ...prev,
        [id]: newLang,
      };
    });
  };

  const setLangPref = (lang) => {
    localStorage.setItem('cookingLang', lang);
  };

  const getLangPref = () => {
    return localStorage.getItem('cookingLang') || 'en';
  };

  const getContinueLaterInfo = (recipe) => {
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    const progress = localStorage.getItem(`cookingProgress_${recipeKey}`);
    if (progress) {
      try {
        const { currentStep, lastLeftAt, lang } = JSON.parse(progress);
        return { currentStep, lastLeftAt, lang };
      } catch {
        return null;
      }
    }
    return null;
  };

  const getInstructions = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const contentToUse = lang === 'hi' ? parts[1] || '' : parts[0];
    const match = contentToUse.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*?)(?=\*\*Approximate|$)/i);
    if (match) {
      return match[1]
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.trim().replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  };

  const isCompleted = (recipe, instructions) => {
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    const progress = localStorage.getItem(`cookingProgress_${recipeKey}`);
    if (progress) {
      try {
        const { currentStep, completed } = JSON.parse(progress);
        if (completed) return true;
        return currentStep >= instructions.length - 1;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleContinueCooking = (recipe, lang, step) => {
    console.log("yes");
    
    const recipeKey = recipe.title.replace(/\s+/g, '_');
    localStorage.setItem(`cookingProgress_${recipeKey}`, JSON.stringify({
      recipe: { title: recipe.title, content: recipe.content },
      currentStep: step,
      lang,
      lastLeftAt: new Date().toISOString(),
      completed: false
    }));
    localStorage.setItem('cookingLang', lang);

    navigate('/cook', {
      state: {
        recipe: { title: recipe.title, content: recipe.content },
        lang,
        currentStep: step
      }
    });
  };

  const handleRecook = async (recipe, lang) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/api/recipe/cooked/${recipe._id}`,
        {
          currentStep: 0,
          completed: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const recipeKey = recipe.title.replace(/\s+/g, '_');
      localStorage.setItem(
        `cookingProgress_${recipeKey}`,
        JSON.stringify({
          recipe: { title: recipe.title, content: recipe.content },
          currentStep: 0,
          lang: lang,
          lastLeftAt: new Date().toISOString(),
          completed: false
        })
      );
      localStorage.setItem('cookingProgress', JSON.stringify({
        recipe: { title: recipe.title, content: recipe.content },
        currentStep: 0,
        lang: lang
      }));
      localStorage.setItem('cookingLang', lang);

      navigate('/cook', {
        state: {
          recipe: { title: recipe.title, content: recipe.content },
          lang: lang,
          currentStep: 0
        }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to start recooking');
    }
  };

  const handlePromptLanguage = (recipe, continueInfo) => {
    const stepToResume = continueInfo?.currentStep || 0;
    const langToUse = continueInfo?.lang || getLangPref() || 'en';
    
    const rect = recipeRefs.current[recipe._id]?.getBoundingClientRect();
    if (rect) {
      setModalPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
    
    setInlineLangModal({ 
      show: true, 
      recipeId: recipe._id, 
      step: stepToResume, 
      defaultLang: langToUse, 
      recipe 
    });
  };

  const handleSelectLang = (lang) => {
    const { recipe, step } = inlineLangModal;
    setInlineLangModal({ show: false, recipeId: null, step: 0, defaultLang: 'en', recipe: null });
    handleContinueCooking(recipe, lang, step);
  };

  const handleSaveToSavedRecipes = async (recipe) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/recipe/save`,
        {
          title: recipe.title,
          content: recipe.content
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Recipe saved to your collection!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to save recipe');
    }
  };

  const extractSections = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return { ingredients: [], steps: [] };
    
    const ingredientsMatch = text.match(/\*\*(?:Ingredients|सामग्री):\*\*\s*\n([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|$)/i);
    const ingredients = ingredientsMatch
      ? ingredientsMatch[1].split('\n').filter(line => line.trim().startsWith('*')).map(line => line.replace(/^\*\s*/, '').trim())
      : [];
      
    const stepsMatch = text.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*)/i);
    const steps = stepsMatch
      ? stepsMatch[1].split('\n').filter(line => line.trim().match(/^\d+\./)).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];
    return { ingredients, steps };
  };

  const extractTitle = (content, lang) => {
    const parts = content.split(/[*]{2}Hindi Translation[:：]?[*]{2}/i);
    const text = lang === 'hi' ? parts[1] : parts[0];
    if (!text) return 'Untitled Recipe';
    
    const lines = text.split('\n').map(line => line.trim()).filter(line =>
      line && !line.toLowerCase().includes('translation')
    );
    
    for (let line of lines) {
      if (lang === 'hi') {
        const match = line.match(/^\*\*नाम:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      } else {
        const match = line.match(/^\*\*Name:\*\*\s*(.+)$/);
        if (match) return match[1].trim();
      }
    }
    return 'Untitled Recipe';
  };

  return (
    <CookHistoryWrapper>
      <div className="particle-bg">
        <Particles
          particleCount={200}
          particleColors={["#48bb78", "#38a169", "#ffffff"]}
          particleSpread={10}
          speed={0.15}
          alphaParticles={true}
        />
      </div>
      
      <div className="main-content">
        <header className="header-bar">
          <div className="header-container">
            <div className="header-left">
              <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menu">
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h1 className="greeting">
                {greeting}, {user?.name}! 🌱
              </h1>
            </div>
            
            <div className="header-right">
              <DarkModeToggle />
              <div className="desktop-buttons">
                <HomeButton />
                <SavedRecipesButton />
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <HomeButton onClick={toggleMenu} />
              <SavedRecipesButton onClick={toggleMenu} />
              <LogoutButton onClick={toggleMenu} />
            </div>
          </div>
        )}

        <div className="content-area">
          <h1 className="page-title">🍳 Cook History</h1>
          
          {cookingHistory.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No cooking history yet. Start cooking to see your progress!</p>
              <button
                onClick={() => navigate('/camera')}
                className="start-cooking-btn"
              >
                Start Cooking 🍳
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {cookingHistory.map((recipe) => {
                const lang = language[recipe._id] || 'en';
                const { ingredients, steps } = extractSections(recipe.content, lang);
                const instructions = getInstructions(recipe.content, lang);
                const continueInfo = getContinueLaterInfo(recipe);
                const completed = isCompleted(recipe, instructions);
                
                return (
                  <div 
                    key={recipe._id} 
                    ref={el => recipeRefs.current[recipe._id] = el}
                    className="history-card"
                  >
                    <div className="recipe-header">
                      <h2 className="recipe-title">
                        {extractTitle(recipe.content, lang)}
                      </h2>
                      <button
                        onClick={() => toggleLanguage(recipe._id)}
                        className="language-toggle"
                      >
                        {lang === 'hi' ? 'English 🇬🇧' : 'हिंदी 🇮🇳'}
                      </button>
                    </div>
                    
                    <div className="progress-section">
                      {continueInfo ? (
                        <div className="continue-info">
                          <span onClick={handleSelectLang} className="status-badge continue">🔄 Continue Cooking</span>
                          <p className="progress-text">
                            Last left at step {continueInfo.currentStep + 1} of {instructions.length}
                          </p>
                          <p className="last-cooked">
                            Last cooked: {new Date(continueInfo.lastLeftAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : completed ? (
                        <div className="completed-info">
                          <span className="status-badge completed">✅ Completed</span>
                          <p className="progress-text">You've completed this recipe!</p>
                        </div>
                      ) : (
                        <div className="not-started-info">
                          <span className="status-badge not-started">⏳ Not Started</span>
                          <p className="progress-text">Ready to start cooking!</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ingredients-section">
                      <h3 className="section-title">Ingredients Required:</h3>
                      <ul className="ingredients-list">
                        {ingredients.length > 0 ? ingredients.map((ing, idx) => (
                          <li key={idx}>{ing}</li>
                        )) : <li>No ingredients found.</li>}
                      </ul>
                    </div>
                    
                    <div className="steps-section">
                      <h3 className="section-title">Steps:</h3>
                      <ol className="steps-list">
                        {steps.length > 0 ? steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        )) : <li>No steps found.</li>}
                      </ol>
                    </div>
                    
                    <div className="action-buttons">
                      {continueInfo ? (
                        <button
                          onClick={() => handlePromptLanguage(recipe, continueInfo)}
                          className="continue-btn"
                        >
                          Continue Cooking
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRecook(recipe, lang)}
                          className="cook-btn"
                        >
                          {completed ? 'Cook Again' : 'Start Cooking'}
                        </button>
                      )}
                      <button
                        onClick={() => handleSaveToSavedRecipes(recipe)}
                        className="save-btn"
                      >
                        Save to Recipes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={inlineLangModal.show} 
        onRequestClose={() => setInlineLangModal({ show: false, recipeId: null, step: 0, defaultLang: 'en', recipe: null })}  
        style={{
          content: {
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
            right: 'auto',
            bottom: 'auto',
            width: '300px',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            transform: 'translateX(-50%)',
            border: 'none',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }
        }}
        ariaHideApp={false}
      >
        <div className="language-modal-content">
          <div className="language-modal-header">
            <FiGlobe size={20} className="globe-icon" />
            <h3>Select Language</h3>
          </div>
          <p className="language-modal-subtitle">Choose your preferred language for cooking:</p>
          
          <div className="language-options">
            <button 
              onClick={() => handleSelectLang('en')}
              className={`lang-option ${inlineLangModal.defaultLang === 'en' ? 'active' : ''}`}
            >
              <span className="flag">🇬🇧</span>
              <span className="lang-name">English</span>
            </button>
            <button
              onClick={() => handleSelectLang('hi')}
              className={`lang-option ${inlineLangModal.defaultLang === 'hi' ? 'active' : ''}`}
            >
              <span className="flag">🇮🇳</span>
              <span className="lang-name">हिंदी</span>
            </button>
          </div>
          
          <button 
            onClick={() => setInlineLangModal({ show: false, recipeId: null, step: 0, defaultLang: 'en', recipe: null })}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </CookHistoryWrapper>
  );
};

const CookHistoryWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background: transparent;

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
    width: 100%;
  }

  .header-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
    border-radius: 0 0 16px 16px;
    width: 100%;
    backdrop-filter: blur(8px);
    padding: 0 16px;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 0;
    width: 100%;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .hamburger-btn {
    background: none;
    border: none;
    color: #22543d;
    cursor: pointer;
    display: none;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-right: 4px;

    &:hover {
      background: rgba(34, 84, 61, 0.1);
    }

    @media (max-width: 1024px) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .greeting {
    font-size: clamp(1rem, 4vw, 1.5rem);
    font-weight: 700;
    color: #22543d;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .desktop-buttons {
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 1024px) {
      display: none;
    }
  }

  .mobile-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: 99;
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(12px);
    border-radius: 0 0 16px 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    padding: 12px 16px;
    animation: slideDown 0.3s ease-out;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);

    @keyframes slideDown {
      from {
        transform: translate(-50%, -20px);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
  }

  .mobile-menu-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    button {
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: rgba(34, 84, 61, 0.1);
      }
    }
  }

  .content-area {
    flex: 1;
    padding: 100px 24px 40px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 768px) {
      padding: 90px 16px 24px;
    }

    @media (max-width: 480px) {
      padding: 80px 12px 16px;
    }
  }

  .page-title {
    font-size: clamp(2rem, 6vw, 2.5rem);
    font-weight: 700;
    color: #22543d;
    text-align: center;
    margin-bottom: 32px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 32px;
    background: rgba(255,255,255,0.7);
    border-radius: 24px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
    text-align: center;
  }

  .empty-text {
    font-size: clamp(1rem, 4vw, 1.25rem);
    color: #4a5568;
    margin-bottom: 24px;
  }

  .start-cooking-btn {
    padding: 12px 32px;
    background: #38a169;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);

    &:hover {
      background: #2f855a;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(56, 161, 105, 0.4);
    }
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .history-card {
    background: rgba(255,255,255,0.7);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 48px 0 rgba(0,0,0,0.12);
    }

    @media (max-width: 768px) {
      padding: 20px;
      border-radius: 16px;
    }

    @media (max-width: 480px) {
      padding: 16px;
      border-radius: 12px;
    }
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .recipe-title {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 600;
    color: #22543d;
    margin: 0;
    flex: 1;
  }

  .language-toggle {
    padding: 6px 12px;
    background: transparent;
    color: #3182ce;
    border: 1px solid #3182ce;
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      background: #3182ce;
      color: white;
    }

    @media (max-width: 768px) {
      align-self: flex-start;
    }
  }

  .progress-section {
    margin: 16px 0;
    padding: 16px;
    background: rgba(247, 250, 252, 0.8);
    border-radius: 12px;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .status-badge.continue {
    background: #fef3c7;
    color: #92400e;
  }

  .status-badge.completed {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.not-started {
    background: #e5e7eb;
    color: #374151;
  }

  .progress-text {
    margin: 4px 0;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .last-cooked {
    margin: 4px 0;
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #22543d;
    font-size: 1rem;
  }

  .ingredients-section,
  .steps-section {
    margin: 16px 0;
  }

  .ingredients-list,
  .steps-list {
    padding-left: 20px;
  }

  .ingredients-list li,
  .steps-list li {
    margin-bottom: 4px;
    color: #4a5568;
    font-size: 0.9rem;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 8px;
    }
  }

  .continue-btn {
    padding: 10px 20px;
    background: #f59e0b;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

    &:hover {
      background: #d97706;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
  }

  .cook-btn {
    padding: 10px 20px;
    background: #38a169;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);

    &:hover {
      background: #2f855a;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
    }
  }

  .save-btn {
    padding: 10px 20px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);

    &:hover {
      background: #2c5aa0;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
    }
  }

  /* Language Modal Styles */
  .language-modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .language-modal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    
    h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #22543d;
    }
    
    .globe-icon {
      color: #3182ce;
    }
  }

  .language-modal-subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .language-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 12px 0;
  }

  .lang-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    
    &:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }
    
    &.active {
      background: #ebf8ff;
      border-color: #90cdf4;
    }
    
    .flag {
      font-size: 1.5rem;
    }
    
    .lang-name {
      font-size: 1rem;
      font-weight: 500;
      color: #2d3748;
    }
  }

  .cancel-btn {
    padding: 10px 16px;
    background: transparent;
    color: #718096;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
    
    &:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }
  }

  /* Landscape Mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .empty-state {
      padding: 32px 24px;
    }
    
    .history-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
  }
`;

export default CookHistoryPage;