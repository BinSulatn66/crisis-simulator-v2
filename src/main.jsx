import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const C = { bg: "#070B14", panel: "#0C1220", panel2: "#101828", border: "#1A2840", borderLight: "#243550", gold: "#C9963A", goldDim: "#6B4E1A", goldBright: "#E8B84B", red: "#C94040", redDim: "#3D1515", redBright: "#E85555", green: "#3AAF7A", greenDim: "#0D3020", greenBright: "#4BE89A", blue: "#3A7AC9", blueDim: "#0D2040", blueBright: "#4B9AE8", purple: "#7A3AC9", purpleDim: "#1D0D3D", text: "#E8EDF8", textSub: "#5A7090", textMuted: "#2A3A50" };

const CRISES = [ 
  { id: "supply", label: "اﺿﻄﺮاب ﺳﻼﺳﻞ اﻹﻣﺪاد", icon: "📦", color: C.red }, 
  { id: "geo", label: "أزﻣﺔ ﺟﯿﻮﺳﯿﺎﺳﯿﺔ", icon: "🌍", color: C.gold }, 
  { id: "tech", label: "ﻗﯿﻮد ﺗﻘﻨﯿﺔ", icon: "💻", color: C.purple }, 
  { id: "pandemic", label: "ﺟﺎﺋﺤﺔ / أزﻣﺔ ﺻﺤﯿﺔ", icon: "🏥", color: C.redBright }, 
  { id: "financial", label: "أزﻣﺔ ﻣﺎﻟﯿﺔ ﻋﺎﻟﻤﯿﺔ", icon: "💰", color: C.blue }, 
  { id: "trade", label: "ﺣﺮب ﺗﺠﺎرﯾﺔ", icon: "⚔️", color: C.goldBright }, 
  { id: "carbon", label: "رﺳﻮم ﻛﺮﺑﻮن / ﺗﺸﺮﯾﻌﺎت ﺑﯿﺌﯿﺔ", icon: "🌱", color: C.green }, 
  { id: "custom", label: "أزﻣﺔ ﻣﺨﺼﺼﺔ", icon: "⚙️", color: C.purple }
];

const SECTORS = ["اﻟﻨﻔﻂ واﻟﻄﺎﻗﺔ","اﻟﻠﻮﺟﺴﺘﯿﺎت واﻟﺸﺤﻦ","اﻟﺘﻘﻨﯿﺔ واﻻﺗﺼﺎﻻت","اﻟﺘﺼﻨﯿﻊ واﻟصناعة","اﻟﺮﻋﺎﯾﺔ اﻟﺼﺤﯿﺔ","اﻟﺒﻨﻮك واﻟﺨﺪﻣﺎت اﻟﻤﺎﻟﯿﺔ","اﻟﺴﯿﺎﺣﺔ واﻟﻀﯿﺎﻓﺔ","اﻟﺰراﻋﺔ واﻟغذاء","اﻟﺘﺠﺰﺋﺔ واﻟﺘﺠﺎرة اﻹﻟﻜﺘﺮوﻧﯿﺔ","اﻟﺒﺘﺮوﻛﯿﻤﺎوﯾﺎت","اﻟﺪﻓﺎع واﻷﻣﻦ","اﻟﺘﻌﻠﯿﻢ واﻟﺒﺤﺚ اﻟﻌﻠﻤﻲ"];

const WARROOM_ROLES = [ 
  { id: "ceo", label: "اﻟﺮﺋﯿﺲ اﻟﺘﻨﻔﯿﺬي", icon: "👑", color: C.gold }, 
  { id: "cfo", label: "اﻟﻤﺪﯾﺮ اﻟﻤﺎﻟﻲ", icon: "📊", color: C.blue }, 
  { id: "coo", label: "رﺋﯿﺲ اﻟﻌﻤﻠﯿﺎت", icon: "⚙️", color: C.green }
];

const apiCall = async (messages, system = "") => {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.content.map(i => i.text || "").join("");
};

