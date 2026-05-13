import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function FocusMode({ onComplete }) {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const loadTask = () => {
        fetch(`https://localhost/api/tasks/${taskId}`, { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(data => setTask(data));
    };

    useEffect(() => { loadTask(); }, [taskId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) { interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000); }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleSub = async (sub) => {
        await fetch(`https://localhost${sub['@id']}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ isCompleted: !sub.isCompleted })
        });
        loadTask();
        if (onComplete) onComplete(); // ✅ Met à jour le XP Badge en haut !
    };

    const handleFinish = async () => {
        setIsFinishing(true);
        const res = await fetch(`https://localhost/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ isCompleted: true, completedAt: new Date().toISOString() })
        });
        if (res.ok) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24'] });
            if (onComplete) onComplete();
            setTimeout(() => navigate('/victory-lane'), 1500);
        }
    };

    if (!task) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Preparing...</div>;

    const totalSub = task.subTasks?.length || 0;
    const completedSub = task.subTasks?.filter(s => s.isCompleted).length || 0;
    const progress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
            <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">&larr; Give up</button>

            <div className={`max-w-2xl w-full text-center space-y-12 transition-all ${isFinishing ? 'scale-110 opacity-0' : 'scale-100'}`}>
                <header>
                    <p className="text-emerald-500 font-black tracking-[0.3em] uppercase text-xs mb-4">Focus Goal</p>
                    <h1 className="text-5xl md:text-6xl font-bold">{task.title}</h1>
                </header>

                <div className="max-w-md w-full mx-auto bg-slate-900/40 rounded-3xl p-8 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] uppercase font-black text-emerald-500/50 tracking-widest">Battle Plan</p>
                        {totalSub > 0 && <span className="text-[10px] font-mono font-bold text-emerald-400">{completedSub}/{totalSub} — {progress}%</span>}
                    </div>

                    {totalSub > 0 && (
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    <div className="space-y-4">
                        {task.subTasks?.map(sub => (
                            <button key={sub.id} onClick={() => toggleSub(sub)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${sub.isCompleted ? 'bg-slate-950/30 opacity-40' : 'bg-slate-800/50 border border-white/5'}`}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${sub.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>{sub.isCompleted && '✓'}</div>
                                <span className={`text-lg ${sub.isCompleted ? 'line-through' : 'text-slate-200'}`}>{sub.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative inline-block py-12">
                    <div className="text-8xl font-mono font-black text-slate-900 select-none">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={() => setIsActive(!isActive)} className={`px-10 py-4 rounded-2xl font-black transition-all ${isActive ? 'bg-rose-500' : 'bg-emerald-500 hover:scale-105'}`}>{isActive ? 'PAUSE' : 'START FOCUS'}</button>
                    </div>
                </div>

                <button onClick={handleFinish} disabled={isFinishing} className="group flex flex-col items-center mx-auto gap-3 text-slate-500 hover:text-emerald-400 transition-all">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Mission Accomplished</span>
                    <span className="text-3xl transition-all group-hover:scale-125">✅</span>
                </button>
            </div>
        </div>
    );
}