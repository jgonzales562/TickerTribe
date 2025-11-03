import { useState, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const navigate = useNavigate();
  const debounceTimer = useRef<number | null>(null);

  // Simulate checking if username is available
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length === 0) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameStatus('invalid');
      setUsernameMessage(
        'Username must be 3-20 characters (letters, numbers, underscore only)'
      );
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    // TODO: Replace with actual API call
    // Simulating API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock list of taken usernames for demo purposes
    const takenUsernames = [
      'admin',
      'user',
      'test',
      'demo',
      'stockmaster',
      'trader123',
    ];

    if (takenUsernames.includes(username.toLowerCase())) {
      setUsernameStatus('taken');
      setUsernameMessage('Username is already taken');
    } else {
      setUsernameStatus('available');
      setUsernameMessage('Username is available!');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');

    // Trigger debounced username validation when username field changes
    if (name === 'username') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 300);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (usernameStatus !== 'available') {
      setError('Please choose a valid and available username');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual registration logic
    // For now, simulate a signup delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard after successful signup
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className='signup-container'>
      <div className='signup-card'>
        <div className='signup-header'>
          <h1>TickerTribe</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className='signup-form'>
          {error && <div className='error-message'>{error}</div>}

          <div className='form-group'>
            <label htmlFor='username'>Username</label>
            <div className='username-input-wrapper'>
              <input
                id='username'
                name='username'
                type='text'
                value={formData.username}
                onChange={handleChange}
                placeholder='Choose a username'
                className={
                  usernameStatus === 'available'
                    ? 'valid'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'invalid'
                    : ''
                }
                required
              />
              {usernameStatus !== 'idle' && (
                <span className={`username-status ${usernameStatus}`}>
                  {usernameStatus === 'checking' && '⏳'}
                  {usernameStatus === 'available' && '✓'}
                  {(usernameStatus === 'taken' ||
                    usernameStatus === 'invalid') &&
                    '✗'}
                </span>
              )}
            </div>
            {usernameMessage && (
              <span className={`username-message ${usernameStatus}`}>
                {usernameMessage}
              </span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <div className='password-input-wrapper'>
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder='Create a password'
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

          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <div className='password-input-wrapper'>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder='Confirm your password'
                required
              />
              <button
                type='button'
                className='toggle-password'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label='Toggle password visibility'
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type='submit' className='signup-button' disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className='signup-footer'>
          <p className='login-link'>
            Already have an account? <Link to='/login'>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
