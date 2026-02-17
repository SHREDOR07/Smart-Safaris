import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="text-gradient-primary">transform</span> your marketing?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Join thousands of teams already growing faster. Start your free 14-day trial — no credit card required.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-10 py-5 rounded-lg bg-gradient-primary text-primary-foreground font-display font-semibold text-lg glow-primary transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
