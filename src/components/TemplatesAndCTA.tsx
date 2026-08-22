
import { Mail } from 'lucide-react';
import styles from './TemplatesAndCTA.module.css';

const templates = [
  { id: 1, title: 'European Highlights', meta: '4 Cities', image: '/assets/images/template-european-highlights.jpg' },
  { id: 2, title: 'Morocco Explorer', meta: '3 Cities', image: '/assets/images/template-morocco-explorer.jpg' },
  { id: 3, title: 'Italian Classics', meta: '4 Cities', image: '/assets/images/template-italian-classics.jpg' },
  { id: 4, title: 'India Golden Triangle', meta: '3 Cities', image: '/assets/images/template-india-golden-triangle.jpg' },
  { id: 5, title: 'Greek Island Hopper', meta: '3 Cities', image: '/assets/images/template-greek-island-hopper.jpg' },
  { id: 6, title: 'Balkan Road Trip', meta: '4 Cities', image: '/assets/images/template-balkan-road-trip.jpg' }
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
