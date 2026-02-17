import { motion } from "framer-motion";
import { BarChart3, Mail, Target, Users, Megaphone, TrendingUp } from "lucide-react";

const services = [
  {
    icon: Target,
    title: "Campaign Targeting",
    description: "Reach the right audience with AI-driven segmentation and precision targeting.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights into campaign performance, ROI, and customer behavior.",
  },
  {
    icon: Mail,
    title: "Email Automation",
    description: "Design, schedule, and optimize email sequences that convert at scale.",
  },
  {
    icon: Users,
    title: "Lead Management",
    description: "Capture, score, and nurture leads through intelligent pipelines.",
  },
  {
    icon: Megaphone,
    title: "Social Campaigns",
    description: "Manage multi-platform social campaigns from a single command center.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tools",
    description: "A/B testing, landing pages, and conversion optimization built in.",
  },
];

const Services = () => {
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
            Everything you need to <span className="text-gradient-primary">scale</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One platform to run your entire marketing engine — no plugins, no duct tape.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
