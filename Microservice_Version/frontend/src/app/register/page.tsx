"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/users/register', { email, name, password });
            alert('Registration successful, please login');
            router.push('/login');
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Register for Monolith</h1>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded text-black bg-white"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
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
                <button type="submit" className="bg-green-600 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
}
