'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState('');
  // اتصال WebSocket را در ref نگه می‌داریم تا در send به آن دسترسی داشته باشیم
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // اتصال به سرور WebSocket بک‌اند (NestJS روی پورت 3001)
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    // هر پیامی که از سرور برسد، به لیست پیام‌ها اضافه می‌شود
    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    // وقتی کامپوننت بسته شد، اتصال را قطع می‌کنیم
    return () => {
      socket.close();
    };
  }, []);

  function send() {
    const socket = socketRef.current;
    // اگر متن خالی باشد یا هنوز وصل نشده باشیم، چیزی نفرست
    if (!text.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    // متن را به‌صورت خام برای سرور می‌فرستیم (همان چیزی که بک‌اند broadcast می‌کند)
    socket.send(text);
    setText('');
  }

  return (
    <div>
      <h1>چت ساده</h1>

      <div
        style={{
          border: '1px solid #333',
          height: 240,
          overflow: 'auto',
          padding: 8,
          marginBottom: 8,
        }}
      >
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            send();
          }
        }}
      />
      <button onClick={send}>ارسال</button>
    </div>
  );
}
