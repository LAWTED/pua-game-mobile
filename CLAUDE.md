# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a mobile-optimized academic PUA (Power, Uncertainty, Authority) survival game built as a text-based RPG. Players take the role of a graduate student facing academic bullying from Professor Zheng Feng over 5 days with 15 total rounds of gameplay. The project serves as an educational tool to raise awareness about academic misconduct and power abuse in higher education.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production  
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with custom pixel art styles
- **AI Integration**: AI SDK with DeepSeek model support (@ai-sdk/deepseek)
- **UI Components**: Radix UI, Vaul (drawer components), Framer Motion
- **Utilities**: React Markdown, Number Flow animations, Embla Carousel

## Architecture Overview

### Game Flow Architecture
The game follows a structured turn-based system with AI-driven narrative progression:

1. **Main Game Loop** (`app/page.tsx`): Central game state management using React hooks
2. **AI API Handler** (`app/api/pua-game/route.ts`): Processes game actions through DeepSeek AI model
3. **Component System**: Modular pixel-styled UI components for different game aspects

### Key State Management
- **Game Progression**: Day tracking (1-5), turn management (3 per day)
- **Character Stats**: Student metrics (stress, progress, evidence, network, money) and hidden professor metrics (authority, risk, anxiety)
- **Interaction Modes**: "idle", "choices", "dice" - controls UI state for different game phases
- **Tool Integration**: AI tools for choice rendering, dice rolling, and stat updates

### AI Tool System
The game uses three core AI tools that must be properly integrated:

1. **renderChoices**: Renders interactive choice buttons (most critical tool)
2. **rollADice**: d20 dice system for action success/failure
3. **updateStats**: Updates character statistics with change descriptions

## Component Architecture

### Core Game Components (`components/pua-game-mobile/`)
- **PixelStatsPanel**: Displays character statistics with animated bars
- **PixelDialogPanel**: Renders game narrative and AI responses  
- **PixelGameHeader**: Shows day progress and game controls
- **PixelInteractionPanel**: Handles user choices and dice interactions

### Layout System
- **Sliding Panel Architecture**: Uses `SlidingInteractionPanel` with Vaul drawer for mobile-optimized interaction
- **Fixed Header**: Sticky game header with day tracking
- **Dynamic Content Area**: Main dialog panel with responsive bottom padding

## Game Logic Integration

### Character System
Two playable characters with different abilities:
- **陆星河 (Lu Xinghe)**: Rich background, money-based problem solving
- **赵一鸣 (Zhao Yiming)**: Academic achiever, study-focused approach

### Stat System
Student stats use pixel art progress bars:
- **Stress** (psi): Mental health (replacing "Ψ PSI" with "😰 STRESS")
- **Progress**: Academic advancement 
- **Evidence**: Collected proof of misconduct
- **Network**: Support connections
- **Money**: Financial resources

### Narrative Progression
Game content is primarily defined in the systemPrompt within `app/page.tsx`. The AI generates scenarios based on:
- Current day/turn tracking
- Character stat thresholds
- Player choice consequences
- Dice roll outcomes

## Styling System

### Pixel Art Design
Custom CSS classes provide retro game aesthetics:
- `.pixel-bg`: Textured background patterns
- `.pixel-panel`: Bordered game panels with drop shadows
- `.pixel-button`: Interactive buttons with hover/active states
- `.pixel-text`: Monospace font rendering
- `.pixel-dice`: Animated dice component
- `.pixel-divider`: Dotted line separators

### Mobile Optimization
- Safe area support for iOS devices
- Responsive typography scaling
- Touch-optimized interaction areas
- Drawer-based UI for space efficiency

## Development Guidelines

### AI Integration
- The game heavily relies on AI tool calls for progression
- Never modify tool schemas without understanding game flow impact
- Tool calls are processed in `onToolCall` handler with specific result handling

### Game Content Modification
- Main game narrative and rules are in the systemPrompt variable
- Character stats and progression logic should maintain balance
- Day/turn tracking uses specific text patterns for detection

### Component Development
- Follow pixel art styling conventions
- Maintain mobile-first responsive design
- Use existing animation patterns for consistency
- Preserve tool integration in interactive components

## Environment Setup

### Required Environment Variables
```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Optional Variables
```bash
OPENAI_API_KEY=your_openai_api_key_here  # If adding OpenAI model support
```

## Important Implementation Notes

### Message Flow
- User interactions are processed through AI tool calls, not direct user input
- Choice selection triggers `addToolResult` with specific tool call IDs
- Dice interactions use manual rolling with animated feedback

### State Synchronization
- Stats updates trigger panel highlighting animations
- Game day progression is detected through message content parsing
- Tool call results are automatically integrated into chat history

### Mobile UX Patterns
- Swipe-up drawer for interactions
- Height-responsive content areas
- Touch-friendly button sizing
- Animated transitions for visual feedback