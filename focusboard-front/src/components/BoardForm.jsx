import { useState } from "react";
import { boardColors } from "../utils/colors.js";
import { useAuth } from "../context/AuthContext.jsx";
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function BoardForm({ onBoardAdded }) {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('emerald');
    const [icon, setIcon] = useState('📋');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const { token } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);

        fetch('https://localhost/api/boards', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, icon, color })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error while creating');
                return response.json();
            })
            .then(() => {
                onBoardAdded();
                setTitle('');
                setIcon('📋');
                setIsSubmitting(false);
                setIsPickerOpen(false);
            })
            .catch(() => setIsSubmitting(false));
    };

    return (
        <form onSubmit={handleSubmit} className="mb-12 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center gap-4 relative">

                <button
                    type="button"
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all shrink-0"
                >
                    {icon}
                </button>

                {isPickerOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsPickerOpen(false)}
                        ></div>

                        <div className="absolute top-20 left-0 z-50 shadow-2xl animate-fade-in-fast">
                            <EmojiPicker
                                theme="dark"
                                onEmojiClick={(emojiObject) => {
                                    setIcon(emojiObject.emoji);
                                    setIsPickerOpen(false);
                                }}
                                searchPlaceholder="Chercher un emoji..."
                                autoFocusSearch={false}
                            />
                        </div>
                    </>
                )}

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New mission..."
                    disabled={isSubmitting}
                    className="flex-1 text-3xl font-bold bg-transparent text-white placeholder-slate-600 focus:outline-none focus:placeholder-slate-500 border-b-2 border-slate-700/50 focus:border-emerald-500 transition-all"
                />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                <div className="flex gap-3">
                    {Object.entries(boardColors).map(([key, styles]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setColor(key)}
                            className={`w-8 h-8 rounded-full transition-all duration-300 ${styles.bg} ${
                                color === key ? 'ring-4 ring-offset-4 ring-offset-slate-900 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-80'
                            }`}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                    {isSubmitting ? '...' : 'Create'}
                </button>
            </div>
        </form>
    );
}