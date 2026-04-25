import { useState } from 'react';
import { boardColors } from '../utils/colors.js';

export default function TaskForm({ boardId, onTaskAdded, colorTheme, availableTags }) {
    const [title, setTitle] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const themeBg = colorTheme ? colorTheme.bg : 'bg-emerald-600';
    const themeText = colorTheme ? colorTheme.text : 'text-emerald-400';

    const toggleTag = (tagIri) => {
        setSelectedTags(prev =>
            prev.includes(tagIri) ? prev.filter(t => t !== tagIri) : [...prev, tagIri]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);

        fetch('https://localhost/api/tasks', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json'
            },
            body: JSON.stringify({
                title: title,
                isCompleted: false,
                completedAt: null,
                board: `/api/boards/${boardId}`,
                tags: selectedTags
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Erreur serveur");
                return response.json();
            })
            .then(() => {
                onTaskAdded();
                setTitle('');
                setSelectedTags([]);
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error("Error adding :", error);
                setIsSubmitting(false);
            });
    };

    return (
        <div className="mb-10 bg-slate-800/20 p-6 rounded-2xl border border-slate-700/50">
            <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New task to break down..."
                    disabled={isSubmitting}
                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-slate-500 focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className={`${themeBg} hover:brightness-110 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2`}
                >
                    {isSubmitting ? '...' : <span><span className="text-xl">+</span> Add</span>}
                </button>
            </form>

            {availableTags && availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-2">Add tags :</span>
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.includes(tag['@id']);
                        const tagTheme = boardColors[tag.color] || boardColors['emerald'];

                        return (
                            <button
                                key={tag['@id']}
                                type="button"
                                onClick={() => toggleTag(tag['@id'])}
                                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                                    isSelected
                                        ? `${tagTheme.bg} text-white border-transparent`
                                        : `bg-slate-900/50 ${tagTheme.text} ${tagTheme.border} opacity-50 hover:opacity-100`
                                }`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}