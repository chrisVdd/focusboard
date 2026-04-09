import { Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function BoardCard({ board }) {
    // 💡 Toujours l'ID en String pour la stabilité
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

    return (
        /* 💡 ICI : On met les listeners sur toute la zone de la carte */
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative"
        >
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