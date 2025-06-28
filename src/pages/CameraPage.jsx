// src/pages/CameraPage.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import ImageUploader from '../components/ImageUploader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import { AuthContext } from "../context/AuthContext";
import LogoutButton from '../components/LogoutButton';
import SavedRecipesButton from '../components/SavedRecipesButton';
import HomeButton from '../components/HomeButton';
import { API_URL } from '../config';
import Particles from '../components/Particle';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FiMenu, FiX } from 'react-icons/fi';

const CameraPage = () => {
  const { user } = useContext(AuthContext);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const imageRef = useRef();
  const [imgDims, setImgDims] = useState({ width: 640, height: 640 });
  const navigate = useNavigate();

  const foodQuotes = [
    "Snap a pic of your veggies and let's cook magic!",
    "Your fridge contents are just recipes waiting to happen!",
    "No food goes to waste with creative cooking!",
    "Turn your vegetables into culinary masterpieces!",
    "Fresh ingredients, endless possibilities!"
  ];
  const [currentQuote] = useState(foodQuotes[Math.floor(Math.random() * foodQuotes.length)]);

  const handleImageChange = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    detectVegetables(file);
  };

  useEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect();
      setImgDims({ width, height });
    }
  }, [image]);

  const detectVegetables = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await axios.post(`${API_URL}/api/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDetections(res.data.detected);
    } catch (err) {
      console.error('Detection error:', err);
      toast.error('Failed to detect vegetables. Please try again.');
    }
  };

  const handleContinue = () => {
    navigate('/recipe', { state: { detectedVeggies: detections } });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <CameraWrapper>
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
        {/* Header Bar */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <HomeButton onClick={toggleMenu} />
              <SavedRecipesButton onClick={toggleMenu} />
              <LogoutButton onClick={toggleMenu} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="content-container">
          <div className="center-content">
            <h2 className="title">🥕 Detect Vegetables</h2>
            <p className="food-quote">{currentQuote}</p>
            <ImageUploader  onImageSelected={handleImageChange} />
            
            {image && (
              <div className="image-preview">
                <img
                  ref={imageRef}
                  src={image}
                  alt="Uploaded vegetables"
                  className="uploaded-image"
                  onLoad={() => {
                    const { width, height } = imageRef.current.getBoundingClientRect();
                    setImgDims({ width, height });
                  }}
                />
              </div>
            )}

            {detections.length > 0 && (
              <div className="detections">
                <h3 className="subtitle">Detected Vegetables:</h3>
                <div className="detection-grid">
                  {detections.map((det, idx) => (
                    <span key={idx} className="detection-pill">
                      ✅ {det.label} ({det.confidence}%)
                    </span>
                  ))}
                </div>
                <button
                  className="next-btn"
                  onClick={handleContinue}
                >
                  Next: Generate Recipe
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </CameraWrapper>
  );
};

export default CameraPage;

// Styled Components
const CameraWrapper = styled.div`
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
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
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
    padding: 12px 12px;
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
  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 80px 16px 40px;
    box-sizing: border-box;
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500px;
    border-radius: 20px;
    height: 100%;
    margin-top: 20px;
    padding: 32px 24px;
  }

  .title {
    font-size: clamp(1.4rem, 5vw, 1.8rem);
    font-weight: 800;
    margin: 0 0 16px;
    color: #2f855a;
    text-align: center;
    line-height: 1.3;
  }

  .food-quote {
    font-size: clamp(0.95rem, 3vw, 1.1rem);
    color: #4a6b57;
    text-align: center;
    margin: 0 0 60px;
    font-style: italic;
    line-height: 1.5;
    max-width: 100%;
    padding: 0 8px;
  }

  .image-preview {
    margin: 16px 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .uploaded-image {
    width: 100%;
    max-width: 400px;
    max-height: 400px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }

  .detections {
    margin-top: 24px;
    width: 100%;
    text-align: center;
  }

  .subtitle {
    font-weight: 600;
    margin-bottom: 16px;
    color: #22543d;
    font-size: 1.1rem;
  }

  .detection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    margin-bottom: 24px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .detection-pill {
    font-size: 0.9rem;
    color: #22543d;
    padding: 8px 10px;
    background: rgba(72, 187, 120, 0.15);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-break: break-word;
  }

  .next-btn {
    padding: 14px 24px;
    background: #38a169;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 8px;
    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
    width: 100%;
    max-width: 300px;

    &:hover {
      background: #2f855a;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(56, 161, 105, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* Tablet Styles */
  @media (max-width: 1024px) {
    .header-container {
      padding: 10px 0;
    }

    .greeting {
      font-size: 1.1rem;
    }

    .content-container {
      padding: 72px 16px 32px;
    }

    .center-content {
      padding: 28px 20px;
    }
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    .header-bar {
      padding: 0 12px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(6px);
    }

    .header-container {
      padding: 8px 0;
    }

    .greeting {
      font-size: 1rem;
    }

    .hamburger-btn {
      margin-right: 2px;
    }

    .mobile-menu {
      top: 60px;
      padding: 10px 12px;
    }

    .content-container {
      padding: 68px 12px 28px;
    }

    .center-content {
      padding: 24px 16px;
      border-radius: 16px;
    }

    .title {
      margin-bottom: 12px;
    }

    .food-quote {
          margin: 0 0 60px;

    }

    .detection-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    }

    .detection-pill {
      font-size: 0.85rem;
      padding: 6px 8px;
    }
  }

  /* Small Mobile Styles */
  @media (max-width: 480px) {
    .header-bar {
      padding: 0 8px;
    }

    .greeting {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .hamburger-btn {
      padding: 4px;
    }

    .mobile-menu {
      top: 56px;
    }

    .content-container {
      padding: 64px 8px 24px;
    }

    .center-content {
      padding: 20px 12px;
      border-radius: 12px;
    }

    .title {
      font-size: 1.3rem;
    }

    .food-quote {
      font-size: 0.9rem;
      margin: 0 0 60px;
    }

    .detection-grid {
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 6px;
    }

    .detection-pill {
      font-size: 0.8rem;
      padding: 5px 6px;
    }

    .next-btn {
      padding: 12px 20px;
      font-size: 0.95rem;
    }
  }

  /* Landscape Mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .content-container {
      padding: 60px 8px 20px;
    }

    .mobile-menu {
      top: 56px;
    }

    .center-content {
      padding: 16px 12px;
    }
  }
`;