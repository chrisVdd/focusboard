import { useState } from "react";
import { boardColors } from "../utils/colors.js";

export default function BoardForm({ onBoardAdded }) {

    const [title, setTitle] = useState('');
    const [color, setColor] = useState('emerald'); // default color
    const [icon, setIcon] = useState('📋'); // default icon
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            body: JSON.stringify({
                title: title,
                icon: icon,
                color: color,
            })
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
            })
            .catch(error => {
                console.error('No possible to create the board: ', error);
                setIsSubmitting(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-12 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-center">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New Board (ex: work)"
                disabled={isSubmitting}
                className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
            />

            <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Emoji (ex: 🚀)"
                className="w-16 bg-slate-800 text-center text-2xl p-3 rounded-xl border border-slate-700"
            />

            <div className="flex gap-2 px-2">
                {Object.entries(boardColors).map(([colorKey, styles]) => (
                    <button
                        key={colorKey}
                        type="button"
                        onClick={() => setColor(colorKey)}
                        className={`w-8 h-8 rounded-full transition-all duration-300 ${styles.bg} ${
                            color === colorKey
                                ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-slate-400 scale-110'
                                : 'opacity-50 hover:opacity-100 hover:scale-110'
                        }`}
                        aria-label={`Select a color ${colorKey}`}
                    />
                ))}
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Add ...' : '+ Add'}
            </button>
        </form>
    );
}