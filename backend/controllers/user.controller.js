const prisma = require('../config/database');

// Get user addresses
const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.locationUser.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ addresses });
  } catch (error) {
    next(error);
  }
};

// Add address
const addAddress = async (req, res, next) => {
  try {
    const { governateId, areaId, description, type = 'home', title } = req.body;

    if (!governateId || !areaId || !description) {
      return res.status(400).json({ error: 'Governate, area, and description are required' });
    }

    const address = await prisma.locationUser.create({
      data: {
        userId: req.user.id,
        governateId: BigInt(governateId),
        areaId: BigInt(areaId),
        description,
        type,
        title,
      }
    });

    res.status(201).json({
      message: 'Address added successfully',
      address: {
        id: address.id.toString(),
        description: address.description,
        type: address.type,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update address
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { governateId, areaId, description, type, title } = req.body;

    const address = await prisma.locationUser.findFirst({
      where: {
        id: BigInt(id),
        userId: req.user.id,
      }
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const updateData = {};
    if (governateId) updateData.governateId = BigInt(governateId);
    if (areaId) updateData.areaId = BigInt(areaId);
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (title !== undefined) updateData.title = title;

    const updatedAddress = await prisma.locationUser.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    res.json({
      message: 'Address updated successfully',
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await prisma.locationUser.findFirst({
      where: {
        id: BigInt(id),
        userId: req.user.id,
      }
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await prisma.locationUser.delete({
      where: { id: BigInt(id) }
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
