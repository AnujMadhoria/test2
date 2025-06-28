import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import DarkModeToggle from '../components/DarkModeToggle';
import LogoutButton from '../components/LogoutButton';
import HomeButton from '../components/HomeButton';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }

  .video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -100;
    object-fit: cover;
  }

  .video-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -99;
    background: rgba(0,0,0,0.5);
  }

  .content-container {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  


  .form-input {
    font-size: 1.1rem;
    padding: 1rem 1.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;
    width: 100%;
    margin-bottom: 1.5rem;
    background-color: transparent;
  }

  .form-input:focus {
    outline: none;
    border-color: #48bb78;
    box-shadow: 0 0 0 4px rgba(72, 187, 120, 0.2);
    transform: translateY(-2px);
  }

  .form-input::placeholder {
    color: #a0aec0;
    font-weight: 300;
  }

  .btn-primary {
    font-size: 1.1rem;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100%;
    border: none;
    text-transform: uppercase;
  }

  .btn-email {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    margin-top: 2rem;
  }

  .btn-email:hover {
    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(56, 161, 105, 0.3);
  }

  .google-btn {
    display: inline-block;
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: white;
    padding: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    margin: 0 auto;
    width: 100%;
    cursor: pointer;
  }

  .google-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  .google-btn img {
    vertical-align: middle;
    margin-right: 8px;
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
  }

  .divider::before, .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  }

  .divider-text {
    padding: 0 1rem;
    color: #718096;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .toggle-link {
    color: #48bb78;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: none;
    border: none;
    padding: 0;
    font-size: inherit;
  }

  .toggle-link:hover {
    color: #2f855a;
    text-decoration: underline;
  }

  .terms-text {
    font-size: 0.75rem;
    color: #718096;
    line-height: 1.5;
    margin-top: 1.5rem;
  }

  .app-title {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .app-subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    font-weight: 400;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    
    margin-bottom: 1.5rem;
    text-align: center;
  }


  @media (max-width: 768px) {
    .content-container {
      padding: 1rem;
    }
    
    .auth-card {
      width: 95%;
      padding: 2rem 1.5rem;
    }
    
    .app-title {
      font-size: 2.5rem;
    }
    
    .section-title {
      font-size: 1.5rem;
    }
    
    .form-input {
      font-size: 1rem;
      padding: 0.9rem 1.2rem;
    }
  }
`;

const LoginPage = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // GSAP refs
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // GSAP Animations
  useEffect(() => {
    if (titleRef.current && subtitleRef.current) {
      // Initial state
      gsap.set(titleRef.current, { opacity: 0, y: -50 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30 });

      // Animate title
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3
      });

      // Animate subtitle
      gsap.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.8
      });

      // Floating animation for title
      gsap.to(titleRef.current, {
        y: -10,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2
      });
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });

  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      toast('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, signupForm);
      toast('User registered successfully! Please login with your credentials.');
      setIsSignup(false);
      setForm({ email: signupForm.email, password: signupForm.password });
    } catch (err) {
      toast('Signup failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/google-login`, { idToken });
      login(res.data.token);
      navigate('/camera');
    } catch (err) {
      toast('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <video autoPlay loop muted playsInline className="video-background">
        <source src="/IMG_0369.MP4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>

    

      <div className="content-container">
        <div className="p-10 w-full max-w-md auth-card">
          <div className="mb-8 text-center">
            <h1 ref={titleRef} className="app-title">FoodLens</h1>
            <p ref={subtitleRef} className="text-white app-subtitle" style={{ color: 'white' }}>Transform veggies into delicious meals</p>
          </div>

          {isSignup ? (
            <div>
              <h2 className="text-white section-title" style={{ color: 'white' }}>Create Your Account</h2>
              <input 
                name="email" 
                value={signupForm.email} 
                onChange={handleSignupChange} 
                placeholder="Email Address" 
                className="form-input" 
              />
              <input 
                type="password" 
                name="password" 
                value={signupForm.password} 
                onChange={handleSignupChange} 
                placeholder="Create Password" 
                className="form-input" 
              />
              <button 
                onClick={handleSignup} 
                disabled={isLoading} 
                className="mt-6 btn-primary btn-email"
                style={{ marginTop: '2rem' }}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="divider">
                <span className="divider-text">or continue with</span>
              </div>

              <div className="mt-6 text-center" style={{ marginTop: '2rem' }}>
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading} 
                  className="google-btn"
                  style={{ display: 'block', margin: '0 auto', width: '100%' }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Sign up with Google
                </button>
              </div>
              
              <div className="mt-6 text-center" style={{ marginTop: '1.25rem' }}>
                <span className="text-white" style={{ color: 'white' }}>Already have an account? </span>
                <button onClick={() => setIsSignup(false)} className="toggle-link">
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-white section-title" style={{ color: 'white' }}>Welcome Chef</h2>
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email Address" 
                className="form-input" 
              />
              <input 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Password" 
                className="form-input" 
              />
              <button 
                onClick={handleEmailLogin} 
                disabled={isLoading} 
                className="btn-primary btn-email"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="divider">
                <span className="divider-text">or continue with</span>
              </div>

              <div className="mt-6 text-center" style={{ marginTop: '2rem' }}>
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading} 
                  className="google-btn"
                  style={{ display: 'block', margin: '0 auto', width: '100%' }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Sign in with Google
                </button>
              </div>

              <div className="mt-6 text-center" style={{ marginTop: '1.25rem' }}>
                <span className="text-white" style={{ color: 'white' }}>Don't have an account? </span>
                <button onClick={() => setIsSignup(true)} className="toggle-link">
                  Sign Up
                </button>
              </div>
            </div>
          )}

          <div className="text-center terms-text">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;