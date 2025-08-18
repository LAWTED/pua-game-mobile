import React, { useState, useRef, useEffect } from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PixelDialogPanelProps {
  messages: Message[];
  status: string;
  gameStarted: boolean;
  gameIntroduction: string;
}

export function PixelDialogPanel({
  messages,
  status,
  gameStarted,
  gameIntroduction
}: PixelDialogPanelProps) {
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // 复制对话内容到剪贴板
  const copyToClipboard = async () => {
    let content = '';

    if (!gameStarted) {
      content = gameIntroduction;
    } else {
      content = '# 🎭 学术江湖生存记 - 对话记录\n\n';
      content += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;

      messages.forEach((message, index) => {
        const parts = (message as any).parts ||
                     (message as any).experimental_providerMetadata?.parts ||
                     null;

        if (message.role === "assistant" && parts) {
          parts.forEach((part: any) => {
            if (part.type === "text") {
              content += `${part.text}\n\n`;
            }
            if (part.type === "tool-invocation" && part.toolInvocation?.result) {
              if (part.toolInvocation.toolName === "renderChoices") {
                content += `👤 **玩家选择**: ${part.toolInvocation.result}\n\n`;
              }
              if (part.toolInvocation.toolName === "rollADice") {
                content += `🎲 **骰子结果**: ${part.toolInvocation.result}\n\n`;
              }
            }
          });

          if (index < messages.length - 1) {
            content += '---\n\n';
          }
        }
      });
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      // 在现代浏览器中，如果clipboard API失败，通常是权限问题
      // 显示提示而不是使用已废弃的execCommand
      alert('复制失败，请手动选择并复制文本');
    }
  };

  console.log(messages);

  return (
    <div className="space-y-4">
      {!gameStarted && (
        <div className="pixel-panel bg-white p-6 relative">
          {/* 复制按钮 */}
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 pixel-button-small p-2 bg-gray-600 hover:bg-gray-700 text-white"
            title="复制游戏介绍"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          <div className="pixel-text prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-4 pixel-text">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-3 pixel-text">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-2 text-sm pixel-text">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 text-sm pixel-text">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="mb-1 pixel-text">{children}</li>
                ),
                hr: () => (
                  <div className="pixel-divider my-4"></div>
                ),
              }}
            >
              {gameIntroduction}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {gameStarted && messages.length > 0 && (
        <div className="pixel-panel bg-white p-6 relative">
          {/* 复制按钮 */}
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 pixel-button-small p-2 bg-gray-600 hover:bg-gray-700 text-white"
            title="复制对话记录"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          <div className="mb-2">
            <span className="pixel-text text-xs font-bold bg-black text-white px-2 py-1">
              SYSTEM
            </span>
          </div>
          <div className="pixel-text prose prose-sm max-w-none">
            {messages.map((message, messageIndex) => {
              console.log('Message structure:', message);

              // 检查多种可能的 parts 位置
              const parts = (message as any).parts ||
                           (message as any).experimental_providerMetadata?.parts ||
                           null;

              if (parts) {
                console.log('Found parts:', parts);
              }

              // 处理 assistant 消息的 parts
              if (message.role === "assistant" && parts) {
                const partElements = parts.map((part: any, partIndex: number) => {
                  if (part.type === "text") {
                    return (
                      <div key={`${messageIndex}-${partIndex}`} className="mb-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 text-sm pixel-text">{children}</p>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-500 pl-4 my-2 italic pixel-text block">
                                {children}
                              </blockquote>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 text-sm pixel-text block">{children}</ul>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold pixel-text">{children}</strong>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 pixel-text block">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-2 pixel-text block">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-2 pixel-text block">{children}</h3>
                            ),
                            hr: () => (
                              <div className="pixel-divider my-4"></div>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-4 block">
                                <table className="min-w-full border-2 border-black">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="border-2 border-black px-2 py-1 bg-gray-200 text-xs pixel-text">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border-2 border-black px-2 py-1 text-xs pixel-text">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }

                  // 处理工具调用结果
                  if (part.type === "tool-invocation" && part.toolInvocation?.result) {
                    // 显示用户的选择（renderChoices）
                    if (part.toolInvocation.toolName === "renderChoices") {
                      return (
                        <div key={`${messageIndex}-${partIndex}`} className="my-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">👤 你的选择:</span>
                            <span className="text-blue-600 font-medium pixel-text bg-blue-50 px-2 py-1 rounded text-sm border border-blue-200">
                              {part.toolInvocation.result}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // 显示骰子结果（rollADice）
                    if (part.toolInvocation.toolName === "rollADice") {
                      return (
                        <div key={`${messageIndex}-${partIndex}`} className="my-2">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">🎲 骰子结果:</span>
                            <span className="text-orange-600 font-medium pixel-text bg-orange-50 px-2 py-1 rounded text-sm border border-orange-200">
                              {part.toolInvocation.result}
                            </span>
                          </div>
                          {/* 骰子结果后添加像素风分割线 */}
                          <div className="pixel-divider my-4"></div>
                        </div>
                      );
                    }
                  }

                  return null;
                });

                // 在消息之间添加分割线
                if (messageIndex < messages.length - 1) {
                  partElements.push(
                    <div key={`divider-${messageIndex}`} className="pixel-divider my-4"></div>
                  );
                }

                return partElements;
              }

              return null;
            })}

            {/* Loading indicator */}
            <AnimatePresence>
              {status === "submitted" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    scale: { duration: 0.2 }
                  }}
                  className="flex items-center gap-2 py-2 text-gray-500"
                >
                  <div className="pixel-loader"></div>
                  <span className="pixel-text text-xs">generating...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}



      <style jsx>{`
        .pixel-button-small {
          font-family: "Courier New", monospace;
          border: 2px solid #fff;
          image-rendering: pixelated;
          transition: all 0.1s;
        }

        .pixel-button-small:active {
          transform: translate(1px, 1px);
        }

        .pixel-button-small:hover {
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.3);
        }

        .pixel-loader {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          animation: pixel-blink 1s infinite;
          image-rendering: pixelated;
        }

        .pixel-dots span {
          animation: pixel-blink 1.5s infinite;
        }

        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.5s; }
        .dot-3 { animation-delay: 1s; }

        @keyframes pixel-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pixel-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .pixel-loading {
          background: linear-gradient(45deg, #e0f2fe, #f3e5f5);
          border-radius: 4px;
          padding: 8px 12px;
        }

      `}</style>

      {/* 滚动锚点 */}
      <div ref={messagesEndRef} />
    </div>
  );
}