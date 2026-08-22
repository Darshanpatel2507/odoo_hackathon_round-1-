import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Copy, CheckCircle2, Wallet, Map, Calendar, ListChecks } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './PopularDestinations.module.css';

export default function PopularDestinations() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await (supabase as any)
      .from('trip_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTemplates(data);
    }
  };

  const nextSlide = () => {
    if (currentIndex < Math.max(0, templates.length - 4)) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={styles.section} id="templates">
      <div className={styles.container}>
        <motion.div 
          className={styles.headerSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className={`${styles.heading} script-font`}>Trip Templates</h2>
          <p className={styles.subheading}>Explore popular destinations or discover community-shared itineraries. Copy the unique 5-digit code to import the complete plan to your dashboard!</p>
        </motion.div>

        <div className={styles.carouselContainer}>
          <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevSlide} disabled={currentIndex === 0}>
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.cardsWrapper}>
            <motion.div 
              className={styles.cardsTrack}
              animate={{ x: `calc(-${currentIndex * (100 / Math.min(4, Math.max(1, templates.length)))}% - ${currentIndex * 16}px)` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {templates.map((template) => (
                <motion.div 
                  key={template.id}
                  className={styles.card}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className={styles.imageContainer}>
                    <img src={template.image_url || '/assets/images/destination-default.jpg'} alt={template.location} className={styles.image} />
                    <div className={styles.codeBadge}>{template.template_code}</div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{template.title}</h3>
                    <div className={styles.cardMeta}>
                      <span>{template.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {templates.length === 0 && (
                <div style={{padding: '40px', width: '100%', textAlign: 'center'}}>Loading templates...</div>
              )}
            </motion.div>
          </div>

          <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextSlide} disabled={currentIndex >= Math.max(0, templates.length - 4)}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className={styles.modalOverlay} onClick={() => setSelectedTemplate(null)}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.modalHeaderImage} style={{ backgroundImage: `url(${selectedTemplate.image_url || '/assets/images/destination-default.jpg'})` }}>
                <button className={styles.closeBtn} onClick={() => setSelectedTemplate(null)}>✕</button>
                <div className={styles.modalHeaderOverlay}>
                  <h2>{selectedTemplate.title}</h2>
                  <p><Map size={16} style={{display: 'inline', marginRight: '5px'}}/> {selectedTemplate.location}</p>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.shareCodeSection}>
                  <div className={styles.shareCodeInfo}>
                    <h4>Template Code</h4>
                    <p>Copy this code to import the full trip plan in your Dashboard!</p>
                  </div>
                  <div className={styles.codeBox} onClick={() => handleCopyCode(selectedTemplate.template_code)}>
                    <span className={styles.codeText}>{selectedTemplate.template_code}</span>
                    <button className={styles.copyBtn}>
                      {copied ? <CheckCircle2 size={20} color="var(--color-primary)" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div className={styles.templateDetails}>
                  <div className={styles.detailCard}>
                    <h4><Wallet size={18}/> Budget Limit</h4>
                    <p>${selectedTemplate.budget_limit || 0}</p>
                  </div>
                  <div className={styles.detailCard}>
                    <h4><Calendar size={18}/> Days Planned</h4>
                    <p>{selectedTemplate.itinerary?.length || 0} Days</p>
                  </div>
                  <div className={styles.detailCard}>
                    <h4><ListChecks size={18}/> Preparation To-Dos</h4>
                    <p>{selectedTemplate.todos?.length || 0} Tasks</p>
                  </div>
                </div>

                <div className={styles.itineraryPreview}>
                  <h3>Itinerary Preview</h3>
                  {selectedTemplate.itinerary && selectedTemplate.itinerary.map((day: any, i: number) => (
                    <div key={i} className={styles.previewDay}>
                      <div className={styles.previewDayNum}>Day {i + 1}</div>
                      <div className={styles.previewDayContent}>
                        <h5>{day.title}</h5>
                        <ul>
                          {day.activities && day.activities.map((act: string, j: number) => (
                            <li key={j}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
