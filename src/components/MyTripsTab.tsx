import { useState } from 'react';
import { MapPin, Calendar, CheckCircle, Clock, Navigation } from 'lucide-react';
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

const mockTrips: Trip[] = [
  {
    id: '1',
    title: 'Italy Adventure',
    location: 'Rome, Florence, Venice',
    dateRange: 'May 20 - Jun 2, 2024',
    image: '/assets/images/showcase-rome.jpg',
    status: 'ongoing',
    progress: 72
  },
  {
    id: '2',
    title: 'Kyoto Autumn Colors',
    location: 'Kyoto, Japan',
    dateRange: 'Nov 10 - Nov 24, 2024',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Paris Getaway',
    location: 'Paris, France',
    dateRange: 'Oct 12 - Oct 18, 2023',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Swiss Alps Hiking',
    location: 'Zermatt, Switzerland',
    dateRange: 'Jul 05 - Jul 12, 2023',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=600',
    status: 'completed'
  }
];

export default function MyTripsTab({ onOpenTrip }: { onOpenTrip: (trip: Trip) => void }) {
  const [activeFilter, setActiveFilter] = useState<TripStatus | 'all'>('all');

  const filteredTrips = activeFilter === 'all' 
    ? mockTrips 
    : mockTrips.filter(trip => trip.status === activeFilter);

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
      <div className={styles.header}>
        <h2 className={styles.title}>My Trips</h2>
        <p className={styles.subtitle}>Manage all your past, present, and future adventures.</p>
      </div>

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
