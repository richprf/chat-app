'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Hash,
  MessageCircle,
  Radio,
  Send,
  User,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';

type ChatMessage = {
  username?: string;
  text: string;
  time: string;
  system?: boolean;
};

export default function Home() {
  const [nameDraft, setNameDraft] = useState('');
  const [roomDraft, setRoomDraft] = useState('');
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">چت ساده</h1>
          </div>
          <p className="mb-6 text-sm text-slate-500">
            نام و اتاق را بنویس (لاگین واقعی نیست):
          </p>
          <div className="mb-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <User className="h-4 w-4 text-slate-400" />
              نام
            </label>
            <input
              placeholder="نام"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  join();
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Hash className="h-4 w-4 text-slate-400" />
              اتاق
            </label>
            <input
              placeholder="اتاق"
              value={roomDraft}
              onChange={(event) => setRoomDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  join();
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            onClick={join}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            ورود به چت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-3 sm:p-6">
      <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900">چت ساده</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={
              connected
                ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700'
                : 'inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700'
            }
          >
            {connected ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            وضعیت: {connected ? 'متصل' : 'قطع شده'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            <Hash className="h-3.5 w-3.5" />
            اتاق: {room}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="rounded-2xl bg-white p-4 shadow-md lg:w-72 lg:shrink-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 text-indigo-500" />
            آنلاین:
          </div>
          <ul className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {users.map((name, index) => (
              <li
                key={index}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5 text-sm text-slate-800"
              >
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {name.charAt(0)}
                  <Radio className="absolute -bottom-0.5 -left-0.5 h-3 w-3 fill-emerald-500 text-emerald-500" />
                </span>
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-md lg:min-h-[calc(100vh-10rem)]">
          <div
            ref={boxRef}
            className="flex-1 space-y-3 overflow-auto p-4"
          >
            {messages.map((message, index) => {
              if (message.system) {
                return (
                  <div key={index} className="my-2 text-center">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                      {message.text} · {message.time}
                    </span>
                  </div>
                );
              }

              const isMine = message.username === username;
              return (
                <div
                  key={index}
                  className={isMine ? 'flex justify-start' : 'flex justify-end'}
                >
                  <div
                    className={
                      isMine
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2 text-white shadow-sm sm:max-w-[70%]'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-slate-800 shadow-sm sm:max-w-[70%]'
                    }
                  >
                    <div
                      className={
                        isMine
                          ? 'mb-0.5 text-xs text-indigo-100'
                          : 'mb-0.5 text-xs text-slate-500'
                      }
                    >
                      {message.username} · {message.time}
                    </div>
                    <div className="break-words text-sm leading-relaxed">
                      {message.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="min-h-6 px-4 pb-1 text-xs text-slate-500">
            {typingUsers.length > 0
              ? `${typingUsers.join('، ')} در حال تایپ است...`
              : '\u00a0'}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 p-3">
            <input
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  send();
                }
              }}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={send}
              disabled={!connected}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" />
              ارسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
