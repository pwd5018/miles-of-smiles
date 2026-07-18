import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, Bookmark, Check, ChevronRight, Clock3, Compass, Heart,
  Home, Pause, Play, RotateCcw, Search, Settings2, Sparkles, Star, Trophy,
  Users, Volume2, VolumeX, X, Zap
} from 'lucide-react';
import { activities, filters } from './activities';
import './styles.css';

const DEFAULT_PLAYERS = ['Passenger 1', 'Passenger 2'];
const emptyRound = () => ({ checked: [], choices: {}, step: 0, started: false, count: 0, ended: false });

function readStored(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable in private browsing. */ }
}

function useFeedback(soundOn) {
  return (kind = 'tap') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(kind === 'success' ? [18, 45, 28] : 10);
    }
    if (!soundOn || typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === 'success' ? 660 : 420;
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
    oscillator.addEventListener('ended', () => context.close());
  };
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [filter, setFilter] = useState('All');
  const [currentId, setCurrentId] = useState(activities[0].id);
  const [favorites, setFavorites] = useState(() => readStored('roadtrip-favorites', []));
  const [completed, setCompleted] = useState(() => Number(readStored('roadtrip-completed', 0)) || 0);
  const [players, setPlayers] = useState(() => {
    const saved = readStored('roadtrip-players', DEFAULT_PLAYERS);
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_PLAYERS;
  });
  const [scores, setScores] = useState(() => readStored('roadtrip-scores', {}));
  const [activePlayer, setActivePlayer] = useState(0);
  const [round, setRound] = useState(emptyRound);
  const [toast, setToast] = useState('');
  const [soundOn, setSoundOn] = useState(() => readStored('roadtrip-sound', true));
  const toastTimer = useRef(null);
  const nextRoundTimer = useRef(null);
  const feedback = useFeedback(soundOn);

  const pool = useMemo(() => filter === 'All' ? activities : activities.filter(a => a.energy === filter.toLowerCase()), [filter]);
  const activity = activities.find(a => a.id === currentId) || activities[0];

  useEffect(() => writeStored('roadtrip-favorites', favorites), [favorites]);
  useEffect(() => writeStored('roadtrip-completed', completed), [completed]);
  useEffect(() => writeStored('roadtrip-players', players), [players]);
  useEffect(() => writeStored('roadtrip-scores', scores), [scores]);
  useEffect(() => writeStored('roadtrip-sound', soundOn), [soundOn]);
  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(nextRoundTimer.current); }, []);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1400);
  };

  const resetRound = () => {
    setRound(emptyRound());
    setActivePlayer(0);
  };

  const openActivity = (nextActivity) => {
    clearTimeout(nextRoundTimer.current);
    setCurrentId(nextActivity.id);
    resetRound();
    setScreen('setup');
    feedback('tap');
  };

  const surprise = () => {
    const choices = pool.filter(item => item.id !== activity.id);
    const next = choices[Math.floor(Math.random() * (choices.length || 1))] || activity;
    openActivity(next);
  };

  const begin = () => {
    const cleaned = players.map((name, index) => name.trim() || `Player ${index + 1}`);
    setPlayers(cleaned);
    resetRound();
    setScreen('play');
    feedback('success');
  };

  const toggleFavorite = (id) => {
    setFavorites(value => value.includes(id) ? value.filter(item => item !== id) : [...value, id]);
    feedback('tap');
  };

  const awardPoint = (playerIndex = activePlayer) => {
    const name = players[playerIndex] || players[0];
    setScores(value => ({ ...value, [name]: (value[name] || 0) + 1 }));
  };

  const finishRound = (winner = activePlayer) => {
    if (round.ended) return;
    setRound(value => ({ ...value, ended: true }));
    awardPoint(winner);
    setCompleted(value => value + 1);
    feedback('success');
    showToast(`Round complete! ${players[winner] || 'Player'} gets +1`);
    clearTimeout(nextRoundTimer.current);
    nextRoundTimer.current = setTimeout(surprise, 1050);
  };

  const resetTrip = () => {
    setScores({});
    setCompleted(0);
    showToast('Scoreboard cleared');
    feedback('tap');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Go home">
          <span className="brand-mark"><Compass size={22} /></span>
          <span><b>MILES OF SMILES</b><small>ROAD TRIP CO.</small></span>
        </button>
        <div className="top-actions">
          <button className="sound-btn" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? 'Mute feedback' : 'Enable feedback'}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="saved-btn" onClick={() => setScreen('saved')} aria-label="Saved activities">
            <Bookmark size={20} fill={favorites.length ? 'currentColor' : 'none'} /><span>{favorites.length}</span>
          </button>
        </div>
      </header>

      {screen === 'home' && <HomeScreen activities={activities} completed={completed} favorites={favorites} filter={filter} filters={filters} setFilter={setFilter} openActivity={openActivity} setScreen={setScreen} surprise={surprise} />}
      {screen === 'setup' && <SetupScreen activity={activity} players={players} setPlayers={setPlayers} begin={begin} setScreen={setScreen} />}
      {screen === 'play' && <PlayScreen activity={activity} players={players} activePlayer={activePlayer} setActivePlayer={setActivePlayer} round={round} setRound={setRound} toggleFavorite={toggleFavorite} favorites={favorites} feedback={feedback} finishRound={finishRound} surprise={surprise} setScreen={setScreen} />}
      {(screen === 'browse' || screen === 'saved') && <BrowseScreen screen={screen} favorites={favorites} pool={pool} openActivity={openActivity} setFilter={setFilter} setScreen={setScreen} />}
      {screen === 'score' && <ScoreScreen scores={scores} completed={completed} resetTrip={resetTrip} setScreen={setScreen} />}

      <nav className="bottom-nav" aria-label="Main navigation">
        <NavButton active={screen === 'home'} label="Home" onClick={() => setScreen('home')}><Home size={19} /></NavButton>
        <NavButton active={screen === 'browse'} label="Games" onClick={() => setScreen('browse')}><Search size={19} /></NavButton>
        <NavButton active={screen === 'score'} label="Score" onClick={() => setScreen('score')}><Trophy size={19} /></NavButton>
        <NavButton active={screen === 'saved'} label="Saved" onClick={() => setScreen('saved')}><Bookmark size={19} /></NavButton>
      </nav>
      {toast && <div className="toast"><Check size={18} />{toast}</div>}
    </main>
  );
}

