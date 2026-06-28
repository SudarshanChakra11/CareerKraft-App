
const AnimatedCard = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: "easeOut",
      }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        y: -10,
        scale: 1.03,
        transition: { duration: 0.3 },
      }}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer
                 transition-all duration-300
                 hover:shadow-2xl"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;