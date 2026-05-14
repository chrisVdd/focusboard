import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import BoardView from "./pages/BoardView.jsx";
import VictoryLane from "./pages/VictoryLane.jsx";
import FocusMode from "./pages/FocusMode.jsx";
import LevelBadge from "./components/LevelBadge.jsx";
import Login from "./pages/Login.jsx";
import {useAuth} from "./context/AuthContext.tsx";

function App() {

    const [tasks, setTasks] = useState([]);
    const { user, isAuthenticated, handleLogout, token } = useAuth();

    const refreshTasks = async () => {

        if (!token) return;

        try {
            const res = await fetch('https://localhost/api/tasks', {
                headers: {
                    'Accept': 'application/ld+json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.status === 401) handleLogout();
            const data = await res.json();
            setTasks(data.member || []);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => { refreshTasks(); }, [token]);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-500/30">
            {isAuthenticated && (
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

                        {/* NOUVELLE BOÎTE : Regroupe le nom et le bouton en colonne */}
                        <div className="flex flex-col items-end gap-1.5">
                            {user?.username && (
                                <span className="hidden md:block text-xs font-medium text-slate-400">
                                Hello, <span className="text-emerald-400 font-bold capitalize">{user.username}</span> 👋
                            </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-[10px] font-black text-red-500/70 hover:text-red-400 uppercase tracking-widest border border-red-500/20 px-3 py-1 rounded-md transition-all w-full text-center"
                            >
                                Logout
                            </button>
                        </div>

                    </div>
                </header>
            )}

            <main>
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                    <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/board/:id" element={isAuthenticated ? <BoardView onTaskUpdated={refreshTasks} /> : <Navigate to="/login" />} />
                    <Route path="/victory-lane" element={isAuthenticated ? <VictoryLane /> : <Navigate to="/login" />} />
                    <Route path="/focus/:taskId" element={isAuthenticated ? <FocusMode onComplete={refreshTasks} /> : <Navigate to="/login" />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;