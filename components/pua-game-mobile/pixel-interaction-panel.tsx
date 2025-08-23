import React from "react";
import { Dices } from "lucide-react";
import { PixelDice } from "./pixel-dice";
import { PixelTimingBar } from "./pixel-timing-bar";

interface Choice {
  text: string;
  toolCallId: string;
}

interface PixelInteractionPanelProps {
  interactionMode: "idle" | "choices" | "dice" | "timing";
  currentChoices: Choice[];
  diceValue: number | null;
  isManualRolling: boolean;
  gameStarted: boolean;
  onSelectChoice: (choice: string, toolCallId: string) => void;
  onDiceClick: () => void;
  onSendHelp: () => void;
  onTimingResult?: (result: 'perfect' | 'good' | 'okay' | 'miss') => void;
  timingActionName?: string;
  timingDifficulty?: 'easy' | 'medium' | 'hard';
}

export function PixelInteractionPanel({
  interactionMode,
  currentChoices,
  diceValue,
  isManualRolling,
  gameStarted,
  onSelectChoice,
  onDiceClick,
  onSendHelp,
  onTimingResult,
  timingActionName = "ACTION",
  timingDifficulty = "medium"
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
      <div className="space-y-2">
        <h3 className="pixel-text text-sm font-bold mb-2 text-center">
          CHOOSE ACTION
        </h3>
        {currentChoices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onSelectChoice(choice.text, choice.toolCallId)}
            className="w-full pixel-button px-3 py-2 bg-blue-500 text-white text-left hover:bg-blue-600 transition-colors"
          >
            <span className="pixel-text text-xs">{index + 1}. {choice.text}</span>
          </button>
        ))}
      </div>
    );
  }

  // 显示骰子
  if (interactionMode === "dice") {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-2">
        <h3 className="pixel-text text-sm font-bold">ROLL THE DICE</h3>
        <PixelDice 
          value={diceValue}
          isRolling={isManualRolling}
          onRoll={onDiceClick}
          disabled={isManualRolling || diceValue !== null}
        />
      </div>
    );
  }

  // 显示计时条
  if (interactionMode === "timing") {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-2">
        <h3 className="pixel-text text-sm font-bold">TIMING CHALLENGE</h3>
        <PixelTimingBar 
          onComplete={onTimingResult || (() => {})}
          difficulty={timingDifficulty}
          actionName={timingActionName}
        />
      </div>
    );
  }

  // 空闲状态
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-3">
      <p className="pixel-text text-center text-gray-600 text-sm">
        Waiting for next action...
      </p>
      <button
        onClick={onSendHelp}
        className="pixel-button px-4 py-2 bg-gray-500 text-white text-sm"
      >
        REQUEST HELP
      </button>
    </div>
  );
}

