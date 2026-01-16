import { motion } from "framer-motion";
import { FaUtensils, FaSmile, FaHandsHelping } from "react-icons/fa";

const CommunityImpact = () => {
  return (
    <section className="section-pad">
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
        className="page-wrap text-center"
      >
        <p className="section-kicker">Trusted by neighbors</p>
        <h2 className="section-title mt-4">Our Community Impact</h2>
        <p className="section-subtitle mt-3 max-w-2xl mx-auto">
          Together, we are reducing food waste and delivering happiness one
          plate at a time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card-surface p-6 border-t-4 border-amber-400"
          >
            <FaUtensils className="text-3xl text-amber-600 mb-2 mx-auto" />
            <h3 className="text-3xl font-bold text-cocoa">12K+</h3>
            <p className="text-clay mt-1">Meals Shared</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card-surface p-6 border-t-4 border-sage-500"
          >
            <FaSmile className="text-3xl text-sage-600 mb-2 mx-auto" />
            <h3 className="text-3xl font-bold text-cocoa">6,500+</h3>
            <p className="text-clay mt-1">Happy Receivers</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card-surface p-6 border-t-4 border-amber-500"
          >
            <FaHandsHelping className="text-3xl text-amber-600 mb-2 mx-auto" />
            <h3 className="text-3xl font-bold text-cocoa">30+</h3>
            <p className="text-clay mt-1">Communities Helped</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CommunityImpact;
