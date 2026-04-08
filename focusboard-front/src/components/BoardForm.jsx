import { useState } from "react";
import { boardColors } from "../utils/colors.js";

const EMOJI_SUGGESTIONS = ['🚀', '💼', '🏡', '🏋️', '🎨', '💸', '🧹', '🌿', '📖', '🎮', '💡'];

export default function BoardForm({ onBoardAdded }) {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('emerald');
    const [icon, setIcon] = useState('📋');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);

        fetch('https://localhost/api/boards', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify({ title, icon, color })
        })
            .then(res => res.json())
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
            <div className="flex items-center gap-6">
                {/* PICKER D'ICÔNE */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="w-16 h-16 bg-slate-700 rounded-2xl text-4xl flex items-center justify-center border-2 border-slate-600 hover:border-emerald-500 hover:scale-105 transition-all duration-300 shadow-inner"
                    >
                        {icon}
                    </button>

                    {isPickerOpen && (
                        <div className="absolute top-full mt-4 left-0 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl z-50 w-72 animate-in fade-in zoom-in duration-200">
                            <p className="text-[10px] text-slate-500 mb-3 font-bold uppercase tracking-widest text-center">Choisir un mood</p>
                            <div className="grid grid-cols-4 gap-2">
                                {EMOJI_SUGGESTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => { setIcon(emoji); setIsPickerOpen(false); }}
                                        className="text-2xl p-2 hover:bg-slate-700 rounded-xl transition-all hover:scale-125"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* TITRE STYLE "INPUT MINIMALISTE" */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom du projet..."
                    disabled={isSubmitting}
                    className="flex-1 text-3xl font-bold bg-transparent text-white placeholder-slate-600 focus:outline-none focus:placeholder-slate-500 border-b-2 border-slate-700/50 focus:border-emerald-500 transition-all"
                />
            </div>

            {/* FOOTER : COULEURS + BOUTON */}
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
                    {isSubmitting ? '...' : 'Créer'}
                </button>
            </div>
        </form>
    );
}