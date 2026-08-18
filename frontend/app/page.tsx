'use client';

import { useEffect, useRef, useState } from 'react';

// هر پیام همین سه فیلد را دارد؛ بک‌اند آن را ذخیره نمی‌کند
type ChatMessage = {
  username: string;
  text: string;
  time: string;
};

export default function Home() {
  const [nameDraft, setNameDraft] = useState('');
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // فقط بعد از انتخاب نام به سرور وصل می‌شویم
  useEffect(() => {
    if (!username) {
      return;
    }

    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);

    socket.onmessage = (event) => {
      const message: ChatMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      socket.close();
    };
  }, [username]);

  // با آمدن پیام جدید، باکس را تا پایین اسکرول می‌کنیم
  useEffect(() => {
    const box = boxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages]);

  function join() {
    if (!nameDraft.trim()) {
      return;
    }
    setUsername(nameDraft.trim());
  }

  function send() {
    const socket = socketRef.current;
    if (!text.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = new Date();
    const time =
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0');

    // نام، متن و ساعت را با هم می‌فرستیم؛ سرور همین JSON را برای همه پخش می‌کند
    socket.send(
      JSON.stringify({
        username,
        text: text.trim(),
        time,
      }),
    );
    setText('');
  }

  // قبل از ورود به چت فقط نام گرفته می‌شود (لاگین واقعی نیست)
  if (!username) {
    return (
      <div>
        <h1>چت ساده</h1>
        <p>یک نام برای خودت بنویس:</p>
        <input
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              join();
            }
          }}
        />
        <button onClick={join}>ورود به چت</button>
      </div>
    );
  }

  return (
    <div>
      <h1>چت ساده</h1>
      <div>وضعیت: {connected ? 'متصل' : 'قطع شده'}</div>

      <div
        ref={boxRef}
        style={{
          border: '1px solid #333',
          height: 240,
          overflow: 'auto',
          padding: 8,
          margin: '8px 0',
        }}
      >
        {messages.map((message, index) => {
          const isMine = message.username === username;

          return (
            <div
              key={index}
              style={{
                textAlign: isMine ? 'right' : 'left',
                background: isMine ? '#cfe8ff' : '#eeeeee',
                margin: '6px 0',
                padding: 6,
              }}
            >
              <div>
                {message.username} · {message.time}
              </div>
              <div>{message.text}</div>
            </div>
          );
        })}
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
      <button onClick={send} disabled={!connected}>
        ارسال
      </button>
    </div>
  );
}
