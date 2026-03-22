import { useState } from "react";

export default function TaskItem({ task, onTaskUpdated }) {
    const [isCompleted, setIsCompleted] = useState(task.completed ?? false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleCompletion = () => {
        const newValue = !isCompleted;
        setIsCompleted(newValue);
        setIsUpdating(true);

        fetch(`https://localhost${task['@id']}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/merge-patch+json',
            },
            body: JSON.stringify({
                isCompleted: newValue
            })
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
        </div>
    );
}