const prisma = require('../config/database');

// Submit contact form
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await prisma.contactUse.create({
      data: {
        name,
        email,
        subject,
        message,
      }
    });

    res.status(201).json({ message: 'Your message has been sent successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
};
