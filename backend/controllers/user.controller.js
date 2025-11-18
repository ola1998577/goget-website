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

    // Validate governateId and areaId exist in DB to avoid FK constraint errors
    let govIdBig, areaIdBig;
    try {
      govIdBig = BigInt(governateId);
      areaIdBig = BigInt(areaId);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid governateId or areaId format' });
    }

    const governate = await prisma.governate.findUnique({ where: { id: govIdBig } });
    if (!governate) {
      return res.status(404).json({ error: 'Governate not found' });
    }

    // The "area" in this project is represented by categories linked to a governate.
    // Verify the provided areaId exists and belongs to the given governate.
    const area = await prisma.category.findUnique({ where: { id: areaIdBig } });
    if (!area) {
      return res.status(404).json({ error: 'Area not found' });
    }
    if (area.governateId && String(area.governateId) !== String(govIdBig)) {
      return res.status(400).json({ error: 'Area does not belong to the selected governate' });
    }

    try {
      const address = await prisma.locationUser.create({
        data: {
          userId: req.user.id,
          governateId: govIdBig,
          areaId: areaIdBig,
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
    } catch (err) {
      // Translate common Prisma FK error to friendly message
      if (err && err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid areaId: foreign key constraint failed. Make sure the selected area exists.' });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Update address
const updateAddress = async (req, res, next) => {
  try {
      if (!governateId || !description) {
        return res.status(400).json({ error: 'Governate and description are required' });

    const address = await prisma.locationUser.findFirst({
      where: {
        id: BigInt(id),
        userId: req.user.id,
      }
       areaIdBig = areaId ? BigInt(areaId) : null;

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const updateData = {};
    if (governateId) updateData.governateId = BigInt(governateId);
    if (areaId) updateData.areaId = BigInt(areaId);
    if (description) updateData.description = description;
      // If areaId provided, verify it exists and belongs to governate
      if (areaIdBig) {
        const area = await prisma.category.findUnique({ where: { id: areaIdBig } });
        if (!area) {
          return res.status(404).json({ error: 'Area not found' });
        }
        if (area.governateId && String(area.governateId) !== String(govIdBig)) {
          return res.status(400).json({ error: 'Area does not belong to the selected governate' });
        }
      }
    if (type) updateData.type = type;
      // Build create data; include areaId only when provided
      const createData = {
        userId: req.user.id,
        governateId: govIdBig,
        description,
        type,
        title,
      };
      if (areaIdBig) createData.areaId = areaIdBig;
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
