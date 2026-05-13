import { useState } from "react";
import { boardColors } from "../utils/colors.js";
import { useNavigate } from "react-router-dom";

export default function TaskItem({ task, onTaskUpdated, tagsDict }) {
    const navigate = useNavigate();
    const [isCompleted, setIsCompleted] = useState(task.isCompleted ?? false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newSubTask, setNewSubTask] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editingSubId, setEditingSubId] = useState(null);
    const [editedSubTitle, setEditedSubTitle] = useState("");

    const subTasks = task.subTasks || [];
    const completedSub = subTasks.filter(s => s.isCompleted).length;
    const progressPercent = subTasks.length > 0 ? Math.round((completedSub / subTasks.length) * 100) : 0;

    const toggleCompletion = () => {
        const newValue = !isCompleted;
        setIsCompleted(newValue);
        setIsUpdating(true);
        fetch(`https://localhost${task['@id']}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ isCompleted: newValue, completedAt: newValue ? new Date().toISOString() : null })
        }).then(() => {
            setIsUpdating(false);
            if (onTaskUpdated) onTaskUpdated();
        });
    };

    const addSubTask = async (e) => {
        if (e.key !== 'Enter' || !newSubTask.trim()) return;
        const res = await fetch('https://localhost/api/sub_tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/ld+json' },
            body: JSON.stringify({ title: newSubTask, task: task['@id'], isCompleted: false })
        });
        if (res.ok) { setNewSubTask(''); onTaskUpdated(); }
    };

    const toggleSub = async (sub) => {
        await fetch(`https://localhost${sub['@id']}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ isCompleted: !sub.isCompleted })
        });
        onTaskUpdated();
    };

    const deleteSub = async (e, id) => {
        e.stopPropagation();
        await fetch(`https://localhost/api/sub_tasks/${id}`, { method: 'DELETE' });
        onTaskUpdated();
    };

    return (
        <div className={`p-5 rounded-2xl shadow-xl border-l-4 flex items-start gap-5 transition-all ${isCompleted ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-800 border-emerald-500'}`}>
            <input type="checkbox" checked={isCompleted} onChange={toggleCompletion} disabled={isUpdating} className="mt-1.5 w-6 h-6 accent-emerald-500 cursor-pointer shrink-0" />

            <div className="flex-1">
                {/* Progression Subtasks */}
                {subTasks.length > 0 && !isCompleted && (
                    <div className="mb-4 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between text-[10px] mb-2 font-bold text-emerald-400">
                            <span>Mission Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                )}

                {/* Titre */}
                <div onClick={() => setIsEditingTitle(true)} className={`text-xl cursor-pointer hover:text-emerald-400 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200 font-bold'}`}>
                    {task.title}
                </div>

                {/* Liste des sous-tâches (UNE SEULE FOIS ICI) */}
                {!isCompleted && (
                    <div className="mt-4 space-y-2 border-l-2 border-slate-700/50 pl-4">
                        {subTasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-3 group/sub">
                                <input type="checkbox" checked={sub.isCompleted} onChange={() => toggleSub(sub)} className="w-4 h-4 accent-emerald-500" />
                                <span className={`text-sm flex-1 ${sub.isCompleted ? 'line-through text-slate-600' : 'text-slate-400'}`}>{sub.title}</span>
                                <button onClick={(e) => deleteSub(e, sub.id)} className="opacity-0 group-hover/sub:opacity-100 text-slate-600 hover:text-rose-500 transition-all text-xs">✕</button>
                            </div>
                        ))}
                        <input type="text" placeholder="Add step..." value={newSubTask} onChange={e => setNewSubTask(e.target.value)} onKeyDown={addSubTask} className="w-full mt-2 bg-transparent text-sm text-slate-500 outline-none italic" />
                    </div>
                )}

                {/* Focus Button */}
                {!isCompleted && (
                    <button onClick={() => navigate(`/focus/${task.id}`)} className="mt-4 bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-md hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest">⚡ Start Focus</button>
                )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-end gap-2 shrink-0">
                {task.tags?.map(iri => {
                    const tag = tagsDict[iri];
                    if (!tag) return null;
                    const theme = boardColors[tag.color] || boardColors['emerald'];
                    return <span key={iri} className={`text-[10px] px-2 py-0.5 rounded-full border bg-slate-900/50 ${theme.text} ${theme.border}`}>{tag.name}</span>;
                })}
            </div>
        </div>
    );
}