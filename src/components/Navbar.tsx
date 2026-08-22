import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Compass className={styles.logoIcon} size={32} />
          <span className={styles.logoText}>GlobeTrotter</span>
        </div>
        
        <div className={styles.linksContainer}>
          <a href="#explore" className={styles.navLink}>Explore</a>
          <a href="#how-it-works" className={styles.navLink}>How it Works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
        </div>
        
        <div className={styles.actionsContainer}>
          <button className={styles.loginBtn}>Log In</button>
          <button className={styles.signupBtn}>Sign Up Free</button>
        </div>
      </div>
    </motion.nav>
  );
}
