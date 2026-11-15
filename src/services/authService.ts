import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types/queue';

const LOCAL_ADMIN_STORAGE_KEY = 'antreyuk_admin_session';

export const signInAdmin = async (email: string, password: string): Promise<AdminUser> => {
  // If Supabase is configured, use Supabase Auth + database role check
  if (isSupabaseConfigured() && supabase) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      throw new Error(`Gagal login: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    // Verify role in 'admins' table (server-side database check)
    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (adminError || !adminRecord) {
      // Logout immediately if user is not in admins table
      await supabase.auth.signOut();
      throw new Error('Akses ditolak: Akun Anda tidak memiliki hak akses Administrator toko.');
    }

    const adminUser: AdminUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      role: adminRecord.role || 'admin',
    };

    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  // Local/Offline mock authentication for seamless immediate testing
  if (email.toLowerCase() === 'admin@antreyuk.com' && password === 'admin123') {
    const mockAdmin: AdminUser = {
      id: 'admin-mock-001',
      email: 'admin@antreyuk.com',
      role: 'admin',
    };
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(mockAdmin));
    return mockAdmin;
  }

  // Also accept any valid demo input if explicitly tested in local mock
  if (email.includes('@') && password.length >= 6) {
    const mockAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email,
      role: 'admin',
    };
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(mockAdmin));
    return mockAdmin;
  }

  throw new Error('Email atau kata sandi tidak valid. Gunakan admin@antreyuk.com dan sandi admin123 untuk mode demo.');
};

export const signOutAdmin = async (): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
};

export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  if (typeof window === 'undefined') return null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        const user = sessionData.session.user;
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (adminRecord) {
          return {
            id: user.id,
            email: user.email || '',
            role: adminRecord.role || 'admin',
          };
        }
      }
    } catch (e) {
      console.warn('Error checking Supabase session:', e);
    }
  }

  const stored = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  return null;
};

