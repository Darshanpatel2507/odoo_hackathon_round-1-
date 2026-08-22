import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const hasNumber = /\d/.test(password);

      if (password.length < 8 || !hasSpecialChar || !hasNumber) {
        setError('Password must be minimum 8 letters, use at least 1 special character, and use numbers.');
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, name }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      onClose();
      navigate('/dashboard');
    } else {
      // Login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        onClose();
        navigate('/dashboard');
      }
    }
    
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.authCard} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className={`${styles.title} script-font`}>
          {mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}
        </h2>
        <p className={styles.subtitle}>
          {mode === 'login' ? 'Log in to continue your adventure.' : 'Join GlobeTrotter today.'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleAuth} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className={styles.forgotPassword}>
              <button 
                type="button" 
                onClick={() => {
                  onClose();
                  navigate('/forgot-password');
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading 
              ? (mode === 'login' ? 'Logging in...' : 'Signing up...') 
              : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className={styles.footer}>
          {mode === 'login' ? (
            <>
              Don't have an account? <button onClick={toggleMode}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account? <button onClick={toggleMode}>Log in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
