// Home.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import BoardList from "../components/BoardList.jsx";
import BoardForm from "../components/BoardForm.jsx";
4
function Home() {
    const [boards, setBoards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 💡 Configuration robuste des capteurs
    const sensors = useSensors(
        useSensor(MouseSensor, {
            // On doit bouger de 10px pour confirmer que c'est un drag et non un clic
            activationConstraint: { distance: 10 },
        }),
        useSensor(TouchSensor, {
            // Appui long (250ms) pour le mobile pour éviter les conflits de scroll
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    const boardIds = useMemo(() => boards.map(b => b.id.toString()), [boards]);

    const loadBoards = () => {
        fetch('https://localhost/api/boards', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(data => {
                const sorted = (data.member || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                setBoards(sorted);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    useEffect(() => { loadBoards(); }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBoards((items) => {
                const oldIndex = items.findIndex((i) => i.id.toString() === active.id);
                const newIndex = items.findIndex((i) => i.id.toString() === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                fetch(`https://localhost/api/boards/${active.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/merge-patch+json' },
                    body: JSON.stringify({ position: newIndex })
                });

                return newOrder;
            });
        }
    };

    const handleBoardDeleted = (boardId) => {
        setBoards(prev => prev.filter(b => b.id !== boardId));
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <h1 className="text-4xl font-bold text-emerald-400 mb-8 tracking-wide">FocusBoard</h1>
            <BoardForm onBoardAdded={loadBoards} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">

                <Link to="/victory-lane" className="group relative flex flex-col justify-between bg-gradient-to-br from-amber-500/10 to-yellow-600/20 p-8 rounded-3xl border-2 border-yellow-500/30 shadow-xl transition-all hover:scale-[1.02] hover:border-yellow-500/60 min-h-[220px]">
                    <div>
                        <span className="text-5xl mb-4 block">🏆</span>
                        <h2 className="text-2xl font-bold text-yellow-500">Victory Lane</h2>
                        <p className="text-xs text-yellow-200/50 italic mt-2 leading-relaxed">
                            "Le panthéon de tes succès."
                        </p>
                    </div>
                    <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
                        Voir les trophées →
                    </div>
                </Link>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={boardIds} strategy={rectSortingStrategy}>
                        <BoardList boards={boards} isLoading={isLoading} onBoardDeleted={handleBoardDeleted} />
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

export default Home;