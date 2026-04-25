import { useState } from "react";
import { boardColors } from "../utils/colors.js";
import { useNavigate } from "react-router-dom"; // 💡 Import correct

export default function TaskItem({ task, onTaskUpdated, tagsDict }) {
    // 💡 1. On déclare le hook de navigation ICI, tout en haut
    const navigate = useNavigate();

    const [isCompleted, setIsCompleted] = useState(task.isCompleted ?? false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleCompletion = () => {
        const newValue = !isCompleted;
        setIsCompleted(newValue);
        setIsUpdating(true);

        const patchData = {
            isCompleted: newValue,
            completedAt: newValue ? new Date().toISOString() : null
        };

        fetch(`https://localhost${task['@id']}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify(patchData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Error while updating');
                setIsUpdating(false);
                if (onTaskUpdated) {
                    setTimeout(() => { onTaskUpdated(); }, 800);
                }
            })
            .catch(error => {
                console.error('Error: ', error);
                setIsCompleted(!newValue);
                setIsUpdating(false);
            });
    };

    return (
        /* 💡 2. AJOUT DE LA CLASSE "group" sur le parent pour le survol */
        <div className={`p-5 rounded-xl shadow-sm border-l-4 flex items-center gap-4 transition-all duration-300 group ${
            isCompleted
                ? 'bg-slate-800/50 border-slate-600'
                : 'bg-slate-800 border-emerald-500 hover:bg-slate-700'
        }`}>
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={toggleCompletion}
                disabled={isUpdating}
                className="w-6 h-6 accent-emerald-500 cursor-pointer transition-transform hover:scale-110 disabled:opacity-50"
            />

            {/* 💡 3. AJOUT DE "flex-1" pour pousser le bouton vers la droite */}
            <span className={`flex-1 text-xl transition-all duration-300 ${
                isCompleted ? 'line-through text-slate-500 italic' : 'text-slate-200'
            }`}>
                {task.title}
            </span>

            {/* Tags (S'affichent avant le bouton Focus) */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {task.tags.map(tagIri => {
                        const tagData = tagsDict ? tagsDict[tagIri] : null;
                        if (!tagData) return null;
                        const theme = boardColors[tagData.color] || { text: 'text-slate-300', border: 'border-slate-600' };
                        return (
                            <span key={tagIri} className={`text-xs px-3 py-1 rounded-full font-medium border bg-slate-900/50 ${theme.text} ${theme.border}`}>
                                {tagData.name}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* 💡 4. LE BOUTON FOCUS : Désormais fonctionnel */}
            {!isCompleted && (
                <button
                    onClick={() => {
                        // On extrait le chiffre de l'IRI : "/api/tasks/5" -> "5"
                        const taskId = task['@id'].split('/').pop();
                        navigate(`/focus/${taskId}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white transition-all whitespace-nowrap"
                >
                    FOCUS ⚡
                </button>
            )}
        </div>
    );
}