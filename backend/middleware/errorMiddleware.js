const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
 
  console.error(`[ERROR] ${req.method} ${req.url} → ${statusCode}: ${message}`);
 
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
 
export default errorMiddleware;
 