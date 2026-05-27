/**
 * Extracts pagination parameters from the query string and returns
 * the SQL LIMIT/OFFSET values plus metadata for the frontend.
 *
 * Usage in a controller:
 *   const { limit, offset, page } = getPagination(req.query);
 *   const { rows, rowCount } = await query(`SELECT ... LIMIT $1 OFFSET $2`, [limit, offset]);
 *   res.json({ data: rows, meta: buildMeta(rowCount, page, limit) });
 */
const getPagination = (queryParams) => {
  const page  = Math.max(1, parseInt(queryParams.page)  || 1);
  const limit = Math.min(100, parseInt(queryParams.limit) || 20); // cap at 100 per page
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildMeta = (totalCount, page, limit) => ({
  totalCount,
  totalPages: Math.ceil(totalCount / limit),
  currentPage: page,
  perPage: limit,
});

module.exports = { getPagination, buildMeta };