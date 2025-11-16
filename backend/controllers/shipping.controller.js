const prisma = require('../config/database');

// Get shipping options
const getShippingOptions = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const options = await prisma.shippingOption.findMany({
      include: {
        translations: {
          where: { language: lang }
        }
      }
    });

    const formattedOptions = options.map(option => {
      const translation = option.translations[0] || {};
      return {
        id: option.id.toString(),
        name: translation.name || 'Shipping Option',
        price: option.price,
        currency: option.currency,
      };
    });

    res.json({ shippingOptions: formattedOptions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShippingOptions,
};
