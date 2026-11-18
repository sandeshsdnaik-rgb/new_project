const { supabase, isSupabaseConfigured } = require('../config/supabase');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (supabase && token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) {
          return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }
        req.user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || 'Authenticated user'
        };
        return next();
      }
    }

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const devUser = {
        id: 'dev-user-1',
        email: process.env.DEV_USER_EMAIL || 'demo@whatif.local',
        name: process.env.DEV_USER_NAME || 'Demo User'
      };
      req.user = devUser;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Authentication required.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Authentication failed.', error: error.message });
  }
}

module.exports = {
  requireAuth,
  isSupabaseConfigured
};
