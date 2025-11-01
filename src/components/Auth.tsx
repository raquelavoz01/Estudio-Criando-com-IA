import React, { useState, useEffect } from 'react';
import { LogoIcon, UserCircleIcon } from './Icons';

interface AuthProps {
    onLoginSuccess: (user: { username: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Seed the admin user if no users exist
        try {
            const users = JSON.parse(localStorage.getItem('studio-users') || '[]');
            const adminUserExists = users.some((u: any) => u.email === 'raquelavoz@gmail.com');

            if (!adminUserExists) {
                const adminUser = { 
                    username: 'Raquel', 
                    email: 'raquelavoz@gmail.com', 
                    password: '#Hased01' 
                };
                users.push(adminUser);
                localStorage.setItem('studio-users', JSON.stringify(users));
            }
        } catch (e) {
            console.error("Failed to seed admin user", e);
            const adminUser = [{ 
                username: 'Raquel', 
                email: 'raquelavoz@gmail.com', 
                password: '#Hased01' 
            }];
            localStorage.setItem('studio-users', JSON.stringify(adminUser));
        }
    }, []);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (!username || !email || !password) {
                setError('Todos os campos são obrigatórios.');
                return;
            }
            try {
                const users = JSON.parse(localStorage.getItem('studio-users') || '[]');
                if (users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
                    setError('Nome de usuário ou email já existe.');
                    return;
                }
                const newUser = { username, email, password };
                localStorage.setItem('studio-users', JSON.stringify([...users, newUser]));
                onLoginSuccess({ username });
            } catch (err) {
                setError('Ocorreu um erro ao criar a conta.');
            }
        } else { // Login mode
            if (!username || !password) {
                setError('Nome de usuário e senha são obrigatórios.');
                return;
            }
            try {
                const users = JSON.parse(localStorage.getItem('studio-users') || '[]');
                const user = users.find((u: any) => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && u.password === password);
                if (user) {
                    onLoginSuccess({ username: user.username });
                } else {
                    setError('Usuário ou senha inválidos.');
                }
            } catch (err) {
                setError('Ocorreu um erro ao fazer login.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-100 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-brand-primary p-3 rounded-xl mb-4">
                        <LogoIcon className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Estúdio: Criando com IA</h1>
                    <p className="text-gray-400 mt-2">Dê vida aos seus mundos e narrativas.</p>
                </div>

                <div className="bg-base-200 shadow-2xl rounded-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-center text-white">
                            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua Conta'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'register' && (
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-base-300 border border-gray-600 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nome de usuário ou Email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-base-300 border border-gray-600 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                             <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-base-300 border border-gray-600 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                        >
                            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                            }}
                            className="font-semibold text-brand-secondary hover:text-brand-light ml-1"
                        >
                            {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;