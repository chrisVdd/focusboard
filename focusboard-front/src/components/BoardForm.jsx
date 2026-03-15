import { useState } from "react";

export default function BoardForm({ onBoardAdded }) {

    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {

        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);

        fetch('https://localhost/api/boards', {
            method: 'POST',
            headers: {
                'Accept': 'application/ld+json',
                'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify({
                title: title,
                color: 'emerald'
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error while creating');
                return response.json;
            })
            .then(newBoard => {
                onBoardAdded();
                setTitle('');
                setIsSubmitting(false);
            })
            .catch(error => {
                console.error('No possible to create the board: ', error);
                setIsSubmitting(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New Board (ex: work)"
                disabled={isSubmitting}
                className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:outline-none transition-colors"
            />
            <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Add ...' : '+ Add'}
            </button>
        </form>
    );
}