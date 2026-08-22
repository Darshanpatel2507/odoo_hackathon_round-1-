import { motion } from 'framer-motion';
import { Compass, Map, Wallet, Activity, BookOpen, Folder, Settings, Bell, MapPin } from 'lucide-react';
import styles from './ProductShowcase.module.css';

export default function ProductShowcase() {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.mockupContainer}
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div 
          className={styles.browserWindow}
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Browser Header */}
          <div className={styles.browserHeader}>
            <div className={styles.windowControls}>
              <span className={styles.controlClose} />
              <span className={styles.controlMin} />
              <span className={styles.controlMax} />
            </div>
            <div className={styles.addressBar}>
              globetrotter.app/itinerary
            </div>
            <div className={styles.browserActions}>
              <div className={styles.mockupAction} />
              <div className={styles.mockupAction} />
            </div>
          </div>
          
          {/* Mockup UI Body */}
          <div className={styles.uiBody}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarLogo}>
                <Compass size={24} color="var(--color-primary)" />
                <span>GlobeTrotter</span>
              </div>
              <div className={styles.sidebarNav}>
                <div className={`${styles.navItem} ${styles.active}`}><Map size={18} /> Itinerary</div>
                <div className={styles.navItem}><MapPin size={18} /> Map</div>
                <div className={styles.navItem}><Wallet size={18} /> Budget</div>
                <div className={styles.navItem}><Activity size={18} /> Activities</div>
                <div className={styles.navItem}><BookOpen size={18} /> Notes</div>
                <div className={styles.navItem}><Folder size={18} /> Documents</div>
                <div className={styles.navItem}><Settings size={18} /> Settings</div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className={styles.mainContent}>
              <div className={styles.topBar}>
                <div className={styles.tripTitle}>
                  <h2>Italy Adventure</h2>
                  <p>May 20 - June 2 • 14 Days • 4 Cities</p>
                </div>
                <div className={styles.topActions}>
                  <Bell size={20} className={styles.iconGray} />
                  <div className={styles.avatar} />
                </div>
              </div>
              
              <div className={styles.contentGrid}>
                {/* Itinerary List */}
                <div className={styles.itineraryList}>
                  <h3 className={styles.panelTitle}>Day by Day Plan</h3>
                  <div className={styles.dayCard}>
                    <div className={styles.dayNumber}>1</div>
                    <div className={styles.dayContent}>
                      <h4>Day 1-3 • Rome</h4>
                      <p>Colosseum Tour</p>
                      <p>Testaccio Food Walk</p>
                    </div>
                    <div className={styles.dayImage} style={{backgroundImage: 'url(https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=200&q=80)'}} />
                  </div>
                  <div className={styles.dayCard}>
                    <div className={styles.dayNumber}>2</div>
                    <div className={styles.dayContent}>
                      <h4>Day 4-6 • Florence</h4>
                      <p>Uffizi Gallery</p>
                      <p>Tuscany Wine Experience</p>
                    </div>
                    <div className={styles.dayImage} style={{backgroundImage: 'url(https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=200&q=80)'}} />
                  </div>
                  <div className={styles.dayCard}>
                    <div className={styles.dayNumber}>3</div>
                    <div className={styles.dayContent}>
                      <h4>Day 7-9 • Amalfi Coast</h4>
                      <p>Positano Exploration</p>
                      <p>Boat Day to Capri</p>
                    </div>
                    <div className={styles.dayImage} style={{backgroundImage: 'url(https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200&q=80)'}} />
                  </div>
                </div>
                
                {/* Map Panel Placeholder */}
                <div className={styles.mapPanel}>
                  <h3 className={styles.panelTitle}>Trip Map</h3>
                  <div className={styles.mapGraphic}>
                    {/* Abstract map representation */}
                    <div className={styles.routeLine} />
                    <div className={`${styles.pin} ${styles.pin1}`}><MapPin size={16} color="var(--color-primary)" fill="var(--color-primary)" /><span>Rome</span></div>
                    <div className={`${styles.pin} ${styles.pin2}`}><MapPin size={16} color="var(--color-primary)" fill="var(--color-primary)" /><span>Florence</span></div>
                    <div className={`${styles.pin} ${styles.pin3}`}><MapPin size={16} color="var(--color-primary)" fill="var(--color-primary)" /><span>Venice</span></div>
                  </div>
                </div>
                
                {/* Budget Panel */}
                <div className={styles.budgetPanel}>
                  <h3 className={styles.panelTitle}>Budget Overview</h3>
                  <div className={styles.progressRow}>
                    <span>Overall Progress</span>
                    <span>72%</span>
                  </div>
                  <div className={styles.progressBar}><div className={styles.progressFill} style={{width: '72%'}}/></div>
                  
                  <div className={styles.budgetItems}>
                    <div className={styles.budgetItem}>
                      <div className={styles.budgetIcon}>✈️</div>
                      <span>Transport</span>
                      <span className={styles.budgetValue}>70%</span>
                    </div>
                    <div className={styles.budgetItem}>
                      <div className={styles.budgetIcon}>🎫</div>
                      <span>Activities</span>
                      <span className={styles.budgetValue}>65%</span>
                    </div>
                    <div className={styles.budgetItem}>
                      <div className={styles.budgetIcon}>🍕</div>
                      <span>Food</span>
                      <span className={styles.budgetValue}>75%</span>
                    </div>
                  </div>
                  
                  <div className={styles.companionCard}>
                    <h4>Travel Companion</h4>
                    <p>Let our AI suggest the best experiences and hidden gems for your trip.</p>
                    <button className={styles.suggestBtn}>Get Suggestions</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
