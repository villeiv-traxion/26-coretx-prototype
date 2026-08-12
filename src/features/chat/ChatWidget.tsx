"use client";

import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import {
  Chat,
  ChatTrigger,
  ChatPanel,
  ChatHeader,
  ChatMessages,
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatInput,
  ChatSendButton,
  ChatDateSeparator,
  Textarea,
} from "@traxion-global/design-system/react";
import { useLanguage } from "@/features/i18n";

const styles = {
  panel: "fixed bottom-24 right-6 h-[480px] w-[360px] shadow-xl",
  headerAvatar:
    "flex h-8 w-8 items-center justify-center rounded-full bg-primary",
  headerIcon: "h-4 w-4 text-primary-foreground",
  headerName: "text-sm font-medium",
  headerStatus: "text-xs text-muted-foreground",
  headerText: "flex flex-col",
  typing: "flex items-center gap-1",
};

type Message = {
  id: number;
  text: string;
  variant: "sent" | "received";
  time: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatWidget() {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now(),
      text,
      variant: "sent",
      time: nowTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: t.chat.response,
        variant: "received",
        time: nowTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  }

  return (
    <Chat defaultOpen={false}>
      <ChatTrigger aria-label={t.chat.triggerLabel} />
      <ChatPanel className={styles.panel}>
        <ChatHeader>
          <div className={styles.headerAvatar}>
            <Bot className={styles.headerIcon} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerName}>{t.chat.title}</span>
            <span className={styles.headerStatus}>{t.chat.subtitle}</span>
          </div>
        </ChatHeader>

        <ChatMessages>
          <ChatDateSeparator>{t.chat.today}</ChatDateSeparator>
          {/*
            El saludo se deriva de `t` en vez de sembrarse en estado: así sigue
            al idioma activo y evita un timestamp que difiera entre SSR y cliente.
          */}
          <ChatBubble variant="received">
            <ChatBubbleMessage variant="received">
              {t.chat.initialMessage}
            </ChatBubbleMessage>
          </ChatBubble>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} variant={msg.variant}>
              <ChatBubbleMessage variant={msg.variant}>
                {msg.text}
              </ChatBubbleMessage>
              <ChatBubbleTimestamp>{msg.time}</ChatBubbleTimestamp>
            </ChatBubble>
          ))}
          {isTyping && (
            <ChatBubble variant="received">
              <ChatBubbleMessage variant="received">
                <span className={styles.typing}>
                  <span className="animate-bounce delay-0">·</span>
                  <span className="animate-bounce delay-100">·</span>
                  <span className="animate-bounce delay-200">·</span>
                </span>
              </ChatBubbleMessage>
            </ChatBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInput onSubmit={handleSubmit}>
          <Textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chat.placeholder}
          />
          <ChatSendButton />
        </ChatInput>
      </ChatPanel>
    </Chat>
  );
}
