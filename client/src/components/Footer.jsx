import React from 'react';

const Footer = () => {
  return (
    <footer className="relative border-t border-outline-variant/20 bg-surface-container-lowest overflow-hidden mt-12">
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display-lg text-primary tracking-tighter text-2xl font-bold mb-4 animate-glow">
              Bhopal Tatkal Mamla
            </div>
            <p className="font-body-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
              Next-generation urban monitoring dashboard and comfort-focused route optimizer designed for high-density city navigation.
            </p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors hover:animate-float">language</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors hover:animate-float" style={{animationDelay: '0.2s'}}>code</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors hover:animate-float" style={{animationDelay: '0.4s'}}>hub</span>
            </div>
          </div>
          
          {/* Links 1 */}
          <div>
            <h4 className="font-headline-sm text-on-surface font-bold mb-4 uppercase tracking-wider text-sm">Telemetry</h4>
            <ul className="space-y-3 font-body-sm text-on-surface-variant">
              <li><a href="#features" className="hover:text-primary-container hover:neon-text transition-colors">Traffic Grid</a></li>
              <li><a href="#routing" className="hover:text-primary-container hover:neon-text transition-colors">Thermal Zones</a></li>
              <li><a href="#" className="hover:text-primary-container hover:neon-text transition-colors">Incident Reports</a></li>
            </ul>
          </div>
          
          {/* Links 2 */}
          <div>
            <h4 className="font-headline-sm text-on-surface font-bold mb-4 uppercase tracking-wider text-sm">System</h4>
            <ul className="space-y-3 font-body-sm text-on-surface-variant">
              <li><a href="#" className="hover:text-primary-container hover:neon-text transition-colors">API Access</a></li>
              <li><a href="#" className="hover:text-primary-container hover:neon-text transition-colors">Control Room</a></li>
              <li><a href="#" className="hover:text-primary-container hover:neon-text transition-colors flex items-center gap-2">Admin Login <span className="material-symbols-outlined text-[14px]">lock</span></a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-data-sm text-[11px] text-on-surface-variant font-mono">
            © {new Date().getFullYear()} Urban Monitoring Core. Sector 7 Administration.
          </p>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded border border-outline-variant/20">
            <span className="w-2 h-2 bg-tertiary-container rounded-full animate-pulse"></span>
            <span className="font-data-sm text-[10px] text-tertiary-container font-mono uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;