import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import TaskItem from "../components/TaskItem.jsx";

export default function BoardView() {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTasks = () => {
        fetch('https://localhost/api/tasks', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(tasksData => {
                const filteredTasks = (tasksData.member || []).filter(
                    task => task.board === `/api/boards/${id}`
                );
                setTasks(filteredTasks);
            });
    };

    useEffect(() => {
        fetch(`https://localhost/api/boards/${id}`, { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(boardData => {
                setBoard(boardData);
                loadTasks();
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 p-8 text-emerald-500 animate-pulse text-xl">
            Loading focus space ...
        </div>;
    }

    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <Link to="/" className="text-slate-400 hover:text-emerald-400 mb-6 inline-block font-medium transition-colors">
                &larr; Back to boards
            </Link>

            <h1 className="text-4xl font-bold text-slate-100 mb-8 border-b border-slate-700 pb-4">
                {board?.title}
            </h1>

            <div className="max-w-3xl">
                <TaskForm boardId={id} onTaskAdded={loadTasks} />
                <div className="space-y-4 mb-12">
                    {activeTasks.length === 0 ? (
                        <p className="text-slate-500 italic">
                            {completedTasks.length > 0
                                ? "Incroyable, tu as tout explosé ! 🎉"
                                : "Aucune tâche pour le moment. À toi de jouer !"}
                        </p>
                    ) : (
                        activeTasks.map(task => (
                            <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} />
                        ))
                    )}
                </div>

                {completedTasks.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-400 mb-6 flex items-center gap-3">
                            <span>✨</span> DONE
                            <span className="text-sm bg-slate-800 text-slate-300 py-1 px-3 rounded-full">
                {completedTasks.length}
              </span>
                        </h2>

                        {/* On met une petite opacité pour montrer que c'est du passé */}
                        <div className="space-y-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                            {completedTasks.map(task => (
                                <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}