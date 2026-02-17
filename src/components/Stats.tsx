import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Active Campaigns" },
  { value: "98%", label: "Client Retention" },
  { value: "3.2x", label: "Average ROI" },
  { value: "50M+", label: "Emails Sent Monthly" },
];

const Stats = () => {
  return (
    <section className="py-24 px-6 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
