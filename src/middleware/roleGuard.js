/**
 * Middleware factory to restrict route access based on user roles.
 *
 * Usage: roleGuard("admin") or roleGuard("admin", "analyst")
 *
 * @param {...string} roles - Allowed roles for the route
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = roleGuard;
