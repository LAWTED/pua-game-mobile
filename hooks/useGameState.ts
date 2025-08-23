import { useState, useRef } from 'react';
import { type CharacterType } from '@/lib/game-config';

// 定义交互类型
export type InteractionMode = "idle" | "choices" | "dice" | "timing";

export interface Choice {
  text: string;
  toolCallId: string;
}

export interface CurrentRound {
  aiResponse?: string;
  choices?: string[];
  userChoice?: string;
  diceResult?: number;
  timingResult?: number; // 力度条结果，1-20的数值
  statsChanges?: string;
  timestamp: number;
}

export interface StatsHistoryItem {
  studentStats: {
    mentalResilience: number;  // 心理韧性 🧠
    academicProgress: number;  // 学术进展 📈
    awarenessLevel: number;    // 觉察水平 🔍
    money: number;            // 金钱 💰
  };
  desc: string;
  studentDesc: string;
  time: number;
}

export function useGameState() {
  // 基础状态
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0);
  
  // Auto mode状态
  const [isAutoMode, setIsAutoMode] = useState(process.env.NEXT_PUBLIC_AUTO_MODE === 'true');
  const [autoLog, setAutoLog] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<CurrentRound>({ timestamp: Date.now() });

  // 交互状态管理
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("idle");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [diceToolCallId, setDiceToolCallId] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [timingToolCallId, setTimingToolCallId] = useState<string | null>(null);
  const [timingActionName, setTimingActionName] = useState<string>("ACTION");
  const [timingDifficulty, setTimingDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // 数值系统状态
  const [statsHistory, setStatsHistory] = useState<StatsHistoryItem[]>([]);
  const [currentStats, setCurrentStats] = useState({
    student: { mentalResilience: 0, academicProgress: 0, awarenessLevel: 0, money: 0 },
  });

  // 证据收集系统
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  
  // 角色和游戏进度
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [currentGameDay, setCurrentGameDay] = useState(1);
  const [dayTitle, setDayTitle] = useState("");
  const [currentDayRounds, setCurrentDayRounds] = useState(0);

  // 数值面板高亮状态
  const [statsHighlight, setStatsHighlight] = useState(false);
  const lastStatsTimeRef = useRef<number | null>(null);

  return {
    // 基础状态
    showInstructions, setShowInstructions,
    isManualRolling, setIsManualRolling,
    gameStarted, setGameStarted,
    bottomPanelHeight, setBottomPanelHeight,
    
    // Auto mode状态
    isAutoMode, setIsAutoMode,
    autoLog, setAutoLog,
    currentRound, setCurrentRound,
    
    // 交互状态
    interactionMode, setInteractionMode,
    currentChoices, setCurrentChoices,
    diceToolCallId, setDiceToolCallId,
    diceValue, setDiceValue,
    timingToolCallId, setTimingToolCallId,
    timingActionName, setTimingActionName,
    timingDifficulty, setTimingDifficulty,
    
    // 数值系统
    statsHistory, setStatsHistory,
    currentStats, setCurrentStats,
    
    // 角色和进度
    selectedCharacter, setSelectedCharacter,
    currentGameDay, setCurrentGameDay,
    dayTitle, setDayTitle,
    currentDayRounds, setCurrentDayRounds,
    
    // UI状态
    statsHighlight, setStatsHighlight,
    lastStatsTimeRef,

    // 证据系统
    collectedEvidence, setCollectedEvidence,
    evidenceCount, setEvidenceCount,
  };
}