const supabase = require('../lib/supabase');
const prisma = require('../lib/prisma');

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so user can log in immediately
      user_metadata: { name },
    });

    if (error) {
      const status = error.message.includes('already') ? 409 : 400;
      return res.status(status).json({ error: error.message });
    }

    // Sync profile row in our DB
    await prisma.user.upsert({
      where: { id: data.user.id },
      update: { name, email },
      create: { id: data.user.id, name, email },
    });

    res.status(201).json({ message: 'Account created. Please sign in.' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name };

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
