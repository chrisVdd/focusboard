import { useParams, Link } from 'react-router-dom';

export default function BoardView() {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <Link to="/" className="text-emerald-500 hover:text-emerald-400 mb-4 inline-block">
                ← Back to boards
            </Link>
            <h1 className="text-4xl font-bold text-slate-100">
                Board n° {id}
            </h1>
            <p className="text-slate-400 mt-4">
                Tasks will arrive soon
            </p>
        </div>
    );
}