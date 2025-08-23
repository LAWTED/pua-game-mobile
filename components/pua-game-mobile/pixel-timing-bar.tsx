import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PixelTimingBarProps {
  onComplete: (result: 'perfect' | 'good' | 'okay' | 'miss') => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  disabled?: boolean;
  actionName?: string;
}

export function PixelTimingBar({ 
  onComplete, 
  difficulty = 'medium', 
  disabled = false,
  actionName = "ACTION"
}: PixelTimingBarProps) {
  const [isActive, setIsActive] = useState(false);
  const [pointerPosition, setPointerPosition] = useState(0);
  const [result, setResult] = useState<'perfect' | 'good' | 'okay' | 'miss' | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Difficulty settings
  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { speed: 1.2, perfectZone: [35, 65], goodZone: [25, 75] };
      case 'medium':
        return { speed: 1.8, perfectZone: [40, 60], goodZone: [30, 70] };
      case 'hard':
        return { speed: 2.5, perfectZone: [45, 55], goodZone: [35, 65] };
      default:
        return { speed: 1.8, perfectZone: [40, 60], goodZone: [30, 70] };
    }
  };

  const settings = getDifficultySettings();

  // Start the timing bar
  const startTiming = useCallback(() => {
    if (disabled || isActive) return;
    
    setIsActive(true);
    setResult(null);
    setShowResult(false);
    setPointerPosition(0);
  }, [disabled, isActive]);

  // Handle tap/click
  const handleTap = useCallback(() => {
    if (!isActive || disabled) return;

    setIsActive(false);
    
    let newResult: 'perfect' | 'good' | 'okay' | 'miss';
    
    if (pointerPosition >= settings.perfectZone[0] && pointerPosition <= settings.perfectZone[1]) {
      newResult = 'perfect';
    } else if (pointerPosition >= settings.goodZone[0] && pointerPosition <= settings.goodZone[1]) {
      newResult = 'good';
    } else if (pointerPosition >= 20 && pointerPosition <= 80) {
      newResult = 'okay';
    } else {
      newResult = 'miss';
    }
    
    setResult(newResult);
    setShowResult(true);
    
    setTimeout(() => {
      onComplete(newResult);
    }, 1500);
  }, [isActive, disabled, pointerPosition, settings, onComplete]);

  // Animate pointer
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPointerPosition(prev => {
        const next = prev + settings.speed;
        if (next >= 100) {
          // Auto-miss if pointer reaches end
          setIsActive(false);
          setResult('miss');
          setShowResult(true);
          setTimeout(() => onComplete('miss'), 1500);
          return 100;
        }
        return next;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive, settings.speed, onComplete]);

  const getResultInfo = (resultType: string) => {
    switch (resultType) {
      case 'perfect':
        return { color: '#10b981', emoji: '🎯', text: 'PERFECT!', description: 'Excellent timing! Maximum effect.' };
      case 'good':
        return { color: '#f59e0b', emoji: '✨', text: 'GOOD!', description: 'Well timed! Good results achieved.' };
      case 'okay':
        return { color: '#6b7280', emoji: '👍', text: 'OKAY', description: 'Decent timing. Some progress made.' };
      case 'miss':
        return { color: '#ef4444', emoji: '😵', text: 'MISSED!', description: 'Poor timing. Limited effect.' };
      default:
        return { color: '#6b7280', emoji: '🎯', text: '', description: '' };
    }
  };

  const resultInfo = result ? getResultInfo(result) : null;

  return (
    <div className="pixel-timing-container">
      <div className="timing-header">
        <h3 className="timing-title">TIMING CHALLENGE</h3>
        <div className="action-name">{actionName}</div>
        <div className="difficulty-badge difficulty-{difficulty}">
          {difficulty.toUpperCase()}
        </div>
      </div>

      <div className="timing-bar-container">
        {/* Background bar */}
        <div className="timing-bar-bg">
          {/* Miss zones */}
          <div className="zone miss-zone-left" style={{ width: `${settings.goodZone[0]}%` }} />
          <div className="zone miss-zone-right" style={{ 
            width: `${100 - settings.goodZone[1]}%`,
            left: `${settings.goodZone[1]}%`
          }} />
          
          {/* Good zones */}
          <div className="zone good-zone-left" style={{ 
            left: `${settings.goodZone[0]}%`,
            width: `${settings.perfectZone[0] - settings.goodZone[0]}%`
          }} />
          <div className="zone good-zone-right" style={{ 
            left: `${settings.perfectZone[1]}%`,
            width: `${settings.goodZone[1] - settings.perfectZone[1]}%`
          }} />
          
          {/* Perfect zone */}
          <div className="zone perfect-zone" style={{ 
            left: `${settings.perfectZone[0]}%`,
            width: `${settings.perfectZone[1] - settings.perfectZone[0]}%`
          }} />

          {/* Pointer */}
          <motion.div 
            className="timing-pointer"
            style={{ 
              left: `${pointerPosition}%`,
              opacity: isActive ? 1 : 0.5
            }}
            animate={{
              y: isActive ? [-2, 2, -2] : [0]
            }}
            transition={{
              duration: 0.3,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Instructions */}
        {!isActive && !showResult && (
          <button 
            className="pixel-button timing-start-button"
            onClick={startTiming}
            disabled={disabled}
          >
            START TIMING
          </button>
        )}

        {isActive && (
          <button 
            className="pixel-button timing-tap-button"
            onClick={handleTap}
          >
            TAP NOW!
          </button>
        )}

        {/* Result display */}
        {showResult && resultInfo && (
          <motion.div 
            className="timing-result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="result-line" style={{ backgroundColor: resultInfo.color }}>
              <span className="result-emoji">{resultInfo.emoji}</span>
              <span className="result-text">{resultInfo.text}</span>
            </div>
            <div className="result-description">
              {resultInfo.description}
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .pixel-timing-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          font-family: "Courier New", monospace;
        }

        .timing-header {
          text-align: center;
          margin-bottom: 16px;
          padding: 8px;
          background: #f3f4f6;
          border: 2px solid #1f2937;
        }

        .timing-title {
          font-size: 0.875rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 4px 0;
          letter-spacing: 0.1em;
        }

        .action-name {
          font-size: 0.75rem;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .difficulty-badge {
          display: inline-block;
          padding: 2px 8px;
          border: 1px solid #1f2937;
          font-size: 0.625rem;
          font-weight: bold;
        }

        .difficulty-easy {
          background: #10b981;
          color: white;
        }

        .difficulty-medium {
          background: #f59e0b;
          color: white;
        }

        .difficulty-hard {
          background: #ef4444;
          color: white;
        }

        .timing-bar-container {
          position: relative;
          margin-bottom: 16px;
        }

        .timing-bar-bg {
          width: 100%;
          height: 40px;
          background: #e5e7eb;
          border: 3px solid #1f2937;
          box-shadow:
            0 0 0 3px #ffffff,
            0 0 0 6px #1f2937,
            4px 4px 0 6px rgba(31, 41, 55, 0.2);
          position: relative;
          overflow: hidden;
          image-rendering: pixelated;
        }

        .zone {
          position: absolute;
          top: 0;
          height: 100%;
          transition: opacity 0.2s;
        }

        .miss-zone-left,
        .miss-zone-right {
          background: linear-gradient(45deg, #fee2e2 25%, #fecaca 25%, #fecaca 50%, #fee2e2 50%, #fee2e2 75%, #fecaca 75%);
          background-size: 8px 8px;
        }

        .good-zone-left,
        .good-zone-right {
          background: linear-gradient(45deg, #fef3c7 25%, #fde68a 25%, #fde68a 50%, #fef3c7 50%, #fef3c7 75%, #fde68a 75%);
          background-size: 6px 6px;
        }

        .perfect-zone {
          background: linear-gradient(45deg, #d1fae5 25%, #a7f3d0 25%, #a7f3d0 50%, #d1fae5 50%, #d1fae5 75%, #a7f3d0 75%);
          background-size: 4px 4px;
          box-shadow: inset 0 0 0 2px #10b981;
        }

        .timing-pointer {
          position: absolute;
          top: -8px;
          width: 6px;
          height: 56px;
          background: #1f2937;
          border: 2px solid #ffffff;
          box-shadow: 2px 2px 0 0 rgba(31, 41, 55, 0.3);
          transform: translateX(-50%);
          z-index: 10;
        }

        .timing-pointer::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 8px;
          background: #ef4444;
          border: 1px solid #1f2937;
        }

        .timing-start-button,
        .timing-tap-button {
          width: 100%;
          padding: 12px;
          margin-top: 12px;
          background: #3b82f6;
          color: white;
          border: 2px solid #1f2937;
          box-shadow:
            0 0 0 2px #ffffff,
            0 0 0 4px #1f2937,
            4px 4px 0 4px rgba(31, 41, 55, 0.2);
          font-family: "Courier New", monospace;
          font-weight: bold;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.1s;
        }

        .timing-tap-button {
          background: #ef4444;
          animation: pulse-glow 0.5s ease-in-out infinite alternate;
        }

        .timing-start-button:hover,
        .timing-tap-button:hover {
          transform: translate(-1px, -1px);
          box-shadow:
            0 0 0 2px #ffffff,
            0 0 0 4px #1f2937,
            5px 5px 0 4px rgba(31, 41, 55, 0.2);
        }

        .timing-start-button:active,
        .timing-tap-button:active {
          transform: translate(1px, 1px);
          box-shadow:
            0 0 0 2px #ffffff,
            0 0 0 4px #1f2937,
            3px 3px 0 3px rgba(31, 41, 55, 0.2);
        }

        .timing-result {
          text-align: center;
          margin-top: 16px;
          padding: 12px;
          background: #f9fafb;
          border: 3px solid #1f2937;
          box-shadow:
            0 0 0 3px #ffffff,
            0 0 0 6px #1f2937,
            4px 4px 0 6px rgba(31, 41, 55, 0.2);
        }

        .result-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          border: 2px solid #1f2937;
          font-weight: bold;
          color: #ffffff;
        }

        .result-emoji {
          font-size: 1.2rem;
        }

        .result-text {
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .result-description {
          font-size: 0.75rem;
          color: #4b5563;
          line-height: 1.3;
        }

        @keyframes pulse-glow {
          0% { 
            box-shadow:
              0 0 0 2px #ffffff,
              0 0 0 4px #1f2937,
              4px 4px 0 4px rgba(31, 41, 55, 0.2);
          }
          100% { 
            box-shadow:
              0 0 0 2px #ffffff,
              0 0 0 4px #ef4444,
              4px 4px 0 4px rgba(239, 68, 68, 0.4);
          }
        }
      `}</style>
    </div>
  );
}