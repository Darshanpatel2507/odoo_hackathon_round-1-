import { useState } from 'react';
import { MapPin, Calendar, CheckCircle, Clock, Navigation, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import styles from './MyTripsTab.module.css';

export type TripStatus = 'ongoing' | 'upcoming' | 'completed';

export interface Trip {
  id: string;
  title: string;
  location: string;
  dateRange: string;
  image: string;
  status: TripStatus;
  progress?: number; // For ongoing trips
}

interface MyTripsTabProps {
  onOpenTrip: (trip: Trip) => void;
  trips: Trip[];
  onTripAdded?: () => void;
}


function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function MyTripsTab({ onOpenTrip, trips, onTripAdded }: MyTripsTabProps) {
  const [activeFilter, setActiveFilter] = useState<TripStatus | 'all'>('all');
  
const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateCode, setTemplateCode] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    location: '', 
    startDate: '', 
    endDate: '',
    status: 'upcoming' as TripStatus,
    itinerary: [{ id: generateId(), title: 'Day 1', places: [''] }],
    todos: [{ id: generateId(), text: '', isCompleted: false }],
    budgetLimit: 0
  });

    const handleImportTemplate = async () => {
    if (!templateCode || templateCode.length !== 5) {
      alert("Please enter a valid 5-digit template code.");
      return;
    }
    setIsImporting(true);
    const { data, error } = await (supabase as any).from('trip_templates').select('*').eq('template_code', templateCode).single() as any;
    if (error || !data) {
      alert("Template not found! Please check the code.");
      setIsImporting(false);
      return;
    }
    
    setFormData({
      ...formData,
      title: data.title,
      location: data.location,
      budgetLimit: data.budget_limit || 0,
      itinerary: data.itinerary || [],
      todos: data.todos || []
    });
    setTemplateCode('');
    setIsImporting(false);
    alert("Template imported successfully! Review and click Create Trip.");
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    // Format date string as 'Start - End' for legacy support
    const dateRangeStr = `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`;
    
    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          user_id: user.id,
          title: formData.title,
          location: formData.location,
          date_range: dateRangeStr,
          status: formData.status,
          image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
          itinerary: formData.itinerary,
          todos: formData.todos,
          budget_limit: formData.budgetLimit
        } as any
      ])
      .select() as any;

    if (!error && data) {
      setShowModal(false);
      setFormData({ 
        title: '', location: '', startDate: '', endDate: '', status: 'upcoming',
        itinerary: [{ id: generateId(), title: 'Day 1', places: [''] }],
        todos: [{ id: generateId(), text: '', isCompleted: false }],
        budgetLimit: 0
      });
      if (onTripAdded) onTripAdded();
    }
    setIsSubmitting(false);
  };

  const filteredTrips = activeFilter === 'all' 
    ? trips 
    : trips.filter(trip => trip.status === activeFilter);

    const handleShareTemplate = async (trip: any) => {
    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit random code
    const { error } = await (supabase as any).from('trip_templates').insert([{
      user_id: user?.id,
      template_code: code,
      title: trip.title,
      location: trip.location,
      image_url: trip.image_url,
      itinerary: trip.itinerary,
      todos: trip.todos,
      budget_limit: trip.budget_limit || 0
    } as any]);

    if (!error) {
      alert(`Trip shared successfully! Your template code is: ${code}\nAnyone can use this code to import your trip template.`);
    } else {
      alert("Failed to share template.");
    }
  };

  const getStatusIcon = (status: TripStatus) => {
    switch (status) {
      case 'ongoing': return <Navigation size={16} />;
      case 'upcoming': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
    }
  };

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case 'ongoing': return 'Ongoing';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerTop}>
        <div>
          <h2 className={styles.title}>My Trips</h2>
          <p className={styles.subtitle}>Manage all your past, present, and future adventures.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={20} />
          New Trip
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Create New Trip</h3>
            <form onSubmit={handleCreateTrip} className={styles.scrollableForm}>
              <div className={styles.formGroup} style={{ backgroundColor: 'rgba(193, 80, 46, 0.05)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--color-primary)' }}>
                <label style={{ color: 'var(--color-primary)' }}>Import from Template Code (Optional)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={templateCode} onChange={e => setTemplateCode(e.target.value)} className={styles.formInput} placeholder="e.g. 84920" maxLength={5} style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1.2rem', textTransform: 'uppercase' }} />
                  <button type="button" onClick={handleImportTemplate} disabled={isImporting} className={styles.primaryOutlineBtn} style={{ whiteSpace: 'nowrap' }}>
                    {isImporting ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Trip Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={styles.formInput} placeholder="e.g. Summer in Italy" />
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={styles.formInput} placeholder="e.g. Rome, Italy" />
              </div>
              <div className={styles.dateRow}>
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input type="date" required min={formData.startDate || new Date().toISOString().split('T')[0]} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className={styles.formInput} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as TripStatus})} className={styles.formInput}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Budget Limit</label>
                <input type="number" required min="0" value={formData.budgetLimit || ''} onChange={e => setFormData({...formData, budgetLimit: Number(e.target.value)})} className={styles.formInput} placeholder="e.g. 5000" />
              </div>
              
              <hr className={styles.divider} />
              <h4>Trip Checklists & Itinerary</h4>
              
              <div className={styles.itinerarySection}>
                {formData.itinerary.map((day, dIdx) => (
                  <div key={day.id} className={styles.checklistCard}>
                    <div className={styles.checklistHeader}>
                      <input type="text" value={day.title} onChange={(e) => {
                        const newIti = [...formData.itinerary];
                        newIti[dIdx].title = e.target.value;
                        setFormData({...formData, itinerary: newIti});
                      }} className={styles.formInput} style={{flex: 1}} placeholder="Checklist Title (e.g. Day 1, Or Essentials)" />
                      <button type="button" onClick={() => {
                        const newIti = formData.itinerary.filter(i => i.id !== day.id);
                        setFormData({...formData, itinerary: newIti});
                      }} className={styles.iconBtn}><Trash2 size={16} /></button>
                    </div>
                    {day.places.map((place, pIdx) => (
                      <div key={pIdx} className={styles.placeRow}>
                        <input type="text" value={place} onChange={(e) => {
                           const newIti = [...formData.itinerary];
                           newIti[dIdx].places[pIdx] = e.target.value;
                           setFormData({...formData, itinerary: newIti});
                        }} className={styles.formInput} placeholder="Place / Item name" />
                        <button type="button" onClick={() => {
                           const newIti = [...formData.itinerary];
                           newIti[dIdx].places.splice(pIdx, 1);
                           setFormData({...formData, itinerary: newIti});
                        }} className={styles.iconBtn}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      const newIti = [...formData.itinerary];
                      newIti[dIdx].places.push('');
                      setFormData({...formData, itinerary: newIti});
                    }} className={styles.secondaryBtn}>+ Add Item</button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  setFormData({...formData, itinerary: [...formData.itinerary, {id: generateId(), title: 'New Checklist', places: ['']}]});
                }} className={styles.primaryOutlineBtn}>+ Add New Checklist</button>
              </div>

              {formData.status === 'upcoming' && (
                <>
                  <hr className={styles.divider} />
                  <h4>To-Be-Done Before Trip</h4>
                  <div className={styles.todosSection}>
                    {formData.todos.map((todo, tIdx) => (
                      <div key={todo.id} className={styles.todoRow}>
                         <input type="text" value={todo.text} onChange={(e) => {
                            const newTodos = [...formData.todos];
                            newTodos[tIdx].text = e.target.value;
                            setFormData({...formData, todos: newTodos});
                         }} className={styles.formInput} placeholder="e.g. Book Flights" />
                         <button type="button" onClick={() => {
                            const newTodos = formData.todos.filter(t => t.id !== todo.id);
                            setFormData({...formData, todos: newTodos});
                         }} className={styles.iconBtn}><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => {
                      setFormData({...formData, todos: [...formData.todos, {id: generateId(), text: '', isCompleted: false}]});
                    }} className={styles.secondaryBtn}>+ Add Task</button>
                  </div>
                </>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.filterBar}>
        <button 
          className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Trips
        </button>
        <button 
          className={`${styles.filterBtn} ${activeFilter === 'ongoing' ? styles.active : ''}`}
          onClick={() => setActiveFilter('ongoing')}
        >
          <Navigation size={16} /> Ongoing
        </button>
        <button 
          className={`${styles.filterBtn} ${activeFilter === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveFilter('upcoming')}
        >
          <Clock size={16} /> Upcoming
        </button>
        <button 
          className={`${styles.filterBtn} ${activeFilter === 'completed' ? styles.active : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          <CheckCircle size={16} /> Completed
        </button>
      </div>

      {filteredTrips.length === 0 ? (
        <div className={styles.emptyState}>
          <MapPin size={48} color="var(--color-gray-400)" />
          <h3>No trips found</h3>
          <p>You don't have any {activeFilter} trips yet.</p>
        </div>
      ) : (
        <div className={styles.tripsGrid}>
          {filteredTrips.map(trip => (
            <div key={trip.id} className={styles.tripCard}>
              <div className={styles.imageWrapper}>
                <img src={trip.image} alt={trip.title} className={styles.tripImage} />
                <div className={`${styles.statusBadge} ${styles[trip.status]}`}>
                  {getStatusIcon(trip.status)}
                  <span>{getStatusLabel(trip.status)}</span>
                </div>
              </div>
              
              <div className={styles.tripContent}>
                <div className={`${styles.statusBadge} ${styles[trip.status]}`} style={{ position: 'relative', alignSelf: 'flex-start', marginBottom: '12px', top: '0', right: '0' }}>
                  {getStatusIcon(trip.status)}
                  <span>{getStatusLabel(trip.status)}</span>
                </div>
                <h3 className={styles.tripTitle}>{trip.title}</h3>
                
                <div className={styles.tripDetails}>
                  <div className={styles.detailRow}>
                    <MapPin size={16} className={styles.detailIcon} />
                    <span>{trip.location}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <Calendar size={16} className={styles.detailIcon} />
                    <span>{trip.dateRange}</span>
                  </div>
                </div>

                {trip.status === 'ongoing' && trip.progress !== undefined && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span>Trip Progress</span>
                      <span>{trip.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${trip.progress}%` }} 
                      />
                    </div>
                  </div>
                )}
                
                <button className={styles.viewBtn} onClick={() => onOpenTrip(trip)}>
                  {trip.status === 'completed' ? 'View Memories' : trip.status === 'upcoming' ? 'Plan Activities' : 'Open Workspace'}
                </button>
                <button className={styles.secondaryBtn} style={{marginTop: '8px', width: '100%'}} onClick={(e) => { e.stopPropagation(); handleShareTemplate(trip); }}>
                  Share Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
