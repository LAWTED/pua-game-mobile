"use client";

import { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import {
  PixelDialogPanel,
  PixelGameHeader,
} from "@/components/pua-game-mobile";
import { SlidingInteractionPanel } from "@/components/sliding-interaction-panel";
import { SYSTEM_PROMPT, GAME_INTRODUCTION, CHARACTERS, STAT_EMOJIS, type CharacterType } from "@/lib/game-config";
import { useGameState } from "@/hooks/useGameState";

// 定义工具参数类型
interface RenderChoicesArgs {
  choices: string[];
}

export default function PuaGameMobile() {
  // 使用自定义hook管理游戏状态
  const gameState = useGameState();
  const {
    showInstructions, setShowInstructions,
    isManualRolling, setIsManualRolling,
    gameStarted, setGameStarted,
    bottomPanelHeight, setBottomPanelHeight,
    isAutoMode, setIsAutoMode,
    autoLog, setAutoLog,
    currentRound, setCurrentRound,
    interactionMode, setInteractionMode,
    currentChoices, setCurrentChoices,
    diceToolCallId, setDiceToolCallId,
    diceValue, setDiceValue,
    timingToolCallId, setTimingToolCallId,
    timingActionName, setTimingActionName,
    timingDifficulty, setTimingDifficulty,
    statsHistory, setStatsHistory,
    currentStats, setCurrentStats,
    selectedCharacter, setSelectedCharacter,
    currentGameDay, setCurrentGameDay,
    dayTitle, setDayTitle,
    currentDayRounds, setCurrentDayRounds,
    statsHighlight, setStatsHighlight,
    lastStatsTimeRef,
    collectedEvidence, setCollectedEvidence,
    evidenceCount, setEvidenceCount,
  } = gameState;
  
  const currentModel = "deepseek";

  // Auto mode functions
  const addRoundToLog = (roundData?: typeof currentRound) => {
    if (!isAutoMode) return;
    
    // 使用传入的数据或当前状态
    const dataToLog = roundData || currentRound;
    
    // 检查是否有实际内容需要记录
    if (!dataToLog.aiResponse && !dataToLog.choices && dataToLog.diceResult === undefined && !dataToLog.timingResult && !dataToLog.statsChanges) {
      console.log('跳过空回合记录');
      return;
    }
    
    const timestamp = new Date().toLocaleString('zh-CN');
    const roundNumber = autoLog.length + 1;
    let roundLog = `## 回合 ${roundNumber} - ${timestamp}\n\n`;
    
    if (dataToLog.aiResponse) {
      roundLog += `### AI响应\n${dataToLog.aiResponse}\n\n`;
    }
    
    if (dataToLog.choices && dataToLog.choices.length > 0) {
      roundLog += `### 可选择项\n${dataToLog.choices.map((choice, i) => `${i + 1}. ${choice}`).join('\n')}\n\n`;
      
      if (dataToLog.userChoice) {
        const choiceIndex = dataToLog.choices.indexOf(dataToLog.userChoice) + 1;
        roundLog += `### 玩家选择\n**选择 ${choiceIndex}**: ${dataToLog.userChoice}\n\n`;
      }
    }
    
    if (dataToLog.diceResult !== undefined) {
      roundLog += `### 骰子结果\n🎲 ${dataToLog.diceResult}/20\n\n`;
    }
    
    if (dataToLog.timingResult !== undefined) {
      roundLog += `### 力度条结果\n🎯 ${dataToLog.timingResult}/20\n\n`;
    }
    
    if (dataToLog.statsChanges) {
      roundLog += `### 数值变化\n${dataToLog.statsChanges}\n\n`;
    }
    
    roundLog += "---\n";
    
    console.log('记录回合:', roundNumber, '内容长度:', roundLog.length);
    setAutoLog(prev => [...prev, roundLog]);
    setCurrentRound({ timestamp: Date.now() });
  };

  // Simplified auto log download - removed unused function
  // Note: saveAutoLogToFile was removed as it's not used in the current UI



  // System prompt and game introduction now imported from config

  // 动态生成系统提示，包含当前数值状态
  const getEnhancedSystemPrompt = () => {
    let enhancedPrompt = SYSTEM_PROMPT;
    
    if (gameStarted && currentStats.student) {
      const stats = currentStats.student;
      const statusInfo = `

## 当前游戏状态
**天数**: 第${currentGameDay}天
**当天回合数**: ${currentDayRounds}/3 (超过3个回合必须推进到下一天)

## 当前学生状态  
- 🧠 心理韧性: ${stats.mentalResilience}/100
- 📈 学术进展: ${stats.academicProgress}/100  
- 🔍 觉察水平: ${stats.awarenessLevel}/100

**重要检查**: 
1. 如果当天回合数≥3，必须立即调用setGameDay推进到第${currentGameDay + 1}天
2. 任何数值变化都必须调用updateStats工具，严禁在文本中描述
3. 根据以上数值状态调整剧情和选项，严格遵循数值阈值影响规则`;
      
      enhancedPrompt += statusInfo;
    }
    
    return enhancedPrompt;
  };

  const { messages, append, addToolResult, status } = useChat({
    api: "/api/pua-game",
    body: {
      systemPrompt: getEnhancedSystemPrompt(),
      model: currentModel,
    },
    initialMessages: [],
    maxSteps: 100,
    onFinish: (message, options) => {
      console.log("onFinish", message, options);
      
      if (isAutoMode && message.content && typeof message.content === 'string') {
        // 记录完整的AI响应到当前回合
        setCurrentRound(prev => ({
          ...prev,
          aiResponse: message.content as string
        }));
        
        // 对于没有工具调用的纯对话，也记录到日志
        // 延迟一点时间确保状态更新完成
        setTimeout(() => addRoundToLog(), 200);
      }
    },
    onToolCall: async ({ toolCall }) => {
      console.log("onToolCall", toolCall);
      
      if (toolCall.toolName === "renderChoices" && toolCall.args) {
        const args = toolCall.args as unknown as RenderChoicesArgs;
        const choices = args.choices || [];

        if (isAutoMode && choices.length > 0) {
          // Auto模式：直接返回随机选择的结果
          const randomIndex = Math.floor(Math.random() * choices.length);
          const selectedChoice = choices[randomIndex];
          
          // 更新当前回合信息
          setCurrentRound(prev => ({
            ...prev,
            choices,
            userChoice: selectedChoice
          }));
          
          return selectedChoice;
        } else {
          // 手动模式：设置UI状态等待用户选择
          setCurrentChoices(
            choices.map((choice) => ({
              text: choice,
              toolCallId: toolCall.toolCallId,
            }))
          );
          setInteractionMode("choices");
          return null;
        }
      }

      if (toolCall.toolName === "rollADice") {
        if (isAutoMode) {
          // Auto模式：直接返回随机骰子结果
          const diceResult = Math.floor(Math.random() * 20) + 1;
          
          // 更新当前回合信息
          setCurrentRound(prev => ({
            ...prev,
            diceResult
          }));
          
          return diceResult.toString();
        } else {
          // 手动模式：设置UI状态等待用户投掷
          setDiceToolCallId(toolCall.toolCallId);
          setInteractionMode("dice");
          setDiceValue(null);
          return null;
        }
      }

      if (toolCall.toolName === "timingChallenge") {
        const args = toolCall.args as { actionName: string; difficulty: 'easy' | 'medium' | 'hard' };
        
        if (isAutoMode) {
          // Auto模式：模拟随机力度条结果，直接生成1-20的数值
          let score: number;
          
          if (args.difficulty === 'easy') {
            // 简单：更容易得高分
            score = Math.floor(Math.random() * 15) + 6; // 6-20，偏向高分
          } else if (args.difficulty === 'medium') {
            // 中等：平均分布
            score = Math.floor(Math.random() * 20) + 1; // 1-20
          } else {
            // 困难：更容易得低分
            score = Math.floor(Math.random() * 15) + 1; // 1-15，偏向低分
          }
          
          // 记录结果到自动日志
          setCurrentRound(prev => ({
            ...prev,
            timingResult: score
          }));
          
          return score.toString();
        } else {
          // 手动模式：设置UI状态等待用户计时操作
          setTimingToolCallId(toolCall.toolCallId);
          setTimingActionName(args.actionName);
          setTimingDifficulty(args.difficulty);
          setInteractionMode("timing");
          return null;
        }
      }

      if (toolCall.toolName === "updateStats" && toolCall.args) {
        const {
          studentStats,
          desc,
          studentDesc,
        } = toolCall.args as {
          studentStats: {
            mentalResilience: number;  // 心理韧性 🧠
            academicProgress: number;  // 学术进展 📈
            awarenessLevel: number;    // 觉察水平 🔍
            money: number;             // 金钱 💰
          };
          desc: string;
          studentDesc: string;
        };

        const oldStats = { ...currentStats.student };
        let statsChangeLog = '';

        // 数值合理性检查和约束
        const newStudentStats = {
          mentalResilience: Math.max(0, Math.min(100, Math.round(studentStats.mentalResilience))),
          academicProgress: Math.max(0, Math.min(100, Math.round(studentStats.academicProgress))),
          awarenessLevel: Math.max(0, Math.min(100, Math.round(studentStats.awarenessLevel))),
          money: Math.max(0, Math.min(100, Math.round(studentStats.money || 0))),
        };

        // Helper function to get stat emoji
        const getStatEmoji = (key: string) => {
          return STAT_EMOJIS[key as keyof typeof STAT_EMOJIS] || '';
        };

        if (statsHistory.length === 0) {
          // 初始化设置
          statsChangeLog = `初始化数值 - 🧠${newStudentStats.mentalResilience} 📈${newStudentStats.academicProgress} 🔍${newStudentStats.awarenessLevel} 💰${newStudentStats.money}`;
        } else {
          // 计算变化量用于显示
          const changes = {
            mentalResilience: newStudentStats.mentalResilience - oldStats.mentalResilience,
            academicProgress: newStudentStats.academicProgress - oldStats.academicProgress,
            awarenessLevel: newStudentStats.awarenessLevel - oldStats.awarenessLevel,
            money: newStudentStats.money - (oldStats.money || 0),
          };

          // 合理性检查：单次变化不应超过25点
          Object.entries(changes).forEach(([key, change]) => {
            if (Math.abs(change) > 25) {
              console.warn(`⚠️ 数值变化过大: ${key} ${change}, 当前值: ${oldStats[key as keyof typeof oldStats]} -> 目标值: ${studentStats[key as keyof typeof studentStats]}`);
            }
          });
          
          const studentChanges = Object.entries(changes)
            .filter(([_, value]) => value !== 0)
            .map(([key, value]) => `${getStatEmoji(key)}${value > 0 ? '+' : ''}${value}`)
            .join(' ');
          
          statsChangeLog = `${studentChanges || '无变化'} | ${desc}`;
        }
        
        // 更新当前回合信息
        if (isAutoMode) {
          setCurrentRound(prev => ({
            ...prev,
            statsChanges: statsChangeLog
          }));
          
          // 数值更新通常是回合的结束，记录日志
          setTimeout(() => addRoundToLog(), 100);
        }
        
        // Enhanced stats threshold analysis with early victory detection
        const getStatThresholdInfo = (stats: typeof newStudentStats) => {
          const thresholds: string[] = [];
          
          // Check for early victory conditions first
          const earlyVictoryConditions = [
            {
              condition: stats.academicProgress >= 90 && stats.awarenessLevel >= 85,
              type: "学术大师",
              desc: "🏆 学术大师：学术成就与智慧并存，可提前毕业"
            },
            {
              condition: stats.mentalResilience >= 90 && stats.awarenessLevel >= 90,
              type: "心理大师", 
              desc: "🧠 心理大师：钢铁意志与洞察力完美结合，无所畏惧"
            },
            {
              condition: stats.academicProgress >= 80 && stats.awarenessLevel >= 80 && stats.mentalResilience >= 80,
              type: "完美应对",
              desc: "✨ 完美应对：三项能力均衡发展，游刃有余"
            },
            {
              condition: evidenceCount >= 3 && stats.awarenessLevel >= 75 && stats.mentalResilience >= 70,
              type: "证据大师",
              desc: "🕵️ 证据大师：收集充分证据，掌握主动权"
            }
          ];

          const matchingVictory = earlyVictoryConditions.find(v => v.condition);
          if (matchingVictory && currentGameDay <= 6) {
            thresholds.push(`🎊 提前胜利触发：${matchingVictory.desc}`);
            
            // Trigger early victory if conditions met before day 6
            setTimeout(() => {
              console.log(`🎊 提前胜利条件达成：${matchingVictory.type}`);
              // This could trigger an early game end in future versions
            }, 100);
          }
          
          // Define threshold rules as data
          const rules = [
            { stat: stats.mentalResilience, ranges: [
              { max: 10, emoji: "⚠️", desc: "极度脆弱：心理濒临崩溃，需要紧急干预" },
              { max: 20, emoji: "😰", desc: "情绪崩溃：选择受限，容易做出极端决定" },
              { min: 90, emoji: "🛡️", desc: "钢铁意志：几乎免疫心理攻击" },
              { min: 80, emoji: "💪", desc: "心态稳定：抗压能力强，不易被操控" }
            ]},
            { stat: stats.academicProgress, ranges: [
              { max: 10, emoji: "📉", desc: "学术停滞：毕业遥遥无期，导师威胁极其有效" },
              { max: 20, emoji: "⏰", desc: "毕业困难：导师威胁有效，选择受限" },
              { min: 90, emoji: "🏆", desc: "学术成功：几乎不受导师威胁影响" },
              { min: 80, emoji: "🎓", desc: "接近毕业：导师影响力下降，获得更多选择权" }
            ]},
            { stat: stats.awarenessLevel, ranges: [
              { max: 10, emoji: "😵", desc: "完全迷茫：无法识别操控，容易上当" },
              { min: 90, emoji: "🕵️", desc: "洞察一切：完全看透导师心理，掌握主动权" },
              { min: 80, emoji: "🔍", desc: "火眼金睛：能识破导师套路，获得额外选项" }
            ]}
          ];
          
          rules.forEach(({ stat, ranges }) => {
            const match = ranges.find(range => 
              (range.max !== undefined && stat <= range.max) ||
              (range.min !== undefined && stat >= range.min)
            );
            if (match) {
              thresholds.push(`${match.emoji} ${match.desc}`);
            }
          });
          
          return thresholds;
        };

        const thresholdInfo = getStatThresholdInfo(newStudentStats);
        if (thresholdInfo.length > 0) {
          console.log("📊 数值阈值状态:", thresholdInfo.join(" | "));
        }

        setCurrentStats({
          student: newStudentStats,
        });

        setStatsHistory((prev) => [
          {
            studentStats: newStudentStats,
            desc,
            studentDesc,
            time: Date.now(),
            thresholdInfo, // 保存阈值信息
          },
          ...prev,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return "updateStats";
      }


      if (toolCall.toolName === "setGameDay" && toolCall.args) {
        const args = toolCall.args as unknown as { 
          day: number; 
          dayTitle: string; 
          summary: string; 
        };
        
        console.log(`天数推进: 第${args.day}天 - ${args.dayTitle}`);
        if (args.summary) {
          console.log(`前一天总结: ${args.summary}`);
        }
        
        setCurrentGameDay(args.day);
        setDayTitle(args.dayTitle);
        // 重置当天回合数
        setCurrentDayRounds(0);
        
        // 如果是自动模式，记录天数推进
        if (isAutoMode) {
          setCurrentRound(prev => ({
            ...prev,
            aiResponse: `**【第${args.day}天】${args.dayTitle}**\n\n${args.summary ? `昨日回顾：${args.summary}\n\n` : ''}开始新的一天...`
          }));
        }
        
        return `已推进到第${args.day}天 - ${args.dayTitle}`;
      }

      if (toolCall.toolName === "endGame" && toolCall.args) {
        const args = toolCall.args as unknown as { 
          ending: string; 
          summary: string; 
          finalMessage: string; 
        };
        
        console.log(`游戏结束 - 结局: ${args.ending}`);
        console.log(`结局总结: ${args.summary}`);
        console.log(`最终消息: ${args.finalMessage}`);
        
        // 可以在这里设置游戏结束状态
        // setGameEnded(true); // 如果需要的话
        
        return `游戏已结束 - ${args.ending}`;
      }

      if (toolCall.toolName === "triggerEarlyVictory" && toolCall.args) {
        const args = toolCall.args as unknown as { 
          victoryType: string; 
          achievedDay: number; 
          finalStats: {
            mentalResilience: number;
            academicProgress: number;
            awarenessLevel: number;
          };
          victoryMessage: string; 
        };
        
        console.log(`🎊 提前胜利！类型: ${args.victoryType}`);
        console.log(`📅 达成天数: 第${args.achievedDay}天`);
        console.log(`📊 最终数值: 🧠${args.finalStats.mentalResilience} 📈${args.finalStats.academicProgress} 🔍${args.finalStats.awarenessLevel}`);
        console.log(`🎉 胜利消息: ${args.victoryMessage}`);
        
        // 记录提前胜利到自动日志
        if (isAutoMode) {
          const victoryLog = `## 🎊 提前胜利达成 - ${new Date().toLocaleString('zh-CN')}

### 胜利类型
${args.victoryType}

### 达成天数
第${args.achievedDay}天

### 最终数值
- 🧠 心理韧性: ${args.finalStats.mentalResilience}
- 📈 学术进展: ${args.finalStats.academicProgress}  
- 🔍 觉察水平: ${args.finalStats.awarenessLevel}

### 胜利消息
${args.victoryMessage}

---
**游戏提前结束，恭喜获得特殊结局！**`;
          
          setAutoLog(prev => [...prev, victoryLog]);
        }
        
        return `🎊 提前胜利达成 - ${args.victoryType}！第${args.achievedDay}天完成突破性成就`;
      }

      if (toolCall.toolName === "collectEvidence" && toolCall.args) {
        const args = toolCall.args as unknown as { 
          evidenceType: string; 
          evidenceDescription: string; 
          importance: string; 
        };
        
        const evidenceEntry = `[${args.evidenceType}] ${args.evidenceDescription} (重要程度: ${args.importance})`;
        console.log(`📋 收集证据: ${evidenceEntry}`);
        
        // 更新证据列表
        setCollectedEvidence(prev => [...prev, evidenceEntry]);
        setEvidenceCount(prev => prev + 1);
        
        // 记录证据收集到自动日志
        if (isAutoMode) {
          setCurrentRound(prev => ({
            ...prev,
            aiResponse: prev.aiResponse ? prev.aiResponse + `\n\n📋 **收集证据**: ${evidenceEntry}` : `📋 **收集证据**: ${evidenceEntry}`
          }));
        }
        
        // 高重要性证据可能影响提前胜利条件
        let bonusMessage = "";
        if (args.importance === "关键" && evidenceCount >= 2) {
          bonusMessage = " - 关键证据收集完成，大幅提升觉察水平！";
        } else if (args.importance === "高") {
          bonusMessage = " - 重要证据到手，觉察水平提升！";
        }
        
        return `📋 证据收集成功${bonusMessage}`;
      }
      if (toolCall.toolName === "getGameStatus") {
        // 返回当前游戏状态
        const includeStats = (toolCall.args as any)?.includeStats ?? true;
        
        let statusInfo = `【第${currentGameDay}天】`;
        if (dayTitle) {
          statusInfo += ` ${dayTitle}`;
        }
        
        if (includeStats && currentStats.student) {
          const { mentalResilience, academicProgress, awarenessLevel, money } = currentStats.student;
          statusInfo += `\n当前数值：🧠${mentalResilience} 📈${academicProgress} 🔍${awarenessLevel} 💰${money || 0}`;
          
          if (evidenceCount > 0) {
            statusInfo += `\n证据数量：${evidenceCount}份`;
          }
        }
        
        return statusInfo;
      }

      return null;
    },
  });

  // 游戏天数现在通过setGameDay工具调用更新，不再需要正则表达式检测

  // Auto mode: dice auto-handling (choices are handled in onToolCall)
  useEffect(() => {
    if (!isAutoMode || interactionMode !== 'dice') return;
    
    console.log(`[Auto Mode] 检测到骰子模式，将在500ms后自动投掷`);
    const timer = setTimeout(() => {
      if (interactionMode === 'dice') {
        console.log(`[Auto Mode] 执行自动投掷`);
        handleDiceClick(); // Use existing dice click handler
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAutoMode, interactionMode]);

  // Auto mode: timing challenge auto-handling - removed redundant logic
  // Timing challenges are now handled directly in onToolCall for auto mode


  // 监听 statsHistory 变化，高亮数值面板
  useEffect(() => {
    if (statsHistory.length > 0) {
      const latest = statsHistory[0].time;
      if (lastStatsTimeRef.current !== latest) {
        setStatsHighlight(true);
        lastStatsTimeRef.current = latest;
        const timer = setTimeout(() => setStatsHighlight(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [statsHistory]);

  const handleSendHelp = () => {
    append({
      role: "user",
      content: "请给我一些可以选择的行动",
    });
  };

  // 选择一个选项
  const handleSelectChoice = (choice: string, toolCallId: string) => {
    setInteractionMode("idle");
    setCurrentChoices([]);
    
    // 检测角色选择 - simplified character detection
    const availableCharacters = Object.keys(CHARACTERS) as CharacterType[];
    const selectedChar = availableCharacters.find(char => choice.includes(char));
    if (selectedChar && !selectedCharacter) {
      setSelectedCharacter(selectedChar);
      console.log(`角色选择: ${selectedChar}`);
    }
    
    // 增加当天回合数
    setCurrentDayRounds(prev => prev + 1);
    addToolResult({
      toolCallId: toolCallId,
      result: choice,
    });
  };

  // 处理骰子点击
  const handleDiceClick = () => {
    if (!diceToolCallId) return;
    setIsManualRolling(true);
    const randomResult = Math.floor(Math.random() * 20) + 1;
    setTimeout(() => {
      setDiceValue(randomResult);
      setIsManualRolling(false);
      setTimeout(() => {
        addToolResult({
          toolCallId: diceToolCallId,
          result: randomResult.toString(),
        });
        setInteractionMode("idle");
        setDiceValue(null);
        setDiceToolCallId(null);
      }, 2000);
    }, 1500);
  };

  // 处理计时条结果
  const handleTimingResult = (result: 'perfect' | 'good' | 'okay' | 'miss') => {
    if (!timingToolCallId) return;
    
    // 将结果转换为1-20的点数
    const getTimingScore = (result: 'perfect' | 'good' | 'okay' | 'miss'): number => {
      switch (result) {
        case 'perfect': return Math.floor(Math.random() * 4) + 17; // 17-20
        case 'good': return Math.floor(Math.random() * 5) + 12; // 12-16
        case 'okay': return Math.floor(Math.random() * 6) + 6; // 6-11
        case 'miss': return Math.floor(Math.random() * 5) + 1; // 1-5
      }
    };
    
    const score = getTimingScore(result);
    
    // 增加当天回合数
    setCurrentDayRounds(prev => prev + 1);
    
    // 记录结果到自动日志（类似骰子）
    if (isAutoMode) {
      setCurrentRound(prev => ({
        ...prev,
        timingResult: score
      }));
    }
    
    // 显示结果一段时间，然后传递给AI（类似骰子的延迟机制）
    setTimeout(() => {
      addToolResult({
        toolCallId: timingToolCallId,
        result: score.toString(), // 传递数字分数给AI
      });
      
      // 重置状态
      setInteractionMode("idle");
      setTimingToolCallId(null);
    }, 1500); // 给用户时间看到结果
  };

  // Auto mode toggle function
  const handleToggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    
    // 添加提示信息
    if (newAutoMode) {
      console.log('🤖 自动模式已开启 - AI将自动做出选择和投掷骰子');
    } else {
      console.log('👤 手动模式已开启 - 需要手动选择和操作');
    }
  };

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
    append({
      role: "user",
      content: "开始游戏",
    });
  };

  return (
    <div className="min-h-screen pixel-bg flex flex-col">
      {/* 游戏头部 */}
      <div className="bg-gray-100">
        <PixelGameHeader
          onShowInstructions={() => setShowInstructions(true)}
          isAutoMode={isAutoMode}
          onToggleAutoMode={handleToggleAutoMode}
        />
      </div>

      {/* 对话面板 - 始终可见，占据主要空间，动态底部padding */}
      <div
        className="flex-1 px-4 pt-4 transition-all duration-300"
        style={{ paddingBottom: `${Math.max(bottomPanelHeight + 36, 140)}px` }}
      >
        <PixelDialogPanel
          messages={messages}
          status={status}
          gameStarted={gameStarted}
          gameIntroduction={GAME_INTRODUCTION}
        />
      </div>

      {/* 滑动交互面板 - 包含数值面板和交互区 */}
      <SlidingInteractionPanel
        interactionMode={interactionMode}
        currentChoices={currentChoices}
        diceValue={diceValue}
        isManualRolling={isManualRolling}
        gameStarted={gameStarted}
        onSelectChoice={handleSelectChoice}
        onDiceClick={handleDiceClick}
        onSendHelp={handleSendHelp}
        onStartGame={startGame}
        onTimingResult={handleTimingResult}
        timingActionName={timingActionName}
        timingDifficulty={timingDifficulty}
        onHeightChange={setBottomPanelHeight}
        statsHistory={statsHistory}
        statsHighlight={statsHighlight}
        currentStats={currentStats}
        selectedCharacter={selectedCharacter || undefined}
        evidenceCount={evidenceCount}
      />


      {/* 游戏说明弹窗 */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="pixel-panel bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="pixel-text text-2xl mb-4">游戏说明</h2>
            <div className="pixel-text space-y-2 text-sm">
              <p>• 游戏持续多天，根据剧情发展</p>
              <p>• 点击底部按钮打开交互区</p>
              <p>• 选择行动会影响数值变化</p>
              <p>• 🎲骰子挑战：随机事件和运气</p>
              <p>• ⏱️计时挑战：技巧和时机控制</p>
              <p>• 收集证据，寻求支持</p>
              <p>• 保持心理健康很重要</p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="pixel-button mt-4 w-full py-2 bg-red-500 text-white"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
