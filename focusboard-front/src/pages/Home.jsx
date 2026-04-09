// Home.jsx
import { useState, useEffect, useMemo } from "react";
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

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={boardIds} strategy={rectSortingStrategy}>
                    <BoardList boards={boards} isLoading={isLoading} onBoardDeleted={handleBoardDeleted} />
                </SortableContext>
            </DndContext>
        </div>
    );
}

export default Home;