import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

var C = { bg: "#070B14", panel: "#0C1220", panel2: "#101828", border: "#1A2840", borderLight: "#243550", gold: "#C9963A", goldDim: "#6B4E1A", goldBright: "#E8B84B", red: "#C94040", redDim: "#3D1515", redBright: "#E85555", green: "#3AAF7A", greenDim: "#0D3020", greenBright: "#4BE89A", blue: "#3A7AC9", blueDim: "#0D2040", blueBright: "#4B9AE8", purple: "#7A3AC9", purpleDim: "#1D0D3D", text: "#E8EDF8", textSub: "#5A7090", textMuted: "#2A3A50" };

var CRISES = [ 
  { id: "supply", label: "اﺿﻄﺮاب ﺳﻼﺳﻞ اﻹﻣﺪاد", icon: "📦", color: C.red }, 
  { id: "geo", label: "أزﻣﺔ ﺟﯿﻮﺳﯿﺎﺳﯿﺔ", icon: "🌍", color: C.gold }, 
  { id: "tech", label: "ﻗﯿﻮد ﺗﻘﻨﯿﺔ", icon: "💻", color: C.purple }, 
  { id: "pandemic", label: "ﺟﺎﺋﺤﺔ / أزﻣﺔ ﺻﺤﯿﺔ", icon: "🏥", color: C.redBright }, 
  { id: "financial", label: "أزﻣﺔ ﻣﺎﻟﯿﺔ ﻋﺎﻟﻤﯿﺔ", icon: "💰", color: C.blue }, 
  { id: "trade", label: "ﺣﺮب ﺗﺟﺎرﯾﺔ", icon: "⚔️", color: C.goldBright }, 
  { id: "carbon", label: "رﺳﻮم ﻛﺮﺑﻮن / ﺗﺸﺮﯾﻌﺎت ﺑﯿﺌﯿﺔ", icon: "🌱", color: C.green }, 
  { id: "custom", label: "أزﻣﺔ ﻣﺨﺼﺼﺔ", icon: "⚙️", color: C.purple }
];

var SECTORS = ["اﻟﻨﻔﻂ واﻟﻄﺎﻗﺔ","اﻟﻠﻮﺟﺴﺘﯿﺎت واﻟﺸﺤﻦ","اﻟﺘﻘﻨﯿﺔ واﻻﺗﺼﺎﻻت","اﻟﺘﺼﻨﯿﻊ واﻟصناعة","اﻟﺮﻋﺎﯾﺔ اﻟﺼﺤﯿﺔ","اﻟﺒﻨﻮك واﻟﺨدﻣﺎت اﻟﻤﺎﻟﯿﺔ","اﻟﺴﯿﺎﺣﺔ واﻟﻀﯿﺎﻓﺔ","اﻟﺰراﻋﺔ واﻟغذاء","اﻟﺘﺠﺰﺋﺔ واﻟﺘﺠﺎرة اﻹﻟﻜﺘﺮوﻧﯿﺔ","اﻟﺒﺘﺮوﻛﯿﻤﺎوﯾﺎت","اﻟدﻓﺎع واﻷﻣﻦ","اﻟﺘﻌﻠﯿﻢ واﻟﺒﺤﺚ اﻟﻌﻠﻤﻲ"];

var WARROOM_ROLES = [ 
  { id: "ceo", label: "اﻟﺮﺋﯿﺲ اﻟﺘﻨﻔﯿﺬي", icon: "👑", color: C.gold }, 
  { id: "cfo", label: "اﻟﻤدﯾﺮ اﻟﻤﺎﻟﻲ", icon: "📊", color: C.blue }, 
  { id: "coo", label: "رﺋﯿﺲ اﻟﻌﻤﻠﯿﺎت", icon: "⚙️", color: C.green }
];

var apiCall = function(messages, system) {
  if (system === undefined) system = "";
  return fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages, system: system }),
  }).then(function(res) {
    return res.json();
  }).then(function(data) {
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.content.map(function(i) { return i.text || ""; }).join("");
  });
};

function Tag(props) {
  var label = props.label;
  var color = props.color;
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: color + "22", border: "1px solid " + color + "44", color: color, fontFamily: "monospace", letterSpacing: 0.5 }}>{label}</span>
  );
}

