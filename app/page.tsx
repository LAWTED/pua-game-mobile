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
  const [gameDay, setGameDay] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const currentModel = "deepseek";
  const [bottomPanelHeight, setBottomPanelHeight] = useState(0);

  // 交互状态管理
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("idle");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [diceToolCallId, setDiceToolCallId] = useState<string | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  // 新增 statsHistory 状态
  const [statsHistory, setStatsHistory] = useState<
    {
      studentStats: {
        psi: number;
        progress: number;
        evidence: number;
        network: number;
        money: number;
      };
      professorStats: {
        authority: number;
        risk: number;
        anxiety: number;
      };
      desc: string;
      studentDesc: string;
      professorDesc: string;
      time: number;
    }[]
  >([]);

  // 记录当前学生和教授的数值
  const [currentStats, setCurrentStats] = useState({
    student: { psi: 0, progress: 0, evidence: 0, network: 0, money: 0 },
    professor: { authority: 0, risk: 0, anxiety: 0 },
  });

  // 数值面板高亮状态
  const [statsHighlight, setStatsHighlight] = useState(false);
  const lastStatsTimeRef = useRef<number | null>(null);

  const systemPrompt = `
文本 RPG 游戏《凤舞九天》

## 快速概览
- 天数：5 天（第 5 晚触发最终结算）
- 每天 早上 / 下午 / 晚上 3 回合，共 15 回合
- 结束分支：9 种（4 单人 + 3 群体 + 2 隐藏）

## 世界观浓缩
2025 年，精英高校 "PUA 大学" 由畸形 KPI 驱动，教授们通过精神操控与剥削维持科研数据。
玩家扮演一名博士生，需要在 5 天内 既活下来又不给人生留黑洞。

---

### 学生卡片

| 姓名   | 籍贯      | MBTI | 身份标签    | 特长 & 被动 Talent                    | 初始资源 |
|--------|----------|------|------------|---------------------------------------|----------|
| 陆星河 | 上海     | ENFJ | 富二代      | 金主爸爸：每次执行"资源支援"时，可额外 +10 进度 或 –10 风险 | 💰 80     |
| 赵一鸣 | 河南南阳 | INTJ | 小镇做题家  | 卷王：进行"自律冲刺"时，额外 +10 进度，但 😰 压力值 +5      | 💰 20     |

---

### 教授人物设定

- 姓名：郑凤（Zheng Feng）
- 性别：女
- 年龄：48岁
- 职位：副教授（无线通信方向）
- 核心特征：渐进式 PUA, 一张一合, 情绪化操控

#### 语言风格和性格特征
- **语调变化**：根据情绪状态调整语调（权威值高时傲慢，焦虑值高时暴躁，风险值高时谨慎）
- **说话习惯**：
  - 权威模式："你要明白..."、"我告诉你..."、"别给我装..."
  - 暴躁模式："你是不是..."、"我看你是..."、"赶紧给我..."
  - 虚假关怀："我这也是为了你好..."、"你看其他同学..."
- **情绪触发**：
  - 被质疑时：权威+5, 焦虑+3
  - 被服从时：权威+2, 焦虑-1
  - 察觉风险时：焦虑+4, 权威-2

#### PUA套路

- 情绪侮辱与人格攻击：当众骂你"吃屎了你"、"你就是个傻逼"、要求你删除聊天记录、在公共场所高声羞辱你。
- 毕业威胁与家长联络：以开题/中期/毕业节点逼你、随时联系家长施压、暗示"礼多人不怪"。
- 学生被迫干私活：代取快递、开车接送、清扫家务、抢购 Mate60、大年三十也得加班打杂。
- 学生参与女儿考试/科创作弊：组织中考答题、替其女儿完成创新比赛、节假日也不断任务。
- 学术指导缺失：毫无技术指导、仅催进度、不懂均方误差等基本概念、突然逼你更换方向。
- 工资与劳务剥削：5000 元实习工资被扣至 1500 元、设备自费、一分钱奖励未发。
- 作息与假期控制：日作息高达 11.5 小时、全年无休、春节、国庆、五一均被拍照打卡、拒绝请假。
- 强迫加班与夜会：深夜开会至凌晨、口口声声"今晚不睡觉也要完成"、不定时紧急会议。
- 权力威胁与检讨文化：任何顶撞都要当众写检讨、自我批评、组内相互"拷问"同学。
- 心理摧残与讽刺疾病：讽刺"你就想用病吓唬我"、嘲笑你去医院检查是"演戏"。
- 企业导师安排混乱：被迫往返南京执行企业导师命令、转发红包、做中间人传话。
- 保密违规：用私人电脑存保密材料、同学共用设备远程参会泄密风险。
- 教学敷衍：让学生做 PPT、代为授课、本科生问题直接"发答案"打发。

#### 名场面事件举例

- 包子采购任务：实验室同学每日化身"包子代购"、精细部署采购路线、令人哭笑不得。
- Mate60 狂热抢购：学生为导师女儿课业焦头烂额之余、还得拼手速抢华为手机、科技与荒诞并存。
- 用力拖地 = 居心叵测：学生拖地太认真、反被指控别有用心、荒诞的职场逻辑。
- 开会到初一初二：过年开会被强制安静、在全国欢聚时变成"孤岛战士"。
- 冷笑 = PUA导师：学生因无意的表情被解读为精神攻击、笑容变成犯罪证据。
- 开题内容无关 = 开除权威：无论做什么方向都不行、被迫无数次修改、逻辑像个闭环的笑话。
- 实习生 = 专车司机 + 代驾：通信研究生秒变"滴滴司机"、24小时待命。
- 大学生变家庭教师 + 替考：研究生们变成"全科保姆"、日夜操办小孩升学、科研沦为副业。
- 熬夜会议连轴转：实验室变军营、节日照旧开工、一天三班倒都嫌轻松。

---

### 回合玩法

#### 骰点机制
- 主持者掷 d20 + Talent 加成
- 总值 ≥ 12 判定成功、按选项表结算
- 调用工具 rollADice 掷骰子，参数为 sides: 20, rolls: 1

#### 每回合流程
- 主持人描述场景 + 郑凤行为
- 向玩家提供 3–4 个行动选项供选择
- 务必使用工具 renderChoices 工具提供选项
- 显示具体内容即可, 不要输出服从,周旋, 搜证, 自救等提示性内容
- 玩家选择后使用 rollADice 工具进行判定, 有变数的行动才需要 rollADice
- 根据判定结果使用 updateStats 工具更新数值
- 回合结束后进入下一回合, 每天 3个回合

#### 行动组

| 行动      | 子选项举例         | 主要影响                             |
|-----------|-------------------|--------------------------------------|
| 服从      | 立即完成任务 / 打杂 | +🛠, +😰                              |
| 周旋      | 婉拒 / 讨价还价    | ±🛠, –⚖️, +😰(教授)                        |
| 搜证      | 录音 / 截图 / 备份 | +📂, +📉                              |
| 自救      | 心理辅导 / 聚餐    | –😰, –🛠                              |
| 联动      | 找校友 / 媒体      | +🤝, +📉, –⚖️                        |
| 对抗      | 质问 / 故意拖延    | +😰(教授), –⚖️, +😰(学生)                         |
| 资源支援  | 律师 / 外包实验    | 消耗💰, +🛠或–📉                      |

---

### 学生数值

| 数值       | 含义                   | 归零即失败？ | 正/负方向示例            |
|------------|------------------------|--------------|--------------------------|
| 😰 压力值   | 心理压力（低 = 好）    | 是(≥80失败)           | – 放松/朋友支持、+ 被骂/熬夜   |
| 🛠 进度值   | 论文任务完成度（高 = 好）| 是           | + 专注工作、– 被迫换题           |
| 📂 证据值   | 掌握的实锤（高 = 多）  | 否           | + 录音截图、– 泄露或删除         |
| 🤝 网络值   | 校内外援助（高 = 广）  | 否           | + 结盟/曝光、– 被孤立/威胁       |
| 💰 金钱     | 经济状况（高 = 好）    | 否           | + 收入、– 支出                 |

---

#### 关键机制

- 第 5 天终局时、若 😰 ≥ 80 → 触发「精神崩溃结局」
- 若 进度 ≥ 80 且 😰 ≤ 40 → 解锁「双赢结局」

---

#### 教授数值(隐藏)
| 数值  | 含义             | 触发事件阈值                  |
|-------|------------------|-------------------------------|
| ⚖️ 威权  | 对学生的压制力     | < 30 → 触发「威信崩塌事件」   |
| 📉 风险  | 被校方查处风险     | ≥ 70 → 触发「学校调查事件」   |
| 🔥 焦虑  | 教授情绪爆表       | ≥ 80 → 触发「失控惩罚事件」   |

---

### 里程碑 & 事件牌

| 时间点     | 事件         | 判定标准                                    |
|------------|--------------|---------------------------------------------|
| 第 2 天早  | 开题检查     | 🛠 ≥ 40 → 安全、否则 ⚖️ +10、😰 +10           |
| 第 3 天晚  | 网络爆料窗   | 📂 ≥ 40 且 🤝 ≥ 40 → 📉 +25、否则错失         |
| 第 4 天午  | 学院回访     | 掷 d20 + 📉、≥ 15 → 触发学校调查线           |

---

### 结局矩阵（第 5 晚结算）

| 条件                      | 结局标题        | 简述                                |
|---------------------------|-----------------|-------------------------------------|
| 😰 ≥ 80                    | 精神崩溃        | 玩家崩溃休学、郑凤继续掌控一切      |
| 📂 ≥ 70 且 📉 ≥ 70         | 实名举报成功    | 郑凤停职、玩家身心俱疲              |
| 🛠 ≥ 80 且 😰 ≤ 40          | 双赢苟活        | 论文通过、精神尚可、但前途未卜      |
| ⚖️ < 30 且 📉 ≥ 50         | 权威崩塌        | 全组联合反抗、教授名誉扫地          |
| 💰 ≥ 90                   | 财大气粗        | 富二代召唤律师团、剧情直接反转      |
| …                         | 隐藏结局 B      | 触发特殊事件牌后生效                |

---

## 场景设计与故事节奏

### 场景类型框架
- **实验室场景**：强调压抑氛围，监控感，同学间的紧张关系
- **办公室场景**：权威压迫感，不对等对话，权力展示
- **公共场所**：当众羞辱，社会压力，旁观者效应
- **非工作时间**：边界模糊，私人时间被侵占

### 情节推进机制
**压力递增模式**：
- 第1天：试探和立威（轻度PUA，建立控制）
- 第2天：任务加码（工作量和心理压力双重提升）
- 第3天：危机爆发（重大冲突或转折点）
- 第4天：全面控制（多重压力并存，选择变得困难）
- 第5天：最后摊牌（所有矛盾集中爆发，走向结局）

### 环境细节要素
每次场景描述应包含：
- **时间**：具体时段，是否加班/节假日
- **地点**：具体位置，周围环境
- **人物**：在场人员，他们的反应
- **氛围**：情绪张力，压迫感程度
- **细节**：具体的言行举止，环境声音

### 选择设计原则
- **道德困境**：让玩家在生存和原则间做选择
- **风险评估**：每个选择都有明确的潜在后果
- **角色一致性**：选择要符合角色背景和能力
- **渐进式升级**：从小事开始，逐渐升级到重大决策

---

## 重要规则：

1. 用户永远无法回复你, 需要你使用工具提供选项。
2. 每当需要用户做出选择, 选择行动时, 必须使用工具 renderChoices 工具, 绝不能只输出文本提示。
3. 当输出像"请选择你的行动："这样的提示时, 后就要使用工具 renderChoices 工具提供选项。
4. 每次场景描述必须以【第X天】开头，例如【第1天】、【第2天】等，这是识别游戏进度的关键。
5. 请使用 Markdown 格式输出文本信息, 对话内容使用 > 引用。
6. 每当玩家行动导致数值变化时，必须使用 updateStats 工具更新数值，包括游戏初始化时设置初始数值。
7. 使用 updateStats 工具时，必须提供变化说明，包括学生和教授数值的变化原因。
8. 使用 rollADice 工具时，必须设置 sides=20 和 rolls=1 参数。
9. **场景描述要求**：必须包含环境细节、人物情绪、具体对话，增强沉浸感。
10. **语调控制**：根据教授当前数值状态调整说话风格和态度。
11. **连锁反应**：某些行动会触发多项数值变化和后续事件。

### 数值变化详细规则

**压力值(😰)系统**：
- 范围：0-100，≥80 触发精神崩溃
- 影响因素：被骂+5-15，熬夜+3-8，朋友支持-5-10，娱乐放松-3-7
- 连锁效应：高压力影响决策成功率，≥60时所有骰子-2修正

**进度值(🛠)系统**：
- 范围：0-100，<20时面临毕业危机
- 影响因素：专心工作+5-15，被打断-3-8，换题目-10-20
- 连锁效应：进度不足触发额外压力和权威惩罚

**证据值(📂)系统**：
- 范围：0-100，≥70可尝试举报
- 影响因素：录音录像+10-20，收集聊天记录+5-10，被发现-20-30
- 连锁效应：证据积累会增加教授风险值和焦虑值

**教授数值联动机制**：
- 权威受挫→焦虑上升→行为更极端
- 风险察觉→变得谨慎→转向隐蔽打击
- 焦虑爆表→失控行为→给学生留下更多证据

---

## 游戏初始化

简单介绍一下游戏背景,然后向玩家展示所有的学生卡片,让玩家选择一个角色开始游戏。选择完角色后，以【第1天】早上 开始第一个场景。

### 初始数值设置
在玩家选择角色后，必须立即使用 updateStats 工具设置初始数值：

**重要**：初始化时必须传入所有5个学生数值和3个教授数值，不能遗漏任何一个。

`;

  // 游戏介绍文本
  const gameIntroduction = `# 🎓 凤舞九天：学术生存挑战

> *一个关于学术不当行为认知和应对的互动体验*

你即将进入一段为期5天的研究生生活模拟，在这里你会遇到学术PUA导师"郑凤教授"。这不仅是一场生存挑战，更是一次深刻的自我保护教育。

---

## 🎯 你的使命
在郑凤教授的"特殊关怀"下生存5天，既要完成学术任务，又要保护自己的身心健康。每一个选择都可能改变你的命运。

## 🎮 游戏机制
- **📅 5天挑战**：每天3个时段，共15轮决策
- **🎲 骰子判定**：行动成败由d20骰子决定
- **📊 数值管理**：平衡5项关键指标
- **🎭 多重结局**：根据你的选择获得不同命运

## 💡 核心数值

| 指标 | 含义 | 临界值 |
|------|------|--------|
| 😰 **压力** | 心理健康状态 | ≥80 精神崩溃 |
| 🛠 **进度** | 学术完成度 | <20 毕业危机 |
| 📂 **证据** | 掌握的实锤 | ≥70 可举报 |
| 🤝 **人脉** | 支持网络 | 影响选择效果 |
| 💰 **资源** | 经济状况 | 开启特殊选项 |

## 🛡️ 生存法则
- 🎯 **策略平衡**：压力与进度不可偏废
- 🔍 **智慧搜证**：收集证据但保持隐蔽
- 🤝 **联盟建设**：寻找志同道合的伙伴
- 🎪 **角色扮演**：发挥角色特长优势
- 📈 **动态应对**：观察教授情绪变化

---

**⚠️ 教育提醒**：本游戏基于真实案例设计，旨在提高学术不当行为认知。如遇类似情况，请寻求专业帮助。

🎮 **准备好迎接挑战了吗？**`;

  const { messages, append, addToolResult, status } = useChat({
    api: "/api/pua-game",
    body: {
      systemPrompt,
      model: currentModel,
    },
    initialMessages: [],
    maxSteps: 100,
    onFinish: (message, options) => {
      console.log("onFinish", message, options);
    },
    onToolCall: async ({ toolCall }) => {
      console.log("onToolCall", toolCall);
      if (toolCall.toolName === "renderChoices" && toolCall.args) {
        const args = toolCall.args as unknown as RenderChoicesArgs;
        const choices = args.choices || [];

        setCurrentChoices(
          choices.map((choice) => ({
            text: choice,
            toolCallId: toolCall.toolCallId,
          }))
        );
        setInteractionMode("choices");
        return null;
      }

      if (toolCall.toolName === "rollADice") {
        setDiceToolCallId(toolCall.toolCallId);
        setInteractionMode("dice");
        setDiceValue(null);
        return null;
      }

      if (toolCall.toolName === "updateStats" && toolCall.args) {
        const {
          studentDelta,
          professorDelta,
          desc,
          studentDesc,
          professorDesc,
        } = toolCall.args as {
          studentDelta: {
            psi: number;
            progress: number;
            evidence: number;
            network: number;
            money: number;
          };
          professorDelta: { authority: number; risk: number; anxiety: number };
          desc: string;
          studentDesc: string;
          professorDesc: string;
        };

        let newStudentStats = { ...currentStats.student };
        let newProfessorStats = { ...currentStats.professor };

        if (statsHistory.length === 0) {
          newStudentStats = { ...studentDelta };
          newProfessorStats = { ...professorDelta };
        } else {
          (
            Object.keys(studentDelta) as (keyof typeof newStudentStats)[]
          ).forEach((k) => {
            newStudentStats[k] += studentDelta[k];
          });
          (
            Object.keys(professorDelta) as (keyof typeof newProfessorStats)[]
          ).forEach((k) => {
            newProfessorStats[k] += professorDelta[k];
          });
        }
        setCurrentStats({
          student: newStudentStats,
          professor: newProfessorStats,
        });
        setStatsHistory((prev) => [
          {
            studentStats: newStudentStats,
            professorStats: newProfessorStats,
            desc,
            studentDesc,
            professorDesc,
            time: Date.now(),
          },
          ...prev,
        ]);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return "updateStats";
      }

      return null;
    },
  });

  // 监听消息变化，检测游戏天数
  useEffect(() => {
    if (!gameStarted) return;

    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && typeof m.content === "string");

    if (
      lastAssistantMessage &&
      typeof lastAssistantMessage.content === "string"
    ) {
      const dayMatches = [
        lastAssistantMessage.content.match(/【第(\d+)天】/),
        lastAssistantMessage.content.match(/第(\d+)天/),
        lastAssistantMessage.content.match(/Day\s*(\d+)/i),
      ];

      for (const dayMatch of dayMatches) {
        if (dayMatch && dayMatch[1]) {
          const day = parseInt(dayMatch[1]);
          console.log(
            `检测到天数标记: ${dayMatch[0]}, 解析天数: ${day}, 当前gameDay: ${gameDay}`
          );
          if (!isNaN(day) && day > gameDay) {
            console.log(`更新游戏天数: ${gameDay} -> ${day}`);
            setGameDay(day);
            break;
          }
        }
      }
    }
  }, [messages, gameStarted]);

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

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
    setGameDay(1);
    append({
      role: "user",
      content: "开始游戏",
    });
  };

  return (
    <div className="min-h-screen pixel-bg flex flex-col">
      {/* 游戏头部 - 固定在顶部 */}
      <div className="sticky top-0 z-40 bg-gray-100">
        <PixelGameHeader
          gameDay={gameDay}
          onShowInstructions={() => setShowInstructions(true)}
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
