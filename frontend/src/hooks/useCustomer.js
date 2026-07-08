import { useContext } from 'react';
import { CustomerContext } from '../context/CustomerContext';

export default function useCustomer() {
  return useContext(CustomerContext);
}
