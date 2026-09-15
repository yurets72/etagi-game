import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Hand,
  Heart,
  Smile,
  Zap,
  Trophy,
  Flame,
  Users,
  Sparkles,
  Calendar,
  X,
  AlertTriangle,
  Award,
  UserPlus,
  LayoutGrid,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface CalendarEvent {
  time: string;
  title: string;
}

interface Agent {
  id: string;
  name: string;
  avatarFile: string;
  x: number;
  y: number;
  status: 'active' | 'newbie' | 'burned' | 'top';
  hp: number;
  happiness: number;
  energy: number;
  deals: number;
  conversion: number;
  trend: 'up' | 'down';
  calendar: CalendarEvent[];
}

type FilterMode = 'all' | 'burned' | 'top' | 'newbie';

// ─── Status config ──────────────────────────────────────
const STATUS_CONFIG: Record<
  Agent['status'],
  { color: string; bg: string; label: string; dot: string }
> = {
  active: { color: '#22c55e', bg: 'bg-green-500/20', label: 'В строю', dot: 'bg-green-500' },
  newbie: { color: '#eab308', bg: 'bg-yellow-500/20', label: 'Новичок', dot: 'bg-yellow-500' },
  burned: { color: '#ef4444', bg: 'bg-red-500/20', label: 'Выгорел', dot: 'bg-red-500' },
  top: { color: '#a855f7', bg: 'bg-purple-500/20', label: 'Топ', dot: 'bg-purple-500' },
};

const BOB_CLASSES = ['idle-bob', 'idle-bob-2', 'idle-bob-3'];

// ─── Mini Bar (over avatar head) ─────────────────────────
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-12 h-1.5 bg-black/40 rounded-sm overflow-hidden border border-black/30">
      <div
        className="h-full bar-fill rounded-sm"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Stat Bar (in agent card) ─────────────────────────────
function StatBar({
  icon,
  label,
  value,
  color,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300">
          {icon}
          {label}
        </span>
        <span className="font-vt text-lg" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-3 bg-black/30 rounded-sm overflow-hidden border border-black/40">
        <div
          className="h-full bar-fill rounded-sm flex items-center justify-end pr-1"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[10px] text-slate-400 leading-snug">{description}</p>
    </div>
  );
}

