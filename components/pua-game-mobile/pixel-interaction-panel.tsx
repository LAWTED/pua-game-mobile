import React from "react";
import { Dices } from "lucide-react";

interface Choice {
  text: string;
  toolCallId: string;
}

interface PixelInteractionPanelProps {
  interactionMode: "idle" | "choices" | "dice";
  currentChoices: Choice[];
  diceValue: number | null;
  isManualRolling: boolean;
  gameStarted: boolean;
  onSelectChoice: (choice: string, toolCallId: string) => void;
  onDiceClick: () => void;
  onSendHelp: () => void;
}

export function PixelInteractionPanel({
  interactionMode,
  currentChoices,
  diceValue,
  isManualRolling,
  gameStarted,
  onSelectChoice,
  onDiceClick,
  onSendHelp
}: PixelInteractionPanelProps) {

  // 未开始游戏时不显示内容（由底部按钮处理）
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="pixel-text text-center text-gray-600">
          点击底部按钮开始游戏
        </p>
      </div>
    );
  }

  // 显示选项
  if (interactionMode === "choices" && currentChoices.length > 0) {
    return (
      <div className="space-y-3">
        <h3 className="pixel-text text-lg font-bold mb-4 text-center">
          CHOOSE ACTION
        </h3>
        {currentChoices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onSelectChoice(choice.text, choice.toolCallId)}
            className="w-full pixel-button px-4 py-3 bg-blue-500 text-white text-left hover:bg-blue-600 transition-colors"
          >
            <span className="pixel-text text-sm">{index + 1}. {choice.text}</span>
          </button>
        ))}
      </div>
    );
  }

  // 显示骰子
  if (interactionMode === "dice") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h3 className="pixel-text text-lg font-bold">ROLL THE DICE</h3>

        <div className="relative">
          <button
            onClick={onDiceClick}
            disabled={isManualRolling || diceValue !== null}
            className={`pixel-dice ${isManualRolling ? 'animate-spin' : ''}`}
          >
            {diceValue !== null ? (
              <span className="pixel-text text-4xl font-bold">{diceValue}</span>
            ) : (
              <Dices size={48} />
            )}
          </button>
        </div>

        {diceValue !== null && (
          <div className="pixel-text text-center">
            <p className="text-lg font-bold">RESULT: {diceValue}</p>
            <p className="text-sm text-gray-600 mt-2">
              {diceValue >= 12 ? "SUCCESS!" : "FAILED!"}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 空闲状态
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <p className="pixel-text text-center text-gray-600">
        Waiting for next action...
      </p>
      <button
        onClick={onSendHelp}
        className="pixel-button px-6 py-3 bg-gray-500 text-white"
      >
        REQUEST HELP
      </button>
    </div>
  );
}

// CSS styles in JSX
const styles = `
  .pixel-dice {
    width: 100px;
    height: 100px;
    background: white;
    border: 4px solid #000;
    box-shadow:
      0 0 0 4px #fff,
      0 0 0 8px #000,
      8px 8px 0 8px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.1s;
  }

  .pixel-dice:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow:
      0 0 0 4px #fff,
      0 0 0 8px #000,
      6px 6px 0 6px rgba(0,0,0,0.2);
  }

  .pixel-dice:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// Add styles to component
if (typeof window !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}