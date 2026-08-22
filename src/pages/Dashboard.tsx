import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Briefcase, MapPin, Wallet, BookOpen, 
  Folder, Settings, Bell, Plus, Share2, LogOut, ArrowLeft,
  Sparkles, Check, FileText, Shield, FileCheck, ChevronRight,
  Ticket, Download, Trash2, Upload, X
} from 'lucide-react';
import ProfileTab from '../components/ProfileTab';
import MyTripsTab, { type Trip } from '../components/MyTripsTab';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';

type TabType = 'dashboard' | 'my-trips' | 'budget' | 'activities' | 'notes' | 'documents' | 'settings' | 'profile';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
}


interface Tour {
  id: string;
  title: string;
  location: string;
  image_url?: string;
  budgetLimit?: number;
  expenses?: Expense[];
}

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
  trip_id?: string;
  trip_name?: string;
  content: string;
  created_at: string;
}

interface DocumentItem {
  id: string;
  trip_id?: string;
  name: string;
  category: 'Transit' | 'Hotel' | 'Activity' | 'Identity' | 'Insurance' | 'Other';
  fileType: 'PDF' | 'Ticket' | 'Image';
  fileSize: string;
  uploadedAt: string;
  notes?: string;
}

interface AdventureFolder {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  documents: DocumentItem[];
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
  const [selectedDay, setSelectedDay] = useState<number | null>(1);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
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
    if (user) {
      fetchTripsData();
      if (activeTab === 'notes') fetchNotes();
    }
  }, [user, activeTab]);

  const fetchTripsData = async () => {
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user?.id || '');
      
    if (!tripsError && tripsData) {
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*');
        
      const { data: docsData } = await supabase
        .from('documents')
        .select('*');

      const toursData: Tour[] = tripsData.map(t => ({
        id: t.id,
        title: t.title,
        location: t.location,
        budgetLimit: (t as any).budget_limit || 0,
        expenses: (expensesData?.filter(e => (e as any).trip_id === t.id) || []) as Expense[]
      }));
      setTours(toursData);
      
      const folders = tripsData.map(t => {
        const tripDocs = (docsData?.filter(d => (d as any).trip_id === t.id) || []).map((d: any) => ({
          id: d.id,
          trip_id: d.trip_id,
          name: d.file_name || d.name,
          category: d.category || 'Other',
          fileType: d.file_type || 'PDF',
          fileSize: d.file_size || '1.2 MB',
          uploadedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Today',
          notes: d.notes
        })) as DocumentItem[];
        
        return {
          id: t.id,
          title: t.title,
          subtitle: t.location,
          image: (t as any).image_url || '/assets/images/showcase-rome.jpg',
          tag: 'Trip Vault',
          documents: tripDocs
        };
      });
      setAdventureFolders(folders);
    }
  };

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
          user_id: user?.id || '',
          trip_id: 'default',
          trip_name: 'Italy Adventure',
          content: 'Packing Essentials:\n- Universal EU power adapters\n- Comfortable walking shoes for cobblestones\n- Modest clothing for Basilica visits (shoulders & knees covered)\n\nRestaurant Bookings:\n- Roscioli Salumeria (Rome) - May 21, 8:30 PM\n- Trattoria Cammillo (Florence) - May 24, 7:45 PM'
        };
        const { data: insertedData, error: insertError } = await supabase
          .from('notes')
          .insert([dummyNote as any])
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
          user_id: user?.id || '', 
          trip_id: 'default', 
          trip_name: newNoteForm.trip_name, 
          content: newNoteForm.content 
        } as any
      ])
      .select();

    if (!error && data) {
      setNotes([data[0], ...notes]);
      setShowAddNoteModal(false);
      setNewNoteForm({ trip_name: '', content: '' });
    }
  };
  const [tours, setTours] = useState<Tour[]>([]);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedBudgetTrip, setSelectedBudgetTrip] = useState<any>(null);

  const [expenseForm, setExpenseForm] = useState<{
    tripId: string;
    description: string;
    amount: number;
    category: string;
  }>({ tripId: '', description: '', amount: 0, category: 'Food' });

  const handleAddExpenseSubmit = async () => {
    if (!expenseForm.tripId || !expenseForm.description || !expenseForm.amount) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          trip_id: expenseForm.tripId,
          description: expenseForm.description,
          amount: expenseForm.amount,
          category: expenseForm.category
        } as any
      ])
      .select() as any;

    if (!error && data) {
      // Refresh or fetchAllData here
      setExpenseForm({ tripId: selectedBudgetTrip?.id || '', description: '', amount: 0, category: 'Food' });
    }
  };

  

  
  // Document Section States
  const [adventureFolders, setAdventureFolders] = useState<AdventureFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentItem['category']>('Transit');
  const [newDocType, setNewDocType] = useState<DocumentItem['fileType']>('PDF');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Add Document Handler
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !selectedFolderId) return;

    const uploadDoc = async () => {
      const { data, error } = await supabase.from('documents').insert([
        {
          user_id: user?.id || '',
          trip_id: selectedFolderId,
          file_name: newDocTitle.trim(),
          file_url: 'placeholder_url',
          category: newDocCategory,
          notes: newDocNotes.trim()
        } as any
      ]).select();
      
      if (!error && data) {
        const docData = data[0] as any;
        const newDoc: DocumentItem = {
          id: docData.id,
          name: docData.file_name || docData.name,
          category: (docData.category as any) || 'Transit',
          fileType: newDocType,
          fileSize: `1.5 MB`,
          uploadedAt: new Date(docData.created_at || new Date()).toLocaleDateString(),
          notes: docData.notes || undefined
        };setAdventureFolders(prev => prev.map(folder => {
          if (folder.id === selectedFolderId) {
            return {
              ...folder,
              documents: [newDoc, ...folder.documents]
            };
          }
          return folder;
        }));
        
        setNewDocTitle('');
        setNewDocCategory('Transit');
        setNewDocType('PDF');
        setNewDocNotes('');
        setShowAddDocModal(false);
        setToastMessage(`Added document!`);
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert("Error saving document!");
      }
    };
    uploadDoc();
  };

  // Delete Document Handler
  const handleDeleteDocument = (folderId: string, docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}"?`)) return;
    setAdventureFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          documents: folder.documents.filter(d => d.id !== docId)
        };
      }
      return folder;
    }));
  };

  const activeAdventureFolder = adventureFolders.find(f => f.id === selectedFolderId);

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
              onClick={() => {
                setActiveTab('documents');
              }}
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
        {/* Top Header */}
        {activeTab === 'my-trips' && (
          <header className={styles.topHeader}>
            <div className={styles.tripHeader}>
              <h1 className={styles.tripTitle}>
                {currentTrip ? currentTrip.title : 'My Workspace'}
              </h1>
              <p className={styles.tripSubtitle}>
                {currentTrip ? `${currentTrip.dateRange} • ${currentTrip.location}` : 'Select a trip from My Trips to get started'}
              </p>
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

        {/* Action Toast Notification */}
        {toastMessage && (
          <div className={styles.notificationToast}>
            <p>✅ <strong>Success:</strong> {toastMessage}</p>
          </div>
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
            <MyTripsTab trips={tours as any} onOpenTrip={(trip) => {
              setCurrentTrip(trip);
              setActiveTab('activities');
            }} />
          </div>
        )}

        {/* Budget Tab View */}
        {activeTab === 'budget' && (
          <div className={styles.fullscreenView}>
            <div className={styles.budgetHeader}>
              <h2 className={styles.viewHeading}>Detailed Trip Budget & Expenses</h2>
            </div>
            
            <div className={styles.budgetGrid}>
              {tours.map(tour => {
                const tourTotalSpent = tour.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0;

                return (
                  <div 
                    key={tour.id} 
                    className={styles.budgetBlock} 
                    onClick={() => {
                      setSelectedBudgetTrip(tour);
                      setExpenseForm({ ...expenseForm, tripId: tour.id });
                      setShowBudgetModal(true);
                    }}
                  >
                    <h3>{tour.title}</h3>
                    <div className={styles.budgetSummaryRow}>
                      <div className={styles.budgetStat}>
                        <span className={styles.budgetLabel}>Budget Limit</span>
                        <span className={styles.budgetValue}>${tour.budgetLimit}</span>
                      </div>
                      <div className={styles.budgetStat}>
                        <span className={styles.budgetLabel}>Total Spent</span>
                        <span className={`${styles.budgetValue} ${tourTotalSpent > (tour.budgetLimit || 0) && (tour.budgetLimit || 0) > 0 ? styles.overBudget : ''}`}>${tourTotalSpent}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tours.length === 0 && (
                <div className={styles.emptyState}>
                  <Wallet size={48} color="var(--color-gray-400)" />
                  <h3>No trips found</h3>
                  <p>Create a trip first to manage its budget.</p>
                </div>
              )}
            </div>

            {/* Budget Expenses Modal */}
            <AnimatePresence>
              {showBudgetModal && selectedBudgetTrip && (
                <div className={styles.modalOverlay} onClick={() => setShowBudgetModal(false)}>
                  <motion.div 
                    className={styles.modalContent}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{ maxWidth: '600px', width: '90%' }}
                  >
                    <div className={styles.modalHeader}>
                      <div className={styles.modalTitle}>
                        <Wallet size={20} color="var(--color-primary)" />
                        <h3>{selectedBudgetTrip.title} Expenses</h3>
                      </div>
                      <button className={styles.closeBtn} onClick={() => setShowBudgetModal(false)}>✕</button>
                    </div>

                    <div className={styles.expensesListModal}>
                      {!selectedBudgetTrip.expenses || selectedBudgetTrip.expenses.length === 0 ? (
                        <p className={styles.emptyText}>No expenses added yet.</p>
                      ) : (
                        selectedBudgetTrip.expenses.map((exp: any) => (
                          <div key={exp.id} className={styles.expenseItemRow}>
                            <div className={styles.expenseInfo}>
                              <span className={styles.expenseDesc}>{exp.description}</span>
                              <span className={styles.expenseCat}>{exp.category}</span>
                            </div>
                            <span className={styles.expenseAmt}>${exp.amount}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className={styles.addExpenseSection}>
                      <h4>Add New Expense</h4>
                      <div className={styles.expenseFormGrid}>
                        <input 
                          type="text" 
                          placeholder="Description (e.g. Dinner)" 
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                          className={styles.formInput}
                        />
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={expenseForm.amount || ''}
                          onChange={(e) => setExpenseForm({...expenseForm, amount: Number(e.target.value)})}
                          className={styles.formInput}
                        />
                        <select 
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                          className={styles.formInput}
                        >
                          <option>Food</option>
                          <option>Transport</option>
                          <option>Accommodation</option>
                          <option>Activities</option>
                          <option>Other</option>
                        </select>
                        <button className={styles.submitBtn} onClick={handleAddExpenseSubmit}>Add Expense</button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
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

        {/* FULL PAGE DOCUMENTS VAULT */}
        {activeTab === 'documents' && (
          <div className={styles.documentsContainer}>
            {/* View A: Adventure Folder Blocks Selection */}
            {selectedFolderId === null ? (
              <div className={styles.adventureFoldersView}>
                <div className={styles.docVaultHeader}>
                  <div>
                    <h2 className={styles.vaultTitle}>Adventure Document Vaults</h2>
                    <p className={styles.vaultSubtitle}>
                      Select an adventure destination block to view, organize, or add travel documents.
                    </p>
                  </div>
                  <div className={styles.vaultBadge}>
                    <Shield size={16} />
                    <span>3 Secure Vaults</span>
                  </div>
                </div>

                <div className={styles.adventureGridBlocks}>
                  {adventureFolders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      className={styles.adventureFolderCard}
                      onClick={() => setSelectedFolderId(folder.id)}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    >
                      <div 
                        className={styles.folderImageCover}
                        style={{ backgroundImage: `url(${folder.image})` }}
                      >
                        <span className={styles.folderRegionTag}>{folder.tag}</span>
                        <span className={styles.folderCountTag}>
                          <FileCheck size={14} />
                          {folder.documents.length} Files
                        </span>
                      </div>

                      <div className={styles.folderCardBody}>
                        <div className={styles.folderTitleRow}>
                          <h3 className={styles.folderHeading}>{folder.title}</h3>
                          <div className={styles.openArrowBtn}>
                            <ChevronRight size={18} />
                          </div>
                        </div>
                        <p className={styles.folderSubtext}>{folder.subtitle}</p>

                        <div className={styles.folderFooter}>
                          <span className={styles.folderActionHint}>Click to open documents</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* View B: Inside Clicked Adventure Block */
              activeAdventureFolder && (
                <div className={styles.adventureDetailView}>
                  {/* Top Navigation & Action Header */}
                  <div className={styles.adventureDetailTopBar}>
                    <button 
                      className={styles.backToFoldersBtn}
                      onClick={() => setSelectedFolderId(null)}
                    >
                      <ArrowLeft size={16} />
                      <span>Back to All Adventures</span>
                    </button>

                    <button 
                      className={styles.addDocPrimaryBtn}
                      onClick={() => setShowAddDocModal(true)}
                    >
                      <Plus size={18} />
                      <span>Add Document</span>
                    </button>
                  </div>

                  <div className={styles.adventureHeaderBanner}>
                    <div className={styles.bannerInfo}>
                      <span className={styles.bannerTag}>{activeAdventureFolder.tag}</span>
                      <h2 className={styles.bannerTitle}>{activeAdventureFolder.title}</h2>
                      <p className={styles.bannerSub}>{activeAdventureFolder.subtitle}</p>
                    </div>
                    <div className={styles.bannerStats}>
                      <span className={styles.totalFilesCount}>
                        {activeAdventureFolder.documents.length} Total Documents
                      </span>
                    </div>
                  </div>

                  {/* Documents List / Grid */}
                  <div className={styles.docsListContainer}>
                    {activeAdventureFolder.documents.length === 0 ? (
                      <div className={styles.emptyDocsBox}>
                        <Folder size={48} className={styles.emptyIcon} />
                        <h3>No documents added yet</h3>
                        <p>Click the "Add Document" button above to upload your first travel file.</p>
                        <button 
                          className={styles.addDocPrimaryBtn}
                          onClick={() => setShowAddDocModal(true)}
                        >
                          <Plus size={16} />
                          <span>Add Document</span>
                        </button>
                      </div>
                    ) : (
                      <div className={styles.docsGrid}>
                        {activeAdventureFolder.documents.map((doc) => (
                          <div key={doc.id} className={styles.docFileCard}>
                            <div className={styles.docCardTop}>
                              <div className={styles.docIconWrapper}>
                                {doc.category === 'Transit' && <Compass size={22} color="var(--color-primary)" />}
                                {doc.category === 'Activity' && <Ticket size={22} color="#D96538" />}
                                {doc.category === 'Hotel' && <BookOpen size={22} color="#E8A33D" />}
                                {doc.category === 'Insurance' && <Shield size={22} color="#27C93F" />}
                                {(doc.category === 'Identity' || doc.category === 'Other') && <FileText size={22} color="#6B5D50" />}
                              </div>
                              <span className={styles.docCategoryBadge}>{doc.category}</span>
                            </div>

                            <h4 className={styles.docCardTitle}>{doc.name}</h4>
                            
                            {doc.notes && (
                              <p className={styles.docNotesText}>📌 {doc.notes}</p>
                            )}

                            <div className={styles.docMetaRow}>
                              <span>{doc.fileType} • {doc.fileSize}</span>
                              <span>Added {doc.uploadedAt}</span>
                            </div>

                            <div className={styles.docCardActions}>
                              <button 
                                className={styles.downloadDocBtn}
                                onClick={() => alert(`Downloading "${doc.name}" (${doc.fileSize})...`)}
                              >
                                <Download size={14} />
                                <span>Download</span>
                              </button>
                              
                              <button 
                                className={styles.deleteDocBtn}
                                onClick={() => handleDeleteDocument(activeAdventureFolder.id, doc.id, doc.name)}
                                title="Delete Document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
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
                  <option value="INR">INR (₹)</option>
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

      {/* Add Document Form Modal */}
      <AnimatePresence>
        {showAddDocModal && activeAdventureFolder && (
          <div className={styles.modalOverlay} onClick={() => setShowAddDocModal(false)}>
            <motion.div 
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <Upload size={22} color="var(--color-primary)" />
                  <h3>Add Document to {activeAdventureFolder.title}</h3>
                </div>
                <button className={styles.closeBtn} onClick={() => setShowAddDocModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddDocument} className={styles.addDocForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="docTitle">Document Name / Description *</label>
                  <input 
                    id="docTitle"
                    type="text" 
                    placeholder="e.g. Flight Confirmation, Hotel Voucher, Entry Pass"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="docCategory">Category</label>
                    <select 
                      id="docCategory"
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value as DocumentItem['category'])}
                    >
                      <option value="Transit">Transit (Flight / Train / Ferry)</option>
                      <option value="Hotel">Hotel / Accommodation</option>
                      <option value="Activity">Activity / Tour Ticket</option>
                      <option value="Identity">Identity / Visa / Passport</option>
                      <option value="Insurance">Travel Insurance</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="docType">Format</label>
                    <select 
                      id="docType"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as DocumentItem['fileType'])}
                    >
                      <option value="PDF">PDF File</option>
                      <option value="Ticket">Mobile QR / Ticket</option>
                      <option value="Image">JPEG / PNG Image</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Upload File</label>
                  <div className={styles.uploadDropZone}>
                    <Upload size={28} className={styles.uploadIcon} />
                    <p><strong>Click to browse</strong> or drag & drop travel document</p>
                    <span>Supports PDF, PNG, JPG up to 25MB</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="docNotes">Notes / Reference No. (Optional)</label>
                  <input 
                    id="docNotes"
                    type="text" 
                    placeholder="e.g. Booking ID #99281, Seat 12A, Gates open 08:30"
                    value={newDocNotes}
                    onChange={(e) => setNewDocNotes(e.target.value)}
                  />
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={() => setShowAddDocModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitDocBtn}
                  >
                    <Plus size={16} />
                    <span>Upload Document</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
