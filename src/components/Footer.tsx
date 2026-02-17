import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <span>Pulse</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            The AI-powered marketing platform for modern growth teams.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-sm">
          <div>
            <h4 className="font-display font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 Pulse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
