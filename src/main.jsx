import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

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
  { id: "supply", label: "اﺿﻄﺮاب ﺳﻼﺳﻞ اﻹﻣﺪاد", icon: "📦", color: C.red },
  { id: "geo", label: "أزﻣﺔ ﺟﯿﻮﺳﯿﺎﺳﯿﺔ", icon: "🌍", color: C.gold },
  { id: "tech", label: "ﻗﯿﻮد ﺗﻘﻨﯿﺔ", icon: "💻", color: C.purple },
  { id: "pandemic", label: "ﺟﺎﺋﺤﺔ / أزﻣﺔ ﺻﺤﯿﺔ", icon: "🏥", color: C.redBright },
  { id: "financial", label: "أزﻣﺔ ﻣﺎﻟﯿﺔ ﻋﺎﻟﻤﯿﺔ", icon: "💰", color: C.blue },
  { id: "trade", label: "ﺣﺮب ﺗﺠﺎرﯾﺔ", icon: "⚔️", color: C.goldBright },
  { id: "carbon", label: "رﺳﻮم ﻛﺮﺑﻮن / ﺗﺸﺮﯾﻌﺎت ﺑﯿﺌﯿﺔ", icon: "🌱", color: C.green },
  { id: "custom", label: "أزﻣﺔ ﻣﺨﺼﺼﺔ", icon: "⚙️", color: C.purple }
];

var SECTORS = [
  "اﻟﻨﻔﻂ واﻟﻄﺎﻗﺔ", "اﻟﻠﻮﺟﺴﺘﯿﺎت واﻟﺸﺤﻦ", "اﻟﺘﻘﻨﯿﺔ واﻻﺗﺼﺎﻻت", "اﻟﺘﺼﻨﯿﻊ واﻟصناعة",
  "اﻟﺮﻋﺎﯾﺔ اﻟﺼﺤﯿﺔ", "اﻟﺒﻨﻮك واﻟﺨﺪﻣﺎت اﻟﻤﺎﻟﯿﺔ", "اﻟﺴﯿﺎﺣﺔ واﻟﻀﯿﺎﻓﺔ", "اﻟﺰراﻋﺔ واﻟﻐﺬاء",
  "اﻟﺘﺠﺰﺋﺔ واﻟﺘﺠﺎرة اﻹﻟﻜﺘﺮوﻧﯿﺔ", "اﻟﺒﺘﺮوﻛﯿﻤﺎوﯾﺎت", "اﻟﺪﻓﺎع واﻷﻣﻦ", "اﻟﺘﻌﻠﯿﻢ واﻟﺒﺤﺚ اﻟﻌﻠﻤﻲ"
];

var WARROOM_ROLES = [
  { id: "ceo", label: "اﻟﺮﺋﯿﺲ اﻟﺘﻨﻔﯿﺬي", icon: "👑", color: C.gold },
  { id: "cfo", label: "اﻟﻤﺪﯾﺮ اﻟﻤﺎﻟﻲ", icon: "📊", color: C.blue },
  { id: "coo", label: "رﺋﯿﺲ اﻟﻌﻤﻠﯿﺎت", icon: "⚙️", color: C.green }
];

var apiCall = function(messages, system) {
  if (system === undefined) system = "";
  return fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages, system: system })
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
  return React.createElement("span", {
    style: {
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 4,
      background: color + "22",
      border: "1px solid " + color + "44",
      color: color,
      fontFamily: "monospace",
      letterSpacing: 0.5
    }
  }, label);
}

function MetricCard(props) {
  var label = props.label;
  var value = props.value;
  var unit = props.unit !== undefined ? props.unit : "%";
  var color = props.color;
  var sub = props.sub;
  return React.createElement("div", {
    style: {
      background: C.panel2,
      border: "1px solid " + C.border,
      borderRadius: 10,
      padding: "16px 18px"
    }
  }, [
    React.createElement("div", {
      key: "label",
      style: { fontSize: 10, color: C.textSub, marginBottom: 8, fontFamily: "monospace" }
    }, label),
    React.createElement("div", {
      key: "value",
      style: { fontSize: 32, fontWeight: 700, color: color, fontFamily: "monospace", lineHeight: 1 }
    }, [
      value,
      React.createElement("span", { key: "unit", style: { fontSize: 16 } }, unit)
    ]),
    sub ? React.createElement("div", {
      key: "sub",
      style: { fontSize: 11, color: C.textSub, marginTop: 6 }
    }, sub) : null
  ]);
}

