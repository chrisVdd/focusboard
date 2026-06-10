import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function QuickCapture({ boards, onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        if (boards.length > 0 && !selectedBoardId) {
            setSelectedBoardId(boards[0].id);
        }
    }, [boards]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !selectedBoardId) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('https://localhost/api/tasks', {
                method: 'POST',
                headers: {
                    'Accept': 'application/ld+json',
                    'Content-Type': 'application/ld+json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title,
                    isCompleted: false,
                    board: `/api/boards/${selectedBoardId}`
                })
            });

            if (response.ok) {
                setTitle('');
                if (onTaskAdded) onTaskAdded();
                setIsSuccess(true);
                setTimeout(() => {
                    setIsSuccess(false);
                }, 1500);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (boards.length === 0) return null;

    return (
        <div className="mb-12 relative group animate-fade-in-fast">
            {/* 1. Lueur magique : on passe à blur-xl pour un VRAI effet néon doux */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>

            {/* 2. Fond du formulaire : bg-slate-800/90 pour bien se détacher de la page ! */}
            <form onSubmit={handleSubmit} className="relative bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 flex flex-col md:flex-row gap-3 items-center border border-slate-700/50 shadow-2xl">
                <div className="flex-1 w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-70">
                         💡
                    </span>
                    <input
                        type="text"
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Got a brilliant idea? Share it here..."
                        className="w-full bg-slate-900/50 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700/50 focus:border-emerald-500/80 focus:bg-slate-900 focus:outline-none transition-all text-lg font-medium placeholder-slate-500"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <select
                        value={selectedBoardId}
                        onChange={(e) => setSelectedBoardId(e.target.value)}
                        className="bg-slate-900/50 text-slate-300 px-4 py-4 rounded-xl border border-slate-700/50 outline-none focus:border-emerald-500 cursor-pointer font-medium"
                        disabled={isSubmitting}
                    >
                        {boards.map(b => (
                            <option key={b.id} value={b.id}>{b.icon} {b.title}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        className={`font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap active:scale-95 ${
                            isSuccess
                                ? 'bg-emerald-400 text-slate-900'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                        }`}
                    >
                        {isSubmitting ? '...' : isSuccess ? "✓ That's a wrap !" : 'Capture'}
                    </button>
                </div>
            </form>
        </div>
    );
}