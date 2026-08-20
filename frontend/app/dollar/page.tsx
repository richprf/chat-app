'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function DollarPage() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    // وصل شدن به Gateway قیمت دلار روی بک‌اند
    const socket = io('http://localhost:3001/dollar');

    // هر بار سرور قیمت جدید فرستاد، عدد روی صفحه عوض می‌شود
    socket.on('price', (value: number) => {
      setPrice(value);
    });

    // قطع اتصال وقتی از صفحه می‌رویم
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <p>
      قیمت دلار:{' '}
      {price === null ? '...' : price.toLocaleString('fa-IR')} تومان
    </p>
  );
}