function ProgressBar(props) {
  var label = props.label;
  var value = props.value;
  var color = props.color;
  var note = props.note;
  return React.createElement("div", { style: { marginBottom: 14 } }, [
    React.createElement("div", {
      key: "header",
      style: { display: "flex", justifyContent: "space-between", marginBottom: 5 }
    }, [
      React.createElement("span", { key: "l", style: { fontSize: 12, color: C.text } }, label),
      React.createElement("span", { key: "v", style: { fontSize: 12, color: color, fontFamily: "monospace", fontWeight: 600 } }, value + "%")
    ]),
    React.createElement("div", {
      key: "track",
      style: { height: 5, background: C.border, borderRadius: 3 }
    }, React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 3,
        width: value + "%",
        background: "linear-gradient(90deg, " + color + "88, " + color + ")",
        boxShadow: "0 0 10px " + color + "55",
        transition: "width 1.2s ease"
      }
    })),
    note ? React.createElement("div", {
      key: "note",
      style: { fontSize: 10, color: C.textSub, marginTop: 3 }
    }, note) : null
  ]);
}

function Spark(props) {
  var color = props.color;
  return React.createElement("span", {
    style: {
      display: "inline-block",
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: color,
      boxShadow: "0 0 6px " + color,
      animation: "pulse 1.8s infinite",
      marginLeft: 6
    }
  });
}

function SectionHeader(props) {
  var title = props.title;
  var sub = props.sub;
  var badge = props.badge;
  return React.createElement("div", { style: { marginBottom: 20 } }, [
    React.createElement("div", {
      key: "t",
      style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }
    }, [
      React.createElement("div", { key: "title", style: { fontSize: 18, fontWeight: 700 } }, title),
      badge ? React.createElement(Tag, { key: "badge", label: badge, color: C.gold }) : null
    ]),
    sub ? React.createElement("div", {
      key: "sub",
      style: { fontSize: 13, color: C.textSub }
    }, sub) : null
  ]);
}

