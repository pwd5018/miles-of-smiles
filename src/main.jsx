import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, Bookmark, Check, ChevronRight, Clock3, Compass, Heart,
  Lightbulb, MapPin, Music2, RotateCcw, Search, Sparkles, Star, Trophy,
  Users, Volume2, X
} from 'lucide-react';
import './styles.css';

const activities = [
  { id: 1, type: 'Spot it', icon: Search, title: 'Rainbow Road', prompt: 'Find something outside for every color of the rainbow — in order!', meta: '5–15 min', ages: 'All ages', energy: 'calm', color: 'coral', bonus: 'Bonus point if nothing you spot is a car.', gameType: 'scavenger', items: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'] },
  { id: 2, type: 'Would you rather?', icon: Sparkles, title: 'Wild Ride', prompt: 'Would you rather travel everywhere by giant turtle or tiny helicopter?', meta: '2–5 min', ages: 'All ages', energy: 'chatty', color: 'blue', bonus: 'Everyone has to defend their answer.', gameType: 'vote', choices: ['Giant turtle', 'Tiny helicopter'] },
  { id: 3, type: 'Make a story', icon: Lightbulb, title: 'One Word Wonder', prompt: 'Build a story together, one word per person. Keep going until someone says “banana.”', meta: '5–10 min', ages: '6+', energy: 'silly', color: 'yellow', bonus: 'Try to work your destination into the story.', gameType: 'pass' },
  { id: 4, type: 'Listen up', icon: Volume2, title: 'Mystery Sound', prompt: 'One person makes a sound with their eyes closed. Everyone else gets one guess.', meta: '5 min', ages: '4+', energy: 'silly', color: 'mint', bonus: 'No animal sounds allowed in round two.', gameType: 'pass' },
  { id: 5, type: 'Music', icon: Music2, title: 'First Note Face-Off', prompt: 'Shuffle your music. Who can name the song fastest after the first three seconds?', meta: '10 min', ages: '6+', energy: 'loud', color: 'purple', bonus: 'Winner picks the next song.', gameType: 'pass' },
  { id: 6, type: 'Challenge', icon: Trophy, title: 'Alphabet Hunt', prompt: 'Find the letters A through Z on signs, license plates, or buildings.', meta: '15–30 min', ages: 'All ages', energy: 'focused', color: 'orange', bonus: 'Skip Q and X if the grown-ups approve.', gameType: 'scavenger', items: [...'ABCDEFGHIJKLMNOPQRSTUVWXY'].concat('Z') },
  { id: 7, type: 'Get talking', icon: Users, title: 'Tiny Time Machine', prompt: 'If you could revisit one family day, which would you pick and why?', meta: '5–10 min', ages: '6+', energy: 'calm', color: 'blue', bonus: 'Pick one thing you would do differently.', gameType: 'pass' },
  { id: 8, type: 'Spot it', icon: Compass, title: 'Roadside Bingo', prompt: 'First to spot a barn, motorcycle, water tower, dog, and yellow sign wins.', meta: '10–20 min', ages: 'All ages', energy: 'focused', color: 'mint', bonus: 'No calling two items from the same view.', gameType: 'scavenger', items: ['Barn', 'Motorcycle', 'Water tower', 'Dog', 'Yellow sign'] },
  { id: 9, type: 'Quick game', icon: Star, title: 'The Quiet Game', prompt: 'First person to talk loses. Yes, grown-ups are allowed to play too.', meta: 'As long as possible', ages: 'All ages', energy: 'calm', color: 'yellow', bonus: 'Winner gets first snack pick.', gameType: 'pass' },
];
const filters = ['All', 'Calm', 'Silly', 'Chatty', 'Focused'];
const readStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(window.localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [filter, setFilter] = useState('All');
  const [current, setCurrent] = useState(0);
  const [favorites, setFavorites] = useState(() => readStored('roadtrip-favorites', []));
  const [completed, setCompleted] = useState(() => Number(readStored('roadtrip-completed', 0)) || 0);
  const [players, setPlayers] = useState(() => { const saved = readStored('roadtrip-players', ['Passenger 1', 'Passenger 2']); return Array.isArray(saved) && saved.length ? saved : ['Passenger 1', 'Passenger 2']; });
  const [scores, setScores] = useState(() => readStored('roadtrip-scores', {}));
  const [activePlayer, setActivePlayer] = useState(0);
  const [round, setRound] = useState({ checked: [], choices: {}, revealed: false });
  const [toast, setToast] = useState('');
  const pool = useMemo(() => filter === 'All' ? activities : activities.filter(a => a.energy === filter.toLowerCase()), [filter]);
  const activity = pool[current % pool.length] || activities[0];
  const Icon = activity.icon;

  useEffect(() => window.localStorage.setItem('roadtrip-favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => window.localStorage.setItem('roadtrip-completed', String(completed)), [completed]);
  useEffect(() => window.localStorage.setItem('roadtrip-players', JSON.stringify(players)), [players]);
  useEffect(() => window.localStorage.setItem('roadtrip-scores', JSON.stringify(scores)), [scores]);

  const chooseActivity = (index, nextScreen = 'setup') => { setCurrent(index); setRound({ checked: [], choices: {}, revealed: false }); setScreen(nextScreen); };
  const surprise = () => { let next = Math.floor(Math.random() * pool.length); if (pool.length > 1 && pool[next]?.id === activity.id) next = (next + 1) % pool.length; chooseActivity(next); };
  const toggleFavorite = (id) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const awardPoint = (playerIndex = activePlayer) => setScores(v => ({ ...v, [players[playerIndex]]: (v[players[playerIndex]] || 0) + 1 }));
  const finish = () => { awardPoint(); setCompleted(c => c + 1); setToast('Round complete! +1 point'); setTimeout(() => { setToast(''); surprise(); }, 900); };
  const begin = () => { setPlayers(v => v.map((name, index) => name.trim() || `Player ${index + 1}`)); setRound({ checked: [], choices: {}, revealed: false }); setActivePlayer(0); setScreen('play'); };
  const toggleItem = (item) => setRound(v => ({ ...v, checked: v.checked.includes(item) ? v.checked.filter(x => x !== item) : [...v.checked, item] }));
  const vote = (player, choice) => setRound(v => ({ ...v, choices: { ...v.choices, [player]: choice } }));

  return <main className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setScreen('home')} aria-label="Go home"><span className="brand-mark"><Compass size={22}/></span><span><b>MILES OF SMILES</b><small>ROAD TRIP CO.</small></span></button><button className="saved-btn" onClick={() => setScreen('saved')} aria-label="Saved activities"><Bookmark size={20} fill={favorites.length ? 'currentColor' : 'none'}/><span>{favorites.length}</span></button></header>

    {screen === 'home' && <><section className="hero"><div className="route-line"><span/><MapPin size={20}/><span/></div><p className="eyebrow">NEXT STOP: A GOOD TIME</p><h1>Are we there<br/><em>yet?</em></h1><p className="intro">Not quite. But we’ve got something fun to pass the miles.</p><button className="primary" onClick={surprise}><Sparkles size={20}/> Surprise us <ChevronRight size={20}/></button><p className="tiny-note">No supplies. No setup. Just play.</p></section><section className="controls"><div className="section-heading"><span>Pick a mood</span><small>or leave it to fate</small></div><div className="chips" role="group" aria-label="Activity mood">{filters.map(f => <button className={filter === f ? 'active' : ''} onClick={() => {setFilter(f); setCurrent(0)}} key={f}>{f}</button>)}</div></section><section className="featured"><div className="section-heading"><span>Road-tested favorites</span><button onClick={() => setScreen('browse')}>See all <ChevronRight size={15}/></button></div><div className="card-row">{activities.slice(0, 3).map((a, i) => <MiniCard key={a.id} activity={a} number={i + 1} onClick={() => chooseActivity(Math.max(0, pool.findIndex(x => x.id === a.id)))} />)}</div></section><section className="trip-stats"><div><Trophy size={24}/><span><b>{completed}</b><small>rounds played</small></span></div><blockquote>“The best part of the trip is who you’re stuck in the car with.”</blockquote></section></>}

    {screen === 'setup' && <section className="setup-screen"><button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Back to the road</button><p className="eyebrow">GET READY TO PLAY</p><h2>{activity.title}</h2><p className="setup-prompt">{activity.prompt}</p><div className="setup-panel"><div className="section-heading"><span>Who’s playing?</span><small>{players.length} players</small></div>{players.map((name, i) => <div className="player-row" key={`${name}-${i}`}><span className="player-dot">{i + 1}</span><input aria-label={`Player ${i + 1} name`} value={name} onChange={e => setPlayers(v => v.map((p, n) => n === i ? e.target.value : p))}/>{players.length > 2 && <button onClick={() => setPlayers(v => v.filter((_, n) => n !== i))} aria-label={`Remove ${name}`}><X size={18}/></button>}</div>)}<button className="add-player" onClick={() => setPlayers(v => [...v, `Player ${v.length + 1}`])}>+ Add player</button></div><button className="primary start" onClick={begin}><Sparkles size={20}/> Start round</button><p className="safety">Passenger picks. Everyone plays. Driver keeps eyes on the road.</p></section>}

    {screen === 'play' && <PlayRound activity={activity} Icon={Icon} players={players} activePlayer={activePlayer} setActivePlayer={setActivePlayer} round={round} setRound={setRound} setScreen={setScreen} toggleFavorite={toggleFavorite} favorites={favorites} toggleItem={toggleItem} vote={vote} finish={finish} surprise={surprise} />}
    {(screen === 'browse' || screen === 'saved') && <Browse screen={screen} favorites={favorites} activities={activities} pool={pool} chooseActivity={chooseActivity} setFilter={setFilter} setScreen={setScreen} />}
    {screen === 'score' && <Score scores={scores} completed={completed} setScreen={setScreen} />}
    <nav className="bottom-nav"><button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><Compass size={19}/>Home</button><button className={screen === 'browse' ? 'active' : ''} onClick={() => setScreen('browse')}><Search size={19}/>Games</button><button className={screen === 'score' ? 'active' : ''} onClick={() => setScreen('score')}><Trophy size={19}/>Score</button><button className={screen === 'saved' ? 'active' : ''} onClick={() => setScreen('saved')}><Bookmark size={19}/>Saved</button></nav>
    {toast && <div className="toast"><Check size={18}/>{toast}</div>}
  </main>;
}

function PlayRound({ activity, Icon, players, activePlayer, setActivePlayer, round, setRound, setScreen, toggleFavorite, favorites, toggleItem, vote, finish, surprise }) {
  const complete = round.checked.length === activity.items?.length;
  const counts = activity.choices?.map(choice => [choice, Object.values(round.choices).filter(v => v === choice).length]);
  return <section className="play-screen"><button className="back" onClick={() => { setRound({ checked: [], choices: {}, revealed: false }); setScreen('setup'); }}><ArrowLeft size={20}/> Back to setup</button><div className={`activity-card ${activity.color}`}><div className="card-top"><span className="activity-icon"><Icon size={28}/></span><button className="heart" onClick={() => toggleFavorite(activity.id)} aria-label="Save activity"><Heart size={23} fill={favorites.includes(activity.id) ? 'currentColor' : 'none'}/></button></div><p className="eyebrow">{activity.type} · {activity.gameType === 'pass' ? 'Pass & play' : 'Interactive round'}</p><h2>{activity.title}</h2><p className="prompt">{activity.prompt}</p>{activity.gameType === 'scavenger' && <div className="round-widget"><div className="progress-label"><b>{round.checked.length}/{activity.items.length} found</b><span>Tap what you see</span></div><div className="hunt-grid">{activity.items.map(item => <button key={item} className={round.checked.includes(item) ? 'checked' : ''} onClick={() => toggleItem(item)}>{round.checked.includes(item) && <Check size={15}/>} {item}</button>)}</div></div>}{activity.gameType === 'vote' && <div className="round-widget"><div className="progress-label"><b>{Object.keys(round.choices).length}/{players.length} votes</b><span>Pass the phone</span></div><div className="turn-label"><span className="player-dot">{activePlayer + 1}</span><b>{players[activePlayer]}, choose:</b></div><div className="choice-grid">{activity.choices.map(choice => <button className={round.choices[activePlayer] === choice ? 'selected' : ''} key={choice} onClick={() => { vote(activePlayer, choice); if (activePlayer < players.length - 1) setActivePlayer(activePlayer + 1); }}>{choice}</button>)}</div>{Object.keys(round.choices).length === players.length && <div className="vote-results">{counts.map(([choice, count]) => <span key={choice}><b>{count}</b>{choice}</span>)}</div>}</div>}{activity.gameType === 'pass' && <div className="round-widget pass-widget"><RotateCcw size={22}/><b>Pass the phone to the next player</b><span>When everyone has had a turn, mark the round complete.</span></div>}<div className="bonus"><Star size={18}/><span><b>Bonus round</b>{activity.bonus}</span></div></div><div className="play-actions"><button className="secondary" onClick={surprise}><RotateCcw size={19}/> Try another</button><button className="primary done" disabled={(activity.gameType === 'scavenger' && !complete) || (activity.gameType === 'vote' && Object.keys(round.choices).length < players.length)} onClick={finish}><Check size={20}/> We did it!</button></div><p className="safety">Passenger picks. Everyone plays. Driver keeps eyes on the road.</p></section>;
}

function Browse({ screen, favorites, activities, pool, chooseActivity, setFilter, setScreen }) { const list = screen === 'saved' ? activities.filter(a => favorites.includes(a.id)) : activities; return <section className="browse-screen"><div className="browse-title"><button className="icon-btn" onClick={() => setScreen('home')}><X size={22}/></button><div><p className="eyebrow">THE GLOVE BOX</p><h2>{screen === 'saved' ? 'Saved for later' : 'All games'}</h2></div></div><div className="list">{list.map(a => <button className="list-card" key={a.id} onClick={() => { const idx = pool.findIndex(x => x.id === a.id); if (idx < 0) setFilter('All'); chooseActivity(idx >= 0 ? idx : activities.findIndex(x => x.id === a.id)); }}><span className={`list-icon ${a.color}`}><a.icon size={22}/></span><span><small>{a.type}</small><b>{a.title}</b><em>{a.meta} · {a.ages}</em></span><ChevronRight size={18}/></button>)}{screen === 'saved' && !favorites.length && <div className="empty"><Bookmark size={36}/><h3>Nothing tucked away yet</h3><p>Tap the heart on any game to save it for later.</p><button className="secondary" onClick={() => setScreen('browse')}>Browse games</button></div>}</div></section>; }
function Score({ scores, completed, setScreen }) { const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]); return <section className="browse-screen score-screen"><p className="eyebrow">TODAY’S ROAD TRIP</p><h2>Scoreboard</h2><div className="score-total"><Trophy size={28}/><span><b>{completed}</b><small>rounds completed</small></span></div>{rows.length ? <div className="score-list">{rows.map(([name, score], i) => <div key={name}><span className="player-dot">{i + 1}</span><b>{name}</b><strong>{score}</strong></div>)}</div> : <div className="empty"><Trophy size={36}/><h3>No scores yet</h3><p>Start a game and points will appear here.</p></div>}<button className="secondary" onClick={() => setScreen('home')}>Find a game</button></section>; }
function MiniCard({ activity: a, number, onClick }) { const Icon = a.icon; return <button className={`mini-card ${a.color}`} onClick={onClick}><span className="mini-num">0{number}</span><Icon size={25}/><small>{a.type}</small><b>{a.title}</b><p>{a.prompt}</p><span className="mini-go">Play <ChevronRight size={15}/></span></button>; }

createRoot(document.getElementById('root')).render(<App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
