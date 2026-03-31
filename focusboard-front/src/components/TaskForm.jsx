import { useState } from 'react';

// 👉 On ajoute colorTheme dans les paramètres
export default function TaskForm({ boardId, onTaskAdded, colorTheme }) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sécurité : si on n'a pas de thème, on met un fond par défaut
    const themeBg = colorTheme ? colorTheme.bg : 'bg-emerald-600';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);

        fetch('https://localhost/api/tasks', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json'
            },
            body: JSON.stringify({
                title: title,
                isCompleted: false,
                board: `/api/boards/${boardId}`
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Erreur serveur");
                return response.json();
            })
            .then(() => {
                onTaskAdded();
                setTitle('');
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout :", error);
                setIsSubmitting(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nouvelle tâche à exploser..."
                disabled={isSubmitting}
                className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-slate-500 focus:outline-none transition-colors"
            />
            <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                // 👉 On utilise la couleur dynamique ici :
                className={`${themeBg} hover:brightness-110 text-white px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50`}
            >
                {isSubmitting ? '...' : '+ Ajouter'}
            </button>
        </form>
    );
}