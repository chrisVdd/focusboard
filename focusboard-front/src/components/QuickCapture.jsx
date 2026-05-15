export default function QuickCapture({ boards, onTaskAdded }) {

    const [title, setTitle] = useState('');
    const [selectedBoardId, setSelectedBoardId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>

            <form onSubmit={handleSubmit} className="relative bg-slate-900 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center border border-white/10 shadow-2xl">
                <div className="flex-1 w-full relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-70">⚡</span>
                    <input
                        type="text"
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Une idée ? Vide ton cerveau ici... (Entrée pour sauver)"
                        className="w-full bg-slate-950/50 text-white pl-12 pr-4 py-4 rounded-lg border border-transparent focus:border-emerald-500/50 focus:bg-slate-950 focus:outline-none transition-all text-lg font-medium placeholder-slate-600"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <select
                        value={selectedBoardId}
                        onChange={(e) => setSelectedBoardId(e.target.value)}
                        className="bg-slate-800 text-slate-300 px-4 py-4 rounded-lg border border-white/5 outline-none focus:border-emerald-500 cursor-pointer text-sm font-medium"
                        disabled={isSubmitting}
                    >
                        {boards.map(b => (
                            <option key={b.id} value={b.id}>{b.icon} {b.title}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
                    >
                        {isSubmitting ? '...' : 'Capturer'}
                    </button>
                </div>
            </form>
        </div>
);



}
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext.tsx";
