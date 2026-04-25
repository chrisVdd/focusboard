import { useState } from "react";
import { boardColors } from "../utils/colors.js";
import { useNavigate } from "react-router-dom"; // 💡 Import correct

export default function TaskItem({ task, onTaskUpdated, tagsDict }) {

    const navigate = useNavigate();

    const [isCompleted, setIsCompleted] = useState(task.isCompleted ?? false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newSubTask, setNewSubTask] = useState("");
    const [isAddingSub, setIsAddingSub] = useState(false);

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

    const addSubTask = async (e) => {

        e.stopPropagation();

        if (e.key !== 'Enter' || !newSubTask.trim()) return;

        try {
            const response = await fetch('https://localhost/api/sub_tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/ld+json' },
                body: JSON.stringify({
                    title: newSubTask,
                    task: task['@id'],
                    isCompleted: false,
                })
            });
            if (response.ok) {
                setNewSubTask('');
                if (onTaskUpdated) onTaskUpdated();
            }
        } catch (e) { console.error("Error while trying to add a subtask: ", e); }
    };

    const toggleSub = async (sub) => {
        try {
            const response = await fetch(`https://localhost${sub['@id']}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                    'Accept': 'application/ld+json'
                },
                body: JSON.stringify({
                    isCompleted: !sub.isCompleted
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Détails de l'erreur API :", errorData);
                throw new Error('Erreur lors de la mise à jour de la sous-tâche');
            }

            // Si tout est bon, on rafraîchit la vue
            if (onTaskUpdated) {
                onTaskUpdated();
            }
        } catch (error) {
            console.error("Erreur toggleSub :", error);
            // Optionnel : tu peux ajouter un petit message d'alerte pour ne pas rester dans le flou
            alert("Impossible de sauvegarder l'état de la sous-tâche.");
        }
    };


    return (
        <div className={`p-5 rounded-xl shadow-sm border-l-4 flex items-start gap-4 transition-all duration-300 group ${
            isCompleted
                ? 'bg-slate-800/50 border-slate-600'
                : 'bg-slate-800 border-emerald-500 hover:bg-slate-700'
        }`}>
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={toggleCompletion}
                disabled={isUpdating}
                className="mt-1 w-6 h-6 accent-emerald-500 cursor-pointer transition-transform hover:scale-110 disabled:opacity-50 shrink-0"
            />

            <div className="flex-1 flex flex-col">
                <span className={`text-xl transition-all duration-300 ${
                    isCompleted ? 'line-through text-slate-500 italic' : 'text-slate-200 font-bold'
                }`}>
                    {task.title}
                </span>

                {!isCompleted && (
                    <div className="mt-3 ml-2 space-y-2 border-l-2 border-slate-700/50 pl-4">
                        {task.subTasks?.map(sub => (
                            <div key={sub.id} className="flex items-center gap-3 group/sub">
                                <input
                                    type="checkbox"
                                    checked={sub.isCompleted}
                                    onChange={() => toggleSub(sub)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className={`text-sm transition-colors ${
                                    sub.isCompleted ? 'line-through text-slate-600' : 'text-slate-400'
                                }`}>
                                    {sub.title}
                                </span>
                            </div>
                        ))}

                        <input
                            type="text"
                            placeholder="Add a step..."
                            value={newSubTask}
                            onChange={(e) => setNewSubTask(e.target.value)}
                            onKeyDown={addSubTask}
                            onClick={(e => e.stopPropagation())}
                            className="w-full mt-2 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 px-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all italic"
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {task.tags.map(tagIri => {
                            const tagData = tagsDict ? tagsDict[tagIri] : null;
                            if (!tagData) return null;
                            const theme = boardColors[tagData.color] || { text: 'text-slate-300', border: 'border-slate-600' };
                            return (
                                <span key={tagIri} className={`text-[10px] px-2 py-0.5 rounded-full font-medium border bg-slate-900/50 ${theme.text} ${theme.border}`}>
                                    {tagData.name}
                                </span>
                            );
                        })}
                    </div>
                )}

                {!isCompleted && (
                    <button
                        onClick={() => {
                            const taskId = task['@id'].split('/').pop();
                            navigate(`/focus/${taskId}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white transition-all whitespace-nowrap"
                    >
                        FOCUS ⚡
                    </button>
                )}
            </div>
        </div>
    );
}