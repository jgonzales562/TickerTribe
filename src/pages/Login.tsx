import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual authentication logic
    // For now, simulate a login delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h1>TickerTribe</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className='login-form'>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <div className='password-input-wrapper'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                required
              />
              <button
                type='button'
                className='toggle-password'
                onClick={() => setShowPassword(!showPassword)}
                aria-label='Toggle password visibility'
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type='submit' className='login-button' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className='login-footer'>
          <button
            type='button'
            className='forgot-password'
            onClick={() => {
              // TODO: Implement forgot password functionality
              alert('Password reset functionality coming soon!');
            }}
          >
            Forgot password?
          </button>
          <p className='signup-link'>
            Don't have an account? <Link to='/signup'>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
