import { useState, useEffect, useRef } from 'react';

export default function LevelBadge({ tasks }) {
    const completedTasks = tasks.filter(t => t.isCompleted);

    const calculateTaskXP = (task) => {
        let xp = 10;
        const subs = task.subTasks || [];
        const completedSubs = subs.filter(s => s.isCompleted).length;
        xp += (completedSubs * 2);
        if (subs.length > 0 && completedSubs === subs.length) xp += 5;
        return xp;
    };

    const totalXP = tasks.reduce((acc, task) => {
        let xp = 0;
        const subs = task.subTasks || [];
        const completedSubs = subs.filter(s => s.isCompleted).length;

        xp += (completedSubs * 2);
        if (task.isCompleted) {
            xp += 10;
            if (subs.length > 0 && completedSubs === subs.length) {
                xp += 5;
            }
        }
        return acc + xp;
    }, 0);

    const level = Math.floor(totalXP / 100) + 1;
    const xpProgress = totalXP % 100;

    const [isAnimating, setIsAnimating] = useState(false);
    const prevXP = useRef(totalXP);

    useEffect(() => {
        if (totalXP > prevXP.current) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 1000);
            prevXP.current = totalXP;
            return () => clearTimeout(timer);
        }
    }, [totalXP]);

    return (
        <div className={`flex items-center gap-3 bg-slate-900/50 p-1.5 pr-4 rounded-full border transition-all duration-500 ${
            isAnimating ? 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105' : 'border-white/10 shadow-inner'
        }`}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-transform ${
                isAnimating ? 'animate-ping opacity-75' : ''
            }`}>
                <span className="text-slate-900 font-black text-[10px]">LVL {level}</span>
            </div>

            <div className={`absolute w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 z-10 transition-transform ${isAnimating ? 'scale-110' : ''}`}>
                <span className="text-slate-900 font-black text-[10px]">LVL {level}</span>
            </div>

            <div className="flex flex-col min-w-[70px] ml-10">
                <div className="flex justify-between text-[12px] font-black uppercase tracking-tighter">
                {/*<div className="flex justify-between font-black uppercase tracking-tighter">*/}
                    <span className={isAnimating ? 'text-yellow-400' : 'text-slate-500'}>
                        {isAnimating ? '+ XP GAINED!' : 'Exp'}
                    </span>
                    <span className="text-yellow-500/70">{xpProgress}%</span>
                </div>
                <div className="h-1 w-full bg-slate-950 rounded-full mt-0.5 overflow-hidden">
                    <div
                        className={`h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out ${isAnimating ? 'brightness-150' : ''}`}
                        style={{ width: `${xpProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}