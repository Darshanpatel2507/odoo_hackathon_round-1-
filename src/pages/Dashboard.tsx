import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, MapPin, Wallet, Activity, BookOpen, 
  Folder, Settings, Bell, Plus, Share2, LogOut, ArrowLeft,
  Sparkles, Check, FileText, Shield, FileCheck, ChevronRight,
  Ticket, Download, Trash2, Upload, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';

type TabType = 'map' | 'budget' | 'activities' | 'notes' | 'documents' | 'settings';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface Destination {
  id: string;
  name: string;
  budgetLimit: number;
  expenses: Expense[];
}

interface Tour {
  id: string;
  title: string;
  destinations: Destination[];
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
  trip_name: string;
  content: string;
  created_at: string;
}

interface DocumentItem {
  id: string;
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

const initialAdventureFolders: AdventureFolder[] = [
  {
    id: 'italy',
    title: 'Italy Adventure',
    subtitle: 'Rome • Florence • Venice • Amalfi Coast',
    image: '/assets/images/showcase-rome.jpg',
    tag: 'Europe',
    documents: [
      {
        id: 'doc-it-1',
        name: 'EU Rail Pass - Frecciarossa High-Speed',
        category: 'Transit',
        fileType: 'PDF',
        fileSize: '1.4 MB',
        uploadedAt: 'May 18, 2026',
        notes: 'Coach 4, Seat 21A & 21B'
      },
      {
        id: 'doc-it-2',
        name: 'Rome Boutique Hotel Voucher & Check-in',
        category: 'Hotel',
        fileType: 'PDF',
        fileSize: '2.1 MB',
        uploadedAt: 'May 19, 2026',
        notes: 'Check-in: 02:00 PM'
      },
      {
        id: 'doc-it-3',
        name: 'Colosseum VIP Guided Tour Tickets',
        category: 'Activity',
        fileType: 'Ticket',
        fileSize: '850 KB',
        uploadedAt: 'May 20, 2026',
        notes: 'Priority Gladiator Arena Gate'
      },
      {
        id: 'doc-it-4',
        name: 'International Travel Health Insurance',
        category: 'Insurance',
        fileType: 'PDF',
        fileSize: '3.2 MB',
        uploadedAt: 'May 15, 2026',
        notes: 'Policy #GLB-IT-99201'
      }
    ]
  },
  {
    id: 'switzerland',
    title: 'Switzerland Adventure',
    subtitle: 'Zurich • Interlaken • Zermatt • Lucerne',
    image: '/assets/images/template-european-highlights.jpg',
    tag: 'Alps',
    documents: [
      {
        id: 'doc-ch-1',
        name: 'Swiss Travel Pass Consecutive 8-Day Pass',
        category: 'Transit',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        uploadedAt: 'Jun 10, 2026',
        notes: 'Valid across all SBB trains & mountain boats'
      },
      {
        id: 'doc-ch-2',
        name: 'Jungfraujoch Top of Europe Mountain Rail Pass',
        category: 'Activity',
        fileType: 'Ticket',
        fileSize: '920 KB',
        uploadedAt: 'Jun 12, 2026',
        notes: 'Eiger Express cable car included'
      },
      {
        id: 'doc-ch-3',
        name: 'Zermatt Matterhorn Chalet Reservation',
        category: 'Hotel',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        uploadedAt: 'Jun 14, 2026',
        notes: 'Balcony with direct Matterhorn view'
      }
    ]
  },
  {
    id: 'vadodara',
    title: 'Vadodara Adventure',
    subtitle: 'Laxmi Vilas • Sayaji Baug • Statue of Unity • Champaner',
    image: '/assets/images/template-india-golden-triangle.jpg',
    tag: 'Heritage',
    documents: [
      {
        id: 'doc-vd-1',
        name: 'IndiGo Flight Confirmation (DEL → BDQ)',
        category: 'Transit',
        fileType: 'PDF',
        fileSize: '1.1 MB',
        uploadedAt: 'Jul 02, 2026',
        notes: 'Flight 6E-2419 • Terminal 1'
      },
      {
        id: 'doc-vd-2',
        name: 'Laxmi Vilas Palace Royal Heritage Pass',
        category: 'Activity',
        fileType: 'Ticket',
        fileSize: '780 KB',
        uploadedAt: 'Jul 04, 2026',
        notes: 'Includes Audio Guide & Maharaja Fatehsingh Museum'
      },
      {
        id: 'doc-vd-3',
        name: 'Grand Mercure Vadodara Surya Palace Stay',
        category: 'Hotel',
        fileType: 'PDF',
        fileSize: '1.9 MB',
        uploadedAt: 'Jul 03, 2026',
        notes: 'Deluxe Suite • Breakfast Included'
      }
    ]
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
  const [tours, setTours] = useState<Tour[]>([
    {
      id: 't1',
      title: 'Italy Adventure',
      destinations: [
        {
          id: 'd1',
          name: 'Rome',
          budgetLimit: 1500,
          expenses: [
            { id: 'e1', description: 'Colosseum Tickets', amount: 50, category: 'Activities' },
            { id: 'e2', description: 'Dinner at Trastevere', amount: 80, category: 'Food' }
          ]
        },
        {
          id: 'd2',
          name: 'Florence',
          budgetLimit: 1200,
          expenses: [
            { id: 'e3', description: 'Train to Florence', amount: 45, category: 'Transport' },
            { id: 'e4', description: 'Uffizi Gallery', amount: 35, category: 'Activities' }
          ]
        }
      ]
    },
    {
      id: 't2',
      title: 'France Getaway',
      destinations: [
        {
          id: 'd3',
          name: 'Paris',
          budgetLimit: 2000,
          expenses: [
            { id: 'e5', description: 'Eiffel Tower', amount: 30, category: 'Activities' },
            { id: 'e6', description: 'Hotel Stay', amount: 500, category: 'Stays' }
          ]
        }
      ]
    }
  ]);

  const [expenseForm, setExpenseForm] = useState<{
    tourId: string;
    destinationId: string;
    description: string;
    amount: string;
    category: string;
  } | null>(null);

  const handleAddExpenseSubmit = () => {
    if (!expenseForm || !expenseForm.description || !expenseForm.amount) return;
    
    setTours(prevTours => prevTours.map(tour => {
      if (tour.id === expenseForm.tourId) {
        return {
          ...tour,
          destinations: tour.destinations.map(dest => {
            if (dest.id === expenseForm.destinationId) {
              return {
                ...dest,
                expenses: [...dest.expenses, {
                  id: Date.now().toString(),
                  description: expenseForm.description,
                  amount: parseFloat(expenseForm.amount),
                  category: expenseForm.category || 'Other'
                }]
              };
            }
            return dest;
          })
        };
      }
      return tour;
    }));
    
    setExpenseForm(null);
  };

  const handleSaveBudget = () => {
    const confirmSave = window.confirm("Are you sure you want to save this budget? Please review all the details before confirming.");
    if (confirmSave) {
      alert("Budget successfully saved!");
    }
  };
  // Document Section States
  const [adventureFolders, setAdventureFolders] = useState<AdventureFolder[]>(initialAdventureFolders);
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

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: newDocTitle.trim(),
      category: newDocCategory,
      fileType: newDocType,
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      uploadedAt: 'Today',
      notes: newDocNotes.trim() || undefined
    };

    setAdventureFolders(prev => prev.map(folder => {
      if (folder.id === selectedFolderId) {
        return {
          ...folder,
          documents: [newDoc, ...folder.documents]
        };
      }
      return folder;
    }));

    // Reset Form
    setNewDocTitle('');
    setNewDocCategory('Transit');
    setNewDocType('PDF');
    setNewDocNotes('');
    setShowAddDocModal(false);

    // Toast
    setToastMessage(`Added "${newDoc.name}" to documents!`);
    setTimeout(() => setToastMessage(null), 3500);
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
            <h1 className={styles.tripTitle}>
              {activeTab === 'documents' 
                ? 'Travel Documents' 
                : 'Italy Adventure'}
            </h1>
            <p className={styles.tripSubtitle}>
              {activeTab === 'documents'
                ? 'Store, manage, and access boarding passes, hotel reservations, and activity tickets.'
                : 'May 20 - June 2 • 14 Days • 4 Cities'}
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
            <div className={styles.budgetHeader}>
              <h2 className={styles.viewHeading}>Detailed Trip Budget & Expenses</h2>
              <button className={styles.actionBtnPrimary} onClick={handleSaveBudget}>Save Budget</button>
            </div>
            
            <div className={styles.toursList}>
              {tours.map(tour => {
                const tourTotalBudget = tour.destinations.reduce((acc, d) => acc + d.budgetLimit, 0);
                const tourTotalSpent = tour.destinations.reduce((acc, d) => 
                  acc + d.expenses.reduce((eAcc, e) => eAcc + e.amount, 0)
                , 0);

                return (
                  <div key={tour.id} className={styles.tourBox}>
                    <div className={styles.tourHeader}>
                      <h3>{tour.title}</h3>
                      <div className={styles.tourSummary}>
                        <span>Limit: ₹{tourTotalBudget}</span>
                        <span className={styles.spentColor}>Spent: ₹{tourTotalSpent}</span>
                      </div>
                    </div>
                    
                    <div className={styles.destinationsList}>
                      {tour.destinations.map(dest => {
                        const destSpent = dest.expenses.reduce((acc, e) => acc + e.amount, 0);
                        
                        return (
                          <div key={dest.id} className={styles.destinationBox}>
                            <div className={styles.destinationHeader}>
                              <h4>{dest.name}</h4>
                              <div className={styles.destSummary}>
                                <span>Limit: ₹{dest.budgetLimit}</span>
                                <span className={styles.spentColor}>Spent: ₹{destSpent}</span>
                              </div>
                            </div>
                            
                            <div className={styles.expenseList}>
                              {dest.expenses.map(exp => (
                                <div key={exp.id} className={styles.expenseItem}>
                                  <div className={styles.expenseInfo}>
                                    <span className={styles.expenseDesc}>{exp.description}</span>
                                    <span className={styles.expenseCat}>{exp.category}</span>
                                  </div>
                                  <span className={styles.expenseAmt}>₹{exp.amount}</span>
                                </div>
                              ))}
                            </div>
                            
                            {expenseForm?.destinationId === dest.id ? (
                              <div className={styles.addExpenseForm}>
                                <input 
                                  type="text" 
                                  placeholder="Expense description" 
                                  value={expenseForm.description}
                                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                                  className={styles.expenseInput}
                                />
                                <input 
                                  type="number" 
                                  placeholder="Amount" 
                                  value={expenseForm.amount}
                                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                                  className={styles.expenseInput}
                                />
                                <select 
                                  value={expenseForm.category}
                                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                                  className={styles.expenseInput}
                                >
                                  <option value="Transport">Transport</option>
                                  <option value="Activities">Activities</option>
                                  <option value="Food">Food</option>
                                  <option value="Stays">Stays</option>
                                  <option value="Other">Other</option>
                                </select>
                                <button className={styles.saveExpenseBtn} onClick={handleAddExpenseSubmit}>Add</button>
                                <button className={styles.cancelExpenseBtn} onClick={() => setExpenseForm(null)}>Cancel</button>
                              </div>
                            ) : (
                              <button 
                                className={styles.addExpenseBtn} 
                                onClick={() => setExpenseForm({ tourId: tour.id, destinationId: dest.id, description: '', amount: '', category: 'Food' })}
                              >
                                + Add Expense
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
