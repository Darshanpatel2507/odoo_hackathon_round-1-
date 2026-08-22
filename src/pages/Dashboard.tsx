import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, MapPin, Wallet, Activity, BookOpen, 
  Folder, Settings, Bell, Plus, Share2, LogOut, ArrowLeft,
  Sparkles, Check, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';

type TabType = 'map' | 'budget' | 'activities' | 'notes' | 'documents' | 'settings';

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

export interface Note {
  id: string;
  trip_name: string;
  content: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [showAiModal, setShowAiModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<string[]>(['Colosseum Tour']);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNoteForm, setNewNoteForm] = useState({ trip_name: '', content: '' });
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'notes') {
      fetchNotes();
    }
  }, [user, activeTab]);

  const fetchNotes = async () => {
    setIsNotesLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        // Insert dummy note
        const dummyNote = {
          user_id: user?.id,
          trip_name: 'Italy Adventure',
          content: 'Packing Essentials:\n- Universal EU power adapters\n- Comfortable walking shoes for cobblestones\n- Modest clothing for Basilica visits (shoulders & knees covered)\n\nRestaurant Bookings:\n- Roscioli Salumeria (Rome) - May 21, 8:30 PM\n- Trattoria Cammillo (Florence) - May 24, 7:45 PM'
        };
        const { data: insertedData, error: insertError } = await supabase
          .from('notes')
          .insert([dummyNote])
          .select();
        
        if (!insertError && insertedData) {
          setNotes(insertedData);
        }
      } else {
        setNotes(data);
      }
    }
    setIsNotesLoading(false);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteForm.trip_name || !newNoteForm.content || !user) return;

    const { data, error } = await supabase
      .from('notes')
      .insert([
        { 
          user_id: user.id, 
          trip_name: newNoteForm.trip_name, 
          content: newNoteForm.content 
        }
      ])
      .select();

    if (!error && data) {
      setNotes([data[0], ...notes]);
      setShowAddNoteModal(false);
      setNewNoteForm({ trip_name: '', content: '' });
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await signOut();
  };

  const toggleActivity = (act: string) => {
    if (completedActivities.includes(act)) {
      if (window.confirm(`Are you sure you want to remove "${act}" from completed activities?`)) {
        setCompletedActivities(completedActivities.filter(a => a !== act));
      }
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
              className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <MapPin size={19} />
              <span>Map</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'budget' ? styles.active : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <Wallet size={19} />
              <span>Budget</span>
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'activities' ? styles.active : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              <Activity size={19} />
              <span>Activities</span>
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
          <div className={styles.userCard}>
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
        <header className={styles.topHeader}>
          <div className={styles.tripHeader}>
            <h1 className={styles.tripTitle}>Italy Adventure</h1>
            <p className={styles.tripSubtitle}>May 20 - June 2 • 14 Days • 4 Cities</p>
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

        {/* Notifications Toast */}
        {showNotificationToast && (
          <div className={styles.notificationToast}>
            <p><strong>✈️ Train Update:</strong> Frecciarossa 9412 to Florence on time.</p>
            <p><strong>🎫 Museum Reminder:</strong> Uffizi Gallery entry booked for 10:30 AM.</p>
          </div>
        )}

        {/* Map Tab View */}
        {activeTab === 'map' && (
          <div className={styles.fullscreenView}>
            <div className={styles.fullMapWrapper}>
              <h2 className={styles.viewHeading}>Complete Italy Route & Transit Breakdown</h2>
              <div className={styles.routeCardsGrid}>
                <div className={styles.routeCard}>
                  <h4>Leg 1: Rome → Florence</h4>
                  <p>🚆 Frecciarossa High-speed rail: 1h 35m</p>
                  <span className={styles.statusTag}>Booked</span>
                </div>
                <div className={styles.routeCard}>
                  <h4>Leg 2: Florence → Venice</h4>
                  <p>🚆 Italo Treno: 2h 05m</p>
                  <span className={styles.statusTag}>Booked</span>
                </div>
                <div className={styles.routeCard}>
                  <h4>Leg 3: Venice → Naples / Amalfi</h4>
                  <p>✈️ Short flight / Scenic train: 3h 40m</p>
                  <span className={styles.statusTagPending}>Suggested</span>
                </div>
              </div>
            </div>
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
                  <h3>₹4,200</h3>
                </div>
                <div className={styles.metricCard}>
                  <span>Total Spent</span>
                  <h3 className={styles.spentColor}>₹3,024 (72%)</h3>
                </div>
                <div className={styles.metricCard}>
                  <span>Remaining</span>
                  <h3 className={styles.remainingColor}>₹1,176</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab View */}
        {activeTab === 'activities' && (
          <div className={styles.fullscreenView}>
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
          </div>
        )}

        {/* Notes Tab View */}
        {activeTab === 'notes' && (
          <div className={styles.fullscreenView}>
            <div className={styles.notesHeaderFlex}>
              <h2 className={styles.viewHeading}>Trip Notes</h2>
              <button className={styles.actionBtnPrimary} onClick={() => setShowAddNoteModal(true)}>
                <Plus size={16} />
                <span>Add Note</span>
              </button>
            </div>
            
            {isNotesLoading ? (
              <p>Loading notes...</p>
            ) : (
              <div className={styles.notesContainer}>
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className={styles.noteBox}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={styles.noteBoxHeader}>
                      <FileText size={18} color="var(--color-primary)" />
                      <h3>{note.trip_name}</h3>
                    </div>
                    <p className={styles.notePreview}>{note.content}</p>
                    <span className={styles.noteDate}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {notes.length === 0 && <p>No notes found. Create one!</p>}
              </div>
            )}
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
                <input type="text" defaultValue="Italy Adventure" />
              </div>
              <div className={styles.formGroup}>
                <label>Primary Currency</label>
                <select defaultValue="EUR">
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
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

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNoteModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddNoteModal(false)}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <FileText size={20} color="var(--color-primary)" />
                  <h3>Add New Note</h3>
                </div>
                <button className={styles.closeBtn} onClick={() => setShowAddNoteModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveNote} className={styles.addNoteForm}>
                <div className={styles.formGroup}>
                  <label>Trip / Tour Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Paris Summer 2026"
                    value={newNoteForm.trip_name}
                    onChange={(e) => setNewNoteForm({...newNoteForm, trip_name: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Note Content</label>
                  <textarea 
                    rows={6}
                    placeholder="Write your notes, itineraries, or packing lists here..."
                    value={newNoteForm.content}
                    onChange={(e) => setNewNoteForm({...newNoteForm, content: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowAddNoteModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitBtn}>Save Note</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className={styles.modalOverlay} onClick={() => setSelectedNote(null)}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <FileText size={20} color="var(--color-primary)" />
                  <h3>{selectedNote.trip_name}</h3>
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedNote(null)}>✕</button>
              </div>

              <div className={styles.viewNoteContent}>
                {selectedNote.content.split('\n').map((line, i) => (
                  <p key={i} style={{ minHeight: '1.2em', margin: '4px 0' }}>{line}</p>
                ))}
              </div>
              <div className={styles.viewNoteFooter}>
                Added on {new Date(selectedNote.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
