import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { session } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <motion.nav 
        className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.container}>
          <Link to="/" className={styles.logoContainer} style={{ textDecoration: 'none' }}>
            <Compass className={styles.logoIcon} size={32} />
            <span className={styles.logoText}>GlobeTrotter</span>
          </Link>
          
          <div className={styles.linksContainer}>
            <a href="/#explore" className={styles.navLink}>Explore</a>
            <a href="/#how-it-works" className={styles.navLink}>How it Works</a>
            <a href="/#pricing" className={styles.navLink}>Pricing</a>
          </div>
          
          <div className={styles.actionsContainer}>
            {session ? (
              <Link to="/dashboard" className={styles.loginBtn} style={{ textDecoration: 'none' }}>Dashboard</Link>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className={styles.loginBtn} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Log In</button>
                <button onClick={() => openAuth('signup')} className={styles.signupBtn} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Sign Up Free</button>
              </>
            )}
          </div>
        </div>
      </motion.nav>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
