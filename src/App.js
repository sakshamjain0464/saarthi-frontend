import React, { useState, useEffect } from 'react';
import { loginWithGoogle, getUser } from './appwrite.config';
import Planner from './Planner';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/card';
import { Input } from '../src//components/ui/input';
import { Button } from '../src/components/ui/button';
import { Label } from '../src//components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src//components/ui/select';
import { Textarea } from '../src//components/ui/textarea';
import { Alert, AlertDescription } from '../src//components/ui/alert';


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-blue-500 to-teal-400">
      {user ? (
        <div className="p-4">
          <p className="text-white text-lg mb-4">Welcome, {user.name}!</p>
          <Planner />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <Button 
            onClick={loginWithGoogle}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            Login with Google
          </Button>
        </div>
      )}
    </div>
  );
}
