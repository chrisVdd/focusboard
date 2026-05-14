import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("https://localhost/api/login_check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error("Invalid credentials");

            const data = await response.json();
            localStorage.setItem("token", data.token);

            window.location.href = "/";

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Login</h2>
                {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/50">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input type="text" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg outline-none" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 rounded-lg transition-colors">Connect</button>
                </form>
            </div>
        </div>
    );
}

export default Login;