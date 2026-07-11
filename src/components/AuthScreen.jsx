import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Lock, Mail, UserPlus, KeyRound, AlertCircle, Loader } from 'lucide-react';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Harap isi semua kolom!');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal harus 6 karakter!');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data?.session) {
          onAuthSuccess(data.session);
        }
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        // Supabase will automatically send confirmation email if set up,
        // or directly insert user details.
        setSuccessMsg(
          'Pendaftaran berhasil! Akun Anda terdaftar sebagai pending. Silakan hubungi admin untuk aktivasi.'
        );
        // Clear fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Auto-switch to login tab
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg(null);
        }, 6000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Clean up error message for user
      let friendlyMessage = err.message;
      if (err.message === 'Invalid login credentials') {
        friendlyMessage = 'Email atau password salah. Silakan coba lagi.';
      } else if (err.message === 'User already registered') {
        friendlyMessage = 'Email ini sudah terdaftar. Silakan login.';
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Lock size={28} className="auth-logo-icon" />
          </div>
          <h2>Marketplace Analyzer</h2>
          <p>Financial & performance dashboard for Shopee & TikTok</p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setErrorMsg(null); setSuccessMsg(null); }}
            disabled={loading}
          >
            Masuk
          </button>
          <button 
            type="button" 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setErrorMsg(null); setSuccessMsg(null); }}
            disabled={loading}
          >
            Daftar
          </button>
        </div>

        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <UserPlus size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="auth-input-group">
            <label>Alamat Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Kata Sandi</label>
            <div className="auth-input-wrapper">
              <KeyRound size={18} className="auth-input-icon" />
              <input 
                type="password" 
                placeholder="Minimal 6 karakter" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="auth-input-group">
              <label>Konfirmasi Kata Sandi</label>
              <div className="auth-input-wrapper">
                <KeyRound size={18} className="auth-input-icon" />
                <input 
                  type="password" 
                  placeholder="Ulangi kata sandi" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{isLogin ? 'Masuk ke Dashboard' : 'Daftar Akun Baru'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin 
              ? 'Belum punya akun? Klik tab Daftar di atas untuk registrasi gratis.' 
              : 'Sudah punya akun? Klik tab Masuk di atas untuk login.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
