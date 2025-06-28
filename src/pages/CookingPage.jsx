import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';
import CookHistoryButton from '../components/CookHistoryButton';
import { API_URL } from '../config';
import { initAudio, playTick, stopAllSounds } from '../utils/soundUtils';
import Particle from '../components/Particle';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiMenu, FiX } from 'react-icons/fi';

const CookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lang, setLang] = useState('en');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [handledSuggestions, setHandledSuggestions] = useState({});
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const speechSynthesisRef = useRef(window.speechSynthesis);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('cookingProgress');
    if (savedProgress) {
      const { recipe: savedRecipe, currentStep: savedStep, lang: savedLang } = JSON.parse(savedProgress);
      setRecipe(savedRecipe);
      setCurrentStep(savedStep);
      setLang(savedLang);
    } else {
      const recipeData = location.state?.recipe;
      const language = location.state?.lang || 'en';
      
      if (recipeData) {
        setRecipe(recipeData);
        setLang(language);
      } else {
        navigate('/camera');
      }
    }
  }, [location.state, navigate]);

  // Save progress whenever it changes
  useEffect(() => {
    if (recipe && instructions.length > 0) {
      const recipeKey = recipe.title.replace(/\s+/g, '_');
      const progressData = {
        recipe,
        currentStep,
        lang,
        lastLeftAt: new Date().toISOString()
      };

      localStorage.setItem('cookingProgress', JSON.stringify(progressData));

      if (currentStep === instructions.length - 1) {
        localStorage.setItem(`cookingProgress_${recipeKey}`, JSON.stringify({
          ...progressData,
          completed: true
        }));

        const updateCookedRecipe = async () => {
          try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/recipe/cooked/${recipe._id}`, {
              completed: true,
              currentStep: currentStep
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error('Failed to update recipe completion status:', err);
          }
        };
        updateCookedRecipe();
      } else {
        localStorage.setItem(`cookingProgress_${recipeKey}`, JSON.stringify(progressData));
      }
    }
  }, [recipe, currentStep, lang, instructions]);

  // Parse recipe content when recipe changes
  useEffect(() => {
    if (recipe) {
      const content = recipe.content;
      const sections = content.split(/\*\*Hindi Translation\*\*/i);
      const englishContent = sections[0];
      const hindiContent = sections[1] || '';
      const contentToUse = lang === 'hi' ? hindiContent : englishContent;
      
      // Extract ingredients
      const ingredientsMatch = contentToUse.match(/\*\*(?:Ingredients|सामग्री):\*\*\s*\n\*([\s\S]*?)(?=\*\*(?:Instructions|निर्देश):\*\*|\*\*Approximate|$)/i);
      if (ingredientsMatch) {
        const ingredientsList = ingredientsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.trim().replace(/^\*\s*/, '').trim());
        setIngredients(ingredientsList);
      }

      // Extract instructions
      const instructionsMatch = contentToUse.match(/\*\*(?:Instructions|निर्देश):\*\*\s*\n([\s\S]*?)(?=\*\*Approximate|$)/i);
      if (instructionsMatch) {
        const instructionsList = instructionsMatch[1]
          .split('\n')
          .filter(line => line.trim().match(/^\d+\./))
          .map(line => line.trim().replace(/^\d+\.\s*/, '').trim());
        setInstructions(instructionsList);
      }
    }
  }, [recipe, lang]);

  // Fetch saved recipes on mount
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/recipe/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedRecipes(res.data.recipes || []);
      } catch (err) {
        setSavedRecipes([]);
      }
    };
    fetchSavedRecipes();
  }, []);

  const startTimer = (minutes) => {
    if (timer) {
      clearInterval(timer);
    }
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
    initAudio();
    
    const newTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          setIsTimerRunning(false);
          stopAllSounds();
          return 0;
        }
        playTick();
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
      setIsTimerRunning(false);
      stopAllSounds();
    }
  };

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const extractTimeFromStep = (step) => {
    const timeMatch = step.match(/(\d+)\s*(?:minutes?|mins?|मिनट)/i);
    return timeMatch ? parseInt(timeMatch[1]) : null;
  };

  const handleContinueLater = () => {
    navigate('/cook-history');
  };

  const handleToggleLanguage = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: userMsg }
    ]);
    setChatInput("");
    try {
      // Prepare recipe data for the API
      const recipeData = {
        title: recipe.title,
        content: recipe.content,
        currentStep: currentStep,
        currentInstruction: instructions[currentStep],
        ingredients: ingredients
      };

      const res = await axios.post(`${API_URL}/api/gemini/chat`, {
        recipe: recipeData,
        step: currentStep,
        message: userMsg
      });

      if (!res.data || !res.data.reply) {
        throw new Error('Invalid response from server');
      }

      // Clean Gemini's reply for JSON
      let suggestion = null;
      let explanation = res.data.reply;
      let cleaned = explanation.trim();

      // Remove markdown code blocks if present
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();
      console.log('Cleaned reply:', cleaned);

      // Only try to parse if it looks like JSON
      if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed.action && parsed.details) {
            suggestion = parsed;
            explanation = parsed.explanation || "";
          }
        } catch (e) {
          // Not a suggestion, just a normal reply
          console.log('Not a JSON suggestion:', e);
        }
      }

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: explanation, suggestion }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = "Sorry, I couldn't get a response from Gemini. ";
      
      if (err.response) {
        // Server responded with an error
        errorMessage += err.response.data?.message || "Please try again.";
      } else if (err.request) {
        // No response received
        errorMessage += "Please check your internet connection and try again.";
      } else {
        // Other error
        errorMessage += "Please try again.";
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "gemini", text: errorMessage }
      ]);
    }
  };
  const handleAcceptSuggestion = async (msg, idx) => {
    const suggestion = msg.suggestions[idx];
    if (!suggestion) return;

    setHandledSuggestions(prev => ({
      ...prev,
      [`${msg.timestamp}-${idx}`]: true
    }));

    const userMessage = {
      role: 'user',
      content: suggestion,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        message: suggestion,
        recipe: recipe.title,
        currentStep: currentStep + 1,
        totalSteps: instructions.length,
        currentInstruction: instructions[currentStep],
        chatHistory: chatHistory.slice(-5)
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString(),
        suggestions: res.data.suggestions || []
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const handleRejectSuggestion = (msg, idx) => {
    setHandledSuggestions(prev => ({
      ...prev,
      [`${msg.timestamp}-${idx}`]: true
    }));
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

  const speakStep = (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      const title = extractTitle(recipe.content, lang);
      
      const existingRecipe = savedRecipes.find(r => r.title === title);
      if (existingRecipe) {
        toast('Recipe already saved!');
        return;
      }

      await axios.post(
        `${API_URL}/api/recipe`,
        { 
          title, 
          content: recipe.content 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('✅ Recipe saved to your collection!');
      setSavedRecipes(prev => [...prev, { title, content: recipe.content }]);
    } catch (err) {
      console.error(err);
      toast('❌ Failed to save recipe');
    }
  };

  if (!recipe || !instructions.length) {
    return (
      <CookingWrapper>
        <div className="particle-bg">
          <Particle />
        </div>
        <div className="error-message">
          ❌ No recipe found. Please go back and generate a recipe first.
        </div>
      </CookingWrapper>
    );
  }

  const currentInstruction = instructions[currentStep];
  const timeForStep = extractTimeFromStep(currentInstruction);
  const isLastStep = currentStep === instructions.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <CookingWrapper>
      <div className="particle-bg">
        <Particle />
      </div>
      
      <div className="main-content">
        {/* Updated Header Bar */}
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
                <CookHistoryButton />
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <HomeButton onClick={toggleMenu} />
              <SavedRecipesButton onClick={toggleMenu} />
              <CookHistoryButton onClick={toggleMenu} />
              <LogoutButton onClick={toggleMenu} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="content-area">
          <div className="recipe-header">
            <h1 className="recipe-title">
              {extractTitle(recipe.content, lang)}
            </h1>
            <div className="recipe-actions">
              <button
                onClick={handleToggleLanguage}
                className="language-btn"
              >
                {lang === 'hi' ? 'Switch to English 🇬🇧' : 'Switch to Hindi 🇮🇳'}
              </button>
              <button
                onClick={handleSaveRecipe}
                className="save-btn"
              >
                💾 Save Recipe
              </button>
            </div>
          </div>

          <div className="cooking-container">
            {/* Progress Section */}
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                Step {currentStep + 1} of {instructions.length}
              </div>
            </div>

            {/* Current Step */}
            <div className="step-section">
              <h2 className="step-title">
                Step {currentStep + 1}
              </h2>
              <div className="step-content">
                <p className="step-text">{currentInstruction}</p>
                <div className="step-actions">
                  <button
                    onClick={() => speakStep(currentInstruction)}
                    className="speak-btn"
                  >
                    🔊 Speak
                  </button>
                  {timeForStep && (
                    <button
                      onClick={() => startTimer(timeForStep)}
                      className="timer-btn"
                      disabled={isTimerRunning}
                    >
                      ⏱️ {timeForStep} min
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Display */}
            {isTimerRunning && (
              <div className="timer-section">
                <div className="timer-display">
                  <span className="timer-text">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={stopTimer}
                    className="stop-timer-btn"
                  >
                    ⏹️ Stop Timer
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button
                onClick={prevStep}
                disabled={isFirstStep}
                className="nav-btn prev-btn"
              >
                ← Previous
              </button>
              <button
                onClick={nextStep}
                disabled={isLastStep}
                className="nav-btn next-btn"
              >
                Next →
              </button>
            </div>

            {/* Completion Message */}
            {isLastStep && (
              <div className="completion-section">
                <h2 className="completion-title">🎉 Congratulations!</h2>
                <p className="completion-text">
                  You've completed the recipe! Your dish is ready to serve.
                </p>
                <button
                  onClick={handleContinueLater}
                  className="continue-later-btn"
                >
                  View Cooking History
                </button>
              </div>
            )}

            {/* Chat Section */}
            <div className="chat-section">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="chat-toggle-btn"
              >
                {isChatOpen ? '✕ Close Chat' : '💬 Cooking Assistant'}
              </button>
              
              {isChatOpen && (
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.role}`}>
                        <div className="message-content">{msg.content}</div>
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="suggestions">
                            {msg.suggestions.map((suggestion, suggestionIdx) => (
                              <button
                                key={suggestionIdx}
                                onClick={() => handleAcceptSuggestion(msg, suggestionIdx)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  handleRejectSuggestion(msg, suggestionIdx);
                                }}
                                className={`suggestion-btn ${
                                  handledSuggestions[`${msg.timestamp}-${suggestionIdx}`] ? 'handled' : ''
                                }`}
                                disabled={handledSuggestions[`${msg.timestamp}-${suggestionIdx}`]}
                              >
                                {explanation }
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                      placeholder="Ask for cooking help..."
                      className="chat-input"
                    />
                    <button
                      onClick={() => handleSendChat(chatInput)}
                      className="send-btn"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </CookingWrapper>
  );
};

export default CookingPage;

// Styled Components
const CookingWrapper = styled.div`
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

  /* Header Styles */
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

  /* Mobile Menu */
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

  /* Main Content */
  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 100px 24px 40px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
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

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
  }

  .recipe-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: #22543d;
    margin: 0;
    flex: 1;
  }

  .recipe-actions {
    display: flex;
    gap: 12px;
  }

  .language-btn,
  .save-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .language-btn {
    background: transparent;
    color: #3182ce;
    border: 1px solid #3182ce;
  }

  .language-btn:hover {
    background: #3182ce;
    color: white;
  }

  .save-btn {
    background: #38a169;
    color: white;
  }

  .save-btn:hover {
    background: #2f855a;
    transform: translateY(-1px);
  }

  .cooking-container {
    background: rgba(255,255,255,0.7);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.08);
  }

  /* ... rest of your existing styles ... */

  /* Tablet Styles */
  @media (max-width: 1024px) {
    .header-container {
      padding: 10px 0;
    }
    
    .content-area {
      padding: 90px 20px 32px;
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
    .header-bar {
      padding: 0 12px;
    }

    .header-container {
      padding: 8px 0;
    }

    .greeting {
      font-size: 1.1rem;
    }

    .mobile-menu {
      top: 60px;
      padding: 10px 12px;
    }

    .content-area {
      padding: 80px 16px 24px;
    }

    .recipe-title {
      font-size: 1.5rem;
    }
    
    .cooking-container {
      padding: 20px;
      border-radius: 16px;
    }
    
    .step-text {
      font-size: 1rem;
    }
    
    .step-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .speak-btn,
    .timer-btn {
      width: 100%;
      padding: 10px 16px;
    }
    
    .navigation-buttons {
      flex-direction: column;
      gap: 8px;
    }
    
    .nav-btn {
      padding: 12px 16px;
    }
    
    .timer-display {
      flex-direction: column;
      gap: 12px;
    }
    
    .timer-text {
      font-size: 1.5rem;
    }
    
    .recipe-actions {
      flex-direction: column;
      gap: 8px;
    }
    
    .language-btn,
    .save-btn {
      width: 100%;
      padding: 10px 16px;
    }
  }

  /* Small Mobile Styles */
  @media (max-width: 480px) {
    .header-bar {
      padding: 0 8px;
    }

    .greeting {
      font-size: 1rem;
    }

    .content-area {
      padding: 70px 12px 20px;
    }

    .recipe-title {
      font-size: 1.25rem;
    }
    
    .cooking-container {
      padding: 16px;
      border-radius: 12px;
    }
    
    .step-title {
      font-size: 1.25rem;
    }
    
    .step-text {
      font-size: 0.9rem;
    }
    
    .timer-text {
      font-size: 1.25rem;
    }
    
    .completion-title {
      font-size: 1.25rem;
    }
    
    .completion-text {
      font-size: 1rem;
    }
    
    .chat-messages {
      max-height: 200px;
    }
    
    .message-content {
      max-width: 90%;
      font-size: 0.85rem;
    }
  }

  /* Landscape Mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .content-area {
      padding: 70px 16px 16px;
    }
    
    .chat-messages {
      max-height: 150px;
    }
  }
`;