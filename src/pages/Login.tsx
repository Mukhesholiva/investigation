import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OlivaLogo from '@/assets/Oliva_skin.png';
import '@/styles/animations.css'; // optional, but not required now

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ username, password });
      toast({
        title: "Login successful",
        description: "Welcome to Oliva Diagnostics Hub",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-2xl border-2 border-[#00b2b8] rounded-2xl bg-white">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="flex flex-col items-center">
            <div className="w-[320px] mb-6">
              <img 
                src={OlivaLogo} 
                alt="Oliva Skin and Hair Clinic" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-2 border-gray-300 focus:border-[#00b2b8] focus:ring-2 focus:ring-[#00b2b8] rounded-md px-4 py-2 transition-all duration-300 outline-none shadow-sm"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-gray-300 focus:border-[#00b2b8] focus:ring-2 focus:ring-[#00b2b8] rounded-md px-4 py-2 transition-all duration-300 outline-none shadow-sm"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00b2b8] hover:bg-[#009a9f] transition-all duration-300 transform hover:scale-105 h-11 text-base font-semibold text-white rounded-md shadow-md"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
