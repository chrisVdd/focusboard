import BoardCard from "./BoardCard.jsx";

export default function BoardList({ boards, isLoading }) {
    if (isLoading) {
        return <p className="text-emerald-500 animate-pulse">Loading database</p>
    }

    if (boards.length === 0) {
        return <p className="text-slate-400 italic">No board found.</p>
    }

    return (
        <div className="contents">
            {boards.map(board => (
                <BoardCard key={board.id.toString()} board={board} />
            ))}
        </div>
    );
}