function NavButton({ active, label, children, onClick }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{children}{label}</button>;
}

function HomeScreen({ activities: catalog, completed, favorites, filter, filters: moodFilters, setFilter, openActivity, setScreen, surprise }) {
  const featured = catalog.slice(0, 4);
  return <>
    <section className="hero">
      <div className="route-line"><span /><Compass size={20} /><span /></div>
      <p className="eyebrow">NEXT STOP: A GOOD TIME</p>
      <h1>Are we there<br /><em>yet?</em></h1>
      <p className="intro">Not quite. But we’ve got a whole glove box of games to pass the miles.</p>
      <button className="primary" onClick={surprise}><Sparkles size={20} /> Surprise us <ChevronRight size={20} /></button>
      <p className="tiny-note">No supplies. No setup. Just play.</p>
    </section>
    <section className="controls">
      <div className="section-heading"><span>Pick a mood</span><small>{catalog.length} games ready</small></div>
      <div className="chips" role="group" aria-label="Activity mood">
        {moodFilters.map(mood => <button className={filter === mood ? 'active' : ''} onClick={() => setFilter(mood)} key={mood}>{mood}</button>)}
      </div>
    </section>
    <section className="featured">
      <div className="section-heading"><span>Start a favorite</span><button onClick={() => setScreen('browse')}>See all <ChevronRight size={15} /></button></div>
      <div className="card-row">{featured.map((item, index) => <MiniCard key={item.id} activity={item} number={index + 1} onClick={() => openActivity(item)} />)}</div>
    </section>
    <section className="home-tools">
      <button className="tool-card" onClick={() => setScreen('browse')}><Zap size={22} /><span><b>Pick a game</b><small>Browse all {catalog.length} activities</small></span><ChevronRight size={18} /></button>
      <button className="tool-card" onClick={() => setScreen('saved')}><Heart size={22} /><span><b>Your glove box</b><small>{favorites.length ? `${favorites.length} saved for later` : 'Save games for the trip'}</small></span><ChevronRight size={18} /></button>
    </section>
    <section className="trip-stats"><div><Trophy size={24} /><span><b>{completed}</b><small>rounds played</small></span></div><blockquote>“The best part of the trip is who you’re stuck in the car with.”</blockquote></section>
  </>;
}

