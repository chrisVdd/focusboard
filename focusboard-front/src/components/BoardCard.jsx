import { Link } from 'react-router-dom';

export default function BoardCard({ board }) {
    return (
        <Link to={`/board/${board.id}`} className="block bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 border-emerald-500 hover:bg-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
            <h2 className="text-2xl font-semibold text-slate-100">{board.title}</h2>
            <p className="text-sm text-slate-400 mt-2">Click to view the tasks</p>
        </Link>
    );
}