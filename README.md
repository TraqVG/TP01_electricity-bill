# TP01_electricity-bill
Lab project: Electricity bill calculation system built with Node.js + Python (AI), reading/writing CSV and containerized with Docker.
=======
# Lab02_2_Electricity_bill

โฟลวการทำงาน:
1) หน้าเว็บ (frontend) รับ input เครื่องใช้ไฟฟ้า + หน่วย (kWh)
2) Backend (Node/Express) เขียนข้อมูลลง `ai/data/electricity.csv`
3) Backend เรียก `python ai/app/main.py` เพื่อ:
   - คำนวณค่าไฟ + Top 3 เครื่องใช้ไฟฟ้าที่กินไฟ (จาก `Electricity_Calculate.py`)
   - ส่ง summary ที่คำนวณแล้วให้ AI วิเคราะห์/แนะนำ (จาก `agent.py`)
   - พิมพ์คำตอบออกทาง stdout และเขียน `ai/data/output.csv`
4) Backend ส่งคำตอบกลับไปแสดงบนหน้าเว็บ
5) Backend ล้างค่าใน `.csv` (เหลือแค่ header) เพื่อไม่ทิ้งข้อมูลผู้ใช้ไว้

## Run แบบ Local
```bash
# 1) ติดตั้ง Node deps
cd backend
npm install

# 2) ติดตั้ง Python deps (ที่ root โปรเจกต์)
cd ..
python -m pip install -r requirements.txt

# 3) รัน server
node backend/src/server.js
```
เปิด: http://localhost:8080

> ถ้าเครื่องใช้ `python3` ให้ตั้งค่า env: `PYTHON_BIN=python3`

## Run ด้วย Docker
```bash
docker build -t electricbill .
docker run -p 8080:8080 --env-file .env electricbill
```

>>>>>>> 53b28e4 (initial commit)