export function CrisisSimulator() {
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

  var msgsState = useState([{
    role: "assistant",
    text: "مرحباً بك في محاكي الأزمات الاستباقي. أنا هنا لمساعدتك في هندسة الصمود وتوقع المخاطر."
  }]);
  var msgs = msgsState[0];
  var setMsgs = msgsState[1];

  var chatInState = useState("");
  var chatIn = chatInState[0];
  var setChatIn = chatInState[1];

  var chatLoadingState = useState(false);
  var chatLoading = chatLoadingState[0];
  var setChatLoading = chatLoadingState[1];

  var warActiveState = useState(false);
  var warActive = warActiveState[0];
  var setWarActive = warActiveState[1];

  var warRoleState = useState(null);
  var warRole = warRoleState[0];
  var setWarRole = warRoleState[1];

  var warEventsState = useState([]);
  var warEvents = warEventsState[0];
  var setWarEvents = warEventsState[1];

  var warDecisionsState = useState({});
  var warDecisions = warDecisionsState[0];
  var setWarDecisions = warDecisionsState[1];

  var warLoadingState = useState(false);
  var warLoading = warLoadingState[0];
  var setWarLoading = warLoadingState[1];

  var warPhaseState = useState(0);
  var warPhase = warPhaseState[0];
  var setWarPhase = warPhaseState[1];

  var warResultState = useState(null);
  var warResult = warResultState[0];
  var setWarResult = warResultState[1];

  var chatEnd = useRef(null);

  useEffect(function() {
    if (chatEnd.current) {
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);

  var runSimulation = function() {
    if (!company || !sector || !crisis) return;
    setSimLoading(true);
    var selectedCrisis = CRISES.filter(function(c) { return c.id === crisis; })[0];
    var crisisLabel = crisis === "custom" ? customCrisis : (selectedCrisis ? selectedCrisis.label : "");
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
    apiCall(newMsgs.map(function(m) {
      return { role: m.role, content: m.text };
    }), sys).then(function(text) {
      setMsgs(function(prev) { return prev.concat([{ role: "assistant", text: text }]); });
    })["catch"](function(e) {
      setMsgs(function(prev) { return prev.concat([{ role: "assistant", text: "⚠ خطأ في الاتصال: " + e.message }]); });
    }).then(function() {
      setChatLoading(false);
    });
  };

  var startWarRoom = function() {
    if (!report || !warRole) return;
    setWarLoading(true);
    setWarEvents([]);
    setWarDecisions({});
    setWarPhase(0);
    setWarResult(null);
    setWarActive(true);

    var roleObj = WARROOM_ROLES.filter(function(r) { return r.id === warRole; })[0];
    var prompt = "أنت قائد غرفة عمليات أزمات. الشركة " + report.company + " تواجه " + report.crisisLabel + ".\n" +
      "أنت تمثل دور: " + (roleObj ? roleObj.label : "") + ".\n" +
      "أنشئ 3 مراحل متتالية من الأزمة، كل مرحلة فيها حدث صادم وخيارات قرار.\n" +
      "أعطني JSON فقط:\n" +
      "{\"phases\":[" +
      "{\"phase\":1,\"title\":\"عنوان\",\"event\":\"وصف الحدث\",\"options\":[\"خيار أ\",\"خيار ب\",\"خيار ج\"]}," +
      "{\"phase\":2,\"title\":\"عنوان\",\"event\":\"وصف\",\"options\":[\"خيار أ\",\"خيار ب\",\"خيار ج\"]}," +
      "{\"phase\":3,\"title\":\"عنوان\",\"event\":\"وصف\",\"options\":[\"خيار أ\",\"خيار ب\",\"خيار ج\"]}" +
      "]}";

    apiCall([{ role: "user", content: prompt }]).then(function(text) {
      var clean = text.replace(/`json|`/g, "").trim();
      var parsed = JSON.parse(clean);
      setWarEvents(parsed.phases);
    })["catch"](function(e) {
      alert("خطأ في غرفة العمليات: " + e.message);
      setWarActive(false);
    }).then(function() {
      setWarLoading(false);
    });
  };

  var makeWarDecision = function(phaseIdx, decision) {
    var newDec = JSON.parse(JSON.stringify(warDecisions));
    newDec[phaseIdx] = decision;
    setWarDecisions(newDec);
    if (phaseIdx < 2) {
      setWarPhase(phaseIdx + 1);
    } else {
      setWarLoading(true);
      var decisionsText = "";
      for (var key in newDec) {
        decisionsText += "المرحلة " + (parseInt(key) + 1) + ": " + newDec[key] + " | ";
      }
      var prompt = "شركة " + report.company + " واجهت أزمة " + report.crisisLabel + ".\n" +
        "قرارات القائد: " + decisionsText + ".\n" +
        "قيم الأداء وأعطني JSON فقط:\n" +
        "{\"resilienceScore\":0-100,\"financialSaved\":0-100,\"verdict\":\"حكم موجز\",\"strengths\":[\"نقطة1\",\"نقطة2\"]}";

      apiCall([{ role: "user", content: prompt }]).then(function(text) {
        var clean = text.replace(/`json|`/g, "").trim();
        setWarResult(JSON.parse(clean));
        setWarPhase(3);
      })["catch"](function(e) {
        alert("خطأ في تقييم القرارات");
      }).then(function() {
        setWarLoading(false);
      });
    }
  };

  return React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "sans-serif",
      direction: "rtl",
      padding: 20
    }
  }, [
    React.createElement("header", {
      key: "header",
      style: { borderBottom: "1px solid " + C.border, paddingBottom: 15, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }
    }, React.createElement("div", null, [
      React.createElement("h1", { key: "h1", style: { color: C.gold, fontSize: 24, fontWeight: "bold" } }, [
        "محاكي الأزمات ",
        React.createElement("span", { key: "s", style: { fontSize: 12, color: C.textSub } }, "النموذج الثاني")
      ]),
      React.createElement("p", { key: "p", style: { fontSize: 13, color: C.textSub } }, "نظام هندسة الصمود الاستباقي (RAROR/SRB)")
    ])),

    tab === "setup" ? React.createElement("div", {
      key: "setup",
      style: { maxWidth: 600, margin: "0 auto", background: C.panel, padding: 30, borderRadius: 15, border: "1px solid " + C.border }
    }, [
      React.createElement(SectionHeader, { key: "sh", title: "إعداد المحاكاة", sub: "أدخل بيانات المنشأة ونوع الأزمة لبدء التحليل" }),
      React.createElement("div", { key: "f", style: { display: "flex", flexDirection: "column", gap: 15 } }, [
        React.createElement("input", {
          key: "i1",
          placeholder: "اسم المنشأة",
          value: company,
          onChange: function(e) { setCompany(e.target.value); },
          style: { background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text }
        }),
        React.createElement("select", {
          key: "s1",
          value: sector,
          onChange: function(e) { setSector(e.target.value); },
          style: { background: C.panel2, border: "1px solid " + C.border, padding: 12, borderRadius: 8, color: C.text }
        }, [
          React.createElement("option", { key: "default", value: "" }, "اختر القطاع"),
          SECTORS.map(function(s) { return React.createElement("option", { key: s, value: s }, s); })
        ]),
        React.createElement("div", {
          key: "g1",
          style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }
        }, CRISES.map(function(c) {
          return React.createElement("button", {
            key: c.id,
            onClick: function() { setCrisis(c.id); },
            style: {
              padding: 15,
              borderRadius: 10,
              border: "1px solid " + (crisis === c.id ? c.color : C.border),
              background: crisis === c.id ? c.color + "11" : C.panel2,
              color: crisis === c.id ? c.color : C.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }
          }, [React.createElement("span", { key: "i" }, c.icon), c.label]);
        })),
        React.createElement("button", {
          key: "b1",
          onClick: runSimulation,
          disabled: simLoading,
          style: { background: C.gold, color: C.bg, border: "none", padding: 15, borderRadius: 10, fontWeight: "bold", marginTop: 10, opacity: simLoading ? 0.6 : 1 }
        }, simLoading ? "جاري التحليل..." : "بدء محاكاة الأزمة")
      ])
    ]) : null,

    tab === "dashboard" && report ? React.createElement("div", {
      key: "dashboard",
      style: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }
    }, [
      React.createElement("div", { key: "main", style: { display: "flex", flexDirection: "column", gap: 20 } }, [
        React.createElement("div", {
          key: "metrics",
          style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }
        }, [
          React.createElement(MetricCard, { key: "m1", label: "مؤشر المخاطر", value: report.riskScore, color: C.red, sub: "مستوى التهديد الكلي" }),
          React.createElement(MetricCard, { key: "m2", label: "RAROR", value: report.raror, unit: "", color: C.gold, sub: "العائد المعدل لمخاطر الصمود" }),
          React.createElement(MetricCard, { key: "m3", label: "جاهزية الاستجابة", value: report.readiness, color: C.green, sub: "قدرة المنشأة الحالية" })
        ]),
        React.createElement("div", {
          key: "summary",
          style: { background: C.panel, padding: 20, borderRadius: 12, border: "1px solid " + C.border }
        }, [
          React.createElement(SectionHeader, { key: "sh2", title: "ملخص التحليل", badge: "استراتيجي" }),
          React.createElement("p", { key: "sum", style: { lineHeight: 1.6, color: C.textSub } }, report.summary)
        ]),
        React.createElement("button", {
            key: "wr-btn",
            onClick: function() { setWarActive(true); },
            style: { background: C.redDim, border: "1px solid " + C.red, color: C.redBright, padding: 15, borderRadius: 10, fontWeight: "bold" }
        }, "دخول غرفة العمليات (War Room)")
      ]),
      React.createElement("div", {
        key: "sidebar",
        style: { background: C.panel, padding: 15, borderRadius: 12, border: "1px solid " + C.border, height: 600, display: "flex", flexDirection: "column" }
      }, [
        React.createElement(SectionHeader, { key: "sh3", title: "مستشار الصمود" }),
        React.createElement("div", {
          key: "chat",
          style: { flex: 1, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }
        }, [
          msgs.map(function(m, i) {
            return React.createElement("div", {
              key: i,
              style: {
                alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                background: m.role === "user" ? C.border : C.panel2,
                padding: 10,
                borderRadius: 8,
                maxWidth: "85%",
                fontSize: 13
              }
            }, m.text);
          }),
          React.createElement("div", { key: "end", ref: chatEnd })
        ]),
        React.createElement("div", { key: "input-area", style: { display: "flex", gap: 5 } }, [
          React.createElement("input", {
            key: "ci",
            value: chatIn,
            onChange: function(e) { setChatIn(e.target.value); },
            onKeyDown: function(e) { if (e.key === "Enter") sendChat(); },
            placeholder: "اسأل الخبير...",
            style: { flex: 1, background: C.bg, border: "1px solid " + C.border, padding: 8, borderRadius: 5, color: C.text }
          }),
          React.createElement("button", {
            key: "cb",
            onClick: sendChat,
            style: { background: C.gold, border: "none", padding: "0 15px", borderRadius: 5, color: C.bg }
          }, "إرسال")
        ])
      ])
    ]) : null,

    warActive ? React.createElement("div", {
        key: "warroom-modal",
        style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(7,11,20,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }
    }, React.createElement("div", {
        style: { background: C.panel, border: "1px solid " + C.gold, borderRadius: 20, maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 30, position: "relative" }
    }, [
        React.createElement("button", {
            key: "close",
            onClick: function() { setWarActive(false); },
            style: { position: "absolute", top: 20, left: 20, background: "none", border: "none", color: C.textSub, fontSize: 20 }
        }, "✕"),
        React.createElement(SectionHeader, { key: "wsh", title: "غرفة العمليات الاستراتيجية", badge: "Live Drill" }),
        !warRole ? React.createElement("div", { key: "role-sel" }, [
            React.createElement("p", { key: "rp", style: { marginBottom: 20 } }, "اختر دورك القيادي في هذه الأزمة:"),
            React.createElement("div", { key: "rg", style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 } }, WARROOM_ROLES.map(function(r) {
                return React.createElement("button", {
                    key: r.id,
                    onClick: function() { setWarRole(r.id); },
                    style: { padding: 20, borderRadius: 15, border: "1px solid " + C.border, background: C.panel2, color: r.color, textAlign: "center" }
                }, [
                    React.createElement("div", { key: "ri", style: { fontSize: 30, marginBottom: 10 } }, r.icon),
                    React.createElement("div", { key: "rl", style: { fontWeight: "bold" } }, r.label)
                ]);
            })),
            React.createElement("button", {
                key: "wb",
                onClick: startWarRoom,
                disabled: !warRole || warLoading,
                style: { width: "100%", background: C.gold, color: C.bg, border: "none", padding: 15, borderRadius: 10, fontWeight: "bold", marginTop: 25 }
            }, "بدء المناورة")
        ]) : (warLoading ? React.createElement("div", { key: "wl", style: { textAlign: "center", padding: 50 } }, "جاري إعداد الأزمة...") : (
            warResult ? React.createElement("div", { key: "res" }, [
                React.createElement(MetricCard, { key: "rs", label: "مؤشر الصمود", value: warResult.resilienceScore, color: C.gold }),
                React.createElement("div", { key: "v", style: { marginTop: 20, padding: 20, background: C.panel2, borderRadius: 10 } }, [
                    React.createElement("div", { key: "vt", style: { fontWeight: "bold", color: C.gold, marginBottom: 10 } }, "الحكم النهائي:"),
                    React.createElement("p", { key: "vp" }, warResult.verdict)
                ]),
                React.createElement("button", {
                    key: "rb",
                    onClick: function() { setWarRole(null); setWarResult(null); },
                    style: { width: "100%", background: C.border, color: C.text, border: "none", padding: 15, borderRadius: 10, marginTop: 20 }
                }, "إعادة المحاولة")
            ]) : (warEvents.length > 0 ? React.createElement("div", { key: "phase" }, [
                React.createElement("div", { key: "ph", style: { color: C.gold, fontWeight: "bold", marginBottom: 5 } }, "المرحلة " + (warPhase + 1) + ": " + warEvents[warPhase].title),
                React.createElement("div", { key: "ev", style: { background: C.panel2, padding: 20, borderRadius: 10, marginBottom: 20, borderRight: "4px solid " + C.red } }, warEvents[warPhase].event),
                React.createElement("div", { key: "opt", style: { display: "flex", flexDirection: "column", gap: 10 } }, warEvents[warPhase].options.map(function(opt) {
                    return React.createElement("button", {
                        key: opt,
                        onClick: function() { makeWarDecision(warPhase, opt); },
                        style: { padding: 15, borderRadius: 8, border: "1px solid " + C.border, background: C.bg, color: C.text, textAlign: "right" }
                    }, opt);
                }))
            ]) : null)
        ))
    ])) : null
  ]);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(CrisisSimulator, null)
  )
);
