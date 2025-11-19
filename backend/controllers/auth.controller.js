const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const { registerSchema, loginSchema, verifyOTPSchema, resendOTPSchema } = require('../validators/auth.validator');

// Generate unique token string
const generateUniqueToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

function safeJson(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}
// Register new user (no OTP, immediate account creation)
const register = async (req, res, next) => {
  try {
    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fName, lName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create token
    const tokenRecord = await prisma.token.create({
      data: {
        token: generateUniqueToken(),
        key: Math.random().toString(36).substring(2, 12),
        keyUpdatedAt: new Date(),
      }
    });

    // Generate OTP
    const otp = generateOTP();

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        fName,
        lName,
        email,
        password: hashedPassword,
        phone,
        tokenId: tokenRecord.id,
        isVerify: false,
        otp,
      },
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        phone: true,
        isVerify: true,
      }
    });

    // TODO: Send OTP via SMS/Email
    console.log(`OTP for ${phone}: ${otp}`);

    res.status(201).json(safeJson({
      success: true,
      message: 'User registered. Please verify OTP.',
      user: {
        id: user.id.toString(),
        name: `${user.fName} ${user.lName}`,
        email: user.email,
        phone: user.phone,
        isVerify: user.isVerify,
      },
    }));
  } catch (error) {
    next(error);
  }
};

// Login user (no OTP, immediate access)
const login = async (req, res, next) => {
  try {
    // Validate input
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user (by email or phone) - select only needed fields to avoid querying missing DB columns
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: email }, // allow login by phone as well
        ]
      },
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        phone: true,
        password: true,
        isVerify: true,
        point: true,
        token: {
          select: {
            id: true,
            islogin: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerify) {
      // Not verified, require OTP
      // Generate new OTP and store
      const otp = generateOTP();
      await prisma.user.update({ where: { id: user.id }, data: { otp } });
      // TODO: Send OTP via SMS/Email
      console.log(`OTP for ${user.phone}: ${otp}`);
      return res.status(403).json({
        error: 'Account not verified. OTP sent.',
        phone: user.phone,
        needOTP: true
      });
    }

    // Update token login status
    if (user.token) {
      await prisma.token.update({
        where: { id: user.token.id },
        data: { islogin: true }
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    res.json(safeJson({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: `${user.fName} ${user.lName}`,
        email: user.email,
        phone: user.phone,
        points: parseInt(user.point),
      }
    }));
  } catch (error) {
    next(error);
  }
};


// Verify OTP
const verifyOTP = async (req, res, next) => {
  try {
    const { error } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { phone, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerify) {
      return res.status(400).json({ error: 'Account already verified' });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { isVerify: true, otp: null } });
    // Generate JWT
    const token = generateToken(user.id);
    res.json({ success: true, message: 'Account verified successfully', token });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
const resendOTP = async (req, res, next) => {
  try {
    const { error } = resendOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerify) {
      return res.status(400).json({ error: 'Account already verified' });
    }
    // Generate new OTP
    const otp = generateOTP();
    await prisma.user.update({ where: { id: user.id }, data: { otp } });
    // TODO: Send OTP via SMS/Email
    console.log(`OTP for ${phone}: ${otp}`);
    res.json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    next(error);
  }
};

// Cancel registration (delete unverified user)
const cancelRegistration = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerify) {
      return res.status(400).json({ error: 'Account already verified' });
    }
    await prisma.user.delete({ where: { id: user.id } });
    res.json({ message: 'Registration cancelled and user deleted' });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        phone: true,
        point: true,
        notification: true,
        quiz: true,
        createdAt: true,
      }
    });

      res.json(safeJson({
        user: {
          ...user,
          name: `${user.fName} ${user.lName}`,
          points: parseInt(String(user.point || 0)),
        }
      }));
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { fName, lName, phone, notification } = req.body;

    const updateData = {};
    if (fName) updateData.fName = fName;
    if (lName) updateData.lName = lName;
    if (phone) updateData.phone = phone;
    if (notification !== undefined) updateData.notification = notification;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        fName: true,
        lName: true,
        email: true,
        phone: true,
        point: true,
        notification: true,
      }
    });

    res.json(safeJson({
      message: 'Profile updated successfully',
      user: {
        ...user,
        name: `${user.fName} ${user.lName}`,
        points: parseInt(String(user.point || 0)),
      }
    }));
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { token: true }
    });

    if (user?.token) {
      await prisma.token.update({
        where: { id: user.token.id },
        data: { islogin: false }
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  cancelRegistration,
  getProfile,
  updateProfile,
  logout,
};
