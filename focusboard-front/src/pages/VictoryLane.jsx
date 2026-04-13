import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function VictoryLane() {
    const [completedTasks, setCompletedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('https://localhost/api/tasks', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(data => {
                const wins = (data.member || [])
                    .filter(t => t.isCompleted)
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                setCompletedTasks(wins);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const groupedWins = completedTasks.reduce((groups, task) => {
        const date = task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-EN', {
            weekday: 'long', day: 'numeric', month: 'long'
        }) : "Date inconnue";
        if (!groups[date]) groups[date] = [];
        groups[date].push(task);
        return groups;
    }, {});

    if (isLoading) return <div className="p-8 text-yellow-500 animate-pulse">Opening of the Pantheon...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <Link to="/" className="mb-8 inline-block text-slate-500 hover:text-yellow-500 transition-colors">
                &larr; Back to Focus
            </Link>

            <header className="mb-12 text-center">
                <div className="inline-block p-4 rounded-full bg-yellow-500/10 mb-4 border border-yellow-500/20">
                    <span className="text-5xl">🏆</span>
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-2">
                    Victory Lane
                </h1>
                <p className="text-slate-400 italic">"Every small step is a victory over chaos.."</p>

                <div className="mt-6 inline-flex gap-8 px-8 py-3 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500">{completedTasks.length}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Total Wins</p>
                    </div>
                    <div className="w-px bg-yellow-500/20"></div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500">
                            {Object.keys(groupedWins).length}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Productive Days</p>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-12">
                {Object.entries(groupedWins).map(([date, tasks]) => (
                    <section key={date} className="relative pl-8 border-l-2 border-yellow-500/20">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                        <h2 className="text-lg font-bold text-yellow-500/80 mb-6 capitalize">{date}</h2>

                        <div className="grid gap-3">
                            {tasks.map(task => (
                                <div key={task.id} className="p-4 bg-slate-900/50 rounded-xl border border-yellow-500/10 flex items-center gap-4 group hover:border-yellow-500/30 transition-all">
                                    <span className="text-xl">✨</span>
                                    <span className="text-slate-200 font-medium">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {completedTasks.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <p className="text-xl italic">The Pantheon is still empty... for now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}