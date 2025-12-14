from langchain_google_genai     import ChatGoogleGenerativeAI # ai model
from langchain.agents import create_agent
from dotenv import load_dotenv
from ai.app.prompts import prompt
from ai.app.Electricity_Calculate import calculate_electric_bill

load_dotenv()

llm_gemini = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
)

agent = create_agent(
    llm_gemini,
    system_prompt=prompt()
)

def electricity_summary(result):
    text = f"""
ค่าไฟเดือนนี้ทั้งหมด: {result['total_costs']} บาท

เครื่องใช้ไฟฟ้าที่ใช้ไฟมากที่สุด:
"""
    for i, item in enumerate(result["items"], start=1):
        text += f"""
{i}. {item['appliance']}
   - ใช้ไฟ {item['units']} หน่วย
   - คิดเป็น {item['cost']} บาท
"""
    return text.strip()

def format_content(content):
    if isinstance(content, list):
        parts = []
        for p in content:
            if isinstance(p, dict) and p.get("type") == "text" and "text" in p:
                parts.append(p["text"])
            elif isinstance(p, str):
                parts.append(p)
        return "".join(parts)
    return str(content)

def ask_agent():
    result = calculate_electric_bill()
    summary = electricity_summary(result)

    human = f"""
นี่คือข้อมูลการใช้ไฟฟ้าของผู้ใช้:

{summary}

ช่วยวิเคราะห์ว่า:
- เครื่องใดเป็นสาเหตุหลักที่ค่าไฟสูง
- มีแนวทางลดค่าไฟอย่างไรบ้าง
- คำแนะนำควรทำลำดับใดก่อน
ตอบเป็นภาษาคนทั่วไป เข้าใจง่าย
""".strip()

    out = agent.invoke({
        "messages": [{
            "role": "user",
            "content": human
        }]
    })

    answer = out["messages"][-1].content
    return format_content(answer).strip()