function Tag({ label, color }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: color + "22", border: \`1px solid \${color}44\`, color, fontFamily: "monospace", letterSpacing: 0.5 }}>{label}</span>
  );
}

function MetricCard({ label, value, unit = "%", color, sub }) {
  return (
    <div style={{ background: C.panel2, border: \`1px solid \${C.border}\`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, color: C.textSub, marginBottom: 8, fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "monospace", lineHeight: 1 }}>{value}<span style={{ fontSize: 16 }}>{unit}</span></div>
      {sub && <div style={{ fontSize: 11, color: C.textSub, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ label, value, color, note }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.text }}>{label}</span>
        <span style={{ fontSize: 12, color, fontFamily: "monospace", fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
        <div style={{ height: "100%", borderRadius: 3, width: \`\${value}%\`, background: \`linear-gradient(90deg, \${color}88, \${color})\`, boxShadow: \`0 0 10px \${color}55\`, transition: "width 1.2s ease" }} />
      </div>
      {note && <div style={{ fontSize: 10, color: C.textSub, marginTop: 3 }}>{note}</div>}
    </div>
  );
}

function Spark({ color }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: \`0 0 6px \${color}\`, animation: "pulse 1.8s infinite", marginLeft: 6 }} />;
}

function SectionHeader({ title, sub, badge }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
        {badge && <Tag label={badge} color={C.gold} />}
      </div>
      {sub && <div style={{ fontSize: 13, color: C.textSub }}>{sub}</div>}
    </div>
  );
}

export default function CrisisSimulator() {
  const [tab, setTab] = useState("setup");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState("");
  const [crisis, setCrisis] = useState(null);
  const [customCrisis, setCustomCrisis] = useState("");
  const [dependency, setDependency] = useState(65);
  const [reserve, setReserve] = useState(8);
  const [capex, setCapex] = useState(500);
  const [report, setReport] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "مرحباً بك في محاكي الأزمات الاستباقي. أنا هنا لمساعدتك في هندسة الصمود وتوقع المخاطر." }]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const runSimulation = async () => {
    if (!company || !sector || !crisis) return;
    setSimLoading(true);
    const crisisLabel = crisis === "custom" ? customCrisis : CRISES.find(c => c.id === crisis)?.label;
    const prompt = \`أنت محلل أزمات استراتيجي خبير في هندسة الصمود الاستباقي ومؤشرات RAROR وSRB.
بيانات المنشأة:
- الاسم: \${company}
- القطاع: \${sector}
- الأزمة المحاكاة: \${crisisLabel}
- الاعتماد على العامل المتأثر: \${dependency}%
- الاحتياطي المالي: \${reserve} أشهر
- الإنفاق الرأسمالي السنوي: \${capex} مليون ريال

أعطني JSON فقط بدون أي نص خارجه:
{
  "riskScore": 0-100,
  "financialImpact": 0-100,
  "readiness": 0-100,
  "recoveryMonths": رقم,
  "raror": رقم_عشري_بين 5- و10,
  "srb": 0-100,
  "capexHedge": {
    "recommendedPercent": 0-30,
    "targetSectors": [{"name":"قطاع","allocation":رقم,"reason":"سبب"}]
  },
  "expectedCoverage": 0-100,
  "phases": [
    {"name":"الإنذار المبكر","duration":"مدة","actions":["إجراء1","إجراء2"]},
    {"name":"ذروة الأزمة","duration":"مدة","actions":["إجراء1","إجراء2"]},
    {"name":"الانتعاش","duration":"مدة","actions":["إجراء1","إجراء2"]}
  ],
  "sparks": ["شرارة محتملة 1","شرارة محتملة 2","شرارة محتملة 3"],
  "recommendations": ["توصية1","توصية2","توصية3","توصية4"],
  "regulatoryRisks": ["خطر تشريعي1","خطر تشريعي2"],
  "summary": "ملخص تحليلي في 4 جمل يتضمن RAROR وSRB"
}\`;

    try {
      const text = await apiCall([{ role: "user", content: prompt }]);
      const clean = text.replace(/\\\`json|\\\`/g, "").trim();
      setReport({ ...JSON.parse(clean), company, sector, crisisLabel });
      setTab("dashboard");
    } catch (e) {
      alert("خطأ في المحاكاة: " + e.message);
    } finally {
      setSimLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoading) return;
    const userMsg = chatIn.trim();
    setChatIn("");
    const newMsgs = [...msgs, { role: "user", text: userMsg }];
    setMsgs(newMsgs);
    setChatLoading(true);

    try {
      const sys = \`أنت استشاري متخصص في هندسة الصمود الاستباقي وإدارة الأزمات. سياق: الشركة \${report?.company} في قطاع \${report?.sector}.\`;
      const text = await apiCall(newMsgs.map(m => ({ role: m.role, content: m.text })), sys);
      setMsgs(prev => [...prev, { role: "assistant", text }]);
    } catch (e) {
      setMsgs(prev => [...prev, { role: "assistant", text: "⚠ خطأ في الاتصال: " + e.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "sans-serif", direction: "rtl", padding: 20 }}>
      <header style={{ borderBottom: \`1px solid \${C.border}\`, paddingBottom: 15, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: C.gold, fontSize: 24, fontWeight: "bold" }}>محاكي الأزمات <span style={{ fontSize: 12, color: C.textSub }}>النموذج الثاني</span></h1>
          <p style={{ fontSize: 13, color: C.textSub }}>نظام هندسة الصمود الاستباقي (RAROR/SRB)</p>
        </div>
      </header>

      {tab === "setup" && (
        <div style={{ maxWidth: 600, margin: "0 auto", background: C.panel, padding: 30, borderRadius: 15, border: \`1px solid \${C.border}\` }}>
          <SectionHeader title="إعداد المحاكاة" sub="أدخل بيانات المنشأة ونوع الأزمة لبدء التحليل" />
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input placeholder="اسم المنشأة" value={company} onChange={e => setCompany(e.target.value)} style={{ background: C.panel2, border: \`1px solid \${C.border}\`, padding: 12, borderRadius: 8, color: C.text }} />
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ background: C.panel2, border: \`1px solid \${C.border}\`, padding: 12, borderRadius: 8, color: C.text }}>
              <option value="">اختر القطاع</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CRISES.map(c => (
                <button key={c.id} onClick={() => setCrisis(c.id)} style={{ padding: 15, borderRadius: 10, border: \`1px solid \${crisis === c.id ? c.color : C.border}\`, background: crisis === c.id ? c.color + "11" : C.panel2, color: crisis === c.id ? c.color : C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
            <button onClick={runSimulation} disabled={simLoading} style={{ background: C.gold, color: C.bg, border: "none", padding: 15, borderRadius: 10, fontWeight: "bold", marginTop: 10, opacity: simLoading ? 0.6 : 1 }}>
              {simLoading ? "جاري التحليل..." : "بدء محاكاة الأزمة"}
            </button>
          </div>
        </div>
      )}

      {tab === "dashboard" && report && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
              <MetricCard label="مؤشر المخاطر" value={report.riskScore} color={C.red} sub="مستوى التهديد الكلي" />
              <MetricCard label="RAROR" value={report.raror} unit="" color={C.gold} sub="العائد المعدل لمخاطر الصمود" />
              <MetricCard label="جاهزية الاستجابة" value={report.readiness} color={C.green} sub="قدرة المنشأة الحالية" />
            </div>
            <div style={{ background: C.panel, padding: 20, borderRadius: 12, border: \`1px solid \${C.border}\` }}>
              <SectionHeader title="ملخص التحليل" badge="استراتيجي" />
              <p style={{ lineHeight: 1.6, color: C.textSub }}>{report.summary}</p>
            </div>
          </div>
          <div style={{ background: C.panel, padding: 15, borderRadius: 12, border: \`1px solid \${C.border}\`, height: 500, display: "flex", flexDirection: "column" }}>
            <SectionHeader title="غرفة العمليات" />
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-start" : "flex-end", background: m.role === "user" ? C.border : C.panel2, padding: 10, borderRadius: 8, maxWidth: "85%", fontSize: 13 }}>
                  {m.text}
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <input value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="اسأل الخبير..." style={{ flex: 1, background: C.bg, border: \`1px solid \${C.border}\`, padding: 8, borderRadius: 5, color: C.text }} />
              <button onClick={sendChat} style={{ background: C.gold, border: "none", padding: "0 15px", borderRadius: 5, color: C.bg }}>إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CrisisSimulator />
  </React.StrictMode>
);