const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// project root (used for calling Python + reading/writing CSV)
function findProjectRoot(startDir) {
  let cur = startDir;
  while (true) {
    const hasAI = fs.existsSync(path.join(cur, "ai"));
    const hasFrontend = fs.existsSync(path.join(cur, "frontend"));
    if (hasAI && hasFrontend) return cur;

    const parent = path.dirname(cur);
    if (parent === cur) return startDir; // กันหลุดถึง drive root
    cur = parent;
  }
}

const projectRoot = findProjectRoot(__dirname);
const electricityCsvPath = path.join(projectRoot, "ai", "data", "electricity.csv");
const outputCsvPath = path.join(projectRoot, "ai", "data", "output.csv");

// serve static files from /frontend
const frontendDir = path.join(projectRoot, "frontend");
app.use(express.static(frontendDir));

// serve หน้าเว็บจาก /frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// helper เขียน CSV แบบง่าย (ไม่ต้องเพิ่ม lib ใหม่)
function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeElectricityCSV(rows, filePath) {
  const header = "appliance,units\n";
  const body = rows.map(r => `${csvEscape(r.appliance)},${csvEscape(r.units)}`).join("\n");
  fs.writeFileSync(filePath, header + body + "\n", "utf8");
}

function resetElectricityCSV(filePath) {
  fs.writeFileSync(filePath, "appliance,units\n", "utf8");
}

function resetOutputCSV(filePath) {
  fs.writeFileSync(filePath, "created_at,answer\n", "utf8");
}


app.post("/calculate", (req, res) => {
  try {
    const data = Array.isArray(req.body) ? req.body : [];

    const rows = data
      .map(x => ({ appliance: String(x.appliance || "").trim(), units: Number(x.units) }))
      .filter(x => x.appliance && Number.isFinite(x.units));

    if (!rows.length) return res.status(400).json({ ok: false, error: "ข้อมูลไม่ถูกต้อง" });
    const electricityCsv = electricityCsvPath;
    const outputCsv = outputCsvPath;

    // 1) เขียน input ไปที่ ai/data/electricity.csv
    writeElectricityCSV(rows, electricityCsv);

    // 2) เรียก python ให้ประมวลผล + AI แนะนำ แล้วเขียน output.csv
    const py = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
    const args = ["-X", "utf8", "-m", "ai.app.main"];


    const child = spawn(py, args, {
      cwd: projectRoot,
      env: { 
        ...process.env, 
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1"
      },
    });

    let out = "";
    let err = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8"); 

    child.stdout.on("data", d => (out += d.toString()));
    child.stderr.on("data", d => (err += d.toString()));

    child.on("close", code => {
      if (code !== 0) {
        // ล้างไฟล์เพื่อไม่ทิ้งข้อมูลผู้ใช้ไว้
        try { resetElectricityCSV(electricityCsv); resetOutputCSV(outputCsv); } catch (e) {}
        return res.status(500).json({ ok: false, error: err || `python exit ${code}` });
      }
      // ล้างไฟล์ .csv หลังได้คำตอบแล้ว
      try { resetElectricityCSV(electricityCsv); resetOutputCSV(outputCsv); } catch (e) {}
      return res.json({ ok: true, answer: out.trim() });
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// ensure CSV files start clean
try { resetElectricityCSV(electricityCsvPath); resetOutputCSV(outputCsvPath); } catch (e) {}

app.listen(port, () => console.log(`listening at http://localhost:${port}`));