// BoardList.jsx
import BoardCard from "./BoardCard.jsx";

export default function BoardList({ boards, isLoading, onBoardDeleted }) {
    if (isLoading) {
        return <p className="text-emerald-500 animate-pulse">Loading database</p>
    }

    if (boards.length === 0) {
        return <p className="text-slate-400 italic">No board found.</p>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.map(board => (
                <BoardCard key={board.id.toString()} board={board} onDeleted={onBoardDeleted} />
            ))}
        </div>
    );
}