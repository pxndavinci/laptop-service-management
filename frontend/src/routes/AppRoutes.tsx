import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ServiceOrders from '../pages/ServiceOrders';
import ServiceTimeline from '../pages/ServiceTimeline';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/service-orders" element={<ServiceOrders />} />
        <Route path="/service-timeline" element={<ServiceTimeline />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
