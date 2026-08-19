'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type ChatMessage = {
  username?: string;
  text: string;
  time: string;
  system?: boolean;
};

const PRESET_ROOMS = ['عمومی', 'تصادفی', 'کمک'];

export default function Home() {
  const [nameDraft, setNameDraft] = useState('');
  const [roomDraft, setRoomDraft] = useState('عمومی');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!username || !room) {
      return;
    }

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // بعد از وصل شدن، وارد اتاق می‌شویم
      socket.emit('join', { username, room });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('chat', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('users', (list: string[]) => {
      setUsers(list);
    });

    // typing از بقیه می‌آید؛ خودمان در لیست نیستیم
    socket.on('typing', (payload: { username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (payload.isTyping) {
          return prev.includes(payload.username)
            ? prev
            : [...prev, payload.username];
        }
        return prev.filter((name) => name !== payload.username);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [username, room]);

  useEffect(() => {
    const box = boxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages]);

  function join() {
    if (!nameDraft.trim() || !roomDraft.trim()) {
      return;
    }
    setUsername(nameDraft.trim());
    setRoom(roomDraft.trim());
  }

  function send() {
    const socket = socketRef.current;
    if (!text.trim() || !socket || !connected) {
      return;
    }

    socket.emit('message', text.trim());
    socket.emit('typing', false);
    setText('');
  }

  function onTextChange(value: string) {
    setText(value);
    const socket = socketRef.current;
    if (!socket || !connected) {
      return;
    }

    // به اتاق بگو در حال تایپ هستیم؛ بعد از یک ثانیه سکوت، خاموش شود
    socket.emit('typing', true);
    if (typingTimer.current) {
      window.clearTimeout(typingTimer.current);
    }
    typingTimer.current = window.setTimeout(() => {
      socket.emit('typing', false);
    }, 1000);
  }

  if (!username || !room) {
    return (
      <div>
        <h1>چت ساده</h1>
        <p>نام و اتاق را بنویس (لاگین واقعی نیست):</p>
        <div>
          <input
            placeholder="نام"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                join();
              }
            }}
          />
        </div>
        <div>
          <input
            placeholder="اتاق"
            list="rooms"
            value={roomDraft}
            onChange={(event) => setRoomDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                join();
              }
            }}
          />
          <datalist id="rooms">
            {PRESET_ROOMS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <button onClick={join}>ورود به چت</button>
      </div>
    );
  }

  return (
    <div>
      <h1>چت ساده</h1>
      <div>
        وضعیت: {connected ? 'متصل' : 'قطع شده'} — اتاق: {room}
      </div>

      <div>
        آنلاین:
        <ul>
          {users.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>

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
          if (message.system) {
            return (
              <div
                key={index}
                style={{ textAlign: 'center', color: '#666', margin: '6px 0' }}
              >
                {message.text} · {message.time}
              </div>
            );
          }

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

      <div>
        {typingUsers.length > 0
          ? `${typingUsers.join('، ')} در حال تایپ است...`
          : '\u00a0'}
      </div>

      <input
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
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
