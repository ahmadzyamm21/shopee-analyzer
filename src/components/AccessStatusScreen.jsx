import React from 'react';
import { supabase } from '../utils/supabaseClient';
import { Clock, ShieldAlert, CalendarRange, LogOut, MessageCircle, ExternalLink } from 'lucide-react';

const AccessStatusScreen = ({ status, expiryDate, userEmail, onLogout }) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (onLogout) onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getWaLink = () => {
    const adminPhone = '628123456789'; // Silakan ganti dengan nomor WA Anda
    const message = `Halo Admin, saya telah mendaftar akun di Marketplace Analyzer dengan email: ${userEmail}. Mohon persetujuan dan aktivasi akun saya. Terima kasih!`;
    return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
  };

  const getLynkLink = () => {
    return 'https://lynk.id/yourusername'; // Silakan ganti dengan link toko Lynk.id Anda
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="status-wrapper">
      <div className="status-glow"></div>
      
      <div className="status-card">
        {status === 'pending' && (
          <div className="status-content">
            <div className="status-icon-box pending">
              <Clock size={36} className="pulse-animation" />
            </div>
            <h2>Menunggu Persetujuan</h2>
            <p className="status-desc">
              Pendaftaran Anda berhasil! Saat ini akun dengan email <strong className="highlight-text">{userEmail}</strong> sedang menunggu persetujuan admin untuk aktivasi.
            </p>
            <p className="status-note">
              Silakan hubungi admin di WhatsApp untuk konfirmasi pembayaran agar akun Anda segera diaktifkan.
            </p>
            
            <div className="status-actions">
              <a href={getWaLink()} target="_blank" rel="noopener noreferrer" className="status-btn btn-wa">
                <MessageCircle size={18} />
                <span>Konfirmasi via WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="status-content">
            <div className="status-icon-box expired">
              <CalendarRange size={36} />
            </div>
            <h2>Masa Aktif Habis</h2>
            <p className="status-desc">
              Masa aktif akun Anda telah berakhir pada tanggal <strong className="highlight-text">{formatDate(expiryDate)}</strong>.
            </p>
            <p className="status-note">
              Silakan lakukan perpanjangan lisensi/langganan Anda melalui toko digital Lynk.id untuk mendapatkan akses kembali.
            </p>
            
            <div className="status-actions">
              <a href={getLynkLink()} target="_blank" rel="noopener noreferrer" className="status-btn btn-lynk">
                <span>Perpanjang di Lynk.id</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

        {status === 'blocked' && (
          <div className="status-content">
            <div className="status-icon-box blocked">
              <ShieldAlert size={36} />
            </div>
            <h2>Akun Ditangguhkan</h2>
            <p className="status-desc">
              Akses akun untuk email <strong className="highlight-text">{userEmail}</strong> telah ditangguhkan atau diblokir.
            </p>
            <p className="status-note">
              Jika Anda merasa ini adalah kesalahan, silakan hubungi admin atau customer service untuk bantuan lebih lanjut.
            </p>
          </div>
        )}

        <div className="status-footer">
          <button onClick={handleLogout} className="status-btn-logout">
            <LogOut size={16} />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessStatusScreen;
