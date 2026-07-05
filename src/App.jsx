import React, { useState, useEffect, useRef, useCallback } from "react";
import { Flame, Trophy, Timer as TimerIcon, ChevronRight, RotateCcw, Settings2, History as HistoryIcon } from "lucide-react";

/* ----------------------------------------------------------------
   TOKENS
-----------------------------------------------------------------*/
const T = {
  bg: "#182620",
  bg2: "#132018",
  panel: "#1D2E26",
  chalk: "#F3EFE4",
  chalkDim: "#B9C4BB",
  amber: "#F2B705",
  coral: "#E8604C",
  sage: "#7FA88D",
  rule: "rgba(243,239,228,0.14)",
};

const SESSION_SECONDS = 150; // 2min30

/* ----------------------------------------------------------------
   NIVEAUX + GENERATEURS DE QUESTIONS
-----------------------------------------------------------------*/
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[ri(0, arr.length - 1)];
const round2 = (n) => Math.round(n * 100) / 100;

function genFond(tier) {
  if (tier <= 1) {
    if (Math.random() < 0.5) {
      const a = ri(10, 99), b = ri(10, 99);
      return Math.random() < 0.5
        ? { q: `${a} + ${b}`, a: a + b }
        : { q: `${Math.max(a, b)} − ${Math.min(a, b)}`, a: Math.max(a, b) - Math.min(a, b) };
    }
    const x = ri(2, 9), y = ri(2, 9);
    return { q: `${x} × ${y}`, a: x * y };
  }
  if (tier === 2) {
    if (Math.random() < 0.4) {
      const x = ri(2, 12), y = ri(2, 12);
      return { q: `${x} × ${y}`, a: x * y };
    }
    if (Math.random() < 0.7) {
      const y = ri(2, 12), q = ri(2, 12);
      return { q: `${y * q} ÷ ${y}`, a: q };
    }
    const a = ri(100, 999), b = ri(100, 999);
    return { q: `${a} + ${b}`, a: a + b };
  }
  if (Math.random() < 0.5) {
    const x = ri(11, 19), y = ri(2, 9);
    return { q: `${x} × ${y}`, a: x * y };
  }
  const a = ri(200, 999), b = ri(100, a - 1);
  return { q: `${a} − ${b}`, a: a - b };
}

function genDec(tier) {
  if (tier <= 1) {
    if (Math.random() < 0.5) {
      const a = round2(ri(10, 99) / 10), b = round2(ri(10, 99) / 10);
      return { q: `${a} + ${b}`, a: round2(a + b) };
    }
    const a = ri(-9, 9), b = ri(-9, 9);
    return { q: `(${a}) + (${b})`, a: a + b };
  }
  if (tier === 2) {
    if (Math.random() < 0.5) {
      const a = round2(ri(10, 99) / 10), b = ri(2, 9);
      return { q: `${a} × ${b}`, a: round2(a * b) };
    }
    const a = ri(-12, 12), b = ri(-9, 9);
    return { q: `(${a}) × (${b})`, a: a * b };
  }
  if (Math.random() < 0.5) {
    const q = ri(2, 12), d = pick([2, 4, 5, 10]);
    return { q: `${q * d} ÷ ${d}`, a: q };
  }
  const a = ri(-20, 20), b = ri(-15, 15), c = ri(-10, 10);
  return { q: `${a} − ${b} + ${c}`, a: a - b + c };
}

function genFrac(tier) {
  if (tier <= 1) {
    const pct = pick([10, 20, 25, 50, 75]);
    const base = pick([2, 4, 5, 10, 20]) * ri(2, 10);
    return { q: `${pct}% de ${base}`, a: round2((pct / 100) * base) };
  }
  if (tier === 2) {
    const d = pick([3, 4, 5, 6, 8]);
    const n1 = ri(1, d - 1), n2 = ri(1, d - 1);
    return { q: `${n1}/${d} + ${n2}/${d}  (numérateur ?)`, a: n1 + n2 };
  }
  if (Math.random() < 0.5) {
    const pct = pick([5, 15, 20, 30]);
    const base = pick([20, 40, 50, 60, 80, 100]);
    const up = Math.random() < 0.5;
    return {
      q: `${base} ${up ? "augmenté" : "diminué"} de ${pct}%`,
      a: round2(base * (up ? 1 + pct / 100 : 1 - pct / 100)),
    };
  }
  const d = pick([3, 4, 5]);
  const base = d * ri(2, 8);
  const n = ri(1, d - 1);
  return { q: `${n}/${d} de ${base}`, a: round2((n / d) * base) };
}

