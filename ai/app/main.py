import sys
import csv
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # .../<root>
sys.path.insert(0, str(PROJECT_ROOT))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8") # type: ignore
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8") # type: ignore

from datetime import datetime
from ai.app.agent import ask_agent

def write_output_csv(out_path: str, answer: str):
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["created_at", "answer"])
        w.writeheader()
        w.writerow({
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "answer": answer
        })

def main():

    answer = ask_agent()
    write_output_csv("ai/data/output.csv", answer)

    # ส่งกลับให้ JS
    print(answer)

if __name__ == "__main__":
    main()