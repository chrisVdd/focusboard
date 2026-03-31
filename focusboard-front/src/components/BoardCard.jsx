import { Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';

export default function BoardCard({ board }) {
    const colorTheme = boardColors[board.color] || boardColors['emerald'];

    return (
        <Link
            to={`/board/${board.id}`}
            className={`block bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${colorTheme.border} ${colorTheme.hover}`}
        >
            <span className="text-3xl">{board.icon || '📋'}</span>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">{board.title}</h2>
            <div className={`text-sm font-medium flex items-center gap-2 ${colorTheme.text}`}>
                <span>Open</span>
                <span className="opacity-0 -ml-2 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0">
          →
        </span>
            </div>
        </Link>
    );
}