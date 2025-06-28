import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <StyledWrapper>
      <button className="Btn" onClick={handleLogout}>
        <span className="sign">
          <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
        </span>
        <span className="text">Logout</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    background-color: rgb(255, 65, 65);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }

  .sign {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
  }

  .sign svg {
    width: 20px;
    height: 20px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    display: flex;
    align-items: center;
    white-space: nowrap;
    opacity: 0;
    width: 0;
    color: white;
    font-size: 1.1em;
    font-weight: 600;
    margin-left: 0;
    transition:
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    z-index: 1;
  }

  .Btn:hover,
  .Btn:focus {
    width: 130px;
    border-radius: 30px;
  }

  .Btn:hover .text,
  .Btn:focus .text {
    opacity: 1;
    width: 70px;
    margin-left: 10px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }

  /* Mobile Styles - Show full text by default */
  @media (max-width: 768px) {
    .Btn {
      width: auto;
      min-width: 80px;
      height: 36px;
      border-radius: 18px;
      padding: 0 12px;
      background-color: #e53e3e;
    }

    .sign {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }

    .sign svg {
      width: 16px;
      height: 16px;
    }

    .text {
      opacity: 1;
      width: auto;
      margin-left: 0;
      font-size: 0.9em;
      color: white;
    }

    .Btn:hover,
    .Btn:focus {
      width: auto;
      border-radius: 18px;
      background-color: #c53030;
    }

    .Btn:hover .text,
    .Btn:focus .text {
      opacity: 1;
      width: auto;
      margin-left: 0;
    }
  }

  /* Small Mobile Styles */
  @media (max-width: 480px) {
    .Btn {
      min-width: 70px;
      height: 32px;
      border-radius: 16px;
      padding: 0 10px;
    }

    .sign {
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }

    .sign svg {
      width: 14px;
      height: 14px;
    }

    .text {
      font-size: 0.8em;
    }
  }
`;

export default LogoutButton;
