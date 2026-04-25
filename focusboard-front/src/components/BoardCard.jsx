import { Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function BoardCard({ board, onDeleted }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: board.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.4 : 1,
        scale: isDragging ? 1.02 : 1,
        cursor: isDragging ? 'grabbing' : 'pointer',
    };

    const colorTheme = boardColors[board.color] || boardColors['emerald'];

    const nextTask = board.tasks && board.tasks.length > 0
        ? board.tasks
            .filter(t => !t.isCompleted)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
        : null;

    const handleDelete = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (window.confirm(`Supprimer définitivement le projet "${board.title}" ?`)) {
            try {
                const response = await fetch(`https://localhost/api/boards/${board.id}`, {
                    method: 'DELETE',
                });

                if (response.ok && onDeleted) {
                    onDeleted(board.id);
                }
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative group h-full"
        >
            {/* 🗑️ On cache le bouton par défaut, il n'apparaît qu'au survol (hover) */}
            <button
                onClick={handleDelete}
                className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 bg-slate-900/80 text-rose-500 p-2 rounded-xl shadow-lg border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                title="Supprimer ce board"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            <Link
                to={`/board/${board.id}`}
                className={`flex flex-col justify-between min-h-[220px] bg-slate-900 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 ${colorTheme.border} ${colorTheme.hover}`}
                onDragStart={(e) => e.preventDefault()}
            >
                <div>
                    <span className="text-4xl block mb-4">{board.icon || '📋'}</span>
                    <h2 className="text-2xl font-bold text-slate-100 truncate pr-6">
                        {board.title}
                    </h2>
                </div>

                <div className="mt-6">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-[0.2em]">
                        Next step
                    </p>
                    {nextTask ? (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="shrink-0 text-emerald-500">🎯</span>
                            <p className={`text-sm font-medium truncate ${colorTheme.text}`}>
                                {nextTask.title}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm italic text-slate-600">Free spirit ✨</p>
                    )}
                </div>
            </Link>
        </div>
    );
}