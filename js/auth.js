// js/auth.js — Authentication module

const Auth = {
  currentUser: null,
  userProfile: null,

  async init() {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      this.currentUser = user;
      await this.loadProfile();
    }
    return this.currentUser;
  },

  async loadProfile() {
    if (!this.currentUser) return null;
    const { data, error } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();
    if (!error) this.userProfile = data;
    return this.userProfile;
  },

  async signIn(email, password) {
    const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.currentUser = data.user;
    await this.loadProfile();
    return data;
  },

  async signOut() {
    await window.supabase.auth.signOut();
    this.currentUser = null;
    this.userProfile = null;
  },

  isStaff() {
    return this.userProfile?.role === 'staff';
  },

  isKitchen() {
    return this.userProfile?.role === 'kitchen';
  }
};