function genPow(tier) {
  if (tier <= 1) {
    if (Math.random() < 0.5) {
      const x = ri(2, 15);
      return { q: `${x}²`, a: x * x };
    }
    const x = ri(2, 15);
    return { q: `√${x * x}`, a: x };
  }
  if (tier === 2) {
    if (Math.random() < 0.5) {
      const x = ri(2, 6);
      return { q: `${x}³`, a: x * x * x };
    }
    const n = ri(1, 5);
    return { q: `10^${n}`, a: Math.pow(10, n) };
  }
  if (Math.random() < 0.5) {
    const n = ri(1, 3);
    return { q: `10^(−${n})`, a: round2(Math.pow(10, -n)) };
  }
  const x = round2(ri(2, 12) / 2);
  return { q: `${x}²`, a: round2(x * x) };
}

function genAlg(tier) {
  if (tier <= 1) {
    if (Math.random() < 0.5) {
      const a = ri(2, 9), b = ri(2, 9);
      return { q: `${a}x + ${b}x  (coefficient de x ?)`, a: a + b };
    }
    const x = ri(2, 8), a = ri(2, 9), b = ri(1, 20);
    return { q: `x=${x} : ${a}x + ${b} = ?`, a: a * x + b };
  }
  if (tier === 2) {
    if (Math.random() < 0.5) {
      const x = ri(2, 20), b = ri(1, 30);
      return { q: `x + ${b} = ${x + b}  (x ?)`, a: x };
    }
    const a = ri(2, 9), x = ri(2, 12);
    return { q: `${a}x = ${a * x}  (x ?)`, a: x };
  }
  const a = ri(2, 9), x = ri(2, 10), b = ri(1, 20);
  return { q: `${a}x + ${b} = ${a * x + b}  (x ?)`, a: x };
}

function genExpert(tier) {
  if (tier <= 1) {
    const table = [
      ["cos(0)", 1], ["sin(0)", 0], ["cos(π)", -1], ["sin(π/2)", 1],
      ["cos(π/2)", 0], ["sin(π/6)", 0.5], ["cos(π/3)", 0.5],
    ];
    const [q, a] = pick(table);
    return { q, a };
  }
  if (tier === 2) {
    const n = ri(2, 4), x = ri(1, 5);
    return { q: `f(x)=x^${n} , f'(${x}) = ?`, a: n * Math.pow(x, n - 1) };
  }
  if (Math.random() < 0.5) {
    const n = ri(1, 4);
    return { q: `log₁₀(10^${n})`, a: n };
  }
  const n = ri(1, 3);
  return { q: `2^${n}`, a: Math.pow(2, n) };
}

const LEVELS = [
  { id: "fond", name: "Fondamentaux", subtitle: "Tables, + / −", gen: genFond },
  { id: "dec", name: "Décimaux & relatifs", subtitle: "Décimaux, nombres négatifs", gen: genDec },
  { id: "frac", name: "Fractions & %", subtitle: "Fractions, pourcentages", gen: genFrac },
  { id: "pow", name: "Puissances & racines", subtitle: "Carrés, cubes, racines", gen: genPow },
  { id: "alg", name: "Calcul littéral", subtitle: "Expressions, équations", gen: genAlg },
  { id: "expert", name: "Expert Terminale", subtitle: "Trigo, dérivées, exp/log", gen: genExpert },
];

const levelById = (id) => LEVELS.find((l) => l.id === id);

