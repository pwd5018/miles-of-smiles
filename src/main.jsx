import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, Bookmark, Check, ChevronRight, Clock3, Compass, Heart,
  Lightbulb, MapPin, Music2, RotateCcw, Search, Sparkles, Star, Trophy,
  Users, Volume2, X
} from 'lucide-react';
import './styles.css';

const activities = [
  { id: 1, type: 'Spot it', icon: Search, title: 'Rainbow Road', prompt: 'Find something outside for every color of the rainbow — in order!', meta: '5–15 min', ages: 'All ages', energy: 'calm', color: 'coral', bonus: 'Bonus point if nothing you spot is a car.' },
  { id: 2, type: 'Would you rather?', icon: Sparkles, title: 'Wild Ride', prompt: 'Would you rather travel everywhere by giant turtle or tiny helicopter?', meta: '2–5 min', ages: 'All ages', energy: 'chatty', color: 'blue', bonus: 'Everyone has to defend their answer.' },
  { id: 3, type: 'Make a story', icon: Lightbulb, title: 'One Word Wonder', prompt: 'Build a story together, one word per person. Keep going until someone says “banana.”', meta: '5–10 min', ages: '6+', energy: 'silly', color: 'yellow', bonus: 'Try to work your destination into the story.' },
  { id: 4, type: 'Listen up', icon: Volume2, title: 'Mystery Sound', prompt: 'One person makes a sound with their eyes closed. Everyone else gets one guess.', meta: '5 min', ages: '4+', energy: 'silly', color: 'mint', bonus: 'No animal sounds allowed in round two.' },
  { id: 5, type: 'Music', icon: Music2, title: 'First Note Face-Off', prompt: 'Shuffle your music. Who can name the song fastest after the first three seconds?', meta: '10 min', ages: '6+', energy: 'loud', color: 'purple', bonus: 'Winner picks the next song.' },
  { id: 6, type: 'Challenge', icon: Trophy, title: 'Alphabet Hunt', prompt: 'Find the letters A through Z on signs, license plates, or buildings.', meta: '15–30 min', ages: 'All ages', energy: 'focused', color: 'orange', bonus: 'Skip Q and X if the grown-ups approve.' },
  { id: 7, type: 'Get talking', icon: Users, title: 'Tiny Time Machine', prompt: 'If you could revisit one family day, which would you pick and why?', meta: '5–10 min', ages: '6+', energy: 'calm', color: 'blue', bonus: 'Pick one thing you would do differently.' },
  { id: 8, type: 'Spot it', icon: Compass, title: 'Roadside Bingo', prompt: 'First to spot a barn, motorcycle, water tower, dog, and yellow sign wins.', meta: '10–20 min', ages: 'All ages', energy: 'focused', color: 'mint', bonus: 'No calling two items from the same view.' },
  { id: 9, type: 'Quick game', icon: Star, title: 'The Quiet Game', prompt: 'First person to talk loses. Yes, grown-ups are allowed to play too.', meta: 'As long as possible', ages: 'All ages', energy: 'calm', color: 'yellow', bonus: 'Winner gets first snack pick.' },
];