// ─── Agent Avatar (on map) ───────────────────────────────
function AgentAvatar({
  agent,
  index,
  isSelected,
  isDimmed,
  onClick,
}: {
  agent: Agent;
  index: number;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  const statusCfg = STATUS_CONFIG[agent.status];
  const isBurned = agent.status === 'burned';
  const isYou = agent.id === 'rop';
  const bobClass = BOB_CLASSES[index % BOB_CLASSES.length];

  return (
    <div
      className="absolute cursor-pointer transition-all duration-300"
      style={{
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: isDimmed ? 0.3 : 1,
        zIndex: 10,
      }}
      onClick={onClick}
    >
      {/* Name bubble */}
      <div className="flex flex-col items-center gap-0.5 mb-1 pointer-events-none">
        {isYou && (
          <div className="you-pulse px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-sm border-2 border-purple-300 shadow-lg mb-0.5 whitespace-nowrap">
            Ты
          </div>
        )}
        <div
          className="px-2 py-0.5 bg-slate-900/90 text-white text-xs rounded-sm border whitespace-nowrap"
          style={{ borderColor: statusCfg.color, boxShadow: `0 2px 8px ${statusCfg.color}40` }}
        >
          {agent.name.split(' ')[0]}
        </div>
        {/* Mini bars */}
        <div className="flex flex-col gap-0.5 items-center">
          <MiniBar value={agent.hp} color="#ef4444" />
          <MiniBar value={agent.happiness} color="#eab308" />
          <MiniBar value={agent.energy} color="#3b82f6" />
        </div>
      </div>

      {/* Shadow under feet */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: 32,
          height: 8,
          bottom: -4,
          background: 'rgba(0,0,0,0.3)',
          filter: 'blur(2px)',
        }}
      />

      {/* Avatar sprite */}
      <div className={`relative ${bobClass}`}>
        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              boxShadow: `0 0 0 3px ${statusCfg.color}, 0 0 12px ${statusCfg.color}80`,
              width: 96,
              height: 96,
            }}
          />
        )}
        <img
  src={`/avatars/${agent.avatarFile}`}
  alt={agent.name}
  className="pixelated w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
        />
        {/* Status dot */}
        <div
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 status-dot-pulse ${statusCfg.dot}`}
          style={{ color: statusCfg.color }}
        />
      </div>
    </div>
  );
}

// ─── Agent Detail Card ───────────────────────────────────
function AgentCard({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const statusCfg = STATUS_CONFIG[agent.status];
  const isBurned = agent.status === 'burned';

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="w-80 h-full bg-slate-900/95 backdrop-blur-md border-l-2 border-purple-500/50 overflow-y-auto relative"
      style={{ zIndex: 100 }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
        <h2 className="text-sm text-slate-300 uppercase tracking-wider">Карточка агента</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Avatar + name + status */}
        <div className="flex items-center gap-3">
          <div className={`relative ${isBurned ? 'burned-filter' : ''}`}>
            <img
              src={`/avatars/${agent.avatarFile}`}
              alt={agent.name}
              width={96}
              height={96}
              className="pixelated"
              style={{ width: 96, height: 96 }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg text-white leading-tight">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
              <span className="text-xs" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Wave button */}
        <button
          onClick={() => {}}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm rounded-lg border border-purple-400/50 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Hand size={16} />
          Поздороваться
        </button>

        {/* Stat bars */}
        <div className="space-y-3 p-3 bg-black/20 rounded-lg border border-white/5">
          <StatBar
            icon={<Heart size={14} className="text-red-400" />}
            label="HP"
            value={agent.hp}
            color="#ef4444"
            description={
              agent.hp < 50
                ? 'Болеет — план выполнен менее чем на 50%'
                : agent.hp <= 80
                  ? 'Норма — план в диапазоне 50–80%'
                  : 'Здоров — план выполнен более чем на 80%'
            }
          />
          <StatBar
            icon={<Smile size={14} className="text-yellow-400" />}
            label="Happiness"
            value={agent.happiness}
            color="#eab308"
            description="Конверсия + отзывы + активность в CRM. Просрочки и срывы показов снижают."
          />
          <StatBar
            icon={<Zap size={14} className="text-blue-400" />}
            label="Energy"
            value={agent.energy}
            color="#3b82f6"
            description="Загрузка активными лидами. Перегруз (>85%) ведёт к выгоранию."
          />
        </div>

        {/* BI Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5 text-center">
            <Trophy size={16} className="mx-auto text-amber-400 mb-1" />
            <div className="text-xl font-vt text-white">{agent.deals}</div>
            <div className="text-[10px] text-slate-400 uppercase">Сделки</div>
          </div>
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5 text-center">
            <TrendingUp size={16} className="mx-auto text-emerald-400 mb-1" />
            <div className="text-xl font-vt text-white">{agent.conversion}%</div>
            <div className="text-[10px] text-slate-400 uppercase">Конверсия</div>
          </div>
          <div className="p-2.5 bg-black/20 rounded-lg border border-white/5 text-center">
            {agent.trend === 'up' ? (
              <TrendingUp size={16} className="mx-auto text-emerald-400 mb-1" />
            ) : (
              <TrendingDown size={16} className="mx-auto text-red-400 mb-1" />
            )}
            <div
              className={`text-xl font-vt ${agent.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {agent.trend === 'up' ? '↑' : '↓'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Тренд</div>
          </div>
        </div>

        {/* Mapping block */}
        <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/20 space-y-2">
          <h4 className="text-xs text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={14} />
            Маппинг метрик
          </h4>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex gap-2">
              <span className="text-red-400">❤️</span>
              <span>HP = % выполнения плана. &lt;50% — болеет, 50–80% — норма, &gt;80% — здоров.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-yellow-400">😊</span>
              <span>Happiness = конверсия + отзывы + CRM. Просрочки и срывы снижают.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400">⚡</span>
              <span>Energy = загрузка лидами. Перегруз → выгорание.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400">💰</span>
              <span>Deals = закрытые сделки за период.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-400">🏆</span>
              <span>Trend = динамика к прошлой неделе.</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-2">
          <h4 className="text-xs text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={14} />
            Календарь
          </h4>
          <div className="space-y-1.5">
            {agent.calendar.map((evt, i) => (
              <div
                key={i}
                className="flex gap-3 p-2 bg-black/20 rounded-lg border border-white/5 hover:border-purple-500/30 transition"
              >
                <span className="font-vt text-lg text-purple-300 leading-none mt-0.5 whitespace-nowrap">
                  {evt.time}
                </span>
                <span className="text-xs text-slate-200 leading-tight">{evt.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Action Panel ────────────────────────────────────────
function ActionPanel({
  filter,
  setFilter,
  counts,
}: {
  filter: FilterMode;
  setFilter: (f: FilterMode) => void;
  counts: { all: number; burned: number; top: number; newbie: number };
}) {
  const buttons: { mode: FilterMode; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    { mode: 'all', label: 'Все', icon: <LayoutGrid size={16} />, count: counts.all, color: 'text-slate-300' },
    { mode: 'burned', label: 'Горящие', icon: <Flame size={16} />, count: counts.burned, color: 'text-red-400' },
    { mode: 'top', label: 'Топ недели', icon: <Award size={16} />, count: counts.top, color: 'text-purple-400' },
    { mode: 'newbie', label: 'Новички', icon: <UserPlus size={16} />, count: counts.newbie, color: 'text-yellow-400' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {buttons.map((btn) => (
        <button
          key={btn.mode}
          onClick={() => setFilter(btn.mode)}
          className={`px-3 py-2 rounded-lg text-xs border flex items-center gap-1.5 transition active:scale-95 ${
            filter === btn.mode
              ? 'bg-purple-600/30 border-purple-500 text-white'
              : 'bg-slate-800/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
          }`}
        >
          <span className={btn.color}>{btn.icon}</span>
          {btn.label}
          <span className="ml-1 px-1.5 py-0.5 bg-black/30 rounded text-[10px]">{btn.count}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Background Map ─────────────────────────────────────
function BackgroundMap() {
  return (
    <>
      <img
        src="/maps/map.png"
        alt="Карта офиса и города"
        className="absolute inset-0 w-full h-full pixelated"
        style={{ zIndex: 1, objectFit: 'cover' }}
        draggable={false}
      />
      {/* Zone overlay labels */}
      <div
        className="zone-label absolute select-none pointer-events-none"
        style={{
          left: '30%',
          top: '4%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          fontSize: '28px',
          opacity: 0.4,
          color: '#ffffff',
          textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
        }}
      >
        ОФИС АН
      </div>
      <div
        className="zone-label absolute select-none pointer-events-none"
        style={{
          left: '80%',
          top: '4%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          fontSize: '28px',
          opacity: 0.4,
          color: '#ffffff',
          textShadow: '2px 2px 0 rgba(0,0,0,0.6)',
        }}
      >
        ГОРОД
      </div>
    </>
  );
}

// ─── Main App ───────────────────────────────────────────
function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    fetch('/mock-data.json')
      .then((res) => res.json())
      .then((data: Agent[]) => setAgents(data))
      .catch((err) => console.error('Failed to load mock data:', err));
  }, []);

  const counts = useMemo(
    () => ({
      all: agents.length,
      burned: agents.filter((a) => a.hp < 50).length,
      top: agents.length,
      newbie: agents.filter((a) => a.status === 'newbie').length,
    }),
    [agents],
  );

  const visibleIds = useMemo(() => {
    if (filter === 'burned') return new Set(agents.filter((a) => a.hp < 50).map((a) => a.id));
    if (filter === 'top') {
      const sorted = [...agents].sort((a, b) => b.deals - a.deals);
      return new Set(sorted.map((a) => a.id));
    }
    if (filter === 'newbie') return new Set(agents.filter((a) => a.status === 'newbie').map((a) => a.id));
    return new Set(agents.map((a) => a.id));
  }, [filter, agents]);

  const sortedAgents = useMemo(() => {
    if (filter === 'top') return [...agents].sort((a, b) => b.deals - a.deals);
    return agents;
  }, [filter, agents]);

  const selectedAgent = agents.find((a) => a.id === selectedId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-purple-500/30 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base text-white leading-none">Этажи — Дашборд отдела продаж</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">2D-режим · агентов на карте: {agents.length}</p>
          </div>
        </div>
        <ActionPanel filter={filter} setFilter={setFilter} counts={counts} />
      </header>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          <BackgroundMap />

          {/* Avatars */}
          {sortedAgents.map((agent, i) => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              index={i}
              isSelected={selectedId === agent.id}
              isDimmed={filter !== 'all' && !visibleIds.has(agent.id)}
              onClick={() => setSelectedId(agent.id)}
            />
          ))}

          {/* Burned alert banner */}
          {filter === 'burned' && counts.burned > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-950/80 border border-red-500/50 rounded-lg flex items-center gap-2 text-sm text-red-300 backdrop-blur-sm z-40">
              <AlertTriangle size={16} />
              {counts.burned} агент(ов) в красной зоне (HP &lt; 50%)
            </div>
          )}
        </div>

        {/* Right panel: agent card */}
        <AnimatePresence>
          {selectedAgent && (
            <AgentCard agent={selectedAgent} onClose={() => setSelectedId(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="px-4 py-1.5 bg-slate-900/95 border-t border-purple-500/20 flex items-center justify-between z-50">
        <p className="text-[10px] text-slate-500">
          Этажи Sales Dashboard · v1.0
        </p>
        <a
          href="https://lpc.opengameart.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-500 hover:text-purple-400 transition"
        >
          Credits: LPC sprites (CC-BY-SA 3.0)
        </a>
      </footer>
    </div>
  );
}

export default App;
