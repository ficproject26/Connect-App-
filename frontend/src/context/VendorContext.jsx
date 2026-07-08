import React, { createContext, useState, useEffect } from 'react';

export const VendorContext = createContext(null);

export function VendorProvider({ children }) {
  const [shopDetails, setShopDetails] = useState(() => {
    const saved = localStorage.getItem('connect_vendor_shop');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_vendor_shop:", err);
      }
    }
    return {
      logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      shopName: 'ABC Electronics',
      ownerName: 'Ravi Sharma',
      businessType: 'Electronics Store',
      gstNumber: '07ABCDE1234F1Z5',
      mobileNumber: '+91 98765 43210',
      email: 'abc.electronics@gmail.com',
      address: 'Karol Bagh, New Delhi, 110005',
      openingTime: '10:00 AM',
      closingTime: '09:00 PM',
      description: 'ABC Electronics is a premium outlet featuring state-of-the-art audiovisual products, luxury wearables, high-fidelity gadgets, and premium smartphone accessories.',
      rating: 4.8,
      reviewsCount: 230,
      totalCustomers: 1245,
      memberVisits: 530,
      totalSales: 2845000,
      partnerSince: '2025'
    };
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('connect_vendor_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_vendor_products:", err);
      }
    }
    return [
      { id: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', name: 'boAt Rockerz 450', category: 'Audio', description: 'Wireless Bluetooth Headphone with Up to 15 Hours Playback and 40mm Dynamic Drivers.', mrp: 2999, offerPrice: 2500, stock: 32, status: 'In Stock' },
      { id: 2, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80', name: 'Noise Air Buds Pro', category: 'Audio', description: 'Truly Wireless Earbuds with Active Noise Cancellation (ANC), 20 Hour Playtime and Quad Mic.', mrp: 3999, offerPrice: 3000, stock: 28, status: 'In Stock' },
      { id: 3, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=300&q=80', name: 'Zebronics Speaker', category: 'Audio', description: 'Powerful Portable Bluetooth Speaker with Rich Bass, LED Lights, and Built-in FM Radio.', mrp: 1999, offerPrice: 1500, stock: 15, status: 'Low Stock' },
      { id: 4, image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&w=300&q=80', name: 'Ambrane Power Bank', category: 'Accessories', description: '20000mAh Power Bank with 22.5W Fast Charging and Dual USB Output.', mrp: 2499, offerPrice: 2000, stock: 18, status: 'In Stock' },
      { id: 5, image: 'https://images.unsplash.com/photo-1541667590243-5b8d234aa6b1?auto=format&fit=crop&w=300&q=80', name: 'Portronics Cable', category: 'Accessories', description: 'Rugged USB Type-C charging and data sync cable, 1.5m long.', mrp: 999, offerPrice: 800, stock: 41, status: 'In Stock' },
      { id: 6, image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=300&q=80', name: 'OnePlus Nord Watch', category: 'Wearables', description: 'Smartwatch with 1.78" AMOLED display, SPO2 tracking, and 105 sports modes.', mrp: 6999, offerPrice: 5000, stock: 8, status: 'Low Stock' },
      { id: 7, image: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&w=300&q=80', name: 'Samsung Galaxy Buds', category: 'Audio', description: 'Premium noise cancelling wireless earbuds with rich sound signature.', mrp: 9999, offerPrice: 8500, stock: 0, status: 'Out of Stock' }
    ];
  });

  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('connect_vendor_offers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_vendor_offers:", err);
      }
    }
    return [
      { id: 1, name: 'Summer Sale', discount: 20, type: 'Flash Sale', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Active' },
      { id: 2, name: 'Weekend Special', discount: 15, type: 'Seasonal Offer', startDate: '2026-06-01', endDate: '2026-06-30', status: 'Active' },
      { id: 3, name: 'Member Exclusive', discount: 25, type: 'Discount Coupon', startDate: '2026-06-15', endDate: '2026-07-15', status: 'Active' }
    ];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('connect_vendor_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_vendor_orders:", err);
      }
    }
    return [
      { id: 'ORD1245', customer: 'Amit Verma', type: 'Silver', product: 'boAt Rockerz 450', amount: 2499, status: 'Delivered', date: '2026-06-16' },
      { id: 'ORD1244', customer: 'Neha Singh', type: 'Gold', product: 'OnePlus Nord Watch', amount: 3999, status: 'Processing', date: '2026-06-15' },
      { id: 'ORD1243', customer: 'Rohit Gupta', type: 'Diamond', product: 'Samsung Galaxy Buds', amount: 1299, status: 'Pending', date: '2026-06-14' },
      { id: 'ORD1242', customer: 'Pooja Sharma', type: 'Silver', product: 'Ambrane Power Bank', amount: 799, status: 'Delivered', date: '2026-06-12' },
      { id: 'ORD1241', customer: 'Vikram Joshi', type: 'Gold', product: 'Noise Air Buds Pro', amount: 2199, status: 'Cancelled', date: '2026-06-10' }
    ];
  });

  const [membershipBenefits, setMembershipBenefits] = useState(() => {
    const saved = localStorage.getItem('connect_vendor_membership');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_vendor_membership:", err);
      }
    }
    return {
      silverDiscount: 10,
      goldDiscount: 20,
      diamondDiscount: 30,
      revenueSilver: 75000,
      revenueGold: 105000,
      revenueDiamond: 65000,
      customersSilver: 45,
      customersGold: 32,
      customersDiamond: 12
    };
  });

  const [notifications, setNotifications] = useState(() => {
    return [
      { id: 1, type: 'order', text: 'New order #ORD1245 received from Amit Verma (Silver)', read: false, time: '2 mins ago' },
      { id: 2, type: 'stock', text: 'Low Stock Alert: Zebronics Speaker is down to 15 items', read: false, time: '1 hour ago' },
      { id: 3, type: 'customer', text: 'New Gold Membership Customer registered: Neha Singh', read: true, time: '3 hours ago' },
      { id: 4, type: 'offer', text: 'Offer Expiry Reminder: Summer Sale expires in 3 days', read: true, time: '1 day ago' },
      { id: 5, type: 'revenue', text: 'Revenue Milestone: You hit ₹2,00,000 monthly sales!', read: true, time: '2 days ago' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('connect_vendor_shop', JSON.stringify(shopDetails));
  }, [shopDetails]);

  useEffect(() => {
    localStorage.setItem('connect_vendor_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('connect_vendor_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('connect_vendor_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('connect_vendor_membership', JSON.stringify(membershipBenefits));
  }, [membershipBenefits]);

  const updateShop = (newDetails) => {
    setShopDetails(newDetails);
  };

  const addProduct = (prod) => {
    setProducts(prev => [prod, ...prev]);
  };

  const updateProduct = (prod) => {
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addOffer = (offer) => {
    setOffers(prev => [offer, ...prev]);
  };

  const deleteOffer = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <VendorContext.Provider value={{
      shopDetails,
      products,
      offers,
      orders,
      membershipBenefits,
      notifications,
      updateShop,
      addProduct,
      updateProduct,
      deleteProduct,
      addOffer,
      deleteOffer,
      updateOrderStatus,
      addNotification,
      markAllNotificationsRead,
      setMembershipBenefits
    }}>
      {children}
    </VendorContext.Provider>
  );
}
