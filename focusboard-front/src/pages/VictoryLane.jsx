import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function VictoryLane() {
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('https://localhost/api/tasks', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(data => {
                setAllTasks(data.member || []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    // --- 🎮 LOGIQUE RPG (Calculated Values) ---
    const completedTasks = allTasks.filter(t => t.isCompleted);

    // Fonction pour calculer l'XP d'UNE seule tâche (réutilisable)
    const calculateTaskTotalXP = (task) => {
        let xp = 10; // Base
        const subs = task.subTasks || [];
        const completedSubs = subs.filter(s => s.isCompleted).length;

        xp += (completedSubs * 2); // 2 XP par sous-tâche

        // Bonus Full Clear : Uniquement si la tâche a des sous-tâches ET qu'elles sont TOUTES finies
        if (subs.length > 0 && completedSubs === subs.length) {
            xp += 5;
        }
        return xp;
    };

    // Calcul du score global
    const totalXP = completedTasks.reduce((acc, task) => acc + calculateTaskTotalXP(task), 0);
    const level = Math.floor(totalXP / 100) + 1;
    const xpProgress = totalXP % 100;

    // Calcul du Streak 🔥
    const calculateStreak = () => {
        const dates = completedTasks
            .filter(t => t.completedAt)
            .map(t => new Date(t.completedAt).toDateString());

        const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
        if (uniqueDates.length === 0) return 0;

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Si aucune victoire aujourd'hui ou hier, le streak tombe à 0
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

        let streak = 0;
        let dateToMatch = new Date(uniqueDates[0]);

        for (let i = 0; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === dateToMatch.toDateString()) {
                streak++;
                dateToMatch.setDate(dateToMatch.getDate() - 1);
            } else break;
        }
        return streak;
    };

    const currentStreak = calculateStreak();

    // Groupement par date pour l'affichage[cite: 7]
    const groupedWins = completedTasks.reduce((groups, task) => {
        const date = task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-EN', {
            weekday: 'long', day: 'numeric', month: 'long'
        }) : "Unknown Date";
        if (!groups[date]) groups[date] = [];
        groups[date].push(task);
        return groups;
    }, {});

    if (isLoading) return <div className="p-8 text-yellow-500 animate-pulse text-xl font-black">OPENING THE PANTHEON...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <Link to="/" className="mb-8 inline-block text-slate-500 hover:text-yellow-500 transition-colors font-bold">
                &larr; Back to boards
            </Link>

            <header className="mb-16 text-center">
                {/* Badge de Niveau & Streak[cite: 7] */}
                <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_50px_rgba(234,179,8,0.2)] border-4 border-slate-950">
                        <span className="text-3xl font-black text-slate-950">LVL {level}</span>
                    </div>
                    {currentStreak > 0 && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl whitespace-nowrap border-2 border-slate-950 animate-bounce">
                            {currentStreak} DAY STREAK 🔥
                        </div>
                    )}
                </div>

                <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">Victory Lane</h1>

                {/* Barre d'XP[cite: 7] */}
                <div className="max-w-md mx-auto mb-12">
                    <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-black">
                        <span>XP Progress</span>
                        <span className="text-yellow-500">{xpProgress} / 100 XP</span>
                    </div>
                    <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>

                {/* Stats Cards[cite: 7] */}
                <div className="flex justify-center gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 min-w-[160px]">
                        <p className="text-4xl font-black text-yellow-500 mb-1">{totalXP}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Score</p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 min-w-[160px]">
                        <p className="text-4xl font-black text-yellow-500 mb-1">{completedTasks.length}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Tasks Smashed</p>
                    </div>
                </div>

                {/* --- AJOUT : LÉGENDE DU BARÈME RPG --- */}
                <div className="max-w-md mx-auto mb-12 grid grid-cols-3 gap-2 bg-slate-900/30 p-4 m-2 rounded-2xl border border-white/5 shadow-inner">
                    <div className="text-center">
                        <p className="text-xs font-black text-yellow-500">10 XP</p>
                        <p className="text-[8px] uppercase text-slate-500 font-bold tracking-tighter">Main Quest</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                        <p className="text-xs font-black text-emerald-500">2 XP</p>
                        <p className="text-[8px] uppercase text-slate-500 font-bold tracking-tighter">Sub-Step</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black text-purple-500">5 XP</p>
                        <p className="text-[8px] uppercase text-slate-500 font-bold tracking-tighter">Full Clear</p>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto space-y-16">
                {Object.entries(groupedWins).map(([date, tasks]) => (
                    <section key={date} className="relative pl-12 border-l-2 border-slate-800">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-yellow-500 border-4 border-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>
                        <h2 className="text-xl font-black text-slate-400 mb-8">{date}</h2>

                        <div className="grid gap-4">
                            {tasks.map(task => {
                                const earnedXP = calculateTaskTotalXP(task);
                                return (
                                    <div key={task.id} className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-slate-900 transition-all">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">✨</span>
                                            <span className="text-lg font-bold text-slate-200">{task.title}</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-yellow-500/50 group-hover:text-yellow-500 transition-colors">
                                            +{earnedXP} XP
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}