
import { Mail } from 'lucide-react';
import styles from './TemplatesAndCTA.module.css';

const templates = [
  { id: 1, title: 'European Highlights', meta: '4 Cities', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Morocco Explorer', meta: '3 Cities', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'Italian Classics', meta: '4 Cities', image: 'https://images.unsplash.com/photo-1516483638261-f4085ee20d8f?auto=format&fit=crop&q=80&w=400' },
  { id: 4, title: 'India Golden Triangle', meta: '3 Cities', image: 'https://images.unsplash.com/photo-1605649487212-4dcf0175b5b9?auto=format&fit=crop&q=80&w=400' },
  { id: 5, title: 'Greek Island Hopper', meta: '3 Cities', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=400' },
  { id: 6, title: 'Balkan Road Trip', meta: '4 Cities', image: 'https://images.unsplash.com/photo-1555990204-de15668d277d?auto=format&fit=crop&q=80&w=400' }
];

export default function TemplatesAndCTA() {
  return (
    <>
      <section className={styles.sectionTemplates}>
        <div className={styles.container}>
          <div className={styles.columns}>
            
            {/* Left: Email Capture */}
            <div className={styles.leftCol}>
              <div className={styles.emailCard}>
                <div className={styles.envelopeIcon}>
                  <Mail size={32} />
                </div>
                <h3 className={styles.emailTitle}>Get Early Access</h3>
                <p className={styles.emailDesc}>Be the first to explore new features and plan unforgettable adventures.</p>
                <form className={styles.emailForm} onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Enter your email address" className={styles.emailInput} required />
                  <button type="submit" className={styles.emailBtn}>Notify Me</button>
                </form>
                {/* Decorative dashed line/arrow could go here as SVG */}
              </div>
            </div>

            {/* Right: Templates Grid */}
            <div className={styles.rightCol}>
              <div className={styles.templatesHeader}>
                <h3 className={styles.templatesTitle}>Popular Trip Templates</h3>
                <p className={styles.templatesDesc}>See how other travelers plan their journeys.</p>
              </div>
              
              <div className={styles.templatesGrid}>
                {templates.map(template => (
                  <div key={template.id} className={styles.templateCard}>
                    <div className={styles.templateImageContainer}>
                      <img src={template.image} alt={template.title} className={styles.templateImage} />
                      <div className={styles.copyLabel}>Copy this trip</div>
                    </div>
                    <div className={styles.templateContent}>
                      <h4 className={styles.templateName}>{template.title}</h4>
                      <span className={styles.templateMeta}>{template.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <section className={styles.sectionCta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaHeading}>Ready to plan your next trip?</h2>
          <button className={styles.ctaBtn}>Get Started Free</button>
        </div>
        <div className={styles.desertTexture} />
      </section>
    </>
  );
}
