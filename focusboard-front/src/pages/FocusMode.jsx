import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function FocusMode() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    useEffect(() => {
        fetch(`https://localhost/api/tasks/${taskId}`, { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(data => setTask(data));
    }, [taskId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // 🏆 LA LOGIQUE DE VICTOIRE
    const handleFinish = async () => {
        setIsFinishing(true);

        // Préparation des données identiques à TaskItem pour la cohérence
        const patchData = {
            isCompleted: true,
            completedAt: new Date().toISOString()
        };

        try {
            const response = await fetch(`https://localhost/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json' },
                body: JSON.stringify(patchData)
            });

            if (response.ok) {
                // 🎆 1. Lancement des confettis
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#fbbf24', '#ffffff'] // Émeraude et Or
                });

                // ⏳ 2. On laisse savourer 1.5s avant de rediriger
                setTimeout(() => {
                    navigate('/victory-lane'); // Direction le panthéon
                }, 1500);
            }
        } catch (error) {
            console.error("Erreur lors de la validation :", error);
            setIsFinishing(false);
        }
    };

    const toggleSub = async (sub) => {
        try {
            const response = await fetch(`https://localhost${sub['@id']}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json' },
                body: JSON.stringify({ isCompleted: !sub.isCompleted })
            });
            if (response.ok) {

                const res = await fetch(`https://localhost/api/tasks/${taskId}`, { headers: { 'Accept': 'application/ld+json' } });
                const data = await res.json();
                setTask(data);
            }
        } catch (e) { console.error(e); }
    };



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!task) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Préparation du tunnel...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
                &larr; Abandonner
            </button>

            <div className={`max-w-2xl w-full text-center space-y-12 transition-all duration-1000 ${isFinishing ? 'scale-110 opacity-0' : 'scale-100'}`}>
                <header>
                    <p className="text-emerald-500 font-black tracking-[0.3em] uppercase text-sm mb-4">Objectif Focus</p>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">{task.title}</h1>
                </header>

                <div className="max-w-md w-full mx-auto bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 mt-12">
                    <p className="text-[10px] uppercase font-black text-emerald-500/50 tracking-widest mb-6 text-center">
                        Plan de combat
                    </p>
                    <div className="space-y-4">
                        {task.subTasks?.length > 0 ? task.subTasks.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => toggleSub(sub)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                    sub.isCompleted
                                        ? 'bg-slate-950/30 opacity-40'
                                        : 'bg-slate-800/50 hover:bg-slate-800 border border-white/5 shadow-lg'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    sub.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                                }`}>
                                    {sub.isCompleted && <span className="text-white text-xs">✓</span>}
                                </div>
                                <span className={`text-lg ${sub.isCompleted ? 'line-through' : 'text-slate-200'}`}>
                    {sub.title}
                </span>
                            </button>
                        )) : (
                            <p className="text-slate-600 italic text-center text-sm">Aucune sous-étape définie</p>
                        )}
                    </div>
                </div>


                {/* TIMER POMODORO */}
                <div className="relative inline-block">
                    <div className="text-9xl font-mono font-black text-slate-900 tabular-nums select-none">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`px-10 py-4 rounded-2xl font-black transition-all ${
                                isActive
                                    ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
                                    : 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105'
                            }`}
                        >
                            {isActive ? 'PAUSE' : 'START FOCUS'}
                        </button>
                    </div>
                </div>

                <div className="pt-12">
                    <button
                        onClick={handleFinish}
                        disabled={isFinishing}
                        className="group flex flex-col items-center mx-auto gap-3 text-slate-500 hover:text-emerald-400 transition-all"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100">Terminer la mission</span>
                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-125">✅</span>
                    </button>
                </div>
            </div>
        </div>
    );
}