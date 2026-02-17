import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Marketing Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            Grow faster
            <br />
            with <span className="text-gradient-primary">smarter</span>
            <br />
            marketing.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed">
            Automate campaigns, analyze performance, and convert more leads — all from one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-primary text-primary-foreground font-display font-semibold text-lg glow-primary transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-border text-foreground font-display font-semibold text-lg hover:bg-secondary transition-colors"
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
