import React from 'react';
import useAuth from '../hooks/useAuth';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import CustomerLayout from '../layouts/CustomerLayout';
// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import JoinNowPage from '../pages/auth/JoinNowPage';
import CustomerDashboard from '../pages/customer/Dashboard';
import CategoryDetails from '../pages/landing/CategoryDetails';
import SubServiceDetails from '../pages/landing/SubServiceDetails';

export default function AppRoutes({
  currentPage,
  setCurrentPage,
  activeCategory,
  activeSubService,
  theme,
  toggleTheme,
  isJobsOpen,
  setIsJobsOpen,
  handleCategoryClick,
  handleHomeNavigate
}) {
  const { currentUser, login, logout, register } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user) => {
    setCurrentPage('dashboard');
  };

  // Routing decisions
  if (currentUser && currentPage === 'dashboard') {
    return (
      <CustomerLayout>
        <CustomerDashboard 
          currentUser={currentUser} 
          onLogOut={handleLogout} 
          onJobsClick={() => setIsJobsOpen(true)}
          onCategoryClick={handleCategoryClick}
        />
      </CustomerLayout>
    );
  }

  if (currentPage === 'login') {
    return (
      <AuthLayout>
        <LoginPage
          onAuthSuccess={(user) => {
            login(user.email, user.role, handleAuthSuccess);
          }}
          onBackToHome={handleHomeNavigate}
          onNavigateToJoinNow={() => setCurrentPage('join-now')}
        />
      </AuthLayout>
    );
  }

  if (currentPage === 'join-now') {
    return (
      <AuthLayout>
        <JoinNowPage
          onAuthSuccess={(user) => {
            register(user, user.role, handleAuthSuccess);
          }}
          onBackToHome={handleHomeNavigate}
          onNavigateToLoginPage={() => setCurrentPage('login')}
        />
      </AuthLayout>
    );
  }

  // Else, we are in Landing Layout (Home / Landing details)
  return (
    <LandingLayout
      theme={theme}
      toggleTheme={toggleTheme}
      onHomeClick={handleHomeNavigate} 
      onCategoryClick={handleCategoryClick}
      isJobsOpen={isJobsOpen}
      setIsJobsOpen={setIsJobsOpen}
      currentUser={currentUser}
      onLogOut={handleLogout}
      onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
      onDashboardClick={() => setCurrentPage('dashboard')}
    >
      {currentPage === 'details' ? (
        <CategoryDetails
          category={activeCategory}
          onBack={handleHomeNavigate}
          onSubCategoryClick={(subTitle) => handleCategoryClick(subTitle, true)}
        />
      ) : currentPage === 'sub-details' ? (
        <SubServiceDetails
          title={activeSubService}
          onBack={handleHomeNavigate}
        />
      ) : (
        <LandingPage
          onJoinClick={() => setCurrentPage('join-now')}
          onCategoryClick={handleCategoryClick}
          theme={theme}
        />
      )}
    </LandingLayout>
  );
}