/* ----------------------------------------------------------------
   TALLY MARKS (signature element)
-----------------------------------------------------------------*/
function TallyMarks({ count }) {
  const groups = Math.floor(count / 5);
  const rest = count % 5;
  const renderGroup = (n, key) => (
    <span key={key} style={{ position: "relative", display: "inline-flex", width: 22, height: 26, marginRight: 6 }}>
      {[0, 1, 2, 3].map((i) =>
        i < n ? (
          <span
            key={i}
            style={{
              position: "absolute", left: i * 5, bottom: 0, width: 2, height: 24,
              background: T.amber, borderRadius: 1, transform: "rotate(-6deg)",
            }}
          />
        ) : null
      )}
      {n >= 5 ? (
        <span style={{ position: "absolute", left: -2, top: 10, width: 26, height: 2.5, background: T.coral, transform: "rotate(-20deg)", borderRadius: 1 }} />
      ) : null}
    </span>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", minHeight: 26 }}>
      {Array.from({ length: groups }).map((_, i) => renderGroup(5, `g${i}`))}
      {rest > 0 && renderGroup(rest, "rest")}
    </div>
  );
}

/* ----------------------------------------------------------------
   STORAGE HELPERS — localStorage (tout reste sur l'appareil de l'élève)
-----------------------------------------------------------------*/
const LS_PROFILE = "cm_profile";
const LS_HISTORY_PREFIX = "cm_history_"; // + levelId

