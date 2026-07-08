import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function LandingLayout({ 
  children, 
  theme, 
  toggleTheme, 
  currentUser, 
  onLogOut, 
  onAuthClick, 
  onHomeClick, 
  onCategoryClick, 
  isJobsOpen, 
  setIsJobsOpen,
  onDashboardClick
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        onHomeClick={onHomeClick} 
        onCategoryClick={onCategoryClick}
        isJobsOpen={isJobsOpen}
        setIsJobsOpen={setIsJobsOpen}
        currentUser={currentUser}
        onLogOut={onLogOut}
        onAuthClick={onAuthClick}
        onDashboardClick={onDashboardClick}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
