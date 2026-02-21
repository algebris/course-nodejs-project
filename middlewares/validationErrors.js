module.exports = async function handleValidationError(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.name === 'ValidationError') {
      ctx.status = 400;
      ctx.body = {errors: err.errors || {}};
      return;
    }

    if (err.code === 'P2002') {
      const fields = Array.isArray(err.meta && err.meta.target) ? err.meta.target : [];
      const errors = {};

      for (const field of fields) {
        if (field === 'email') {
          errors.email = 'Такой email уже существует';
        } else if (field === 'displayName') {
          errors.displayName = 'Такое имя уже существует';
        } else {
          errors[field] = 'Поле должно быть уникальным';
        }
      }

      ctx.status = 400;
      ctx.body = {errors};
      return;
    }

    throw err;
  }
};
