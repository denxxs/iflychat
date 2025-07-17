import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Indifly Ventures Logo */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1b2f5a' }}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <div className="relative">
                    {/* "i" letter */}
                    <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: '#1b2f5a' }}></div>
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#1b2f5a' }}></div>
                    {/* Orange accent bars */}
                    <div className="absolute -right-2 top-0 w-4 h-2 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                    <div className="absolute -right-2 top-3 w-4 h-2 rounded-sm" style={{ backgroundColor: '#ff6a22' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1b2f5a' }}>Indifly Ventures</h1>
          <p className="text-gray-600 text-sm font-medium">Legal Assistant</p>
          <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: '#ff6a22' }}></div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#1b2f5a' }}>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 border-gray-200 transition-all duration-200"
                  style={{ 
                    borderColor: '#1b2f5a',
                    '--tw-ring-color': '#ff6a22'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6a22'}
                  onBlur={(e) => e.target.style.borderColor = '#1b2f5a'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#1b2f5a' }}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-11 border-gray-200 transition-all duration-200"
                  style={{ 
                    borderColor: '#1b2f5a',
                    '--tw-ring-color': '#ff6a22'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff6a22'}
                  onBlur={(e) => e.target.style.borderColor = '#1b2f5a'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
              style={{ 
                backgroundColor: '#1b2f5a',
                borderColor: '#1b2f5a'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#ff6a22'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1b2f5a'}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="rounded-lg p-3" style={{ backgroundColor: '#f8f9fa' }}>
              <p className="text-xs font-medium" style={{ color: '#1b2f5a' }}>
                💡 Demo Mode: Use any email and password to continue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;