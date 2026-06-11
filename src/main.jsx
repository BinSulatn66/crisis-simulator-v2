import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

var C = {
  bg: '#070B14',
  panel: '#0C1220',
  panel2: '#101828',
  border: '#1A2840',
  borderLight: '#243550',
  gold: '#C9963A',
  goldDim: '#6B4E1A',
  goldBright: '#E8B84B',
  red: '#C94040',
  redDim: '#3D1515',
  redBright: '#E85555',
  green: '#3AAF7A',
  greenDim: '#0D3020',
  greenBright: '#4BE89A',
  blue: '#3A7AC9',
  blueDim: '#0D2040',
  blueBright: '#4B9AE8',
  purple: '#7A3AC9',
  purpleDim: '#1D0D3D',
  text: '#E8EDF8',
  textSub: '#5A7090',
  textMuted: '#2A3A50'
};

var CRISES = [
  { id: 'supply', label: 'اﺿﻄﺮاب ﺳﻼﺳﻞ اﻹﻣﺪاد', icon: '📦', color: C.red },
  { id: 'geo', label: 'أزﻣﺔ ﺟﯿﻮﺳﯿﺎﺳﯿﺔ', icon: '🌍', color: C.gold },
  { id: 'tech', label: 'ﻗﯿﻮد ﺗﻘﻨﯿﺔ', icon: '💻', color: C.purple },
  { id: 'pandemic', label: 'ﺟﺎﺋﺤﺔ / أزﻣﺔ ﺻﺤﯿﺔ', icon: '🏥', color: C.redBright },
  { id: 'financial', label: 'أزﻣﺔ ﻣﺎﻟﯿﺔ ﻋﺎﻟﻤﯿﺔ', icon: '💰', color: C.blue },
  { id: 'trade', label: 'ﺣﺮب ﺗﺠﺎرﯾﺔ', icon: '⚔️', color: C.goldBright },
  { id: 'carbon', label: 'رﺳﻮم ﻛﺮﺑﻮن / ﺗﺸﺮﯾﻌﺎت ﺑﯿﺌﯿﺔ', icon: '🌱', color: C.green },
  { id: 'custom', label: 'أزﻣﺔ ﻣﺨﺼﺼﺔ', icon: '⚙️', color: C.purple }
];

var SECTORS = [
  'اﻟﻨﻔﻂ واﻟﻄﺎﻗﺔ', 'اﻟﻠﻮﺟﺴﺘﯿﺎت واﻟﺸﺤﻦ', 'اﻟﺘﻘﻨﯿﺔ واﻻﺗﺼﺎﻻت',
  'اﻟﺘﺼﻨﯿﻊ واﻟصناعة', 'اﻟﺮﻋﺎﯾﺔ اﻟﺼﺤﯿﺔ', 'اﻟﺒﻨﻮك واﻟﺨﺪﻣﺎت اﻟﻤﺎﻟﯿﺔ',
  'اﻟﺴﯿﺎﺣﺔ واﻟﻀﯿﺎﻓﺔ', 'اﻟﺰراﻋﺔ واﻟغذاء', 'اﻟﺘﺠﺰﺋﺔ واﻟﺘﺠﺎرة اﻹﻟﻜﺘﺮوﻧﯿﺔ',
  'اﻟﺒﺘﺮوﻛﯿﻤﺎوﯾﺎت', 'اﻟدﻓﺎع واﻷﻣﻦ', 'اﻟﺘﻌﻠﯿﻢ واﻟﺒﺤﺚ اﻟعمي'
];

var WARROOM_ROLES = [
  { id: 'ceo', label: 'اﻟﺮﺋﯿﺲ اﻟﺘﻨﻔﯿﺬي', icon: '👑', color: C.gold },
  { id: 'cfo', label: 'اﻟﻤﺪﯾﺮ اﻟﻤﺎﻟﻲ', icon: '📊', color: C.blue },
  { id: 'coo', label: 'رﺋﯿﺲ اﻟﻌﻤﻠﯿﺎت', icon: '⚙️', color: C.green }
];

var css = "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&display=swap');" +
  "*{box-sizing:border-box;margin:0;padding:0}" +
  "body{background:#070B14;color:#E8EDF8;font-family:'IBM Plex Sans Arabic', sans-serif}" +
  "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}" +
  "@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}\" +\n" +
  "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}" +
  ".anim{animation:fadeUp 0.35s ease}" +
  ".spin{animation:spin 1.2s linear infinite;display:inline-block}" +
  ".clickable{cursor:pointer;transition:all 0.2s}";

var apiCall = function(messages, system) {
  if (system === undefined) system = '';
  return fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: messages, system: system }),
  }).then(function(res) {
    return res.json();
  }).then(function(data) {
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.content.map(function(i) { return i.text || ''; }).join('');
  });
};

function Tag(props) {
  return React.createElement('span', {
    style: { fontSize: 10, padding: '2px 8px', borderRadius: 4, background: props.color + '22', border: '1px solid ' + props.color + '44', color: props.color, fontFamily: 'monospace', letterSpacing: 0.5 }
  }, props.label);
}

