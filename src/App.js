import React, { useState, useEffect } from 'react';
import { loginWithGoogle, logoutUser, getUser } from './appwrite.config'
import Planner from './Planner';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await getUser()
                setUser(userData)
            } catch (error) {
                setUser(null)
            }
        }

        checkUser()
    }, [])

    return (
        <div>
            {user ? (
                <>
                    <p>Welcome, {user.name}!</p>
                    <Planner />
                </>
            ) : (
                <button onClick={loginWithGoogle}>Login with Google</button>
            )}
        </div>
    )
}

export default App;
