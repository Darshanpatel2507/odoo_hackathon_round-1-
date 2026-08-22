import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './ProfileTab.module.css';

export default function ProfileTab() {
  const { user } = useAuth();
  
  // State for Personal Info
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Load from LocalStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('profile_name');
    const savedAvatar = localStorage.getItem('profile_avatar');

    if (savedName) setName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('profile_name', name);
    if (avatarUrl) {
      localStorage.setItem('profile_avatar', avatarUrl);
    }
    alert('Profile saved successfully!');
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    
    // Upload to avatars bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) {
      alert("Error uploading avatar!");
      setIsUploading(false);
      return;
    }
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    const publicUrl = data.publicUrl;
    setAvatarUrl(publicUrl);
    
    // Optional: save to a profiles table if it exists, otherwise just localStorage for now
    localStorage.setItem('profile_avatar', publicUrl);
    
    setIsUploading(false);
  };





  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.viewHeading}>Your Profile</h2>

      {/* Personal Information Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
        </div>
        
        <div className={styles.profileForm}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
              ) : (
                user?.email ? user.email[0].toUpperCase() : 'G'
              )}
            </div>
            <button 
              className={styles.uploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.infoSection}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name" 
              />
            </div>
            <button className={styles.saveBtn} onClick={handleSaveProfile}>Save Changes</button>
          </div>
        </div>
      </section>


    </div>
  );
}
