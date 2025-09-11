
import React, {useState, useEffect, useRef} from 'react'
import dayjs from 'dayjs'

const AP_EXAMS = [
 "Art History","Biology","Calculus AB","Calculus BC","Chemistry","Chinese Language",
 "Computer Science A","Computer Science Principles","English Language","English Literature",
 "Environmental Science","European History","French Language","German Language","Italian Language",
 "Japanese Language","Latin","Macroeconomics","Microeconomics","Music Theory","Physics 1",
 "Physics 2","Physics C: E&M","Physics C: Mechanics","Psychology","Seminar","Spanish Language",
 "Spanish Literature","Statistics","U.S. Government & Politics","U.S. History","World History",
 "Comparative Government","Human Geography","Chinese Literature","Japanese Literature"
];

function useLocalStorage(key, init){
  const [val,setVal] = useState(()=> {
    try { const raw = localStorage.getItem(key); return raw? JSON.parse(raw): init }
    catch(e){ return init }
  });
  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(val)) }, [key, val]);
  return [val, setVal];
}

function Auth({onLogin}){
  const [name, setName] = useLocalStorage('sf_user', '');
  return (
    <div className="card">
      <h3>Welcome to StudyFlow</h3>
      <p className="small">Enter a display name to continue (client-only demo auth)</p>
      <div className="row" style={{marginTop:10}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
        <button className="btn" onClick={()=> { if(!name){ alert('Enter a name'); return } onLogin(name) }}>Continue</button>
      </div>
    </div>
  )
}

function PlanBuilder({user}){
  const [selected, setSelected] = useLocalStorage('sf_selected', []);
  const [weeks, setWeeks] = useLocalStorage('sf_weeks', 8);
  const [plan, setPlan] = useLocalStorage('sf_plan', null);
  const [extended, setExtended] = useLocalStorage('sf_extended', false);

  function toggleExam(name){
    setSelected(prev => prev.includes(name) ? prev.filter(x=>x!==name) : [...prev, name]);
  }

  function generate(){
    if(selected.length===0){ alert('Select at least one exam'); return; }
    const w = Math.max(1, Number(weeks));
    const pf = extended ? 1.5 : 1;
    const out = [];
    for(let i=1;i<=w;i++){
      out.push({
        week:i,
        fullExam: selected[(i-1)%selected.length],
        timedMinutes: Math.round(90 * pf),
        reviews: [`Topic A for ${selected[(i-1)%selected.length]}`, `Topic B for week ${i}`]
      });
    }
    const payload = { user, weeks: w, selected, extended, schedule: out, generatedAt: new Date().toISOString() };
    setPlan(payload);
    alert('Plan generated — you can export to calendar or download as text.');
  }

  function exportICal(){
    if(!plan){ alert('Generate a plan first'); return; }
    const ics = makeICal(plan);
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'studyflow_plan.ics'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadTxt(){
    const text = plan ? JSON.stringify(plan, null, 2) : 'No plan';
    const blob = new Blob([text], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'studyflow_plan.txt'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <h3>AP Practice Plan Builder</h3>
      <div className="small">Weeks: <input type="number" value={weeks} onChange={e=>setWeeks(e.target.value)} style={{width:80}} /> Extended time: <input type="checkbox" checked={extended} onChange={e=>setExtended(e.target.checked)} /></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:8,marginTop:10}}>
        {AP_EXAMS.map(name=>(
          <div key={name} onClick={()=>toggleExam(name)} style={{padding:10,borderRadius:8,background: selected.includes(name)?'rgba(124,92,255,0.12)':'rgba(255,255,255,0.02)',cursor:'pointer'}}>
            <strong>{name}</strong><div className="small">AP</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:10, display:'flex', gap:8}}>
        <button className="btn" onClick={generate}>Generate Plan</button>
        <button className="btn" onClick={exportICal}>Export iCal</button>
        <button className="btn" onClick={downloadTxt}>Download JSON</button>
      </div>

      <div style={{marginTop:12}}>
        <h4>Generated Plan</h4>
        <pre style={{whiteSpace:'pre-wrap',color:'#cbd5e1',background:'transparent',padding:8,borderRadius:6}}>{plan? JSON.stringify(plan, null, 2) : 'No plan yet'}</pre>
      </div>
    </div>
  )
}

/* produce a minimal iCal file from plan */
function makeICal(plan){
  const uid = (s)=>`${s.user || 'user'}-${Date.now()}@studyflow.local`;
  // start events weekly starting today
  const start = dayjs();
  let out = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyFlow//EN\n";
  plan.schedule.forEach((wk, idx)=>{
    const dt = start.add(idx, 'week').startOf('day').add(16,'hour'); // 4pm local
    const dtstr = dt.format('YYYYMMDDTHHmmss');
    out += "BEGIN:VEVENT\n";
    out += `UID:${uid(wk)}\n`;
    out += `DTSTAMP:${dayjs().format('YYYYMMDDTHHmmss')}\n`;
    out += `DTSTART:${dtstr}\n`;
    out += `SUMMARY:StudyFlow — Full Practice: ${wk.fullExam}\n`;
    out += `DESCRIPTION:Timed practice ~${wk.timedMinutes} minutes\\nReviews:\\n${wk.reviews.join('\\n')}\n`;
    out += "END:VEVENT\n";
  });
  out += "END:VCALENDAR";
  return out;
}

/* AI Tutor component that calls /api/gemini */
function AITutor(){
  const [messages, setMessages] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  async function send(){
    if(!q) return;
    setMessages(m=>[...m,{who:'user',text:q}]);
    setLoading(true);
    try{
      const res = await fetch('/api/gemini', {method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({prompt:q})});
      const j = await res.json();
      setMessages(m=>[...m,{who:'user',text:q},{who:'ai',text: j.reply || j.error || 'No reply'}]);
    }catch(e){
      setMessages(m=>[...m,{who:'ai',text:'Error contacting server: '+e.message}]);
    }finally{ setLoading(false); setQ(''); }
  }

  return (
    <div className="card" style={{position:'sticky', top:20}}>
      <h3>AI Tutor (Gemini)</h3>
      <div style={{maxHeight:300, overflow:'auto', padding:8}}>
        {messages.map((m,i)=> <div key={i} style={{textAlign: m.who==='user'?'right':'left',marginBottom:8}}><div style={{display:'inline-block',padding:8,borderRadius:8,background: m.who==='user'?'#121827':'#062028'}}>{m.text}</div></div>)}
        {loading && <div className="small">Thinking…</div>}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask the AI…" style={{flex:1}} onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
        <button className="btn" onClick={send}>Send</button>
      </div>
      <div className="small" style={{marginTop:10}}>Server-side API keys required. See server/README for instructions.</div>
    </div>
  )
}

/* Practice runner: simple timed test runner with extended-time support and auto scoring for multiple-choice */
function PracticeRunner(){
  // demo questions (would be fetched from server or generated by AI)
  const sample = [
    {id:1, q:'What is derivative of x^2?', choices:['2x','x','x^2','1'], ans:0},
    {id:2, q:'Which gas is most abundant in Earth atmosphere?', choices:['Oxygen','Nitrogen','Carbon dioxide','Argon'], ans:1},
  ];
  const [timeLeft, setTimeLeft] = useState(60*30); // 30 min
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [extended, setExtended] = useLocalStorage('sf_pr_extended', false);
  useEffect(()=>{
    let t;
    if(running && timeLeft>0){
      t = setInterval(()=> setTimeLeft(t0=> t0-1), 1000);
    } else if(timeLeft===0 && running){
      finish();
    }
    return ()=> clearInterval(t);
  }, [running, timeLeft]);

  function start(){
    setScore(null);
    const base = 30*60;
    setTimeLeft(Math.round(base * (extended?1.5:1)));
    setAnswers({});
    setRunning(true);
  }
  function select(qid, choice){
    setAnswers(a=>({...a, [qid]:choice}));
  }
  function finish(){
    setRunning(false);
    let correct = 0;
    sample.forEach(s=>{ if(answers[s.id]===s.ans) correct++; });
    setScore({correct, total:sample.length, percent: Math.round(100*correct/sample.length)});
  }

  return (
    <div className="card" style={{marginTop:12}}>
      <h3>Practice Test Runner</h3>
      <div className="row small">Extended time: <input type="checkbox" checked={extended} onChange={e=>setExtended(e.target.checked)} /></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div className="small">Time: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <div>
          <button className="btn" onClick={start}>Start</button>
          <button className="btn" onClick={finish} style={{marginLeft:8}}>Finish</button>
        </div>
      </div>
      <div style={{marginTop:10}}>
        {sample.map(s=>(
          <div key={s.id} style={{padding:10,borderRadius:8,marginBottom:8,background:'rgba(255,255,255,0.03)'}}>
            <div><strong>{s.q}</strong></div>
            <div style={{marginTop:6}}>
              {s.choices.map((c,idx)=>(
                <label key={idx} style={{display:'block',cursor:'pointer'}}>
                  <input type="radio" name={'q'+s.id} checked={answers[s.id]===idx} onChange={()=>select(s.id, idx)} /> {c}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {score && <div style={{marginTop:8}} className="small">Score: {score.correct}/{score.total} ({score.percent}%)</div>}
    </div>
  )
}

export default function App(){
  const [user, setUser] = useLocalStorage('sf_user_name', null);
  return (
    <div className="app">
      {!user ? <Auth onLogin={(n)=> setUser(n)} /> : (
        <>
          <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><h2>StudyFlow — {user}</h2><div className="small">Free AI study tools • AP practice plans • accommodations</div></div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className="btn" onClick={()=>{ localStorage.removeItem('sf_user_name'); window.location.reload(); }}>Log out</button>
            </div>
          </header>
          <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:12}}>
            <div>
              <PlanBuilder user={user} />
              <PracticeRunner />
            </div>
            <div>
              <AITutor />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
