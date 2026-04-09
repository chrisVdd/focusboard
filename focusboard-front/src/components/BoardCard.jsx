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
        isDragging// 💡 Toujours l'ID en String pour la stabilité
    } = useSortable({ id: board.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
        cursor: isDragging ? 'grabbing' : 'pointer', // 💡 Curseur visuel clair
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

        if (window.confirm(`Delete the project "${board.title}"`)) {
            try {
                const response = await fetch(`https://localhost/api/boards/${board.id}`, {
                    method: 'DELETE',
                });

                if (response.ok && onDeleted) {
                    onDeleted(board.id);
                }
            } catch (error) {
                console.error("Error while deleting, ", error);
            }
        }
    }

    return (
        /* 💡 ICI : On met les listeners sur toute la zone de la carte */
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative"
        >
            <button
                onClick={handleDelete}
                className="absolute bottom-4 right-4 z-30 bg-rose-600 text-white p-2.5 rounded-xl shadow-xl hover:bg-rose-500 hover:scale-110 transition-all border border-rose-400/20 backdrop-blur-sm"
                title="Delete this board"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            <Link
                to={`/board/${board.id}`}
                /* 💡 'pointer-events-auto' assure que le lien reste cliquable */
                className={`block bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 transition-all duration-300 hover:-translate-y-1 ${colorTheme.border} ${colorTheme.hover}`}
                /* On empêche le drag natif du navigateur sur le lien pour ne pas interférer */
                onDragStart={(e) => e.preventDefault()}
            >
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl select-none">{board.icon || '📋'}</span>
                    <h2 className="text-2xl font-bold text-slate-100 truncate">
                        {board.title}
                    </h2>
                </div>

                <div className="mt-2 p-3 bg-slate-900/40 rounded-lg border border-slate-700/30">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">
                        Next step :
                    </p>
                    {nextTask ? (
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 text-xs">🎯</span>
                            <p className={`text-sm font-medium truncate ${colorTheme.text}`}>
                                {nextTask.title}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm italic text-slate-600">No task queuing ✨</p>
                    )}
                </div>
            </Link>
        </div>
    );
}