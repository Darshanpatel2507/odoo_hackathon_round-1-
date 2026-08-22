import { motion } from 'framer-motion';
import { Camera, Mountain, Utensils, Building, Cloud } from 'lucide-react';
import styles from './AdventureGrid.module.css';

const adventures = [
  {
    id: 1,
    title: 'Desert Safari',
    icon: <Camera size={20} />,
    image: 'https://images.unsplash.com/photo-1547432426-f76239401764?auto=format&fit=crop&q=80&w=800',
    className: styles.largeTile
  },
  {
    id: 2,
    title: 'Hiking',
    icon: <Mountain size={20} />,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800',
    className: styles.smallTile
  },
  {
    id: 3,
    title: 'Food Tour',
    icon: <Utensils size={20} />,
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4859?auto=format&fit=crop&q=80&w=800',
    className: styles.smallTile
  },
  {
    id: 4,
    title: 'Museum',
    icon: <Building size={20} />,
    image: 'https://images.unsplash.com/photo-1564399580075-5bfc198b9eb9?auto=format&fit=crop&q=80&w=800',
    className: styles.smallTile
  },
  {
    id: 5,
    title: 'Hot Air Balloon',
    icon: <Cloud size={20} />,
    image: 'https://images.unsplash.com/photo-1517454045558-b118b622c8cb?auto=format&fit=crop&q=80&w=800',
    className: styles.smallTile
  }
];

export default function AdventureGrid() {
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
          Have an Adventure Today
        </motion.h2>

        <div className={styles.grid}>
          {adventures.map((adv, index) => (
            <motion.div 
              key={adv.id}
              className={`${styles.tile} ${adv.className}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            >
              <div className={styles.imageContainer}>
                <img src={adv.image} alt={adv.title} className={styles.image} />
              </div>
              <div className={styles.overlay} />
              <div className={styles.content}>
                <div className={styles.icon}>{adv.icon}</div>
                <h3 className={styles.title}>{adv.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