function MetricCard(props) {
  var unit = props.unit !== undefined ? props.unit : '%';
  return React.createElement('div', {
    style: { background: C.panel2, border: '1px solid ' + C.border, borderRadius: 10, padding: '16px 18px' }
  },
    React.createElement('div', { style: { fontSize: 10, color: C.textSub, marginBottom: 8, fontFamily: 'monospace' } }, props.label),
    React.createElement('div', { style: { fontSize: 32, fontWeight: 700, color: props.color, fontFamily: 'monospace', lineHeight: 1 } },
      props.value,
      React.createElement('span', { style: { fontSize: 16 } }, unit)
    ),
    props.sub ? React.createElement('div', { style: { fontSize: 11, color: C.textSub, marginTop: 6 } }, props.sub) : null
  );
}

function SectionHeader(props) {
  return React.createElement('div', { style: { marginBottom: 20 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 } },
      React.createElement('div', { style: { fontSize: 18, fontWeight: 700 } }, props.title),
      props.badge ? React.createElement(Tag, { label: props.badge, color: C.gold }) : null
    ),
    props.sub ? React.createElement('div', { style: { fontSize: 13, color: C.textSub } }, props.sub) : null
  );
}

function CrisisSimulator() {
  var state_tab = React.useState('setup'); var tab = state_tab[0]; var setTab = state_tab[1];
  var state_company = React.useState(''); var company = state_company[0]; var setCompany = state_company[1];
  var state_sector = React.useState(''); var sector = state_sector[0]; var setSector = state_sector[1];
  var state_crisis = React.useState(null); var crisis = state_crisis[0]; var setCrisis = state_crisis[1];
  var state_report = React.useState(null); var report = state_report[0]; var setReport = state_report[1];
  var state_simL = React.useState(false); var simLoading = state_simL[0]; var setSimLoading = state_simL[1];
  var state_msgs = React.useState([{ role: 'assistant', text: 'مرحباً بك في محاكي الأزمات الاستباقي. أنا هنا لمساعدتك في هندسة الصمود وتوقع المخاطر.' }]); var msgs = state_msgs[0]; var setMsgs = state_msgs[1];
  var state_chatIn = React.useState(''); var chatIn = state_chatIn[0]; var setChatIn = state_chatIn[1];
  var state_chatL = React.useState(false); var chatLoading = state_chatL[0]; var setChatLoading = state_chatL[1];

  var chatEnd = React.useRef(null);
  React.useEffect(function() { if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  var runSimulation = function() {
    if (!company || !sector || !crisis) return;
    setSimLoading(true);
    var crisisLabel = CRISES.filter(function(c) { return c.id === crisis; })[0].label;
    var prompt = 'أنت محلل أزمات استراتيجي خبير في هندسة الصمود الاستباقي ومؤشرات RAROR وSRB.\\n' +
      'بيانات المنشأة:\\n' +
      '- الاسم: ' + company + '\\n' +
      '- القطاع: ' + sector + '\\n' +
      '- الأزمة المحاكاة: ' + crisisLabel + '\\n' +
      'أعطني JSON فقط بدون أي نصوص أخرى.\\n';
    apiCall([{ role: 'user', content: prompt }]).then(function(text) {
      var parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      parsed.company = company; parsed.sector = sector; parsed.crisisLabel = crisisLabel;
      setReport(parsed); setTab('dashboard');
    }).catch(function(e) { alert('Error: ' + e.message); }).then(function() { setSimLoading(false); });
  };

  var sendChat = function() {
    if (!chatIn.trim() || chatLoading) return;
    var userMsg = chatIn.trim(); setChatIn('');
    var newMsgs = msgs.concat([{ role: 'user', text: userMsg }]);
    setMsgs(newMsgs); setChatLoading(true);
    apiCall(newMsgs.map(function(m) { return { role: m.role, content: m.text }; })).then(function(text) {
      setMsgs(function(prev) { return prev.concat([{ role: 'assistant', text: text }]); });
    }).catch(function(e) { setMsgs(function(prev) { return prev.concat([{ role: 'assistant', text: '⚠ Error: ' + e.message }]); }); }).then(function() { setChatLoading(false); });
  };

  if (tab === 'setup') {
    return React.createElement('div', { style: { maxWidth: 600, margin: '40px auto', background: C.panel, padding: 30, borderRadius: 15, border: '1px solid ' + C.border, direction: 'rtl' } },
      React.createElement(SectionHeader, { title: 'إعداد المحاكاة', sub: 'أدخل بيانات المنشأة ونوع الأزمة لبدء التحليل' }),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 15 } },
        React.createElement('input', { placeholder: 'اسم المنشأة', value: company, onChange: function(e) { setCompany(e.target.value); }, style: { background: C.panel2, border: '1px solid ' + C.border, padding: 12, borderRadius: 8, color: C.text, textAlign: 'right' } }),
        React.createElement('select', { value: sector, onChange: function(e) { setSector(e.target.value); }, style: { background: C.panel2, border: '1px solid ' + C.border, padding: 12, borderRadius: 8, color: C.text, textAlign: 'right' } },
          React.createElement('option', { value: '' }, 'اختر القطاع'),
          SECTORS.map(function(s) { return React.createElement('option', { key: s, value: s }, s); })
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
          CRISES.map(function(c) {
            return React.createElement('button', { key: c.id, onClick: function() { setCrisis(c.id); }, style: { padding: 15, borderRadius: 10, border: '1px solid ' + (crisis === c.id ? c.color : C.border), background: crisis === c.id ? c.color + '11' : C.panel2, color: crisis === c.id ? c.color : C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' } },
              React.createElement('span', null, c.icon), React.createElement('span', null, c.label)
            );
          })
        ),
        React.createElement('button', { onClick: runSimulation, disabled: simLoading, style: { background: C.gold, color: C.bg, border: 'none', padding: 15, borderRadius: 10, fontWeight: 'bold', marginTop: 10, opacity: simLoading ? 0.6 : 1, cursor: 'pointer' } }, simLoading ? 'جاري التحليل...' : 'بدء محاكاة الأزمة')
      )
    );
  }

  return React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, direction: 'rtl', maxWidth: 1200, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 20 } },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 } },
        React.createElement(MetricCard, { label: 'مؤشر المخاطر', value: report.riskScore, color: C.red, sub: 'مستوى التهديد الكلي' }),
        React.createElement(MetricCard, { label: 'RAROR', value: report.raror, unit: '', color: C.gold, sub: 'العائد المعدل لمخاطر الصمود' }),
        React.createElement(MetricCard, { label: 'جاهزية الاستجابة', value: report.readiness, color: C.green, sub: 'قدرة المنشأة الحالية' })\n" +
      "      ),\n" +
      "      React.createElement('div', { style: { background: C.panel, padding: 20, borderRadius: 12, border: '1px solid ' + C.border } },\n" +
      "        React.createElement(SectionHeader, { title: 'ملخص التحليل', badge: 'استراتيجي' }),\n" +
      "        React.createElement('p', { style: { lineHeight: 1.6, color: C.textSub, textAlign: 'right' } }, report.summary)\n" +
      "      )\n" +
      "    ),\n" +
      "    React.createElement('div', { style: { background: C.panel, padding: 15, borderRadius: 12, border: '1px solid ' + C.border, height: 600, display: 'flex', flexDirection: 'column' } },\n" +
      "      React.createElement(SectionHeader, { title: 'مساعد الصمود' }),\n" +
      "      React.createElement('div', { style: { flex: 1, overflowY: 'auto', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 10 } },\n" +
      "        msgs.map(function(m, i) { return React.createElement('div', { key: i, style: { alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end', background: m.role === 'user' ? C.border : C.panel2, padding: 10, borderRadius: 8, maxWidth: '85%', fontSize: 13, textAlign: 'right' } }, m.text); }),\n" +
      "        React.createElement('div', { ref: chatEnd })\n" +
      "      ),\n" +
      "      React.createElement('div', { style: { display: 'flex', gap: 5 } },\n" +
      "        React.createElement('input', { value: chatIn, onChange: function(e) { setChatIn(e.target.value); }, onKeyDown: function(e) { if (e.key === 'Enter') sendChat(); }, placeholder: 'اسأل الخبير...', style: { flex: 1, background: C.bg, border: '1px solid ' + C.border, padding: 8, borderRadius: 5, color: C.text, textAlign: 'right' } }),\n" +
      "        React.createElement('button', { onClick: sendChat, style: { background: C.gold, border: 'none', padding: '0 15px', borderRadius: 5, color: C.bg, cursor: 'pointer' } }, 'إرسال')\n" +
      "      )\n" +
      "    )\n" +
      "  );\n" +
      "}\n\n" +
      "function App() {\n" +
      "  return React.createElement('div', { style: { minHeight: '100vh', background: C.bg, padding: '20px' } },\n" +
      "    React.createElement('style', null, css),\n" +
      "    React.createElement('header', { style: { borderBottom: '1px solid ' + C.border, paddingBottom: 15, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' } },\n" +
      "      React.createElement('div', null,\n" +
      "        React.createElement('h1', { style: { color: C.gold, fontSize: 24, fontWeight: 'bold' } }, 'محاكي الأزمات'),\n" +
      "        React.createElement('p', { style: { fontSize: 13, color: C.textSub } }, 'نظام هندسة الصمود الاستباقي (RAROR/SRB)')\n" +
      "      )\n" +
      "    ),\n" +
      "    React.createElement(CrisisSimulator, null)\n" +
      "  );\n" +
      "}\n\n" +
      "var root = ReactDOM.createRoot(document.getElementById('root'));\n" +
      "root.render(React.createElement(App, null));