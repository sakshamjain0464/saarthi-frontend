import React, { useState, useEffect } from 'react';
import { loginWithGoogle, getUser, logoutUser } from './authHelper';
import Planner from './Planner';
import { Button } from '../src/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { ToastContainer } from 'react-toastify';


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

    async function handleLogoutUser() {
        await logoutUser();
        setUser(null)
    }

    function handleGuestLogin() {
        setUser({ name: "Guest", $id: "guest" })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-teal-400">
            {user ? (
                <div className="p-4">
                    <button onClick={handleLogoutUser} className='bg-white py-2 px-6 rounded-xl flex gap-2 fixed right-0'><LogOut />
                        Logout</button>
                    <p className="text-white text-lg mb-4 text-center">Welcome, {user.name}!</p>
                    <Planner user={user} />
                </div>
            ) : (
                <div className="flex items-center justify-center min-h-screen">
                    {loading ? (<Loader2 className="w-6 h-6 animate-spin inline-block" />) : (
                        <div className='flex flex-col gap-4'>
                            <Button
                                onClick={loginWithGoogle}
                                className="bg-white text-purple-600 hover:bg-gray-100"
                            >
                                Login with Google
                            </Button>
                            <Button
                                onClick={handleGuestLogin}
                                className="bg-white text-purple-600 hover:bg-gray-100"
                            >
                                Use As Guest
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
