# چت ساده با WebSocket

دو پروژه‌ی کوچک برای یادگیری پیام real-time با اتاق:

- `backend` — NestJS + Socket.IO (`@nestjs/websockets` و `@nestjs/platform-socket.io`)
- `frontend` — Next.js با `socket.io-client`

پیام‌ها ذخیره نمی‌شوند. هر کاربر فقط پیام‌های اتاق خودش را می‌بیند.

## اجرا

ترمینال ۱ — بک‌اند:

```bash
cd backend
npm install
npm start
```

ترمینال ۲ — فرانت:

```bash
cd frontend
npm install
npm run dev
```

بعد مرورگر را روی [http://localhost:3000](http://localhost:3000) باز کنید. برای دیدن اتاق‌ها، دو تب با اتاق یکسان و یک تب با اتاق دیگر باز کنید.

ابتدا نام کاربری و نام اتاق را خودت بنویس (لاگین واقعی نیست). اگر آن اتاق نباشد ساخته می‌شود؛ اگر باشد وارد همان می‌شوی.

## جریان کار

1. فرانت به `http://localhost:3001` وصل می‌شود و `join` را با نام و اتاق می‌فرستد.
2. سرور کلاینت را با `client.join(room)` وارد همان اتاق می‌کند.
3. پیام‌ها فقط با `server.to(room).emit` برای همان اتاق پخش می‌شوند.
4. لیست آنلاین، وضعیت تایپ، و پیام ورود/خروج هم فقط به همان اتاق می‌روند.

## قیمت لحظه‌ای دلار

صفحه [http://localhost:3000/dollar](http://localhost:3000/dollar) با WebSocket به بک‌اند وصل می‌شود. بک‌اند قیمت دلار آزاد را از `https://call5.tgju.org/ajax.json` می‌خواند و همان عدد را برای فرانت می‌فرستد.
