import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import TagCreator from "../components/TagCreator.jsx";

// ✅ AJOUT : On récupère la prop onTaskUpdated passée par App.jsx
export default function BoardView({ onTaskUpdated }) {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [tagsDict, setTagsDict] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");

    const token = localStorage.getItem("token");

    const loadTasks = () => {
        fetch('https://localhost/api/tasks', {
            headers: {
                'Accept': 'application/ld+json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(res => res.json())
            .then(tasksData => {
                const filteredTasks = (tasksData.member || []).filter(
                    task => task.board === `/api/boards/${id}`
                );
                setTasks(filteredTasks);

                if (onTaskUpdated) onTaskUpdated();
            });
    };

    const loadTags = () => {
        fetch('https://localhost/api/tags', {
            headers: {
                'Accept': 'application/ld+json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(res => res.json())
            .then(tagsData => {
                const dict = {};
                (tagsData.member || []).forEach(tag => { dict[tag['@id']] = tag; });
                setTagsDict(dict);
            });
    };

    useEffect(() => {
        loadTags();
        fetch(`https://localhost/api/boards/${id}`, {
            headers: {
                'Accept': 'application/ld+json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(res => res.json())
            .then(boardData => {
                setBoard(boardData);
                setEditedTitle(boardData.title);
                loadTasks();
                setIsLoading(false);
            });
    }, [id]);

    const saveBoardTitle = async () => {
        if (editedTitle.trim() === "" || editedTitle === board.title) {
            setIsEditingTitle(false);
            return;
        }
        try {
            const response = await fetch(`https://localhost/api/boards/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editedTitle })
            });
            if (response.ok) {
                const updatedBoard = await response.json();
                setBoard(updatedBoard);
                setIsEditingTitle(false);
            }
        } catch (e) { console.error(e); }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-900 p-8 text-slate-500 animate-pulse">Loading...</div>;

    const colorTheme = boardColors[board?.color] || boardColors['emerald'];
    const filterTasks = (list) => activeFilters.length === 0 ? list : list.filter(t => t.tags?.some(tag => activeFilters.includes(tag)));

    const allActive = tasks.filter(t => !t.isCompleted);
    const allDone = tasks.filter(t => t.isCompleted);
    const progress = tasks.length === 0 ? 0 : Math.round((allDone.length / tasks.length) * 100);

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <Link to="/" className={`mb-6 inline-block font-medium transition-colors text-slate-400 hover:${colorTheme.text}`}>&larr; Back to boards</Link>

            <div className="mb-8">
                {isEditingTitle ? (
                    <input autoFocus value={editedTitle} onChange={e => setEditedTitle(e.target.value)} onBlur={saveBoardTitle} onKeyDown={e => e.key === 'Enter' && saveBoardTitle()} className={`text-4xl font-bold bg-transparent border-b-2 outline-none w-full pb-4 ${colorTheme.text} ${colorTheme.border}`} />
                ) : (
                    <h1 onClick={() => setIsEditingTitle(true)} className={`text-4xl font-bold border-b-2 pb-4 cursor-pointer hover:opacity-80 transition-all ${colorTheme.text} ${colorTheme.border}`}>{board?.title}</h1>
                )}
            </div>

            <div className="max-w-3xl">
                {/* Progrès global */}
                <div className="mb-8 bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-medium text-slate-400">Board Progress</span>
                        <span className={`text-2xl font-black ${colorTheme.text}`}>{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${colorTheme.bg} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                    <TagCreator onTagAdded={loadTags} />
                    <div className="flex flex-wrap gap-2">
                        {Object.values(tagsDict).map(tag => (
                            <button key={tag.id} onClick={() => setActiveFilters(prev => prev.includes(tag['@id']) ? prev.filter(x => x !== tag['@id']) : [...prev, tag['@id']])} className={`text-xs px-3 py-1 rounded-full border transition-all ${activeFilters.includes(tag['@id']) ? 'bg-emerald-500 text-white' : 'bg-slate-900/50 text-slate-400'}`}>
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                <TaskForm boardId={id} onTaskAdded={loadTasks} colorTheme={colorTheme} availableTags={Object.values(tagsDict)} />

                <div className="space-y-4 mb-12">
                    {filterTasks(allActive).map(task => (
                        <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} tagsDict={tagsDict} />
                    ))}
                </div>

                {allDone.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-400 mb-6 flex items-center gap-3">✨ Victories <span className="text-sm bg-slate-800 py-1 px-3 rounded-full">{allDone.length}</span></h2>
                        <div className="space-y-4 opacity-70">
                            {filterTasks(allDone).map(task => (
                                <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} tagsDict={tagsDict} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}