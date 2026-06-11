import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

/* 
   Crisis Simulator - Model 2 (Strict ES5 Implementation)
   Target: Legacy Mobile Safari (absolutely no ES6 syntax)
*/

var C = {
  bg: "#070B14",
  panel: "#0C1220",
  panel2: "#101828",
  border: "#1A2840",
  borderLight: "#243550",
  gold: "#C9963A",
  goldDim: "#6B4E1A",
  goldBright: "#E8B84B",
  red: "#C94040",
  redDim: "#3D1515",
  redBright: "#E85555",
  green: "#3AAF7A",
  greenDim: "#0D3020",
  greenBright: "#4BE89A",
  blue: "#3A7AC9",
  blueDim: "#0D2040",
  blueBright: "#4B9AE8",
  purple: "#7A3AC9",
  purpleDim: "#1D0D3D",
  text: "#E8EDF8",
  textSub: "#5A7090",
  textMuted: "#2A3A50"
};

var CRISES = [
  { id: "supply", label: "اضطراب سلاسل الإمداد", icon: "📦", color: C.red },
  { id: "geo", label: "أزمة جيوسياسية", icon: "🌍", color: C.gold },
  { id: "tech", label: "قيود تقنية", icon: "💻", color: C.purple },
  { id: "pandemic", label: "جائحة / أزمة صحية", icon: "🏥", color: C.redBright },
  { id: "financial", label: "أزمة مالية عالمية", icon: "💰", color: C.blue },
  { id: "trade", label: "حرب تجارية", icon: "⚔️", color: C.goldBright },
  { id: "carbon", label: "رسوم كربون / تشريعات بيئية", icon: "🌱", color: C.green },
  { id: "custom", label: "أزمة مخصصة", icon: "⚙️", color: C.purple }
];

var SECTORS = [
  "النفط والطاقة",
  "اللوجستيات والشحن",
  "التقنية والاتصالات",
  "التصنيع والصناعة",
  "الرعاية الصحية",
  "البنوك والخدمات المالية",
  "السياحة والضيافة",
  "الزراعة والغذاء",
  "التجارة الإلكترونية",
  "البتروكيماويات",
  "الدفاع والأمن",
  "التعليم والبحث"
];

var css = "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&display=swap');" +
  "*{box-sizing:border-box;margin:0;padding:0}" +
  "body{background:#070B14;color:#E8EDF8;font-family:'IBM Plex Sans Arabic', sans-serif;direction:rtl;text-align:right}" +
  "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}" +
  ".anim{animation:fadeUp 0.4s ease}" +
  ".clickable{cursor:pointer;transition:all 0.2s}" +
  ".clickable:hover{opacity:0.8}" +
  "input[type=range]{width:100%;accent-color:#C9963A}";

var apiCall = function(messages, system) {
  var body = {
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 2000,
    messages: messages
  };
  if (system) { body.system = system; }
  
  return fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(function(res) {
    return res.json();
  }).then(function(data) {
    if (data.error) { throw new Error(data.error.message || "API Error"); }
    var content = "";
    for (var i = 0; i < data.content.length; i++) {
      content += (data.content[i].text || "");
    }
    return content;
  });
};

function Tag(props) {
  return React.createElement("span", {
    style: { fontSize: 10, padding: "2px 8px", borderRadius: 4, background: props.color + "22", border: "1px solid " + props.color + "44", color: props.color, fontFamily: "monospace" }
  }, props.label);
}

function MetricCard(props) {
  return React.createElement("div", {
    style: { background: C.panel2, border: "1px solid " + C.border, borderRadius: 10, padding: "16px" }
  },
    React.createElement("div", { style: { fontSize: 10, color: C.textSub, marginBottom: 8 } }, props.label),
    React.createElement("div", { style: { fontSize: 28, fontWeight: 700, color: props.color || C.text } }, 
      props.value, 
      React.createElement("span", { style: { fontSize: 14, marginLeft: 4 } }, props.unit || "%")
    ),
    props.sub ? React.createElement("div", { style: { fontSize: 11, color: C.textSub, marginTop: 4 } }, props.sub) : null
  );
}

