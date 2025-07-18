import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import IndiflyLogo from './IndiflyLogo';
import { authHelpers } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authHelpers.loginUser({ email, password });
      
      if (result.success) {
        onLogin({
          ...result.user,
          isLoggedIn: true
        });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <IndiflyLogo size="2xl" className="drop-shadow-lg rounded-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#02295c' }}>Indifly AI</h1>
          <p className="text-gray-600 text-sm font-medium">Intelligent Legal Assistant</p>
          <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: '#fa6620' }}></div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#02295c' }}>Email Address</Label>
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
                    borderColor: '#02295c',
                    '--tw-ring-color': '#fa6620'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fa6620'}
                  onBlur={(e) => e.target.style.borderColor = '#02295c'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#02295c' }}>Password</Label>
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
                    borderColor: '#02295c',
                    '--tw-ring-color': '#fa6620'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fa6620'}
                  onBlur={(e) => e.target.style.borderColor = '#02295c'}
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
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-11 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
              style={{ 
                backgroundColor: '#02295c',
                borderColor: '#02295c'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fa6620'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#02295c'}
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
              <p className="text-xs font-medium" style={{ color: '#02295c' }}>
                💡 For testing: test@iflychat.com / testpass123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;