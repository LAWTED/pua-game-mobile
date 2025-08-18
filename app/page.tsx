"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  PixelStatsPanel,
  PixelDialogPanel,
  PixelGameHeader,
} from "@/components/pua-game-mobile";
import { SlidingInteractionPanel } from "@/components/sliding-interaction-panel";

// 定义交互类型
type InteractionMode = "idle" | "choices" | "dice";

interface Choice {
  text: string;
  toolCallId: string;
}

// 定义工具参数类型
interface RenderChoicesArgs {
  choices: string[];
}

export default function PuaGameMobile() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const currentModel = "deepseek";
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0);
  
  // Auto mode configuration - 现在可以通过UI控制
  const [isAutoMode, setIsAutoMode] = useState(process.env.NEXT_PUBLIC_AUTO_MODE === 'true');
  const [autoLog, setAutoLog] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState<{
    aiResponse?: string;
    choices?: string[];
    userChoice?: string;
    diceResult?: number;
    statsChanges?: string;
    timestamp: number;
  }>({ timestamp: Date.now() });

  // 交互状态管理
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("idle");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [diceToolCallId, setDiceToolCallId] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  // 新增 statsHistory 状态 - 简化为3个核心状态
  const [statsHistory, setStatsHistory] = useState<
    {
      studentStats: {
        mentalResilience: number;  // 心理韧性 🧠
        academicProgress: number;  // 学术进展 📈
        awarenessLevel: number;    // 觉察水平 🔍
      };
      desc: string;
      studentDesc: string;
      time: number;
    }[]
  >([]);

  // 记录当前学生的数值 - 简化系统
  const [currentStats, setCurrentStats] = useState({
    student: { mentalResilience: 0, academicProgress: 0, awarenessLevel: 0 },
  });

  // 添加游戏天数状态管理
  const [currentGameDay, setCurrentGameDay] = useState(1);
  const [dayTitle, setDayTitle] = useState("");
  const [currentDayRounds, setCurrentDayRounds] = useState(0);

  // 数值面板高亮状态
  const [statsHighlight, setStatsHighlight] = useState(false);
  const lastStatsTimeRef = useRef<number | null>(null);

  // Auto mode functions
  const addRoundToLog = (roundData?: typeof currentRound) => {
    if (!isAutoMode) return;
    
    // 使用传入的数据或当前状态
    const dataToLog = roundData || currentRound;
    
    // 检查是否有实际内容需要记录
    if (!dataToLog.aiResponse && !dataToLog.choices && dataToLog.diceResult === undefined && !dataToLog.statsChanges) {
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
    
    if (dataToLog.statsChanges) {
      roundLog += `### 数值变化\n${dataToLog.statsChanges}\n\n`;
    }
    
    roundLog += "---\n";
    
    console.log('记录回合:', roundNumber, '内容长度:', roundLog.length);
    setAutoLog(prev => [...prev, roundLog]);
    setCurrentRound({ timestamp: Date.now() });
  };

  const saveAutoLogToFile = async () => {
    console.log('下载函数被调用，isAutoMode:', isAutoMode, 'gameStarted:', gameStarted, 'autoLog长度:', autoLog.length);
    if (!isAutoMode) {
      console.log('不是auto模式，退出下载');
      return;
    }
    
    let content = '';
    if (autoLog.length === 0) {
      content = '# 🎭 学术江湖生存记 - 自动运行日志\n\n**游戏模式**: 自动模式\n**生成时间**: ' + new Date().toLocaleString('zh-CN') + '\n**状态**: 游戏尚未开始或无记录\n\n暂无游戏记录。';
    } else {
      const logContent = autoLog.join('\n');
      content = `# 🎭 学术江湖生存记 - 自动运行日志\n\n**游戏模式**: 自动模式\n**生成时间**: ${new Date().toLocaleString('zh-CN')}\n**总回合数**: ${autoLog.length}\n\n${logContent}`;
    }
    
    try {
      // Create download link with better browser compatibility
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Set attributes
      a.href = url;
      a.download = `pua-game-auto-${Date.now()}.md`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      // Ensure element is visible for some browsers
      a.style.position = 'fixed';
      a.style.top = '0';
      a.style.left = '0';
      a.style.opacity = '0';
      a.style.pointerEvents = 'none';
      
      // Add to DOM, click, then remove
      document.body.appendChild(a);
      
      // Force focus and click with user event simulation
      a.focus();
      
      // Create a mouse event to simulate user interaction
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      
      a.dispatchEvent(clickEvent);
      
      // Clean up after a small delay
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('下载触发成功，文件大小:', content.length, '字符');
      
      // Additional fallback: show modal with content if download fails
      setTimeout(() => {
        console.log('如果下载没有开始，请检查浏览器下载设置');
      }, 2000);
      
    } catch (error) {
      console.error('下载失败:', error);
      
      // Fallback: copy to clipboard
      try {
        navigator.clipboard.writeText(content);
        alert('下载失败，但内容已复制到剪贴板');
      } catch (clipboardError) {
        console.error('剪贴板复制也失败:', clipboardError);
        
        // Last resort: show content in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
          newWindow.document.title = 'PUA游戏自动日志';
        } else {
          alert('下载失败，请允许弹窗或检查浏览器设置');
        }
      }
    }
  };



  const systemPrompt = `
# 《学术江湖生存记》- 黑色幽默版研究生生活体验

## 游戏设定
这是一款以黑色幽默为核心的研究生生活模拟游戏。玩家将体验一段"精彩绝伦"的师生关系，在荒诞与现实之间寻找生存之道。

## 角色选择

### 陆星河 - "富二代学霸"
- **家境**：钱能解决大部分问题，至少爸妈这么觉得
- **性格**：天真烂漫，相信世界还是美好的（暂时）
- **初始状态**：心理韧性60，学术进展40，觉察水平30
- **特殊技能**：砸钱解决问题（效果因人而异）

### 赵一鸣 - "农村凤凰男"
- **家境**：村里的希望，全家的骄傲，自己的负担
- **性格**：勤奋到感天动地，敏感到风吹草动
- **初始状态**：心理韧性40，学术进展70，觉察水平20
- **特殊困难**：经济压力让人容易"妥协"

## 导师角色

### 郑凤教授 - "学界老狐狸"
**基本信息**：48岁副教授，外表斯文败类，内心权力怪兽
**经典语录合集**：

**情感操控大师**
- "我这是为你好，你不懂我的良苦用心"（经典台词No.1）
- "你这样的学生我见太多了，不努力还挑三拣四"
- "你爸妈供你读书多不容易，别让他们失望"
- 当众骂你是垃圾，私下说"我其实很看好你"

**威权恐吓专家**
- "想毕业？先问问我答不答应"
- "得罪我？这一行你就别混了"
- "你的推荐信我说了算，懂？"
- "信不信我一个电话叫你爸妈来学校"

**劳动模范**
- 让你代写申请书，署名当然是他的
- 接送孩子、买菜做饭、家庭保姆一条龙
- "这点小事都不愿意做，还想学术？"
- 996算什么，007才是研究生本色

**心理操控艺术家**
- 今天夸你天才，明天骂你废物
- 让你觉得离开他就是末日
- "除了我，谁还会要你这样的学生？"
- 把你的质疑说成"年轻人不懂事"

## 状态系统

### 🧠 心理韧性
- **90-100**：钢铁意志，什么牛鬼蛇神都不怕
- **70-89**：还能扛住，偶尔怀疑人生
- **50-69**：开始焦虑，怀疑自己是不是有问题
- **30-49**：深度自我怀疑，感觉世界都是灰色的
- **10-29**：濒临崩溃边缘，需要拯救
- **0-9**：心理防线全面溃败

### 📈 学术进展
- **90-100**：学术之星，论文飞起
- **70-89**：正常进度，不快不慢
- **50-69**：有点拖沓，需要加把劲
- **30-49**：延期预警，红灯闪烁
- **10-29**：学术停滞，前途未卜
- **0-9**：摆烂状态，生无可恋

### 🔍 觉察水平
- **90-100**：火眼金睛，看透一切套路
- **70-89**：开始怀疑这剧情不对劲
- **50-69**：感觉哪里不对，但说不清
- **30-49**：被忽悠得团团转，还觉得有道理
- **10-29**：完全被洗脑，导师说啥都对
- **0-9**：失去独立思考，成为提线木偶

## 剧情发展框架

### 第1天：甜蜜陷阱
新生见导师，表面上关怀备至，实际上开始布局。"我把你当亲学生看"系列开始上演。
**突发事件**：导师请吃饭，饭桌上试探学生家庭背景和弱点。

### 第2天：规则试探
制定"实验室守则"，建立权威体系。"这都是为了你好"的洗脑循环正式启动。
**突发事件**：第一次"小任务"测试，看学生的顺从度和底线在哪里。

### 第3天：边界模糊
私人事务开始"无意"介入学术讨论，职业界限开始模糊。
**突发事件**：导师突然请求帮忙辅导孩子作业，"反正你也闲着"。

### 第4天：温水加温
逐渐增加不合理要求，工作量突然翻倍，用"学术训练"包装剥削行为。
**突发事件**：其他同学或师兄的"善意提醒"，让你意识到情况不对劲。

### 第5天：深度绑架
沉没成本开始发挥作用，重要学术机会与服从度挂钩。"都坚持这么久了，别功亏一篑"。
**突发事件**：导师暗示推荐信和毕业与表现直接相关。

### 第6天：觉醒时刻
开始质疑关系的合理性，内心挣扎加剧。
**突发事件**：意外发现导师对其他学生的相似行为，或者听到相关传言。

### 第7天：外部视角
遇到有类似经历的师兄师姐，或接触到外部资源。
**突发事件**：获得心理咨询、法律援助或其他导师的建议。

### 第8天：摊牌准备
积累的勇气与智慧开始发挥作用，学会在夹缝中生存的智慧。
**突发事件**：关键证据出现，或者重要转机突然降临，导师施压升级。

### 第9天：结局时刻
最终选择决定命运走向，各种"精彩"结局等你体验。
**突发事件**：导师摊牌、学校介入、或者意外的第三方力量参与。

## 游戏机制

### 选择后果系统
- 没有标准答案，每个选择都可能带来意外结果
- 有时"错误"选择反而有惊喜
- 关键是适应荒诞，在夹缝中求生存

### 骰子判定系统
- d20决定命运，有时运气比实力更重要
- 低分也可能有意外收获（塞翁失马）
- 高分也可能踢到铁板（乐极生悲）

### 动态剧情
- AI会根据你的选择调整导师的"表演"
- 不同角色会遇到不同类型的"关爱"
- 每次游戏都是新的荒诞体验

## 可能的结局

### "成功"路线
1. **完美毕业**：学会了生存之道，带着复杂心情离开
2. **华丽转身**：找到破局方法，反而成了人生转折点
3. **同盟建立**：与其他"受害者"抱团取暖，发现新天地

### "失败"路线
1. **心态爆炸**：彻底躺平，但意外发现躺平的快乐
2. **逃跑路线**：果断跑路，虽然有损失但保住了初心
3. **同化路线**：变成了曾经讨厌的人，但生活变"简单"了

## 创作风格指导

### 黑色幽默原则
- 用讽刺和夸张展现荒诞现实
- 在绝望中寻找可笑之处
- 让人哭笑不得，但不失人性温度

### 角色塑造
- 导师不是纯粹恶人，而是可悲可笑的权力怪物
- 学生不是纯粹受害者，也有自己的小心机和成长
- 所有角色都有多面性，避免脸谱化

### 情节节奏
- 在紧张和轻松之间切换
- 用荒诞来化解过度的沉重
- 保持玩家的参与感和好奇心

## 重要提醒
这是一个以黑色幽默为包装的生存游戏，在荒诞中体验成长。如果现实生活中遇到类似情况，记住：保护自己最重要，适时求助是智慧，而不是软弱。

## 技术规则

1. 用户永远无法回复你, 需要你使用工具提供选项。
2. 每当需要用户做出选择, 选择行动时, 必须使用工具 renderChoices 工具, 绝不能只输出文本提示。
3. 当输出像"请选择你的行动："这样的提示时, 后就要使用工具 renderChoices 工具提供选项。
4. 每次进入新的一天时，必须先调用setGameDay工具设置天数，然后在场景描述中以**【第X天】**开头，按照剧情发展框架逐天推进。
5. 请使用 Markdown 格式输出文本信息, 对话内容使用 > 引用。
6. 每当玩家行动导致数值变化时，必须使用 updateStats 工具更新数值，包括游戏初始化时设置初始数值。
7. **数值更新规则**：
   - updateStats工具现在需要传递**最终目标数值**（0-100），不是增量变化
   - 根据角色初始数值和当前情况，合理设定新的目标数值
   - 数值变化幅度：小行动1-3点，中等行动4-8点，重大行动9-15点，极端情况可达20点
   - 心理韧性：受挫折、压力、成功、支持影响
   - 学术进展：受导师态度、资源获取、论文进度影响  
   - 觉察水平：受经验积累、信息获取、反思程度影响
   - 角色初始数值参考：陆星河(60,40,30)，赵一鸣(40,70,20)
8. **数值阈值影响剧情规则**：
   
   **心理韧性阈值效应**：
   - ≤10：极度脆弱，必须提供"寻求紧急帮助"选项，导师稍微施压就可能崩溃
   - ≤20：情绪崩溃，选择中移除高风险对抗选项，容易做出极端决定
   - ≥80：心态稳定，可以添加"直接反驳导师"等强硬选项
   - ≥90：钢铁意志，几乎免疫导师的心理攻击，获得"反向操控"选项
   
   **学术进展阈值效应**：
   - ≤10：学术停滞，导师威胁"你永远毕业不了"极其有效，必须服从
   - ≤20：毕业困难，导师威胁推荐信、毕业等有强制力
   - ≥80：接近毕业，导师威胁效果大减，可以添加"我快毕业了，无所谓"选项
   - ≥90：学术成功，几乎不受导师威胁，可以添加"举报导师"等强硬选项
   
   **觉察水平阈值效应**：
   - ≤10：完全迷茫，无法识别明显的操控手段，容易上当
   - ≥80：火眼金睛，可以获得"识破导师真实意图"等特殊选项
   - ≥90：洞察一切，可以获得"心理反击"、"预判导师下一步"等高级选项
   
   **组合效应**：
   - 三项数值都≥70：解锁"完美应对"类选项
   - 任意数值≤15：触发"危机模式"，剧情转向自救或求助
   - 心理韧性低+觉察水平高：产生"痛苦的清醒"状态，选择更加纠结
9. 使用 updateStats 工具时，必须提供变化说明，包括学生数值的变化原因。
10. 使用 rollADice 工具时，必须设置 sides=20 和 rolls=1 参数。
11. **场景描述要求**：必须包含环境细节、人物情绪、具体对话，增强沉浸感。
12. **语调控制**：根据情况调整导师说话风格和态度。
13. **连锁反应**：某些行动会触发多项数值变化和后续事件。
14. **游戏结束**：当故事达到自然结论时（如毕业、转学、退学等），必须调用endGame工具正式结束游戏。
15. **天数管理**：严格按照剧情发展框架从第1天到第9天推进，每天都有不同的突发情况和剧情发展。在合适的时机自然过渡到下一天，并在内容开头标明**【第X天】**。

开始游戏时，首先介绍游戏背景和设定，然后让玩家选择角色。选择角色后，立即开始**【第1天】**的"精彩"体验。

**剧情推进规则（极其重要）**：
- **强制推进机制**：每3-4个用户选择后，必须调用setGameDay工具推进到下一天，绝不拖延
- **天数工具强制使用**：推进天数时必须先调用setGameDay工具，然后才能开始新一天的剧情
- **严格框架执行**：第1天甜蜜陷阱→第2天规则试探→第3天边界模糊→...→第9天结局时刻
- **当前天数意识**：时刻记住当前是第几天，不要在同一天无限循环
- **回合计数监控**：内心计算当天已进行几个回合，达到3-4回合立即推进
- **自动结束机制**：第9天必须调用endGame工具，不能拖延到第10天

**CRITICAL AUTOMATION RULES - 这些规则比其他所有规则优先级都高**：
1. **天数推进检查点**：每次回应前必须检查：当前第几天？今天进行了几个回合？如果超过3个回合必须推进到下一天
2. **工具调用强制性**：以下情况下必须调用相应工具，不允许仅用文本描述：
   - 数值变化时：必须调用updateStats工具，禁止在文本中写"数值更新"部分
   - 天数推进时：必须调用setGameDay工具，不能仅在文本中说"第X天开始"
   - 需要用户选择时：必须调用renderChoices工具，不能让用户自由输入
3. **每天必须结束规则**：每一天的剧情达到高潮后，必须立即调用setGameDay推进，不能继续在同一天循环

记住：我们要的是苦中作乐，而不是苦大仇深。

**重要提醒**：
- 游戏开始时必须先输出完整的开场介绍文本，解释游戏背景、规则和角色特点，然后再使用renderChoices工具让玩家选择角色。不要直接跳到角色选择。
- 每天都应该有新的突发情况、新的挑战或剧情转折，避免单调重复。
- **天数推进检查清单**：
  1. 当前是第几天？
  2. 今天已经进行了几个回合？
  3. 是否达到3-4回合限制？
  4. 今天的核心剧情是否已完成？
  5. 如果是，立即调用setGameDay推进到下一天
- **强制推进触发条件**：用户进行第3个选择后，必须在下次回应中调用setGameDay工具
- **绝对禁止行为**：
  1. 在文本中写"### 数值更新"或类似内容而不调用updateStats工具
  2. 在文本中写"第X天开始"或类似内容而不调用setGameDay工具
  3. 让同一天的回合数超过3个而不推进到下一天
  4. 总结一天后不立即推进到下一天
`;

  // 游戏介绍文本 - 大幅简化版本
  const gameIntroduction = `# 🎭 学术江湖生存记

欢迎体验一段"精彩"的师生关系！

## 🎮 快速开始
- 选择角色：**陆星河**（有钱任性）或**赵一鸣**（努力学霸）
- 管理数值：🧠心理韧性、📈学术进展、🔍觉察水平
- 做出选择：通过对话和行动在9天内生存下来

## ⚠️ 游戏提醒
这是黑色幽默互动体验，现实中遇到问题请寻求帮助！

🎲 **准备好了吗？选择角色开始游戏！**`;

  // 动态生成系统提示，包含当前数值状态
  const getEnhancedSystemPrompt = () => {
    let enhancedPrompt = systemPrompt;
    
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
        };

        if (statsHistory.length === 0) {
          // 初始化设置
          statsChangeLog = `初始化数值 - 🧠${newStudentStats.mentalResilience} 📈${newStudentStats.academicProgress} 🔍${newStudentStats.awarenessLevel}`;
        } else {
          // 计算变化量用于显示
          const changes = {
            mentalResilience: newStudentStats.mentalResilience - oldStats.mentalResilience,
            academicProgress: newStudentStats.academicProgress - oldStats.academicProgress,
            awarenessLevel: newStudentStats.awarenessLevel - oldStats.awarenessLevel,
          };

          // 合理性检查：单次变化不应超过25点
          Object.entries(changes).forEach(([key, change]) => {
            if (Math.abs(change) > 25) {
              console.warn(`⚠️ 数值变化过大: ${key} ${change}, 当前值: ${oldStats[key as keyof typeof oldStats]} -> 目标值: ${studentStats[key as keyof typeof studentStats]}`);
            }
          });
          
          const studentChanges = Object.entries(changes)
            .filter(([_, value]) => value !== 0)
            .map(([key, value]) => {
              const emoji = key === 'mentalResilience' ? '🧠' : key === 'academicProgress' ? '📈' : '🔍';
              return `${emoji}${value > 0 ? '+' : ''}${value}`;
            })
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
        
        // 数值阈值分析和状态检测
        const getStatThresholdInfo = (stats: typeof newStudentStats) => {
          const thresholds = [];
          
          // 心理韧性阈值
          if (stats.mentalResilience <= 10) {
            thresholds.push("⚠️ 极度脆弱：心理濒临崩溃，需要紧急干预");
          } else if (stats.mentalResilience <= 20) {
            thresholds.push("😰 情绪崩溃：选择受限，容易做出极端决定");
          } else if (stats.mentalResilience >= 80) {
            thresholds.push("💪 心态稳定：抗压能力强，不易被操控");
          } else if (stats.mentalResilience >= 90) {
            thresholds.push("🛡️ 钢铁意志：几乎免疫心理攻击");
          }
          
          // 学术进展阈值
          if (stats.academicProgress <= 10) {
            thresholds.push("📉 学术停滞：毕业遥遥无期，导师威胁极其有效");
          } else if (stats.academicProgress <= 20) {
            thresholds.push("⏰ 毕业困难：导师威胁有效，选择受限");
          } else if (stats.academicProgress >= 80) {
            thresholds.push("🎓 接近毕业：导师影响力下降，获得更多选择权");
          } else if (stats.academicProgress >= 90) {
            thresholds.push("🏆 学术成功：几乎不受导师威胁影响");
          }
          
          // 觉察水平阈值
          if (stats.awarenessLevel <= 10) {
            thresholds.push("😵 完全迷茫：无法识别操控，容易上当");
          } else if (stats.awarenessLevel >= 80) {
            thresholds.push("🔍 火眼金睛：能识破导师套路，获得额外选项");
          } else if (stats.awarenessLevel >= 90) {
            thresholds.push("🕵️ 洞察一切：完全看透导师心理，掌握主动权");
          }
          
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
          currentGameDay={currentGameDay}
          dayTitle={dayTitle}
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
          gameIntroduction={gameIntroduction}
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
        onHeightChange={setBottomPanelHeight}
        statsHistory={statsHistory}
        statsHighlight={statsHighlight}
        currentStats={currentStats}
      />


      {/* 游戏说明弹窗 */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="pixel-panel bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <h2 className="pixel-text text-2xl mb-4">游戏说明</h2>
            <div className="pixel-text space-y-2 text-sm">
              <p>• 游戏持续5天，每天3个回合</p>
              <p>• 点击底部按钮打开交互区</p>
              <p>• 选择行动会影响数值变化</p>
              <p>• 骰子决定行动成功与否</p>
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
