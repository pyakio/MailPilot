// Validation Middleware — MailPilot
// Uses Zod schemas to validate incoming request bodies, query params, and route params

function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: formattedErrors[0]?.message || 'Validation error',
          message: formattedErrors[0]?.message || 'Validation error',
          errors: formattedErrors,
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    }
  };
}

module.exports = { validate };
