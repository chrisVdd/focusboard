import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import Home from "./pages/Home.jsx";
import BoardView from "./pages/BoardView.jsx";
import VictoryLane from "./pages/VictoryLane.jsx";
import FocusMode from "./pages/FocusMode.jsx";
import LevelBadge from "./components/LevelBadge.jsx";

function App() {
    const [tasks, setTasks] = useState([]);

    const refreshTasks = () => {
        fetch('https://localhost/api/tasks', {
            headers: { 'Accept': 'application/ld+json' }
        })
            .then(res => res.json())
            .then(data => setTasks(data.member || []))
            .catch(err => console.error('Header fetch error:', err));
    };

    useEffect(() => { refreshTasks(); }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500/30">
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
                <Link to="/" className="group flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-950 group-hover:rotate-12 transition-transform">F</div>
                    <span className="text-xl font-black tracking-tighter">
                        FOCUS<span className="text-emerald-500">BOARD</span>
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <Link to="/victory-lane" className="text-[10px] font-black text-slate-500 hover:text-yellow-500 transition-colors uppercase tracking-[0.2em]">
                        Victory Lane 🏆
                    </Link>
                    <LevelBadge tasks={tasks} />
                </div>
            </header>

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/board/:id" element={<BoardView onTaskUpdated={refreshTasks} />} />
                    <Route path="/victory-lane" element={<VictoryLane />} />
                    <Route path="/focus/:taskId" element={<FocusMode onComplete={refreshTasks} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;