import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, LayoutDashboard, Briefcase, MapPin, Wallet, Activity, BookOpen, 
  Folder, Settings, Bell, Plus, Share2, LogOut, ArrowLeft,
  Sparkles, Check, User
} from 'lucide-react';
import ProfileTab from '../components/ProfileTab';
import MyTripsTab, { type Trip } from '../components/MyTripsTab';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

type TabType = 'dashboard' | 'my-trips' | 'budget' | 'activities' | 'notes' | 'documents' | 'settings' | 'profile';

interface DayPlan {
  id: number;
  dayBadge: string;
  title: string;
  days: string;
  city: string;
  activities: string[];
  image: string;
  coordinates: { x: number; y: number };
}

const initialTripDays: DayPlan[] = [
  {
    id: 1,
    dayBadge: '1',
    title: 'Day 1-3 • Rome',
    days: 'May 20 - May 22',
    city: 'Rome',
    activities: ['Colosseum Tour', 'Testaccio Food Walk', 'Trevi Fountain at Sunset', 'Vatican Museums'],
    image: '/assets/images/showcase-rome.jpg',
    coordinates: { x: 38, y: 30 }
  },
  {
    id: 2,
    dayBadge: '2',
    title: 'Day 4-6 • Florence',
    days: 'May 23 - May 25',
    city: 'Florence',
    activities: ['Uffizi Gallery', 'Tuscany Wine Experience', 'Piazzale Michelangelo Sunset', 'Duomo Climb'],
    image: '/assets/images/showcase-florence.jpg',
    coordinates: { x: 50, y: 52 }
  },
  {
    id: 3,
    dayBadge: '3',
    title: 'Day 7-9 • Amalfi Coast',
    days: 'May 26 - May 28',
    city: 'Amalfi Coast',
    activities: ['Positano Exploration', 'Boat Day to Capri', 'Path of the Gods Hike', 'Ravello Gardens'],
    image: '/assets/images/showcase-amalfi.jpg',
    coordinates: { x: 62, y: 78 }
  },
  {
    id: 4,
    dayBadge: '4',
    title: 'Day 10-14 • Venice',
    days: 'May 29 - Jun 2',
    city: 'Venice',
    activities: ["St. Mark's Basilica", 'Gondola Ride', 'Burano Color Walk', 'Doge Palace Secret Passages'],
    image: '/assets/images/showcase-venice.jpg',
    coordinates: { x: 68, y: 22 }
  }
];

