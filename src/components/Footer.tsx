import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <motion.footer 
      className={styles.footer}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.texture} />
      
      <div className={styles.container}>
        <div className={styles.logo}>
          <Compass size={40} />
        </div>
        
        <nav className={styles.nav}>
          <a href="#">Home</a>
          <a href="#">Explore</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
        
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} GlobeTrotter. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}
