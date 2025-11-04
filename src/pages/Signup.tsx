import { useState, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import {
  USERNAME_CHECK_DEBOUNCE,
  USERNAME_CHECK_DELAY,
  SIGNUP_SIMULATION_DELAY,
} from '../constants/validation';
import { MOCK_TAKEN_USERNAMES } from '../constants/auth';
import {
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

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

  // Check username availability (simulated for demo)
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (username.length === 0) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    // Username format validation
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameStatus('invalid');
      setUsernameMessage(validation.error || 'Invalid username');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Checking availability...');

    // Note: In production, this would be an API call to check username
    await new Promise((resolve) => setTimeout(resolve, USERNAME_CHECK_DELAY));

    if (
      MOCK_TAKEN_USERNAMES.includes(
        username.toLowerCase() as (typeof MOCK_TAKEN_USERNAMES)[number]
      )
    ) {
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
      }, USERNAME_CHECK_DEBOUNCE);
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

    // Validate password match
    const passwordMatchValidation = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (!passwordMatchValidation.isValid) {
      setError(passwordMatchValidation.error || 'Invalid password');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    setIsLoading(true);

    // Note: In production, implement actual registration with API
    // This simulates signup for demo purposes
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, SIGNUP_SIMULATION_DELAY);
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
