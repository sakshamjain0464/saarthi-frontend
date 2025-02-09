import React, { useState, useEffect } from 'react';
import { loginWithGoogle, getUser } from './appwrite.config';
import Planner from './Planner';
import { Button } from '../src/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import MarkDownRenderer from './components/ui/markdownRenderer';


export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                setLoading(true);
                const userData = await getUser();
                setUser(userData);
            } catch (error) {
                setUser(null);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-teal-400">
            <MarkDownRenderer message={""} />
            {user ? (
                <div className="p-4">
                    <p className="text-white text-lg mb-4">Welcome, {user.name}!</p>
                    <Planner />
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-screen">
                    {loading ? (<Loader2 className="w-6 h-6 animate-spin inline-block" />) : (<Button
                        onClick={loginWithGoogle}
                        className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                        Login with Google
                    </Button>)}
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
