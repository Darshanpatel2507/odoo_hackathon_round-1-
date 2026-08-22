import { motion, type Variants } from 'framer-motion';
import { MapPin, Wallet, Sparkles } from 'lucide-react';
import styles from './Features.module.css';

const features = [
  {
    icon: <MapPin size={32} />,
    title: 'Plan Multi-City Trips',
    description: 'Organize complex itineraries with ease. Perfect for any adventure.'
  },
  {
    icon: <Wallet size={32} />,
    title: 'Track Your Budget Automatically',
    description: 'Stay on top of your spending with smart budget tracking.'
  },
  {
    icon: <Sparkles size={32} />,
    title: 'AI-Suggested Itineraries',
    description: 'Get personalized recommendations based on your style and interests.'
  }
];

export default function Features() {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

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
          Why GlobeTrotter
        </motion.h2>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} className={styles.card} variants={cardVariants}>
              <div className={styles.iconContainer}>
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
