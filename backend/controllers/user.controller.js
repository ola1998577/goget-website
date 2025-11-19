const prisma = require('../config/database');

// Helper: convert BigInt values in an object/array to strings recursively
function convertBigInt(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(convertBigInt);
  if (obj instanceof Date) return obj; // leave dates intact
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = convertBigInt(v);
    }
    return out;
  }
  return obj;
}

// Get user addresses
const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.locationUser.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ addresses: convertBigInt(addresses) });
  } catch (error) {
    next(error);
  }
};

// Add address (areaId optional)
const addAddress = async (req, res, next) => {
  try {
    const { governateId, areaId, description, type = 'home', title } = req.body;

    if (!governateId || !description) {
      return res.status(400).json({ error: 'Governate and description are required' });
    }

    // Validate governateId (required) and areaId (optional)
    let govIdBig;
    try {
      govIdBig = BigInt(governateId);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid governateId format' });
    }

    let areaIdBig = null;
    if (areaId) {
      try {
        areaIdBig = BigInt(areaId);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid areaId format' });
      }
    }

    const governate = await prisma.governate.findUnique({ where: { id: govIdBig } });
    if (!governate) {
      return res.status(404).json({ error: 'Governate not found' });
    }

    // If areaId provided, verify it exists in the `areas` table and belongs to the governate
    if (areaIdBig) {
      try {
        const rows = await prisma.$queryRawUnsafe('SELECT id, governate_id FROM areas WHERE id = ? LIMIT 1', areaIdBig);
        const area = (rows && rows[0]) || null;
        if (!area) {
          return res.status(404).json({ error: 'Area not found' });
        }
        if (area.governate_id && String(area.governate_id) !== String(govIdBig)) {
          return res.status(400).json({ error: 'Area does not belong to the selected governate' });
        }
      } catch (e) {
        // If the areas table/query isn't available, fall back to letting DB FK handle validation
        console.warn('Area validation query failed:', e && e.message ? e.message : e);
      }
    }

    // Build create data; include areaId only when provided
    const createData = {
      userId: req.user.id,
      governateId: govIdBig,
      description,
      type,
      title,
    };
    if (areaIdBig) createData.areaId = areaIdBig;

    try {
      const address = await prisma.locationUser.create({ data: createData });
      res.status(201).json({
        message: 'Address added successfully',
        address: {
          id: address.id.toString(),
          description: address.description,
          type: address.type,
        }
      });
    } catch (err) {
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
    if (governateId) {
      try { updateData.governateId = BigInt(governateId); } catch (e) { return res.status(400).json({ error: 'Invalid governateId format' }); }
    }
    if (areaId) {
      try { updateData.areaId = BigInt(areaId); } catch (e) { return res.status(400).json({ error: 'Invalid areaId format' }); }
    }
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (title !== undefined) updateData.title = title;

    // If both governateId and areaId present, verify association via `areas` table when possible
    if (updateData.governateId && updateData.areaId) {
      try {
        const rows = await prisma.$queryRawUnsafe('SELECT id, governate_id FROM areas WHERE id = ? LIMIT 1', updateData.areaId);
        const area = (rows && rows[0]) || null;
        if (!area) return res.status(404).json({ error: 'Area not found' });
        if (area.governate_id && String(area.governate_id) !== String(updateData.governateId)) {
          return res.status(400).json({ error: 'Area does not belong to the selected governate' });
        }
      } catch (e) {
        console.warn('Area validation query failed:', e && e.message ? e.message : e);
      }
    }

    const updatedAddress = await prisma.locationUser.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    res.json({
      message: 'Address updated successfully',
      address: convertBigInt(updatedAddress),
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

    await prisma.locationUser.delete({ where: { id: BigInt(id) } });

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
