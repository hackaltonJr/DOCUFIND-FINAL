module.exports = function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  let limit = parseInt(query.limit, 10) || 20;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip,
    toMeta: async (Model, filter = {}) => {
      const total = await Model.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);
      return { page, limit, total, totalPages };
    }
  };
};
