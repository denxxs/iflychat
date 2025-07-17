import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login - simulate API call
    setTimeout(() => {
      onLogin({
        id: '1',
        name: email.split('@')[0],
        email: email,
        isLoggedIn: true
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">IV</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: '#333333' }}>
            Indifly Ventures
          </CardTitle>
          <CardDescription style={{ color: '#666666' }}>
            Legal Assistant - Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#333333' }}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2"
                style={{ 
                  borderColor: '#6B5B95',
                  '--tw-ring-color': '#F5A623'
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: '#333333' }}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2"
                style={{ 
                  borderColor: '#6B5B95',
                  '--tw-ring-color': '#F5A623'
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:shadow-lg"
              disabled={isLoading}
              style={{ 
                backgroundColor: '#6B5B95',
                borderColor: '#6B5B95'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5A4A85'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6B5B95'}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: '#666666' }}>
              Demo credentials: Use any email and password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;