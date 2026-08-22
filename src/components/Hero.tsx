import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

export default function Hero() {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 200]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: 'easeOut' 
      } 
    }
  };

  return (
    <div className={styles.heroWrapper}>
      <motion.div 
        className={styles.heroBackground}
        style={{ y: yBg }}
      />
      <div className={styles.overlay} />
      
      <div className={styles.contentContainer}>
        <motion.div 
          className={styles.textContent}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className={styles.headline}>
            Plan Every Stop of Your Next Adventure.
          </motion.h1>
          <motion.p variants={itemVariants} className={`${styles.subheadline} script-font`}>
            Multi-city trips, one single plan.
          </motion.p>
          
          <motion.div variants={itemVariants} className={styles.searchCard}>
            <div className={styles.searchField}>
              <MapPin className={styles.searchIcon} size={20} />
              <div className={styles.fieldText}>
                <span className={styles.fieldLabel}>Where to</span>
                <input type="text" placeholder="e.g. Italy, Japan, Bali" className={styles.fieldInput} />
              </div>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.searchField}>
              <Calendar className={styles.searchIcon} size={20} />
              <div className={styles.fieldText}>
                <span className={styles.fieldLabel}>Dates</span>
                <input type="text" placeholder="Select dates" className={styles.fieldInput} />
              </div>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.searchField}>
              <Clock className={styles.searchIcon} size={20} />
              <div className={styles.fieldText}>
                <span className={styles.fieldLabel}>Days</span>
                <input type="text" placeholder="Select days" className={styles.fieldInput} />
              </div>
            </div>
            
            <Link to="/signup" className={styles.searchBtn} style={{display: 'inline-flex', textDecoration: 'none'}}>
              Start Planning <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
