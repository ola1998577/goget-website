const prisma = require('../config/database');

// Get areas by governate id (areas table expected)
exports.getAreas = async (req, res, next) => {
  try {
    const governateId = req.query.governateId || req.query.govId || req.params.id;
    const lang = (req.query.lang || 'en').toString();
    if (!governateId) return res.status(400).json({ success: false, message: 'governateId is required' });

    let govIdBig;
    try { govIdBig = BigInt(governateId); } catch (e) { return res.status(400).json({ success: false, message: 'Invalid governateId' }); }

    // Prefer translations table when available. Try a few strategies and fall back to simple columns.
    try {
      const queryWithTrans = `
        SELECT a.id,
               COALESCE(t.title, t.name, a.name, a.title, '') AS name,
               COALESCE(t.title_ar, t.name_ar, a.name_ar, '') AS nameAr
        FROM areas a
        LEFT JOIN areas_translations t ON (t.area_id = a.id AND (t.language = ? OR t.locale = ?))
        WHERE a.governate_id = ?
        ORDER BY a.id ASC
      `;

      const rows = await prisma.$queryRawUnsafe(queryWithTrans, lang, lang, govIdBig);
      if (rows && rows.length) {
        const formatted = rows.map(a => ({ id: String(a.id), name: a.name || '', nameAr: a.nameAr || '' }));
        return res.json({ success: true, data: formatted });
      }
    } catch (e) {
      // translation table may not exist or query structure differs; fall through to other strategies
      console.warn('areas translations query failed:', e && e.message ? e.message : e);
    }

    // Fallback: try a simple columns-only query (existing behavior)
    try {
      const query = `
        SELECT id, COALESCE(name, title, '') AS name, COALESCE(name_ar, title_ar, '') AS nameAr
        FROM areas
        WHERE governate_id = ?
        ORDER BY id ASC
      `;

      const areas = await prisma.$queryRawUnsafe(query, govIdBig);
      const formatted = (areas || []).map(a => ({ id: String(a.id), name: a.name || '', nameAr: a.nameAr || '' }));
      return res.json({ success: true, data: formatted });
    } catch (error) {
      console.error('getAreas final fallback error:', error && error.message ? error.message : error);
      return res.json({ success: true, data: [] });
    }
  } catch (error) {
    // generic catch-all
    console.error('getAreas error:', error && error.message ? error.message : error);
    return res.json({ success: true, data: [] });
  }
};

// Get single area by id
exports.getAreaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id is required' });
    let idBig;
    try { idBig = BigInt(id); } catch (e) { return res.status(400).json({ success: false, message: 'Invalid id' }); }

    const query = `SELECT id, COALESCE(name, title, '') AS name, COALESCE(name_ar, title_ar, '') AS nameAr FROM areas WHERE id = ? LIMIT 1`;
    const rows = await prisma.$queryRawUnsafe(query, idBig);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Area not found' });
    const a = rows[0];
    return res.json({ success: true, data: { id: String(a.id), name: a.name || '', nameAr: a.nameAr || '' } });
  } catch (error) {
    next(error);
  }
};
