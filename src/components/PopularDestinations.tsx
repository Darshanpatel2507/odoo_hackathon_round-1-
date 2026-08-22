import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PopularDestinations.module.css';

const destinations = [
  {
    id: 1,
    name: 'Santorini, Greece',
    activities: '12 activities',
    image: '/assets/images/destination-santorini.jpg'
  },
  {
    id: 2,
    name: 'Marrakech, Morocco',
    activities: '15 activities',
    image: '/assets/images/destination-marrakech.jpg'
  },
  {
    id: 3,
    name: 'Tuscany, Italy',
    activities: '18 activities',
    image: '/assets/images/destination-tuscany.jpg'
  },
  {
    id: 4,
    name: 'Jaipur, India',
    activities: '14 activities',
    image: '/assets/images/destination-jaipur.jpg'
  }
];

export default function PopularDestinations() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.h2 
          className={`${styles.heading} script-font`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Popular Destinations
        </motion.h2>

        <div className={styles.carouselContainer}>
          <button className={`${styles.navButton} ${styles.prevButton}`} aria-label="Previous">
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.cardsGrid}>
            {destinations.map((dest, index) => (
              <motion.div 
                key={dest.id}
                className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className={styles.imageContainer}>
                  <img src={dest.image} alt={dest.name} className={styles.image} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{dest.name}</h3>
                  <span className={styles.metaBadge}>{dest.activities}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <button className={`${styles.navButton} ${styles.nextButton}`} aria-label="Next">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
