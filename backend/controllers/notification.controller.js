const prisma = require('../config/database');

// Get notifications
const getNotifications = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedNotifications = notifications.map(n => ({
      id: n.id.toString(),
      title: lang === 'ar' ? n.titleAr : n.title,
      description: lang === 'ar' ? n.descriptionAr : n.description,
      image: n.image,
      createdAt: n.createdAt,
    }));

    res.json({ notifications: formattedNotifications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
};
