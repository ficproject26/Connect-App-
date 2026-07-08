import React from 'react';
import Hero from '../../components/landing/Hero';
import Ecosystem from '../../components/landing/Ecosystem';
import Pricing from '../../components/landing/Pricing';
import ServicesSection from '../../components/landing/ServicesSection';
import HowItWorks from '../../components/landing/HowItWorks';
import MobileApp from '../../components/landing/MobileApp';
import CTA from '../../components/landing/CTA';
import BranchLocations from '../../components/landing/BranchLocations';

export default function LandingPage({ onJoinClick, onCategoryClick }) {
  return (
    <>
      {/* Hero Section with stacked credit cards and world map */}
      <Hero onJoinClick={onJoinClick} />

      {/* 6-Pillar Ecosystem Grid */}
      <Ecosystem onCardClick={onCategoryClick} />

      {/* Pricing Tiers Selection Cards */}
      <Pricing onSelectTier={onJoinClick} />

      {/* Business Services Section */}
      <ServicesSection onCategoryClick={onCategoryClick} />

      {/* How It Works steps */}
      <HowItWorks />

      {/* Mobile App promo and phone mockup */}
      <MobileApp />

      {/* CTA card banner */}
      <CTA onJoinClick={onJoinClick} />

      {/* Branch & Office Locations */}
      <BranchLocations />
    </>
  );
}
