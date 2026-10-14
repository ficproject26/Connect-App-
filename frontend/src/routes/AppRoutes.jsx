import React, { useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useCustomer from '../hooks/useCustomer';
import { authService } from '../services/authService';
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
import AccountStatusNotice from '../pages/auth/AccountStatusNotice';

import ErrorBoundary from '../components/common/ErrorBoundary';

export default function AppRoutes({
  currentPage,
  setCurrentPage,
  activeCategory,
  setActiveCategory,
  activeSubService,
  setActiveSubService,
  theme,
  toggleTheme,
  isJobsOpen,
  setIsJobsOpen,
  handleCategoryClick,
  handleHomeNavigate
}) {
  const { currentUser, login, logout, register } = useAuth();
  const { resetCustomerState } = useCustomer();
  const isLoggingOutRef = useRef(false);

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      // 1. Immediately terminate auth session, clear tokens, user & cookies
      await logout();

      // 2. Clear customer context state in memory and storage (wallet, tier, transactions)
      if (typeof resetCustomerState === 'function') {
        resetCustomerState();
      }

      // 3. Switch route to public landing page ('home')
      setCurrentPage('home');
      if (typeof handleHomeNavigate === 'function') {
        handleHomeNavigate();
      }

      // 4. Update browser URL to public landing ('/') and replace history state
      // so browser back navigation cannot expose authenticated dashboard
      try {
        if (typeof window !== 'undefined') {
          window.history.replaceState({ page: 'home', category: null, subService: null }, '', '/');
        }
      } catch (e) {}
    } catch (err) {
      console.warn("Logout error:", err);
      setCurrentPage('home');
    } finally {
      isLoggingOutRef.current = false;
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentPage('dashboard');
    try {
      if (typeof window !== 'undefined') {
        window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
      }
    } catch (e) {}
  };

  const effectiveUser = currentUser || null;

  // Protected pages that strictly require authenticated user session
  const protectedPages = [
    'dashboard', 'profile', 'orders', 'bookings', 'jobs', 'myjobs',
    'wallet', 'membership', 'membership-card', 'card', 'payments', 'settings'
  ];

  // Account Approval & Role Isolation Guard
  const userRole = (currentUser?.role || '').toLowerCase();
  const userStatus = (currentUser?.status || '').toLowerCase();
  const userApproval = (currentUser?.approvalStatus || '').toLowerCase();

  const isPendingAccount = ['pending', 'pending_approval', 'pending approval', 'under_verification', 'under verification', 'in_review', 'in review'].includes(userStatus) ||
                           ['pending', 'pending_approval', 'pending approval', 'under_verification', 'under verification', 'in_review', 'in review'].includes(userApproval);
  const isSuspendedAccount = ['suspended', 'rejected', 'inactive'].includes(userStatus) ||
                             ['suspended', 'rejected'].includes(userApproval);
  const isUnauthorizedRole = currentUser && userRole && userRole !== 'customer';

  // If authenticated user is pending, suspended, or unauthorized for the Customer application context:
  if (currentUser && (isPendingAccount || isSuspendedAccount || isUnauthorizedRole)) {
    let statusType = 'pending';
    if (isUnauthorizedRole) statusType = 'unauthorized_role';
    else if (isSuspendedAccount) statusType = 'suspended';

    return (
      <AuthLayout>
        <AccountStatusNotice
          statusType={statusType}
          user={currentUser}
          onLogout={handleLogout}
          onBackHome={handleHomeNavigate}
        />
      </AuthLayout>
    );
  }

  // Protected route auth guard: unauthenticated access to protected routes strictly redirects to Public Landing Page
  if (protectedPages.includes(currentPage) && !currentUser) {
    return (
      <CustomerLayout>
        <ErrorBoundary>
          <CustomerDashboard 
            key="guest"
            currentUser={null} 
            onLogOut={handleLogout} 
            onJobsClick={() => setIsJobsOpen(true)}
            onCategoryClick={handleCategoryClick}
            isLandingPage={true}
            hideProfile={true}
            onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
            onNavigateToJoinNow={() => setCurrentPage('join-now')}
          />
        </ErrorBoundary>
      </CustomerLayout>
    );
  }

  // Routing decisions
  if (currentPage === 'dashboard') {
    return (
      <CustomerLayout>
        <ErrorBoundary>
          <CustomerDashboard 
            key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
            currentUser={effectiveUser} 
            onLogOut={handleLogout} 
            onJobsClick={() => setIsJobsOpen(true)}
            onCategoryClick={handleCategoryClick}
          />
        </ErrorBoundary>
      </CustomerLayout>
    );
  }

  if (currentPage === 'login') {
    if (currentUser) {
      return (
        <CustomerLayout>
          <ErrorBoundary>
            <CustomerDashboard 
              key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
              currentUser={effectiveUser} 
              onLogOut={handleLogout} 
              onJobsClick={() => setIsJobsOpen(true)}
              onCategoryClick={handleCategoryClick}
            />
          </ErrorBoundary>
        </CustomerLayout>
      );
    }

    return (
      <AuthLayout>
        <LoginPage
          onAuthSuccess={handleAuthSuccess}
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

  // Details or Sub-details views
  if (currentPage === 'details' || currentPage === 'sub-details') {
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
        ) : (
          <SubServiceDetails
            title={activeSubService}
            onBack={handleHomeNavigate}
          />
        )}
      </LandingLayout>
    );
  }

  // Home / Landing Page: renders full Customer Dashboard experience (hiding profile when guest)
  return (
    <CustomerLayout>
      <ErrorBoundary>
        <CustomerDashboard 
          key={currentUser ? (currentUser.id || currentUser.customerId || currentUser.email || 'authenticated') : 'guest'}
          currentUser={currentUser} 
          onLogOut={handleLogout} 
          onJobsClick={() => setIsJobsOpen(true)}
          onCategoryClick={handleCategoryClick}
          isLandingPage={true}
          hideProfile={!currentUser}
          onAuthClick={(tab) => setCurrentPage(tab === 'login' ? 'login' : 'join-now')}
          onNavigateToJoinNow={() => setCurrentPage('join-now')}
        />
      </ErrorBoundary>
    </CustomerLayout>
  );
}
