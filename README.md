# چت ساده با WebSocket

دو پروژه‌ی کوچک برای یادگیری ارسال و دریافت پیام real-time:

- `backend` — NestJS + WebSocket خام (`@nestjs/websockets` و `@nestjs/platform-ws`)
- `frontend` — Next.js با WebSocket مرورگر (`new WebSocket(...)`)

پیام‌ها ذخیره نمی‌شوند. فقط بین کاربرهایی که همین الان وصل هستند رد و بدل می‌شوند.

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

بعد مرورگر را روی [http://localhost:3000](http://localhost:3000) باز کنید. برای دیدن broadcast، همان صفحه را در دو تب باز کنید.

## جریان کار

1. فرانت به `ws://localhost:3001` وصل می‌شود.
2. با زدن ارسال، متن با `socket.send` به بک‌اند می‌رود.
3. بک‌اند همان متن را برای همه‌ی کلاینت‌های متصل می‌فرستد.
4. هر کلاینت متن را در `onmessage` می‌گیرد و روی صفحه نشان می‌دهد.
