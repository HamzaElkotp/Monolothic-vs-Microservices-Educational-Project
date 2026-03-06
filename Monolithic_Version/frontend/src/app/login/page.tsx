"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/users/login', { email, password });
            Cookies.set('token', res.data.token);
            router.push('/');
        } catch (err) {
            alert('Login failed');
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Login to Monolith</h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded text-black bg-white"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded text-black bg-white"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
}