function SectionHeader(props) {
  return React.createElement("div", { style: { marginBottom: 20 } },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 } },
      React.createElement("div", { style: { fontSize: 18, fontWeight: 700 } }, props.title),
      props.badge ? React.createElement(Tag, { label: props.badge, color: C.gold }) : null
    ),
    props.sub ? React.createElement("div", { style: { fontSize: 13, color: C.textSub } }, props.sub) : null
  );
}

export default function CrisisSimulator() {
  var tabState = useState("setup");
  var tab = tabState[0];
  var setTab = tabState[1];

  var companyState = useState("");
  var company = companyState[0];
  var setCompany = companyState[1];

  var sectorState = useState("");
  var sector = sectorState[0];
  var setSector = sectorState[1];

  var crisisState = useState(null);
  var crisis = crisisState[0];
  var setCrisis = crisisState[1];

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

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var runSimulation = function() {
    if (!company || !sector || !crisis) { return alert("يرجى إكمال البيانات"); }
    setLoading(true);
    
    var crisisLabel = "";
    for (var i = 0; i < CRISES.length; i++) {
      if (CRISES[i].id === crisis) { crisisLabel = CRISES[i].label; break; }
    }

    var prompt = "أنت محلل أزمات استراتيجي. قم بتحليل المخاطر التالية وأعطني JSON حصراً:\n" +
      "الشركة: " + company + "\n" +
      "القطاع: " + sector + "\n" +
      "الأزمة: " + crisisLabel + "\n" +
      "الاعتمادية: " + dependency + "%\n" +
      "الاحتياطي: " + reserve + " أشهر\n" +
      "الإنفاق الرأسمالي: " + capex + " مليون ريال\n" +
      "مطلوب JSON: { riskScore, financialImpact, readiness, raror, srb, summary, recommendations: [] }";

    apiCall([{ role: "user", content: prompt }])
      .then(function(text) {
        var clean = text.replace(/```json|```/g, "").trim();
        var parsed = JSON.parse(clean);
        parsed.company = company;
        parsed.sector = sector;
        parsed.crisisLabel = crisisLabel;
        setReport(parsed);
        setTab("dashboard");
      })
      .catch(function(err) { alert("خطأ: " + err.message); })
      .then(function() { setLoading(false); });
  };

  var setupView = React.createElement("div", { style: { maxWidth: 600, margin: "40px auto", background: C.panel, padding: 30, borderRadius: 15, border: "1px solid " + C.border } },
    React.createElement(SectionHeader, { title: "إعداد المحاكاة الاستراتيجية", sub: "أدخل بيانات المنشأة ونوع التهديد لبناء نموذج الصمود" }),
    
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } },
      React.createElement("input", {
        placeholder: "اسم المنشأة / الشركة",
        value: company,
        onChange: function(e) { setCompany(e.target.value); },
        style: { background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text, textAlign: "right" }
      }),
      
      React.createElement("select", {
        value: sector,
        onChange: function(e) { setSector(e.target.value); },
        style: { background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text }
      },
        React.createElement("option", { value: "" }, "اختر القطاع الحيوي"),
        SECTORS.map(function(s) { return React.createElement("option", { key: s, value: s }, s); })
      ),

      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 13, color: C.textSub, marginBottom: 10 } }, "مستوى الاعتماد على العامل المتأثر (" + dependency + "%)"),
        React.createElement("input", {
          type: "range", min: 0, max: 100, value: dependency,
          onChange: function(e) { setDependency(e.target.value); }
        })
      ),

      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 13, color: C.textSub, marginBottom: 10 } }, "الاحتياطي المالي التشغيلي (" + reserve + " أشهر)"),
        React.createElement("input", {
          type: "range", min: 1, max: 24, value: reserve,
          onChange: function(e) { setReserve(e.target.value); }
        })
      ),

      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        CRISES.map(function(c) {
          return React.createElement("div", {
            key: c.id,
            onClick: function() { setCrisis(c.id); },
            className: "clickable",
            style: { 
              padding: 15, borderRadius: 10, border: "1px solid " + (crisis === c.id ? c.color : C.border),
              background: crisis === c.id ? c.color + "15" : C.panel2,
              textAlign: "center"
            }
          },
            React.createElement("div", { style: { fontSize: 20, marginBottom: 5 } }, c.icon),
            React.createElement("div", { style: { fontSize: 11, color: crisis === c.id ? C.text : C.textSub } }, c.label)
          );
        })
      ),

      React.createElement("button", {
        onClick: runSimulation,
        disabled: loading,
        style: { background: C.gold, color: C.bg, padding: 15, borderRadius: 10, fontWeight: "bold", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }
      }, loading ? "جاري المعالجة..." : "بدء محاكاة الأزمة")
    )
  );

  var dashboardView = report ? React.createElement("div", { style: { maxWidth: 900, margin: "20px auto" } },
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15, marginBottom: 20 } },
      React.createElement(MetricCard, { label: "مؤشر المخاطر", value: report.riskScore, color: C.red, sub: "مستوى التهديد الكلي" }),
      React.createElement(MetricCard, { label: "RAROR", value: report.raror, unit: "", color: C.gold, sub: "العائد المعدل لمخاطر الصمود" }),
      React.createElement(MetricCard, { label: "SRB", value: report.srb, unit: "", color: C.blue, sub: "مؤشر كفاءة الإنفاق" }),
      React.createElement(MetricCard, { label: "الجاهزية", value: report.readiness, color: C.green, sub: "قدرة المنشأة على الصمود" })
    ),
    React.createElement("div", { style: { background: C.panel, padding: 25, borderRadius: 12, border: "1px solid " + C.border } },
      React.createElement(SectionHeader, { title: "التحليل الاستراتيجي: " + report.company, badge: report.crisisLabel }),
      React.createElement("p", { style: { lineHeight: 1.8, color: C.textSub, marginBottom: 20 } }, report.summary),
      React.createElement("div", { style: { borderTop: "1px solid " + C.border, paddingTop: 20 } },
        React.createElement("div", { style: { fontWeight: "bold", marginBottom: 10, color: C.gold } }, "التوصيات الوقائية:"),
        React.createElement("ul", { style: { listStyle: "none", padding: 0 } },
          report.recommendations.map(function(r, i) {
            return React.createElement("li", { key: i, style: { marginBottom: 8, padding: "8px 12px", background: C.panel2, borderRadius: 6, fontSize: 13, borderRight: "3px solid " + C.gold } }, r);
          })
        )
      ),
      React.createElement("button", {
        onClick: function() { setTab("setup"); },
        style: { marginTop: 25, background: "transparent", color: C.gold, border: "1px solid " + C.gold, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }
      }, "إعادة الضبط")
    )
  ) : null;

  return React.createElement("div", { style: { minHeight: "100vh", background: C.bg, padding: 20 } },
    React.createElement("style", null, css),
    React.createElement("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, borderBottom: "1px solid " + C.border, paddingBottom: 15 } },
      React.createElement("div", null,
        React.createElement("div", { style: { fontSize: 22, fontWeight: 700, color: C.gold } }, "محاكي الأزمات | Crisis Simulator"),
        React.createElement("div", { style: { fontSize: 12, color: C.textSub } }, "نظام هندسة الصمود الاستباقي (RAROR/SRB)")
      ),
      React.createElement("div", { style: { width: 40, height: 40, background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontWeight: "bold" } }, "V2")
    ),
    tab === "setup" ? setupView : dashboardView
  );
}

var rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    React.createElement(React.StrictMode, null,
      React.createElement(CrisisSimulator, null)
    )
  );
}