function MetricCard(props) {
  var label = props.label;
  var value = props.value;
  var unit = props.unit !== undefined ? props.unit : "%";
  var color = props.color;
  var sub = props.sub;
  return (
    <div style={{ background: C.panel2, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 10, color: C.textSub, marginBottom: 8, fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color, fontFamily: "monospace", lineHeight: 1 }}>{value}<span style={{ fontSize: 16 }}>{unit}</span></div>
      {sub && <div style={{ fontSize: 11, color: C.textSub, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar(props) {
  var label = props.label;
  var value = props.value;
  var color = props.color;
  var note = props.note;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.text }}>{label}</span>
        <span style={{ fontSize: 12, color: color, fontFamily: "monospace", fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
        <div style={{ height: "100%", borderRadius: 3, width: value + "%", background: "linear-gradient(90deg, " + color + "88, " + color + ")", boxShadow: "0 0 10px " + color + "55", transition: "width 1.2s ease" }} />
      </div>
      {note && <div style={{ fontSize: 10, color: C.textSub, marginTop: 3 }}>{note}</div>}
    </div>
  );
}

function Spark(props) {
  var color = props.color;
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: "0 0 6px " + color, animation: "pulse 1.8s infinite", marginLeft: 6 }} />;
}

function SectionHeader(props) {
  var title = props.title;
  var sub = props.sub;
  var badge = props.badge;
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

export function CrisisSimulator() {
  var state = useState("setup");
  var tab = state[0];
  var setTab = state[1];

  var companyState = useState("");
  var company = companyState[0];
  var setCompany = companyState[1];

  var sectorState = useState("");
  var sector = sectorState[0];
  var setSector = sectorState[1];

  var crisisState = useState(null);
  var crisis = crisisState[0];
  var setCrisis = crisisState[1];

  var customCrisisState = useState("");
  var customCrisis = customCrisisState[0];
  var setCustomCrisis = customCrisisState[1];

  var dependencyState = useState(65);
  var dependency = dependencyState[0];
  var setDependency = dependencyState[1];

  var reserveState = useState(8);
  var reserve = reserveState[0];
  var setReserve = reserveState[1];

  var capexState = useState(500);
  var capex = capexState[0];
  var setCapex = capexState[1];

  var reportState = useState(null);
  var report = reportState[0];
  var setReport = reportState[1];

  var simLoadingState = useState(false);
  var simLoading = simLoadingState[0];
  var setSimLoading = simLoadingState[1];

  var msgsState = useState([{ role: "assistant", text: "مرحباً بك في محاكي الأزمات الاستباقي. أنا هنا لمساعدتك في هندسة الصمود وتوقع المخاطر." }]);
  var msgs = msgsState[0];
  var setMsgs = msgsState[1];

  var chatInState = useState("");
  var chatIn = chatInState[0];
  var setChatIn = chatInState[1];

  var chatLoadingState = useState(false);
  var chatLoading = chatLoadingState[0];
  var setChatLoading = chatLoadingState[1];

  var chatEnd = useRef(null);

  useEffect(function() {
    if (chatEnd.current) {
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  var runSimulation = function() {
    if (!company || !sector || !crisis) return;
    setSimLoading(true);
    var crisisLabel = crisis === "custom" ? customCrisis : CRISES.filter(function(c) { return c.id === crisis; })[0].label;
    var prompt = "أنت محلل أزمات استراتيجي خبير في هندسة الصمود الاستباقي ومؤشرات RAROR وSRB.\n" +
"بيانات المنشأة:\n" +
"- الاسم: " + company + "\n" +
"- القطاع: " + sector + "\n" +
"- الأزمة المحاكاة: " + crisisLabel + "\n" +
"- الاعتماد على العامل المتأثر: " + dependency + "%\n" +
"- الاحتياطي المالي: " + reserve + " أشهر\n" +
"- الإنفاق الرأسمالي السنوي: " + capex + " مليون ريال\n\n" +
"أعطني JSON فقط بدون أي نص خارجه:\n" +
"{\n" +
"  \"riskScore\": 0-100,\n" +
"  \"financialImpact\": 0-100,\n" +
"  \"readiness\": 0-100,\n" +
"  \"recoveryMonths\": رقم,\n" +
"  \"raror\": رقم_عشري_بين 5- و10,\n" +
"  \"srb\": 0-100,\n" +
"  \"capexHedge\": {\n" +
"    \"recommendedPercent\": 0-30,\n" +
"    \"targetSectors\": [{\"name\":\"قطاع\",\"allocation\":رقم,\"reason\":\"سبب\"}]\n" +
"  },\n" +
"  \"expectedCoverage\": 0-100,\n" +
"  \"phases\": [\n" +
"    {\"name\":\"الإنذار المبكر\",\"duration\":\"مدة\",\"actions\":[\"إجراء1\",\"إجراء2\"]},\n" +
"    {\"name\":\"ذروة الأزمة\",\"duration\":\"مدة\",\"actions\":[\"إجراء1\",\"إجراء2\"]},\n" +
"    {\"name\":\"الانتعاش\",\"duration\":\"مدة\",\"actions\":[\"إجراء1\",\"إجراء2\"]}\n" +
"  ],\n" +
"  \"sparks\": [\"شرارة محتملة 1\",\"شرارة محتملة 2\",\"شرارة محتملة 3\"],\n" +
"  \"recommendations\": [\"توصية1\",\"توصية2\",\"توصية3\",\"توصية4\"],\n" +
"  \"regulatoryRisks\": [\"خطر تشريعي1\",\"خطر تشريعي2\"],\n" +
"  \"summary\": \"ملخص تحليلي في 4 جمل يتضمن RAROR وSRB\"\n" +
"}";

    apiCall([{ role: "user", content: prompt }]).then(function(text) {
      var clean = text.replace(/`json|`/g, "").trim();
      var parsed = JSON.parse(clean);
      parsed.company = company;
      parsed.sector = sector;
      parsed.crisisLabel = crisisLabel;
      setReport(parsed);
      setTab("dashboard");
    })["catch"](function(e) {
      alert("خطأ في المحاكاة: " + e.message);
    }).then(function() {
      setSimLoading(false);
    });
  };

  var sendChat = function() {
    if (!chatIn.trim() || chatLoading) return;
    var userMsg = chatIn.trim();
    setChatIn("");
    var newMsgs = msgs.concat([{ role: "user", text: userMsg }]);
    setMsgs(newMsgs);
    setChatLoading(true);

    var sys = "أنت استشاري متخصص في هندسة الصمود الاستباقي وإدارة الأزمات. سياق: الشركة " + (report ? report.company : "") + " في قطاع " + (report ? report.sector : "") + ".";
    apiCall(newMsgs.map(function(m) { return { role: m.role, content: m.text }; }), sys).then(function(text) {
      setMsgs(function(prev) { return prev.concat([{ role: "assistant", text: text }]); });
    })["catch"](function(e) {
      setMsgs(function(prev) { return prev.concat([{ role: "assistant", text: "⚠ خطأ في الاتصال: " + e.message }]); });
    }).then(function() {
      setChatLoading(false);
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "sans-serif", direction: "rtl", padding: 20 }}>
      <header style={{ borderBottom: "1px solid " + C.border, paddingBottom: 15, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: C.gold, fontSize: 24, fontWeight: "bold" }}>محاكي الأزمات <span style={{ fontSize: 12, color: C.textSub }}>النموذج الثاني</span></h1>
          <p style={{ fontSize: 13, color: C.textSub }}>نظام هندسة الصمود الاستباقي (RAROR/SRB)</p>
        </div>
      </header>

      {tab === "setup" && (
        <div style={{ maxWidth: 600, margin: "0 auto", background: C.panel, padding: 30, borderRadius: 15, border: "1px solid " + C.border }}>
          <SectionHeader title="إعداد المحاكاة" sub="أدخل بيانات المنشأة ونوع الأزمة لبدء التحليل" />
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input placeholder="اسم المنشأة" value={company} onChange={function(e) { setCompany(e.target.value); }} style={{ background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text }} />
            <select value={sector} onChange={function(e) { setSector(e.target.value); }} style={{ background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text }}>
              <option value="">اختر القطاع</option>
              {SECTORS.map(function(s) { return <option key={s} value={s}>{s}</option>; })}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CRISES.map(function(c) {
                return (
                  <button key={c.id} onClick={function() { setCrisis(c.id); }} style={{ padding: 15, borderRadius: 10, border: "1px solid " + (crisis === c.id ? c.color : C.border), background: crisis === c.id ? c.color + "11" : C.panel2, color: crisis === c.id ? c.color : C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{c.icon}</span> {c.label}
                  </button>
                );
              })}
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
            <div style={{ background: C.panel, padding: 20, borderRadius: 12, border: "1px solid " + C.border }}>
              <SectionHeader title="ملخص التحليل" badge="استراتيجي" />
              <p style={{ lineHeight: 1.6, color: C.textSub }}>{report.summary}</p>
            </div>
          </div>
          <div style={{ background: C.panel, padding: 15, borderRadius: 12, border: "1px solid " + C.border, height: 500, display: "flex", flexDirection: "column" }}>
            <SectionHeader title="غرفة العمليات" />
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map(function(m, i) {
                return (
                  <div key={i} style={{ alignSelf: m.role === "user" ? "flex-start" : "flex-end", background: m.role === "user" ? C.border : C.panel2, padding: 10, borderRadius: 8, maxWidth: "85%", fontSize: 13 }}>
                    {m.text}
                  </div>
                );
              })}
              <div ref={chatEnd} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <input value={chatIn} onChange={function(e) { setChatIn(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") sendChat(); }} placeholder="اسأل الخبير..." style={{ flex: 1, background: C.bg, border: "1px solid " + C.border, padding: 8, borderRadius: 5, color: C.text }} />
              <button onClick={sendChat} style={{ background: C.gold, border: "none", padding: "0 15px", borderRadius: 5, color: C.bg }}>إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, 
    React.createElement(CrisisSimulator, null)
  )
);
