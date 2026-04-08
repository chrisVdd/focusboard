import { Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';

export default function BoardCard({ board }) {
    const colorTheme = boardColors[board.color] || boardColors['emerald'];
    const nextTask = board.tasks && board.tasks.length > 0
        ? board.tasks
            .filter(t => !t.isCompleted) // 💡 Propre et net
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
        : null;

    return (
        <Link
            to={`/board/${board.id}`}
            className={`block bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${colorTheme.border} ${colorTheme.hover}`}
        >
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{board.icon || '📋'}</span>
                <h2 className="text-2xl font-bold text-slate-100">{board.title}</h2>
            </div>

            <div className="mt-2 p-3 bg-slate-900/40 rounded-lg border border-slate-700/30 group">
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

            <div className={`mt-4 text-xs font-medium flex items-center gap-2 ${colorTheme.text} opacity-60`}>
                <span>See the board</span>
                <span>→</span>
            </div>
        </Link>
    );
}