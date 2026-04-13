import { useState } from "react";
import { boardColors } from "../utils/colors.js";

export default function TaskItem({ task, onTaskUpdated, tagsDict }) {
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
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
            body: JSON.stringify(patchData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Error while updating');
                setIsUpdating(false);

                if (onTaskUpdated) {
                    setTimeout(() => {
                        onTaskUpdated();
                    }, 800);
                }
            })
            .catch(error => {
                console.error('Error: ', error);
                setIsCompleted(!newValue);
                setIsUpdating(false);
            });
    };

    return (
        <div className={`p-5 rounded-xl shadow-sm border-l-4 flex items-center gap-4 transition-all duration-300 ${ 
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
            <span className={`text-xl transition-all duration-300 ${
                isCompleted
                    ? 'line-through text-slate-500 italic'
                    : 'text-slate-200'
            }`}>
                {task.title}
            </span>

            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {task.tags.map(tagIri => {
                        // On cherche le tag dans notre dictionnaire
                        const tagData = tagsDict ? tagsDict[tagIri] : null;
                        if (!tagData) return null; // Si on ne le trouve pas, on n'affiche rien

                        // On récupère ses couleurs (avec un fallback gris par sécurité)
                        const theme = boardColors[tagData.color] || { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600' };

                        return (
                            <span
                                key={tagIri}
                                className={`text-xs px-3 py-1 rounded-full font-medium border bg-slate-900/50 ${theme.text} ${theme.border}`}
                            >
                                    {tagData.name}
                                </span>
                        );
                    })}
                </div>
            )}

        </div>
    );
}