# นำเข้า lib pandas
import pandas as pd

def calculate_electric_bill():
    
    # ถ้าไม่กำหนด rate_per_unit กำหนดเป็น 5
    rate_per_unit   =   5
    csv_path        =   "ai/data/electricity.csv"

    #อ่านไฟล์
    df = pd.read_csv(csv_path)

    # สร้าง column ใหม่โดยเอา unit x ราคายูนิต
    df["cost"]  =   df["units"] * rate_per_unit
    total_cost  =   df["cost"].sum()    

    #เทส
    all_items       =   df.sort_values(
        by = "units" ,      # เรียงตามจำนวน unit ที่ใช้งาน
        ascending = False
        )[["appliance", "units", "cost"]].to_dict(orient="records")

    # ส่งออกค่า ใช่จ่ายรวมและเครื่องใช้ไฟฟ้าทั้ง 3 ชนิดที่กินไฟมากที่สุด โดยแปลงเป็น list
    return {
        "total_costs"    :   float(total_cost),
        "items"         :   all_items
    }