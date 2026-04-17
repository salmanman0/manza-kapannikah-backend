class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {*} data
   * @param {string} message
   * @param {number} statusCode
   */
  static success(res, data = null, message = 'Berhasil', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data !== null && { data }),
    });
  }

  static created(res, data = null, message = 'Data berhasil dibuat') {
    return this.success(res, data, message, 201);
  }

  static paginated(res, data, pagination, message = 'Berhasil') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }
}

module.exports = ApiResponse;
