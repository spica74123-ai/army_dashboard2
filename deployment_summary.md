# Army Dashboard2 Build Log & Instructions

บันทึกสรุปการดำเนินการปรับปรุงระบบ ครั้งที่ 1 (21/04/2026)

## 📌 สรุปงานที่ทำเสร็จแล้ว
1. **Database Migration**: นำเข้าข้อมูลหน่วยรบ 316 ข้อมูลจาก Spreadsheet เข้าสู่ MongoDB Atlas 100%
2. **UI/UX Enhancement**: 
   - อัปเกรดฟอนต์เป็น **Noto Sans Thai** เพื่อความสวยงามและอ่านง่าย
   - ปรับแต่งไอคอนและโลโก้ให้โปร่งใส (Transparent Branding)
3. **Architecture Upgrade**: 
   - เปลี่ยนจาก Express + Next.js แยกกัน มาเป็น **Pure Next.js Architecture** เพื่อความเสถียรสูงสุดบน Vercel
   - ยุบรวมโครงสร้างโฟลเดอร์ให้เป็นระเบียบ (Flattened Structure)
4. **Deployment**:
   - เชื่อมต่อและอัปโหลดขึ้น GitHub: [spica74123-ai/army_dashboard2](https://github.com/spica74123-ai/army_dashboard2)
   - ตั้งค่าระบบให้พร้อมสำหรับ Vercel (Auto-Deployment)

---

## 🔑 ข้อมูลการเข้าใช้งาน
*   **URL (Local)**: `http://localhost:3002`
*   **Username**: `admin`
*   **Password**: `123`

---

## ⚙️ การตั้งค่า Environment Variables (บน Vercel)
หากต้องตั้งค่าใหม่ ให้ใช้ค่าดังนี้:
*   `MONGODB_URI`: `mongodb+srv://armyadmin:Army%402024@cluster0.q4vtkot.mongodb.net/army_dashboard?retryWrites=true&w=majority&appName=Cluster0`
*   `JWT_SECRET`: `army_secret_key_2024`
*   `NODE_ENV`: `production`

---

## 📂 โครงสร้างโปรเจกต์ปัจจุบัน
*   `/app`: หน้าต่าง UI ทั้งหมด (Next.js App Router)
*   `/api/exec/route.js`: ระบบหลังบ้าน (API Route Handler)
*   `/lib/db.js`: ตัวเชื่อมฐานข้อมูลหลัก
*   `/public`: ไฟล์รูปภาพ โลโก้ และไอคอน

---
**หมายเหตุ**: บันทึกนี้ถูกสร้างขึ้นเพื่อเป็นคู่มือสรุปงานและจัดเก็บข้อมูลสำคัญสำหรับผู้พัฒนา