const filters = ['All', 'Calm', 'Silly', 'Chatty', 'Focused'];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [filter, setFilter] = useState('All');
  const [current, setCurrent] = useState(0);
  const [favorites, setFavorites] = useState(() => typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem('roadtrip-favorites') || '[]'));
  const [completed, setCompleted] = useState(() => typeof window === 'undefined' ? 0 : Number(localStorage.getItem('roadtrip-completed') || 0));
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem('roadtrip-favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('roadtrip-completed', String(completed)), [completed]);

  const pool = useMemo(() => filter === 'All' ? activities : activities.filter(a => a.energy === filter.toLowerCase()), [filter]);
  const activity = pool[current % pool.length] || activities[0];

  const surprise = () => {
    let next = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && pool[next]?.id === activity.id) next = (next + 1) % pool.length;
    setCurrent(next);
    setScreen('play');
  };
  const toggleFavorite = (id) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const finish = () => {
    setCompleted(c => c + 1);
    setToast('Nice one! Added to today’s tally.');
    setTimeout(() => { setToast(''); surprise(); }, 1100);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Go home">
          <span className="brand-mark"><Compass size={22}/></span>
          <span><b>MILES OF SMILES</b><small>ROAD TRIP CO.</small></span>
        </button>
        <button className="saved-btn" onClick={() => setScreen('saved')} aria-label="Saved activities">
          <Bookmark size={20} fill={favorites.length ? 'currentColor' : 'none'}/><span>{favorites.length}</span>
        </button>
      </header>

      {screen === 'home' && <>
        <section className="hero">
          <div className="route-line"><span/><MapPin size={20}/><span/></div>
          <p className="eyebrow">NEXT STOP: A GOOD TIME</p>
          <h1>Are we there<br/><em>yet?</em></h1>
          <p className="intro">Not quite. But we’ve got something fun to pass the miles.</p>
          <button className="primary" onClick={surprise}><Sparkles size={20}/> Surprise us <ChevronRight size={20}/></button>
          <p className="tiny-note">No supplies. No setup. Just play.</p>
        </section>

        <section className="controls">
          <div className="section-heading"><span>Pick a mood</span><small>or leave it to fate</small></div>
          <div className="chips" role="group" aria-label="Activity mood">
            {filters.map(f => <button className={filter === f ? 'active' : ''} onClick={() => {setFilter(f); setCurrent(0)}} key={f}>{f}</button>)}
          </div>
        </section>

        <section className="featured">
          <div className="section-heading"><span>Road-tested favorites</span><button onClick={() => setScreen('browse')}>See all <ChevronRight size={15}/></button></div>
          <div className="card-row">
            {activities.slice(0, 3).map((a, i) => <MiniCard key={a.id} activity={a} number={i + 1} onClick={() => {setCurrent(pool.findIndex(x => x.id === a.id) >= 0 ? pool.findIndex(x => x.id === a.id) : 0); setScreen('play')}} />)}
          </div>
        </section>

        <section className="trip-stats">
          <div><Trophy size={24}/><span><b>{completed}</b><small>games played</small></span></div>
          <blockquote>“The best part of the trip is who you’re stuck in the car with.”</blockquote>
        </section>
      </>}

      {screen === 'play' && <section className="play-screen">
        <button className="back" onClick={() => setScreen('home')}><ArrowLeft size={20}/> Back to the road</button>
        <div className={`activity-card ${activity.color}`}>
          <div className="card-top">
            <span className="activity-icon"><activity.icon size={28}/></span>
            <button className="heart" onClick={() => toggleFavorite(activity.id)} aria-label="Save activity"><Heart size={23} fill={favorites.includes(activity.id) ? 'currentColor' : 'none'}/></button>
          </div>
          <p className="eyebrow">{activity.type}</p>
          <h2>{activity.title}</h2>
          <p className="prompt">{activity.prompt}</p>
          <div className="meta"><span><Clock3 size={16}/>{activity.meta}</span><span><Users size={16}/>{activity.ages}</span></div>
          <div className="bonus"><Star size={18}/><span><b>Bonus round</b>{activity.bonus}</span></div>
        </div>
        <div className="play-actions">
          <button className="secondary" onClick={surprise}><RotateCcw size={19}/> Try another</button>
          <button className="primary done" onClick={finish}><Check size={20}/> We did it!</button>
        </div>
        <p className="safety">Passenger picks. Everyone plays. Driver keeps eyes on the road.</p>
      </section>}

      {(screen === 'browse' || screen === 'saved') && <section className="browse-screen">
        <div className="browse-title"><button className="icon-btn" onClick={() => setScreen('home')}><X size={22}/></button><div><p className="eyebrow">THE GLOVE BOX</p><h2>{screen === 'saved' ? 'Saved for later' : 'All activities'}</h2></div></div>
        <div className="list">
          {(screen === 'saved' ? activities.filter(a => favorites.includes(a.id)) : activities).map(a => <button className="list-card" key={a.id} onClick={() => {const idx = pool.findIndex(x => x.id === a.id); setCurrent(idx >= 0 ? idx : activities.findIndex(x => x.id === a.id)); if (idx < 0) setFilter('All'); setScreen('play')}}><span className={`list-icon ${a.color}`}><a.icon size={22}/></span><span><small>{a.type}</small><b>{a.title}</b><em>{a.meta} · {a.ages}</em></span><ChevronRight size={18}/></button>)}
          {screen === 'saved' && favorites.length === 0 && <div className="empty"><Bookmark size={36}/><h3>Nothing tucked away yet</h3><p>Tap the heart on any activity to save it for later.</p><button className="secondary" onClick={() => setScreen('browse')}>Browse activities</button></div>}
        </div>
      </section>}
      {toast && <div className="toast"><Check size={18}/>{toast}</div>}
    </main>
  );
}

function MiniCard({ activity: a, number, onClick }) {
  const Icon = a.icon;
  return <button className={`mini-card ${a.color}`} onClick={onClick}>
    <span className="mini-num">0{number}</span><Icon size={25}/><small>{a.type}</small><b>{a.title}</b><p>{a.prompt}</p><span className="mini-go">Play <ChevronRight size={15}/></span>
  </button>
}

createRoot(document.getElementById('root')).render(<App />);
