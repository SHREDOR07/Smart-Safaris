import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "This platform tripled our conversion rate in just two months. The AI targeting is unreal.",
    author: "Sarah Chen",
    role: "CMO, TechFlow",
  },
  {
    quote: "We replaced four different tools with this one. Our team is faster and our campaigns perform better.",
    author: "Marcus Rivera",
    role: "Head of Growth, Bloom",
  },
  {
    quote: "The analytics alone are worth it. We finally understand what's actually driving revenue.",
    author: "Anya Patel",
    role: "Marketing Director, Scalar",
  },
];

const Testimonials = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient-primary">leaders</span>
          </h2>
          <p className="text-muted-foreground text-lg">See what marketing teams are saying.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-card"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground text-lg leading-relaxed mb-8">"{t.quote}"</p>
              <div>
                <div className="font-display font-semibold">{t.author}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