function getProfile() {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setProfile(p) {
  try { localStorage.setItem(LS_PROFILE, JSON.stringify(p)); } catch {}
}
function getHistory(levelId) {
  try {
    const raw = localStorage.getItem(LS_HISTORY_PREFIX + levelId);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function pushHistory(levelId, entry) {
  try {
    const list = getHistory(levelId);
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 15);
    localStorage.setItem(LS_HISTORY_PREFIX + levelId, JSON.stringify(trimmed));
    return trimmed;
  } catch { return []; }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ----------------------------------------------------------------
   APP
-----------------------------------------------------------------*/
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [profile, setProfileState] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [levelChoice, setLevelChoice] = useState(LEVELS[0].id);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    const p = getProfile();
    if (p && p.name && p.level) {
      setProfileState(p);
      setScreen("home");
    } else {
      setScreen("setup");
    }
  }, []);

  useEffect(() => {
    if (screen === "home" && profile) {
      setHistory(getHistory(profile.level));
    }
  }, [screen, profile]);

  const startProfile = () => {
    if (!nameInput.trim()) return;
    const p = { name: nameInput.trim(), level: levelChoice, daysStreak: 0, lastPlayDate: null, totalSessions: 0, bestScoreEver: 0 };
    setProfile(p);
    setProfileState(p);
    setScreen("home");
  };

  const changeLevel = (lvl) => {
    const p = { ...profile, level: lvl };
    setProfile(p);
    setProfileState(p);
  };

  const resetProfile = () => {
    setScreen("setup");
    setNameInput(profile?.name || "");
    setLevelChoice(profile?.level || LEVELS[0].id);
  };

  const finishSession = (result) => {
    const today = todayStr();
    let daysStreak = profile.daysStreak || 0;
    if (profile.lastPlayDate) {
      const diffDays = Math.round((new Date(today) - new Date(profile.lastPlayDate)) / 86400000);
      if (diffDays === 1) daysStreak += 1;
      else if (diffDays > 1) daysStreak = 1;
    } else {
      daysStreak = 1;
    }
    const p = {
      ...profile,
      daysStreak,
      lastPlayDate: today,
      totalSessions: (profile.totalSessions || 0) + 1,
      bestScoreEver: Math.max(profile.bestScoreEver || 0, result.score),
    };
    setProfile(p);
    setProfileState(p);
    const h = pushHistory(profile.level, {
      score: result.score, streak: result.bestStreak, date: today,
    });
    setHistory(h);
    setLastResult(result);
    setScreen("result");
  };

  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, ${T.bg2}, ${T.bg})`,
      color: T.chalk, fontFamily: "'Inter', system-ui, sans-serif", display: "flex",
      justifyContent: "center", padding: "24px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .sg { font-family: 'Space Grotesk', sans-serif; }
        input::placeholder { color: ${T.chalkDim}; opacity: 0.7; }
        button { font-family: inherit; cursor: pointer; }
        @keyframes flashGreen { 0%{ box-shadow: 0 0 0 0 rgba(127,168,141,0.6);} 100%{ box-shadow: 0 0 0 18px rgba(127,168,141,0);} }
        @keyframes flashRed { 0%{ box-shadow: 0 0 0 0 rgba(232,96,76,0.55);} 100%{ box-shadow: 0 0 0 18px rgba(232,96,76,0);} }
        @keyframes popIn { from{ opacity:0; transform: scale(0.94);} to{ opacity:1; transform: scale(1);} }
        .pop { animation: popIn 0.18s ease-out; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {screen === "loading" && <div style={{ textAlign: "center", padding: 60, color: T.chalkDim }}>Chargement…</div>}
        {screen === "setup" && (
          <SetupScreen
            nameInput={nameInput} setNameInput={setNameInput}
            levelChoice={levelChoice} setLevelChoice={setLevelChoice}
            onStart={startProfile}
          />
        )}
        {screen === "home" && profile && (
          <HomeScreen
            profile={profile} history={history}
            onPlay={() => setScreen("game")}
            onChangeLevel={changeLevel}
            onEditProfile={resetProfile}
            onShowHistory={() => setScreen("history")}
          />
        )}
        {screen === "game" && profile && (
          <GameScreen level={levelById(profile.level)} onFinish={finishSession} />
        )}
        {screen === "result" && lastResult && profile && (
          <ResultScreen
            result={lastResult} profile={profile}
            onReplay={() => setScreen("game")}
            onHome={() => setScreen("home")}
          />
        )}
        {screen === "history" && profile && (
          <HistoryScreen level={levelById(profile.level)} history={history} onBack={() => setScreen("home")} />
        )}
      </div>
    </div>
  );
}

/* ---------------- SETUP ---------------- */
function SetupScreen({ nameInput, setNameInput, levelChoice, setLevelChoice, onStart }) {
  return (
    <div className="pop">
      <h1 className="sg" style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 4px" }}>Calcul mental</h1>
      <p style={{ color: T.chalkDim, marginBottom: 24, lineHeight: 1.5 }}>
        2 minutes 30 par jour. Tu choisis ton niveau, l'appli s'adapte à ta vitesse.
      </p>
      <label style={{ fontSize: 13, color: T.chalkDim, display: "block", marginBottom: 6 }}>Prénom</label>
      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        placeholder="Ton prénom"
        style={{
          width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10,
          border: `1px solid ${T.rule}`, background: T.panel, color: T.chalk, fontSize: 16, marginBottom: 20,
        }}
      />
      <label style={{ fontSize: 13, color: T.chalkDim, display: "block", marginBottom: 8 }}>Niveau</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLevelChoice(l.id)}
            style={{
              textAlign: "left", padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${levelChoice === l.id ? T.amber : T.rule}`,
              background: levelChoice === l.id ? "rgba(242,183,5,0.12)" : T.panel,
              color: T.chalk,
            }}
          >
            <div style={{ fontWeight: 600 }}>{l.name}</div>
            <div style={{ fontSize: 12, color: T.chalkDim }}>{l.subtitle}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onStart}
        disabled={!nameInput.trim()}
        style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none",
          background: nameInput.trim() ? T.amber : T.rule, color: nameInput.trim() ? "#1B2A22" : T.chalkDim,
          fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        Commencer <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ---------------- HOME ---------------- */
