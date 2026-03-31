import { useState} from "react";
import { boardColors } from "../utils/colors.js";

export default function TagCreator({ onTagAdded }) {

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('emerald');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);

        fetch('https://localhost/api/tags', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify({
                name: name,
                color: color
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Server error');
                return response.json();
            })
            .then(() => {
                onTagAdded();
                setName('')
                setIsOpen(false)
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error('Error: ', error);
                setIsSubmitting(false);
            });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 border border-dashed border-slate-500 text-slate-400 hover:text-slate-200 hover:border-slate-300 hover:bg-slate-800"
            >
                + New Tag
            </button>
        );
    }

    return (

        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-full border border-slate-600 shadow-lg animate-fade-in-fast">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name"
                maxLength={20}
                autoFocus
                className="bg-transparent text-white text-xs py-3 pyu-1 w-32 focus:outline-none placeholder-slate-500"
            />

            <div className="flex gap-1 border-l border-slate-700 pl-2">
                {Object.entries(boardColors).map(([colorKey, styles]) => (
                    <button
                        key={colorKey}
                        type="button"
                        onClick={() => setColor(colorKey)}
                        className={`w-5 h-5 rounded-full transition-all ${styles.bg} ${
                            color === colorKey ? 'ring-2 ring-offset-1 ring-offset-slate-800 ring-slate-300 scale-110' : 'opacity-50 hover:opacity-100'
                        }`}
                    />
                ))}
            </div>

            <div className="flex gap-1 border-l border-slate-700 pl-2 pr-1">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors text-xs"
                >
                    ✕
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-white transition-colors text-xs ${boardColors[color].bg} hover:brightness-110 disabled:opacity-50`}
                >
                    {isSubmitting ? '...' : '✓'}
                </button>
            </div>
        </form>
    );
}