const aiSuggestionsList = [
  {
    city: 'Rome',
    title: 'Secret Trastevere Pasta Spot',
    desc: 'Visit Da Enzo al 29 early before opening for authentic cacio e pepe without the wait.',
    tag: 'Culinary'
  },
  {
    city: 'Florence',
    title: 'Sunset at San Miniato al Monte',
    desc: 'Slightly higher than Piazzale Michelangelo with fewer crowds and monastic Gregorian chants at dusk.',
    tag: 'Hidden Gem'
  },
  {
    city: 'Amalfi',
    title: 'Morning Fjord of Furore',
    desc: 'A hidden coastal inlet with emerald water and a secluded pebble beach.',
    tag: 'Scenic'
  },
  {
    city: 'Venice',
    title: 'Cannaregio Evening Cicchetti Tour',
    desc: 'Hop between local wine bars (bàcari) along Fondamenta dei Ormesini.',
    tag: 'Culture'
  }
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [showAiModal, setShowAiModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<string[]>(['Colosseum Tour']);

  const handleLogout = async () => {
    navigate('/');
    await signOut();
  };

  const toggleActivity = (act: string) => {
    if (completedActivities.includes(act)) {
      setCompletedActivities(completedActivities.filter(a => a !== act));
    } else {
      setCompletedActivities([...completedActivities, act]);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link to="/" className={styles.sidebarLogo}>
            <Compass size={28} className={styles.logoIcon} />
            <span className={styles.logoText}>GlobeTrotter</span>
          </Link>

          <nav className={styles.sidebarNav}>
            <button 
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'my-trips' ? styles.active : ''}`}
              onClick={() => setActiveTab('my-trips')}
            >
              <Briefcase size={19} />
              <span>My Trips</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'budget' ? styles.active : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <Wallet size={19} />
              <span>Budget</span>
            </button>

            <button 
              className={`${styles.navItem} ${activeTab === 'notes' ? styles.active : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <BookOpen size={19} />
              <span>Notes</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <Folder size={19} />
              <span>Documents</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={19} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard} onClick={() => setActiveTab('profile')}>
            <div className={styles.userAvatar}>
              {user?.email ? user.email[0].toUpperCase() : 'G'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.email ? user.email.split('@')[0] : 'Traveler'}</span>
              <span className={styles.userPlan}>Explorer Pro</span>
            </div>
          </div>
          <div className={styles.sidebarActions}>
            <Link to="/" className={styles.homeLink}>
              <ArrowLeft size={16} />
              <span>Home</span>
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className={styles.mainCanvas}>
        {/* Top Header */}
        {/* Top Header (Hidden on global tabs) */}
        {activeTab !== 'my-trips' && activeTab !== 'profile' && (
          <header className={styles.topHeader}>
            <div className={styles.tripHeader}>
              <h1 className={styles.tripTitle}>{currentTrip ? currentTrip.title : 'My Workspace'}</h1>
              <p className={styles.tripSubtitle}>{currentTrip ? `${currentTrip.dateRange} • ${currentTrip.location}` : 'Select a trip from My Trips to get started'}</p>
            </div>

            <div className={styles.headerControls}>
              <button 
                className={styles.iconBtn}
                onClick={() => {
                  setShowNotificationToast(!showNotificationToast);
                  setNotificationCount(0);
                }}
                title="Notifications"
              >
                <Bell size={20} />
                {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
              </button>

              <button className={styles.actionBtnSecondary} onClick={() => alert('Trip link copied to clipboard!')}>
                <Share2 size={16} />
                <span>Share</span>
              </button>

              <button className={styles.actionBtnPrimary} onClick={() => setShowAiModal(true)}>
                <Sparkles size={16} />
                <span>AI Guide</span>
              </button>
            </div>
          </header>
        )}

        {/* Notifications Toast */}
        {showNotificationToast && (
          <div className={styles.notificationToast}>
            <p><strong>✈️ Train Update:</strong> Frecciarossa 9412 to Florence on time.</p>
            <p><strong>🎫 Museum Reminder:</strong> Uffizi Gallery entry booked for 10:30 AM.</p>
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className={styles.contentGrid}>
            {/* Left Column: Day by Day Plan */}
            <section className={styles.planSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Day by Day Plan</h2>
                <span className={styles.dayCounter}>{initialTripDays.length} Stops</span>
              </div>

              <div className={styles.dayList}>
                {initialTripDays.map((day) => (
                  <div 
                    key={day.id} 
                    className={`${styles.dayCard} ${selectedDay === day.id ? styles.selectedCard : ''}`}
                    onClick={() => setSelectedDay(day.id)}
                  >
                    <div className={styles.dayBadge}>{day.dayBadge}</div>
                    
                    <div className={styles.dayDetails}>
                      <h3 className={styles.dayCity}>{day.title}</h3>
                      <div className={styles.activityTags}>
                        {day.activities.slice(0, 2).map((act, idx) => (
                          <p key={idx} className={styles.activityItem}>
                            • {act}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div 
                      className={styles.dayThumbnail} 
                      style={{ backgroundImage: `url(${day.image})` }}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Middle Column: Trip Map */}
            <section className={styles.mapSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Trip Map</h2>
                <span className={styles.mapBadge}>Interactive Route</span>
              </div>

              <div className={styles.mapCanvas}>
                {/* SVG Route Connection Lines */}
                <svg className={styles.mapSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M 38 30 Q 42 42 50 52 T 68 22 Q 66 50 62 78" 
                    fill="none" 
                    stroke="var(--color-primary)" 
                    strokeWidth="1.8" 
                    strokeDasharray="3 3"
                    className={styles.animatedRoute}
                  />
                </svg>

                {/* City Pins on Map */}
                {initialTripDays.map((stop) => (
                  <div 
                    key={stop.id}
                    className={`${styles.mapMarker} ${selectedDay === stop.id ? styles.activeMarker : ''}`}
                    style={{ left: `${stop.coordinates.x}%`, top: `${stop.coordinates.y}%` }}
                    onClick={() => setSelectedDay(stop.id)}
                  >
                    <div className={styles.pinDot}>
                      <MapPin size={16} fill="var(--color-primary)" color="var(--color-primary)" />
                    </div>
                    <span className={styles.pinLabel}>{stop.city}</span>
                  </div>
                ))}

                <div className={styles.mapFooterInfo}>
                  <span>📍 {initialTripDays.find(d => d.id === selectedDay)?.city || 'Rome'} Highlighted</span>
                </div>
              </div>
            </section>

            {/* Right Column: Budget Overview & Companion */}
            <section className={styles.budgetSection}>
              <div className={styles.budgetCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Budget Overview</h2>
                </div>

                <div className={styles.progressRow}>
                  <span className={styles.progressLabel}>Overall Progress</span>
                  <span className={styles.progressPercentage}>72%</span>
                </div>
                
                <div className={styles.progressBar}>
                  <motion.div 
                    className={styles.progressFill} 
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                <div className={styles.categoryList}>
                  <div className={styles.categoryItem}>
                    <div className={styles.categoryIconWrap}>✈️</div>
                    <span className={styles.categoryName}>Transport</span>
                    <span className={styles.categoryVal}>70%</span>
                  </div>

                  <div className={styles.categoryItem}>
                    <div className={styles.categoryIconWrap}>🎫</div>
                    <span className={styles.categoryName}>Activities</span>
                    <span className={styles.categoryVal}>65%</span>
                  </div>

                  <div className={styles.categoryItem}>
                    <div className={styles.categoryIconWrap}>🍕</div>
                    <span className={styles.categoryName}>Food</span>
                    <span className={styles.categoryVal}>75%</span>
                  </div>

                  <div className={styles.categoryItem}>
                    <div className={styles.categoryIconWrap}>🏨</div>
                    <span className={styles.categoryName}>Stays</span>
                    <span className={styles.categoryVal}>80%</span>
                  </div>
                </div>

                {/* Travel Companion Box */}
                <div className={styles.companionBox}>
                  <div className={styles.companionHeader}>
                    <Sparkles size={18} color="var(--color-primary)" />
                    <h3 className={styles.companionTitle}>Travel Companion</h3>
                  </div>
                  <p className={styles.companionDesc}>
                    Let our AI suggest the best experiences and hidden gems for your trip.
                  </p>
                  <button 
                    className={styles.suggestBtn}
                    onClick={() => setShowAiModal(true)}
                  >
                    Get Suggestions
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* My Trips Tab View */}
        {activeTab === 'my-trips' && (
          <div className={styles.fullscreenView}>
            <MyTripsTab onOpenTrip={(trip) => {
              setCurrentTrip(trip);
              setActiveTab('activities');
            }} />
          </div>
        )}

        {/* Budget Tab View */}
        {activeTab === 'budget' && (
          <div className={styles.fullscreenView}>
            <div className={styles.budgetTrackerView}>
              <h2 className={styles.viewHeading}>Detailed Trip Budget & Expenses</h2>
              <div className={styles.budgetMetrics}>
                <div className={styles.metricCard}>
                  <span>Total Budget</span>
                  <h3>$4,200</h3>
                </div>
                <div className={styles.metricCard}>
                  <span>Total Spent</span>
                  <h3 className={styles.spentColor}>$3,024 (72%)</h3>
                </div>
                <div className={styles.metricCard}>
                  <span>Remaining</span>
                  <h3 className={styles.remainingColor}>$1,176</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab View */}
        {activeTab === 'activities' && (
          <div className={styles.fullscreenView}>
            {!currentTrip && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-500)' }}>
                <h2>No Trip Selected</h2>
                <p>Go to "My Trips" and select a trip to view its activities.</p>
              </div>
            )}

            {currentTrip?.status === 'completed' && (
              <>
                <h2 className={styles.viewHeading}>Trip Memories & Completed Activities</h2>
                <div className={styles.activityGrid}>
                  <div className={styles.activityDayCard}>
                    <h3>Highlights</h3>
                    <div className={styles.checklist}>
                      <div className={`${styles.checkItem} ${styles.checked}`}>
                        <div className={styles.checkBox}><Check size={14} /></div>
                        <span>Visited the Eiffel Tower</span>
                      </div>
                      <div className={`${styles.checkItem} ${styles.checked}`}>
                        <div className={styles.checkBox}><Check size={14} /></div>
                        <span>Louvre Museum Tour</span>
                      </div>
                      <div className={`${styles.checkItem} ${styles.checked}`}>
                        <div className={styles.checkBox}><Check size={14} /></div>
                        <span>Seine River Cruise</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {currentTrip?.status === 'upcoming' && (
              <>
                <h2 className={styles.viewHeading}>Planning Checklist & To-Dos</h2>
                <div className={styles.activityGrid}>
                  <div className={styles.activityDayCard}>
                    <h3>Before You Go</h3>
                    <div className={styles.checklist}>
                      <div className={styles.checkItem}>
                        <div className={styles.checkBox}></div>
                        <span>Book flight tickets</span>
                      </div>
                      <div className={styles.checkItem}>
                        <div className={styles.checkBox}></div>
                        <span>Reserve hotels</span>
                      </div>
                      <div className={styles.checkItem}>
                        <div className={styles.checkBox}></div>
                        <span>Buy travel insurance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentTrip?.status === 'ongoing' && (
              <>
                <h2 className={styles.viewHeading}>Itinerary Activity Checklist</h2>
                <div className={styles.activityGrid}>
                  {initialTripDays.map(day => (
                    <div key={day.id} className={styles.activityDayCard}>
                      <h3>{day.title}</h3>
                      <div className={styles.checklist}>
                        {day.activities.map((act, i) => {
                          const isDone = completedActivities.includes(act);
                          return (
                            <div 
                              key={i} 
                              className={`${styles.checkItem} ${isDone ? styles.checked : ''}`}
                              onClick={() => toggleActivity(act)}
                            >
                              <div className={styles.checkBox}>
                                {isDone && <Check size={14} />}
                              </div>
                              <span>{act}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Notes Tab View */}
        {activeTab === 'notes' && (
          <div className={styles.fullscreenView}>
            <h2 className={styles.viewHeading}>Trip Notes & Packing Checklist</h2>
            <div className={styles.notesContainer}>
              <div className={styles.noteBox}>
                <h3>Packing Essentials</h3>
                <p>• Universal EU power adapters</p>
                <p>• Comfortable walking shoes for cobblestones</p>
                <p>• Modest clothing for Basilica visits (shoulders & knees covered)</p>
              </div>
              <div className={styles.noteBox}>
                <h3>Restaurant Bookings</h3>
                <p>• Roscioli Salumeria (Rome) - May 21, 8:30 PM</p>
                <p>• Trattoria Cammillo (Florence) - May 24, 7:45 PM</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab View */}
        {activeTab === 'documents' && (
          <div className={styles.fullscreenView}>
            <h2 className={styles.viewHeading}>Travel Documents & Bookings</h2>
            <div className={styles.documentsGrid}>
              <div className={styles.docCard}>
                <Folder size={24} color="var(--color-primary)" />
                <div>
                  <h4>EU Rail Passes</h4>
                  <p>PDF • 1.2 MB</p>
                </div>
              </div>
              <div className={styles.docCard}>
                <Folder size={24} color="var(--color-primary)" />
                <div>
                  <h4>Hotel Reservations</h4>
                  <p>PDF • 2.8 MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab View */}
        {activeTab === 'settings' && (
          <div className={styles.fullscreenView}>
            <h2 className={styles.viewHeading}>Trip Settings & Preferences</h2>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Trip Title</label>
                <input type="text" defaultValue={currentTrip?.title || ''} key={currentTrip?.id || 'default'} placeholder="Enter trip title" />
              </div>
              <div className={styles.formGroup}>
                <label>Primary Currency</label>
                <select defaultValue="EUR">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab View */}
        {activeTab === 'profile' && (
          <div className={styles.fullscreenView} style={{ padding: '24px 0' }}>
            <ProfileTab />
          </div>
        )}
      </main>

      {/* AI Travel Companion Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAiModal(false)}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <Sparkles size={20} color="var(--color-primary)" />
                  <h3>AI Travel Companion Suggestions</h3>
                </div>
                <button className={styles.closeBtn} onClick={() => setShowAiModal(false)}>
                  ✕
                </button>
              </div>

              <div className={styles.suggestionsList}>
                {aiSuggestionsList.map((item, idx) => (
                  <div key={idx} className={styles.suggestionCard}>
                    <div className={styles.suggestionTop}>
                      <span className={styles.suggestionCity}>{item.city}</span>
                      <span className={styles.suggestionTag}>{item.tag}</span>
                    </div>
                    <h4 className={styles.suggestionHeading}>{item.title}</h4>
                    <p className={styles.suggestionBody}>{item.desc}</p>
                    <button 
                      className={styles.addActivityBtn}
                      onClick={() => {
                        alert(`Added "${item.title}" to your itinerary!`);
                        setShowAiModal(false);
                      }}
                    >
                      <Plus size={14} /> Add to Itinerary
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
