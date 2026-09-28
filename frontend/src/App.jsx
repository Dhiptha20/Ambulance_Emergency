import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ToastProvider } from './hooks/useToast.jsx';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Ambulances } from './pages/Ambulances';
import { EmergencyCalls } from './pages/EmergencyCalls';
import { CreateEmergencyCall } from './pages/CreateEmergencyCall';
import { Zones } from './pages/Zones';
import { ZoneProximity } from './pages/ZoneProximity';
import { Analytics } from './pages/Analytics';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="ambulances" element={<Ambulances />} />
          <Route path="emergency-calls" element={<EmergencyCalls />} />
          <Route path="emergency-calls/new" element={<CreateEmergencyCall />} />
          <Route path="zones" element={<Zones />} />
          <Route path="proximity" element={<ZoneProximity />} />
          <Route path="analytics" element={<Analytics />} />
          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
