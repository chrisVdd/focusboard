import { useState } from "react";
import { boardColors } from "../utils/colors.js";
import { useNavigate } from "react-router-dom";

export default function TaskItem({ task, onTaskUpdated, tagsDict }) {
    const navigate = useNavigate();

    // --- ÉTATS ---
    const [isCompleted, setIsCompleted] = useState(task.isCompleted ?? false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newSubTask, setNewSubTask] = useState("");

    // États pour l'édition du titre
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);

    // --- CALCULS DE PROGRESSION ---
    const subTasks = task.subTasks || [];
    const totalSub = subTasks.length;
    const completedSub = subTasks.filter(s => s.isCompleted).length;
    const progressPercent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    // --- LOGIQUE DE SAUVEGARDE DU TITRE ---
    const saveTitle = async () => {
        if (editedTitle.trim() === "" || editedTitle === task.title) {
            setIsEditingTitle(false);
            setEditedTitle(task.title); // Reset si vide
            return;
        }

        try {
            const response = await fetch(`https://localhost${task['@id']}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json' },
                body: JSON.stringify({ title: editedTitle })
            });
            if (response.ok) {
                setIsEditingTitle(false);
                if (onTaskUpdated) onTaskUpdated();
            }
        } catch (e) {
            console.error("Erreur sauvegarde titre:", e);
        }
    };

    // --- LOGIQUE DE COMPLÉTION (TÂCHE PRINCIPALE) ---
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
                    // Petit délai pour l'animation avant de rafraîchir la liste
                    setTimeout(() => { onTaskUpdated(); }, 800);
                }
            })
            .catch(error => {
                console.error('Error: ', error);
                setIsCompleted(!newValue);
                setIsUpdating(false);
            });
    };

    // --- LOGIQUE DES SOUS-TÂCHES ---
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
        } catch (e) { console.error("Error adding subtask:", e); }
    };

    const deleteSub = async (e, subId) => {
        e.stopPropagation();
        try {
            const response = await fetch(`https://localhost/api/sub_tasks/${subId}`, {
                method: 'DELETE',
            });
            if (response.ok && onTaskUpdated) onTaskUpdated();
        } catch (e) { console.error("Error deleting subtask:", e); }
    };

    const [editingSubId, setEditingSubId] = useState(null);
    const [editedSubTitle, setEditedSubTitle] = useState("");

    const saveSubTitle = async (sub) => {
        if (editedSubTitle.trim() === "" || editedSubTitle === sub.title) {
            setEditingSubId(null);
            return;
        }
        try {
            await fetch(`https://localhost${sub['@id']}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json' },
                body: JSON.stringify({ title: editedSubTitle })
            });
            setEditingSubId(null);
            onTaskUpdated();
        } catch (e) { console.error(e); }
    };

    const toggleSub = async (sub) => {
        try {
            const response = await fetch(`https://localhost${sub['@id']}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json' },
                body: JSON.stringify({ isCompleted: !sub.isCompleted })
            });
            if (response.ok && onTaskUpdated) onTaskUpdated();
        } catch (e) { console.error("Error toggling subtask:", e); }
    };

    return (
        <div className={`p-5 rounded-2xl shadow-xl border-l-4 flex items-start gap-5 transition-all duration-300 group ${
            isCompleted
                ? 'bg-slate-800/40 border-slate-700'
                : 'bg-slate-800 border-emerald-500 hover:bg-slate-750'
        }`}>

            {/* Checkbox Principale */}
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={toggleCompletion}
                disabled={isUpdating}
                className="mt-1.5 w-6 h-6 accent-emerald-500 cursor-pointer transition-transform hover:scale-110 disabled:opacity-50 shrink-0"
            />

            <div className="flex-1 flex flex-col">

                {/* 📊 BARRE DE PROGRESSION "GAMER" */}
                {totalSub > 0 && !isCompleted && (
                    <div className="mb-4 bg-slate-950/40 p-3 rounded-xl border border-white/5 shadow-inner">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                                Mission Status
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                {completedSub}/{totalSub} — {progressPercent}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ✏️ TITRE ÉDITABLE */}
                {isEditingTitle ? (
                    <input
                        autoFocus
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle();
                            if (e.key === 'Escape') {
                                setEditedTitle(task.title);
                                setIsEditingTitle(false);
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 text-xl font-bold text-white border-b-2 border-emerald-500 outline-none py-1 px-2 rounded-t-md w-full"
                    />
                ) : (
                    <div
                        onClick={(e) => {
                            console.log("Clic détecté sur :", task.title); // 💡 Pour vérifier dans la console
                            e.stopPropagation();
                            setIsEditingTitle(true);
                        }}
                        className={`text-xl transition-all duration-300 cursor-pointer hover:text-emerald-400 py-1 w-full ${
                            isCompleted ? 'line-through text-slate-500 italic' : 'text-slate-200 font-bold'
                        }`}
                    >
                        {task.title}
                    </div>
                )}

                {/* 🧱 LISTE DES SOUS-TÂCHES */}
                {!isCompleted && (
                    <div className="mt-4 mb-4 ml-2 space-y-2 border-l-2 border-slate-700/50 pl-4">
                        {subTasks.map(sub => (
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

                        {/* Input d'ajout rapide */}
                        <input
                            type="text"
                            placeholder="Add step..."
                            value={newSubTask}
                            onChange={(e) => setNewSubTask(e.target.value)}
                            onKeyDown={addSubTask}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full mt-2 bg-slate-900/30 border border-transparent hover:border-slate-700/50 rounded-lg py-2 px-3 text-sm text-slate-500 focus:text-slate-300 focus:outline-none transition-all italic"
                        />
                    </div>
                )}
                {subTasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 group/sub">
                        <input
                            type="checkbox"
                            checked={sub.isCompleted}
                            onChange={() => toggleSub(sub)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 cursor-pointer"
                        />

                        {editingSubId === sub.id ? (
                            <input
                                autoFocus
                                value={editedSubTitle}
                                onChange={(e) => setEditedSubTitle(e.target.value)}
                                onBlur={() => setEditingSubId(null)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveSubTitle(sub);
                                    if (e.key === 'Escape') setEditingSubId(null);
                                }}
                                className="bg-slate-900 text-sm text-white border-b border-emerald-500 outline-none flex-1 py-0.5"
                            />
                        ) : (
                            <span
                                onClick={() => { setEditingSubId(sub.id); setEditedSubTitle(sub.title); }}
                                className={`text-sm flex-1 cursor-text transition-colors ${
                                    sub.isCompleted ? 'line-through text-slate-600' : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                {sub.title}
            </span>
                        )}

                        {/* Bouton de suppression discret qui n'apparaît qu'au survol de la ligne */}
                        <button
                            onClick={(e) => deleteSub(e, sub.id)}
                            className="opacity-0 group-hover/sub:opacity-100 text-slate-600 hover:text-rose-500 transition-all text-xs"
                        >
                            ✕
                        </button>
                    </div>
                ))}
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
                        className="opacity-0 group-hover:opacity-100 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-white transition-all shadow-lg whitespace-nowrap"
                    >
                        FOCUS ⚡
                    </button>
                )}
            </div>
        </div>
    );
}