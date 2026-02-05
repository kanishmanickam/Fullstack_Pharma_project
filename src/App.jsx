import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import StockIntelligence from './pages/StockIntelligence';
import ExcelUpload from './pages/ExcelUpload';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/billing"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff']}>
                <Billing />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff']}>
                <Customers />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/excel-upload"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff']}>
                <ExcelUpload />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/stock-intelligence"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <StockIntelligence />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