function SetupScreen({ activity, players, setPlayers, begin, setScreen }) {
  const Icon = activity.icon;
  return <section className="setup-screen">
    <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20} /> Back to the road</button>
    <div className={`setup-icon ${activity.color}`}><Icon size={28} /></div>
    <p className="eyebrow">{activity.type} · {labelFor(activity.gameType)}</p>
    <h2>{activity.title}</h2>
    <p className="setup-prompt">{activity.prompt}</p>
    <div className="setup-meta"><span><Clock3 size={15} /> {activity.meta}</span><span><Users size={15} /> {activity.ages}</span></div>
    <div className="setup-panel">
      <div className="section-heading"><span>Who’s playing?</span><small>{players.length} players</small></div>
      {players.map((name, index) => <div className="player-row" key={`${index}-${name}`}><span className="player-dot">{index + 1}</span><input aria-label={`Player ${index + 1} name`} value={name} onChange={event => setPlayers(value => value.map((player, i) => i === index ? event.target.value : player))} />{players.length > 2 && <button onClick={() => setPlayers(value => value.filter((_, i) => i !== index))} aria-label={`Remove player ${index + 1}`}><X size={18} /></button>}</div>)}
      <button className="add-player" onClick={() => setPlayers(value => [...value, `Player ${value.length + 1}`])}>+ Add player</button>
    </div>
    <button className="primary start" onClick={begin}><Play size={19} /> Start round</button>
    <p className="safety">Passenger picks. Everyone plays. Driver keeps eyes on the road.</p>
  </section>;
}

