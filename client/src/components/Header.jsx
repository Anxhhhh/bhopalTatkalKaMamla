import React from 'react';

const Header = ({ triggerLaunchSequence }) => {
  return (
    <>
      {/* Top Navbar */}
      <nav className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-gutter h-16 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 transition-all duration-300">
        <div className="flex items-center gap-8">
          <div className="font-display-lg text-primary tracking-tighter text-2xl font-bold hover:animate-glow transition-all cursor-pointer">
            Bhopal Tatkal Mamla
          </div>
          <div className="flex gap-6">
            <button 
              onClick={triggerLaunchSequence}
              className="text-on-surface-variant font-medium hover:text-primary-container hover:neon-text transition-all scale-95 duration-150 text-body-lg cursor-pointer"
            >
              Dashboard
            </button>
            <a className="text-on-surface-variant font-medium hover:text-primary-container hover:neon-text transition-all scale-95 duration-150 text-body-lg" href="#features">City Map</a>
            <a className="text-on-surface-variant font-medium hover:text-primary-container hover:neon-text transition-all scale-95 duration-150 text-body-lg" href="#routing">Routes</a>
            <a className="text-on-surface-variant font-medium hover:text-primary-container hover:neon-text transition-all scale-95 duration-150 text-body-lg" href="#sequence">Analytics</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert("Simulation alerts are operational.")} 
            className="text-on-surface-variant hover:text-primary-container transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined hover:animate-pulse">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full animate-ping"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined hover:rotate-90 transition-transform duration-300">settings</span>
          </button>
          <button 
            onClick={triggerLaunchSequence}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded font-body-sm font-semibold hover:bg-primary neon-glow transition-all cursor-pointer"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Mobile Nav Header */}
      <nav className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="font-display-lg text-primary tracking-tighter text-xl font-bold">Bhopal Tatkal</div>
        <button 
          onClick={triggerLaunchSequence}
          className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded font-body-sm font-semibold neon-glow cursor-pointer"
        >
          Launch
        </button>
      </nav>
    </>
  );
};

export default Header;