const prisma = require('../config/database');

exports.getAreas = async (req, res, next) => {
  try {
    const governateId = req.query.governateId || req.query.govId || req.params.id;
    
    if (!governateId) return res.status(400).json({ success: false, message: 'governateId is required' });

    let govIdBig;
    try { 
      govIdBig = BigInt(governateId); 
    } catch (e) { 
      return res.status(400).json({ success: false, message: 'Invalid governateId' }); 
    }

    // Inspect actual DB columns for the `areas` table to support differing schemas
    const cols = await prisma.$queryRawUnsafe("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'areas'");
    const colNames = (cols || []).map(c => String(c.COLUMN_NAME).toLowerCase());

    // Determine possible name columns (fallbacks)
    const nameCol = colNames.includes('name') ? 'name' : (colNames.includes('title') ? 'title' : (colNames.includes('name_ar') ? 'name_ar' : (colNames.includes('title_ar') ? 'title_ar' : null)));
    const nameArCol = colNames.includes('name_ar') ? 'name_ar' : (colNames.includes('title_ar') ? 'title_ar' : (colNames.includes('name') ? 'name' : null));

    const selectName = nameCol ? `COALESCE(${nameCol}, '')` : "''";
    const selectNameAr = nameArCol ? `COALESCE(${nameArCol}, '')` : "''";

    // Use raw SQL to avoid Prisma schema mismatches when DB has different column names
    const sql = `SELECT id, governate_id as governateId, ${selectName} as name, ${selectNameAr} as nameAr FROM areas WHERE governate_id = ${String(govIdBig)} ORDER BY id ASC`;
    const rows = await prisma.$queryRawUnsafe(sql);

    const formatted = (rows || []).map(r => ({ id: String(r.id), name: r.name || '', nameAr: r.nameAr || '' }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('[v0] getAreas error:', error && error.stack ? error.stack : error);
    return res.status(500).json({ success: false, message: 'Database error occurred' });
  }
};

// Get single area by id
exports.getAreaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    
    let idBig;
    try { 
      idBig = BigInt(id); 
    } catch (e) { 
      return res.status(400).json({ success: false, message: 'Invalid id' }); 
    }

    const area = await prisma.area.findUnique({
      where: { id: idBig }
    });

    if (!area) return res.status(404).json({ success: false, message: 'Area not found' });

    return res.json({ success: true, data: { id: String(area.id), name: area.name || '', nameAr: area.nameAr || '' } });
  } catch (error) {
    next(error);
  }
};