function PlayScreen({ activity, players, activePlayer, setActivePlayer, round, setRound, toggleFavorite, favorites, feedback, finishRound, surprise, setScreen }) {
  const Icon = activity.icon;
  const [secondsLeft, setSecondsLeft] = useState(activity.seconds || 0);
  const timerEnded = activity.gameType === 'timer' && round.started && secondsLeft <= 0;

  useEffect(() => setSecondsLeft(activity.seconds || 0), [activity.id, activity.seconds]);
  useEffect(() => {
    if (activity.gameType !== 'timer' || !round.started || secondsLeft <= 0) return undefined;
    const timer = setInterval(() => setSecondsLeft(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [activity.gameType, round.started, secondsLeft]);
  useEffect(() => {
    if (timerEnded && !round.ended) {
      setRound(value => ({ ...value, ended: true }));
      feedback('success');
    }
  }, [timerEnded, round.ended, setRound, feedback]);

  const updateRound = (updates) => setRound(value => ({ ...value, ...updates }));
  const nextPlayer = () => setActivePlayer(value => (value + 1) % players.length);
  const canFinish = !round.ended && (activity.gameType === 'scavenger'
    ? round.checked.length === activity.items.length
    : activity.gameType === 'vote'
      ? Object.keys(round.choices).length === players.length
      : activity.gameType === 'rapid'
        ? round.count >= activity.goal
        : activity.gameType === 'timer'
          ? round.started
          : round.step >= activity.turns);

  const handleSequence = () => {
    updateRound({ step: round.step + 1 });
    nextPlayer();
    feedback('tap');
  };

  return <section className="play-screen">
    <button className="back" onClick={() => setScreen('setup')}><ArrowLeft size={20} /> Back to setup</button>
    <div className={`activity-card ${activity.color}`}>
      <div className="card-top"><span className="activity-icon"><Icon size={28} /></span><button className="heart" onClick={() => toggleFavorite(activity.id)} aria-label="Save activity"><Heart size={23} fill={favorites.includes(activity.id) ? 'currentColor' : 'none'} /></button></div>
      <p className="eyebrow">{activity.type} · {labelFor(activity.gameType)}</p>
      <h2>{activity.title}</h2>
      <p className="prompt">{activity.prompt}</p>
      <RoundWidget activity={activity} players={players} activePlayer={activePlayer} setActivePlayer={setActivePlayer} round={round} updateRound={updateRound} nextPlayer={nextPlayer} secondsLeft={secondsLeft} timerEnded={timerEnded} handleSequence={handleSequence} feedback={feedback} />
      <div className="bonus"><Star size={18} /><span><b>Bonus round</b>{activity.bonus}</span></div>
    </div>
    <div className="play-actions"><button className="secondary" onClick={surprise}><RotateCcw size={19} /> Try another</button><button className="primary done" disabled={!canFinish} onClick={() => finishRound(activePlayer)}><Check size={20} /> We did it!</button></div>
    <p className="safety">Passenger picks. Everyone plays. Driver keeps eyes on the road.</p>
  </section>;
}

function RoundWidget({ activity, players, activePlayer, setActivePlayer, round, updateRound, nextPlayer, secondsLeft, timerEnded, handleSequence, feedback }) {
  const touchStart = useRef(null);
  if (activity.gameType === 'scavenger') return <div className="round-widget"><div className="progress-label"><b>{round.checked.length}/{activity.items.length} found</b><span>Tap what you see</span></div><div className="hunt-grid">{activity.items.map(item => <button key={item} className={round.checked.includes(item) ? 'checked' : ''} onClick={() => { updateRound({ checked: round.checked.includes(item) ? round.checked.filter(value => value !== item) : [...round.checked, item] }); feedback('tap'); }}>{round.checked.includes(item) && <Check size={15} />} {item}</button>)}</div></div>;

  if (activity.gameType === 'vote') {
    const results = activity.choices.map(choice => [choice, Object.values(round.choices).filter(value => value === choice).length]);
    const allVoted = Object.keys(round.choices).length === players.length;
    const choose = (choice) => { if (allVoted) return; updateRound({ choices: { ...round.choices, [activePlayer]: choice } }); if (activePlayer < players.length - 1) setActivePlayer(activePlayer + 1); feedback('tap'); };
    const handleTouchStart = event => { touchStart.current = event.touches[0].clientX; };
    const handleTouchEnd = event => { if (touchStart.current === null || allVoted) return; const delta = event.changedTouches[0].clientX - touchStart.current; touchStart.current = null; if (Math.abs(delta) < 45) return; choose(activity.choices[delta < 0 ? 1 : 0]); };
    return <div className="round-widget"><div className="progress-label"><b>{Object.keys(round.choices).length}/{players.length} votes</b><span>Tap or swipe</span></div><div className="turn-label"><span className="player-dot">{activePlayer + 1}</span><b>{players[activePlayer]}, choose:</b></div><div className="choice-grid swipe-choices" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>{activity.choices.map(choice => <button disabled={allVoted} className={round.choices[activePlayer] === choice ? 'selected' : ''} key={choice} onClick={() => choose(choice)}>{choice}</button>)}</div>{allVoted && <div className="vote-results">{results.map(([choice, count]) => <span key={choice}><b>{count}</b>{choice}</span>)}</div>}</div>;
  }

  if (activity.gameType === 'timer') return <div className="round-widget timer-widget"><div className={`timer-face ${timerEnded ? 'finished' : ''}`}><span>{timerEnded ? 'TIME!' : formatTime(secondsLeft)}</span><small>{timerEnded ? 'Make your call' : 'on the clock'}</small></div>{!round.started ? <button className="timer-action" onClick={() => { updateRound({ started: true }); feedback('success'); }}><Play size={20} /> Start the clock</button> : <div className="timer-status">{timerEnded ? <><Zap size={18} /> Time is up!</> : <><Pause size={18} /> Keep going!</>}</div>}</div>;

  if (activity.gameType === 'rapid') return <div className="round-widget rapid-widget"><div className="rapid-score"><b>{round.count}</b><span>of {activity.goal}</span></div><p>Category: <strong>{activity.category}</strong></p><button className="count-button" disabled={round.count >= activity.goal} onClick={() => { updateRound({ count: round.count + 1 }); feedback('tap'); }}><Zap size={22} /> Got one!</button><small>Tap once for every valid answer</small></div>;

  return <div className="round-widget sequence-widget"><div className="progress-label"><b>{Math.min(round.step, activity.turns)}/{activity.turns} turns</b><span>Pass the phone</span></div><div className="turn-label"><span className="player-dot">{activePlayer + 1}</span><b>{players[activePlayer]}, you’re up!</b></div><p>{activity.turnLabel}</p><button className="sequence-action" disabled={round.step >= activity.turns} onClick={handleSequence}><Check size={20} /> Done — pass it on</button></div>;
}

function BrowseScreen({ screen, favorites, pool, openActivity, setFilter, setScreen }) {
  const list = screen === 'saved' ? activities.filter(activity => favorites.includes(activity.id)) : activities;
  return <section className="browse-screen"><div className="browse-title"><button className="icon-btn" onClick={() => setScreen('home')}><X size={22} /></button><div><p className="eyebrow">THE GLOVE BOX</p><h2>{screen === 'saved' ? 'Saved for later' : 'All games'}</h2></div></div><div className="list">{list.map(activity => <button className="list-card" key={activity.id} onClick={() => { if (!pool.some(item => item.id === activity.id)) setFilter('All'); openActivity(activity); }}><span className={`list-icon ${activity.color}`}><activity.icon size={22} /></span><span><small>{activity.type} · {labelFor(activity.gameType)}</small><b>{activity.title}</b><em>{activity.meta} · {activity.ages}</em></span><ChevronRight size={18} /></button>)}{screen === 'saved' && !favorites.length && <div className="empty"><Bookmark size={36} /><h3>Nothing tucked away yet</h3><p>Tap the heart on any game to save it for later.</p><button className="secondary" onClick={() => setScreen('browse')}>Browse games</button></div>}</div></section>;
}

function ScoreScreen({ scores, completed, resetTrip, setScreen }) {
  const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return <section className="browse-screen score-screen"><p className="eyebrow">TODAY’S ROAD TRIP</p><h2>Scoreboard</h2><div className="score-total"><Trophy size={28} /><span><b>{completed}</b><small>rounds completed</small></span></div>{rows.length ? <div className="score-list">{rows.map(([name, score], index) => <div key={name}><span className="player-dot">{index + 1}</span><b>{name}</b><strong>{score}</strong></div>)}</div> : <div className="empty"><Trophy size={36} /><h3>No scores yet</h3><p>Start a game and points will appear here.</p></div>}<div className="score-actions"><button className="secondary" onClick={() => setScreen('home')}>Find a game</button><button className="text-button" onClick={resetTrip}><Settings2 size={15} /> Reset trip</button></div></section>;
}

function MiniCard({ activity, number, onClick }) {
  const Icon = activity.icon;
  return <button className={`mini-card ${activity.color}`} onClick={onClick}><span className="mini-num">0{number}</span><Icon size={25} /><small>{activity.type}</small><b>{activity.title}</b><p>{activity.prompt}</p><span className="mini-go">Play <ChevronRight size={15} /></span></button>;
}

function labelFor(gameType) {
  return { scavenger: 'Tap & find', vote: 'Pass & vote', timer: 'Beat the clock', rapid: 'Quick fire', sequence: 'Pass & play' }[gameType] || 'Play';
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

createRoot(document.getElementById('root')).render(<App />);

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
