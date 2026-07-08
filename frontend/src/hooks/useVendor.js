import { useContext } from 'react';
import { VendorContext } from '../context/VendorContext';

export default function useVendor() {
  return useContext(VendorContext);
}