function HomeScreen({ profile, history, onPlay, onChangeLevel, onEditProfile, onShowHistory }) {
  const level = levelById(profile.level);
  return (
    <div className="pop">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 13, color: T.chalkDim }}>Salut</div>
          <h1 className="sg" style={{ fontSize: 26, fontWeight: 700, margin: "2px 0" }}>{profile.name}</h1>
        </div>
        <button onClick={onEditProfile} style={{ background: "transparent", border: "none", color: T.chalkDim, padding: 6 }}>
          <Settings2 size={20} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, margin: "14px 0 18px" }}>
        <div style={{ flex: 1, background: T.panel, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.rule}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.amber }}>
            <Flame size={16} /> <span style={{ fontSize: 22, fontWeight: 700 }} className="sg">{profile.daysStreak || 0}</span>
          </div>
          <div style={{ fontSize: 12, color: T.chalkDim, marginTop: 2 }}>jours d'affilée</div>
        </div>
        <div style={{ flex: 1, background: T.panel, borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.rule}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.sage }}>
            <Trophy size={16} /> <span style={{ fontSize: 22, fontWeight: 700 }} className="sg">{profile.bestScoreEver || 0}</span>
          </div>
          <div style={{ fontSize: 12, color: T.chalkDim, marginTop: 2 }}>meilleur score</div>
        </div>
      </div>

      <div style={{ background: T.panel, borderRadius: 14, padding: 16, border: `1px solid ${T.rule}`, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.chalkDim, marginBottom: 4 }}>Niveau actuel</div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{level.name}</div>
        <div style={{ fontSize: 13, color: T.chalkDim, marginBottom: 10 }}>{level.subtitle}</div>
        <select
          value={profile.level}
          onChange={(e) => onChangeLevel(e.target.value)}
          style={{
            width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${T.rule}`,
            background: T.bg2, color: T.chalk, fontSize: 14,
          }}
        >
          {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <button
        onClick={onPlay}
        style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "none", background: T.amber,
          color: "#1B2A22", fontWeight: 700, fontSize: 17, marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <TimerIcon size={18} /> Lancer les 2 min 30
      </button>

      <button
        onClick={onShowHistory}
        style={{
          width: "100%", padding: "13px", borderRadius: 12, border: `1px solid ${T.rule}`,
          background: "transparent", color: T.chalk, fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <HistoryIcon size={16} color={T.amber} />
        {history.length > 0 ? `Historique — ${history.length} session${history.length > 1 ? "s" : ""}` : "Historique de tes sessions"}
      </button>
    </div>
  );
}

/* ---------------- GAME ---------------- */
function GameScreen({ level, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [tier, setTier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [question, setQuestion] = useState(() => level.gen(1));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const qStartRef = useRef(Date.now());
  const inputRef = useRef(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish({ score, correct, total, bestStreak });
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]); // eslint-disable-line

  useEffect(() => { inputRef.current && inputRef.current.focus(); }, [question]);

  const nextQuestion = useCallback((newTier) => {
    setQuestion(level.gen(newTier));
    setInput("");
    qStartRef.current = Date.now();
  }, [level]);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim() === "" || feedback) return;
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    const user = parseFloat(input.replace(",", "."));
    const ok = Math.abs(user - question.a) < 0.01;
    setTotal((t) => t + 1);

    let newTier = tier;
    if (ok) {
      setCorrect((c) => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      if (newStreak % 4 === 0) newTier = Math.min(3, tier + 1);
      const base = 10 * tier;
      const speedBonus = elapsed < 3 ? 5 : elapsed < 6 ? 2 : 0;
      const streakBonus = Math.min(newStreak * 2, 20);
      setScore((s) => s + base + speedBonus + streakBonus);
      setFeedback("ok");
    } else {
      setStreak(0);
      newTier = Math.max(1, tier - 1);
      setFeedback("ko");
    }
    setTier(newTier);
    setTimeout(() => {
      setFeedback(null);
      nextQuestion(newTier);
    }, ok ? 260 : 650);
  };

  const pct = Math.max(0, timeLeft / SESSION_SECONDS);

  return (
    <div className="pop">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: T.chalkDim }}>{level.name}</div>
        <div className="sg" style={{
          fontWeight: 700, fontSize: 20, color: timeLeft <= 15 ? T.coral : T.chalk,
          fontVariantNumeric: "tabular-nums",
        }}>
          {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div style={{ height: 6, background: T.rule, borderRadius: 3, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: T.amber, transition: "width 1s linear" }} />
      </div>

      <div
        style={{
          background: T.panel, borderRadius: 18, padding: "36px 20px", textAlign: "center",
          border: `1px solid ${T.rule}`, marginBottom: 18,
          animation: feedback === "ok" ? "flashGreen 0.35s ease-out" : feedback === "ko" ? "flashRed 0.5s ease-out" : "none",
        }}
      >
        <div className="sg" style={{ fontSize: 34, fontWeight: 700, marginBottom: feedback === "ko" ? 8 : 0 }}>
          {question.q}
        </div>
        {feedback === "ko" && (
          <div style={{ color: T.coral, fontSize: 14, marginTop: 4 }}>
            réponse : <b>{question.a}</b>
          </div>
        )}
      </div>

      <form onSubmit={submit}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          inputMode="decimal"
          placeholder="?"
          disabled={!!feedback}
          style={{
            width: "100%", boxSizing: "border-box", padding: "16px", borderRadius: 12,
            border: `2px solid ${feedback === "ok" ? T.sage : feedback === "ko" ? T.coral : T.rule}`,
            background: T.bg2, color: T.chalk, fontSize: 22, textAlign: "center", marginBottom: 14,
          }}
          className="sg"
          autoComplete="off"
        />
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TallyMarks count={streak} />
        <div style={{ textAlign: "right" }}>
          <div className="sg" style={{ fontSize: 22, fontWeight: 700, color: T.amber }}>{score}</div>
          <div style={{ fontSize: 11, color: T.chalkDim }}>points</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- RESULT ---------------- */
function ResultScreen({ result, profile, onReplay, onHome }) {
  const isPB = result.score >= (profile.bestScoreEver || 0);
  return (
    <div className="pop" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, color: T.chalkDim, marginBottom: 4 }}>Session terminée</div>
      <div className="sg" style={{ fontSize: 52, fontWeight: 700, color: T.amber, lineHeight: 1 }}>{result.score}</div>
      <div style={{ fontSize: 13, color: T.chalkDim, marginBottom: 18 }}>points{isPB ? "  •  nouveau record 🎉" : ""}</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: T.panel, borderRadius: 12, padding: 14, border: `1px solid ${T.rule}` }}>
          <div className="sg" style={{ fontSize: 20, fontWeight: 700 }}>{result.correct}/{result.total}</div>
          <div style={{ fontSize: 11, color: T.chalkDim }}>bonnes réponses</div>
        </div>
        <div style={{ flex: 1, background: T.panel, borderRadius: 12, padding: 14, border: `1px solid ${T.rule}` }}>
          <div className="sg" style={{ fontSize: 20, fontWeight: 700, color: T.sage }}>{result.bestStreak}</div>
          <div style={{ fontSize: 11, color: T.chalkDim }}>meilleure série</div>
        </div>
      </div>

      <button
        onClick={onReplay}
        style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "none", background: T.amber,
          color: "#1B2A22", fontWeight: 700, fontSize: 15, marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <RotateCcw size={16} /> Rejouer
      </button>
      <button
        onClick={onHome}
        style={{
          width: "100%", padding: "13px", borderRadius: 12, border: `1px solid ${T.rule}`,
          background: "transparent", color: T.chalk, fontSize: 14,
        }}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}

/* ---------------- HISTORY (remplace le classement partagé) ---------------- */
function HistoryScreen({ level, history, onBack }) {
  return (
    <div className="pop">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <HistoryIcon size={20} color={T.amber} />
        <h1 className="sg" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Historique</h1>
      </div>
      <div style={{ fontSize: 13, color: T.chalkDim, marginBottom: 16 }}>{level.name} — meilleurs scores</div>

      {history.length === 0 && (
        <div style={{ color: T.chalkDim, fontSize: 14, padding: "20px 0" }}>
          Pas encore de session enregistrée à ce niveau.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {history.map((e, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: T.panel, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${i === 0 ? T.amber : T.rule}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="sg" style={{ width: 22, color: i === 0 ? T.amber : T.chalkDim, fontWeight: 700 }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: T.chalkDim }}>{e.date}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="sg" style={{ fontWeight: 700 }}>{e.score}</div>
              <div style={{ fontSize: 10, color: T.chalkDim }}>série {e.streak}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          width: "100%", padding: "13px", borderRadius: 12, border: `1px solid ${T.rule}`,
          background: "transparent", color: T.chalk, fontSize: 14,
        }}
      >
        Retour
      </button>
    </div>
  );
}
