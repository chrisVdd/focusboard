import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { boardColors } from '../utils/colors';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import TagCreator from "../components/TagCreator.jsx";

export default function BoardView() {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [tagsDict, setTagsDict] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const [activeFilters, setActiveFilters] = useState([]);

    const loadTasks = () => {
        fetch('https://localhost/api/tasks', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(tasksData => {
                const filteredTasks = (tasksData.member || []).filter(
                    task => task.board === `/api/boards/${id}`
                );
                setTasks(filteredTasks);
            });
    };

    const loadTags = () => {
        fetch('https://localhost/api/tags', { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(tagsData => {
                const dict = {};
                (tagsData.member || []).forEach(tag => {
                    dict[tag['@id']] = tag;
                });
                setTagsDict(dict);
            });
    };

    useEffect(() => {
        loadTags();
        fetch(`https://localhost/api/boards/${id}`, { headers: { 'Accept': 'application/ld+json' } })
            .then(res => res.json())
            .then(boardData => {
                setBoard(boardData);
                loadTasks();
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 p-8 text-slate-500 animate-pulse text-xl">Chargement de ton espace Focus...</div>;
    }

    const colorTheme = board ? (boardColors[board.color] || boardColors['emerald']) : boardColors['emerald'];

    const filterTasks = (taskList) => {
        if (activeFilters.length === 0) return taskList; // Si aucun filtre, on affiche tout
        return taskList.filter(task =>
            // On garde la tâche si elle possède au moins un des tags sélectionnés
            task.tags && task.tags.some(tagIri => activeFilters.includes(tagIri))
        );
    };

    const allActiveTasks = tasks.filter(task => !task.isCompleted);
    const allCompletedTasks = tasks.filter(task => task.isCompleted);

    const displayedActiveTasks = filterTasks(allActiveTasks);
    const displayedCompletedTasks = filterTasks(allCompletedTasks);

    const totalTasks = tasks.length;
    const completedCount = allCompletedTasks.length;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

    let motivationMessage = "Ajoute une tâche pour commencer !";
    if (totalTasks > 0) {
        if (progressPercentage === 0) motivationMessage = "C'est parti, on s'y met !";
        else if (progressPercentage < 50) motivationMessage = "On avance bien !";
        else if (progressPercentage === 50) motivationMessage = "On est à la moitié !";
        else if (progressPercentage < 100) motivationMessage = "Tu y es presque, lâche rien !";
        else motivationMessage = "Masterclass ! Tu as tout explosé ! 🏆";
    }

    const toggleFilter = (tagIri) => {
        setActiveFilters(prev =>
            prev.includes(tagIri) ? prev.filter(t => t !== tagIri) : [...prev, tagIri]
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 text-white">
            <Link to="/" className={`mb-6 inline-block font-medium transition-colors text-slate-400 hover:${colorTheme.text}`}>
                &larr; Retour aux tableaux
            </Link>

            <h1 className={`text-4xl font-bold mb-8 border-b-2 pb-4 ${colorTheme.text} ${colorTheme.border}`}>
                {board?.title}
            </h1>

            <div className="max-w-3xl">

                <div className="mb-8 bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-medium text-slate-400">{motivationMessage}</span>
                        <span className={`text-2xl font-black ${colorTheme.text}`}>{progressPercentage}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full ${colorTheme.bg} transition-all duration-1000 ease-out`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">

                    {Object.values(tagsDict).length > 0 && (
                        <>
                            <span className="text-sm font-medium text-slate-400">Filtrer :</span>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(tagsDict).map(tag => {
                                    const isSelected = activeFilters.includes(tag['@id']);
                                    const theme = boardColors[tag.color] || boardColors['emerald'];

                                    return (
                                        <button
                                            key={`filter-${tag['@id']}`}
                                            onClick={() => toggleFilter(tag['@id'])}
                                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 border ${
                                                isSelected
                                                    ? `${theme.bg} text-white border-transparent shadow-md scale-105 ring-2 ring-white/20`
                                                    : `bg-slate-900/50 ${theme.text} ${theme.border} hover:bg-slate-800 opacity-60 hover:opacity-100`
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="w-px h-6 bg-slate-700 mx-1"></div>
                        </>
                    )}
                    <TagCreator onTagAdded={loadTags} />
                </div>

                <TaskForm boardId={id} onTaskAdded={loadTasks} colorTheme={colorTheme} availableTags={Object.values(tagsDict)} />

                <div className="space-y-4 mb-12">
                    {displayedActiveTasks.length === 0 && allActiveTasks.length > 0 && (
                        <p className="text-slate-500 italic text-center py-4">Aucune tâche active ne correspond à ce filtre. 🕵️‍♂️</p>
                    )}
                    {displayedActiveTasks.map(task => (
                        <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} tagsDict={tagsDict} />
                    ))}
                </div>

                {displayedCompletedTasks.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-400 mb-6 flex items-center gap-3">
                            <span>✨</span> Victoires
                            <span className="text-sm bg-slate-800 text-slate-300 py-1 px-3 rounded-full">
                {displayedCompletedTasks.length}
              </span>
                        </h2>

                        <div className="space-y-4 opacity-70 hover:opacity-100 transition-opacity duration-500">
                            {displayedCompletedTasks.map(task => (
                                <TaskItem key={task.id} task={task} onTaskUpdated={loadTasks} tagsDict={tagsDict} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}