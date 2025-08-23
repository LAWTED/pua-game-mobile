import React from 'react';
import { Dices } from 'lucide-react';

interface PixelDiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

export function PixelDice({ value, isRolling, onRoll, disabled = false }: PixelDiceProps) {
  const getDiceResult = () => {
    if (value === null) return null;
    if (value >= 16) return { text: 'CRITICAL!', color: '#10b981', emoji: '🔥' };
    if (value >= 12) return { text: 'SUCCESS!', color: '#f59e0b', emoji: '✅' };
    if (value >= 8) return { text: 'PARTIAL', color: '#6b7280', emoji: '⚡' };
    return { text: 'FAILED!', color: '#ef4444', emoji: '💥' };
  };

  const result = getDiceResult();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className={`pixel-dice-enhanced ${isRolling ? 'rolling' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : onRoll}
      >
        {value !== null ? (
          <div className="dice-result">
            <span className="dice-number">{value}</span>
          </div>
        ) : (
          <Dices size={48} className="dice-icon" />
        )}
      </div>

      {result && (
        <div className="pixel-result-panel">
          <div className="result-line" style={{ backgroundColor: result.color }}>
            <span className="result-emoji">{result.emoji}</span>
            <span className="result-text">{result.text}</span>
          </div>
          <div className="result-description">
            {value! >= 16 && "Outstanding success with bonus effects!"}
            {value! >= 12 && value! < 16 && "Success! Your action works as intended."}
            {value! >= 8 && value! < 12 && "Mixed results. Some progress made."}
            {value! < 8 && "Things don't go as planned..."}
          </div>
        </div>
      )}

      <style jsx>{`
        .pixel-dice-enhanced {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 4px solid #1f2937;
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            8px 8px 0 8px rgba(31, 41, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.1s ease;
          font-family: "Courier New", monospace;
          image-rendering: pixelated;
          position: relative;
          overflow: hidden;
        }

        .pixel-dice-enhanced:hover:not(.disabled) {
          transform: translate(-2px, -2px);
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            10px 10px 0 8px rgba(31, 41, 55, 0.3);
        }

        .pixel-dice-enhanced:active:not(.disabled) {
          transform: translate(2px, 2px);
          box-shadow:
            0 0 0 4px #ffffff,
            0 0 0 8px #1f2937,
            6px 6px 0 6px rgba(31, 41, 55, 0.3);
        }

        .pixel-dice-enhanced.disabled {
          cursor: not-allowed;
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .pixel-dice-enhanced.rolling {
          animation: roll-bounce 0.1s infinite alternate;
        }

        .dice-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .dice-number {
          font-size: 3rem;
          font-weight: bold;
          color: #1f2937;
          line-height: 1;
          text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.8);
        }

        .dice-icon {
          color: #4b5563;
          filter: drop-shadow(2px 2px 0px rgba(255, 255, 255, 0.8));
        }

        .pixel-result-panel {
          background: #f9fafb;
          border: 3px solid #1f2937;
          box-shadow: 
            0 0 0 3px #ffffff,
            0 0 0 6px #1f2937,
            4px 4px 0 6px rgba(31, 41, 55, 0.2);
          padding: 12px 16px;
          min-width: 200px;
          text-align: center;
          image-rendering: pixelated;
        }

        .result-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 6px 12px;
          margin-bottom: 8px;
          border: 2px solid #1f2937;
          font-family: "Courier New", monospace;
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
          font-family: "Courier New", monospace;
          font-size: 0.75rem;
          color: #4b5563;
          line-height: 1.3;
          text-align: center;
        }

        @keyframes roll-bounce {
          0% { 
            transform: rotate(-3deg) scale(1); 
          }
          100% { 
            transform: rotate(3deg) scale(1.05); 
          }
        }

        /* Add some sparkle effect for critical hits */
        .pixel-dice-enhanced::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, transparent 40%, #fbbf24, transparent 60%, transparent);
          opacity: 0;
          animation: sparkle 2s ease-in-out infinite;
          z-index: -1;
          pointer-events: none;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: rotate(0deg); }
          50% { opacity: 0.3; transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
}