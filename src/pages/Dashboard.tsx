import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={`${styles.title} script-font`}>Dashboard</h1>
          <button onClick={signOut} className={styles.logoutBtn}>Log Out</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.welcomeCard}>
            <h2>Welcome back, traveler!</h2>
            <p>You are logged in as {user?.email}</p>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>My Trips</h3>
              <p>You haven't planned any trips yet.</p>
            </div>
            <div className={styles.card}>
              <h3>Saved Templates</h3>
              <p>Explore the homepage to save templates.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
