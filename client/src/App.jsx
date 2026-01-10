import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tenders from './pages/Tenders';
import TenderDetails from './pages/TenderDetails';
import BuyerDashboard from './pages/buyer/Dashboard';
import CreateRFQ from './pages/buyer/CreateRFQ';
import EditRFQ from './pages/buyer/EditRFQ';
import ViewBids from './pages/buyer/ViewBids';
import VendorDashboard from './pages/vendor/Dashboard';
import MyBids from './pages/vendor/MyBids';
import SubmitBid from './pages/vendor/SubmitBid';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import About from './pages/About';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="page-wrapper">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff'
                }
              }
            }}
          />
          
          <Routes>
            {/* Admin Routes (No Header/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Main Routes */}
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/tenders" element={<Tenders />} />
                      <Route path="/tenders/:id" element={<TenderDetails />} />
                      
                      {/* Informational Pages */}
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about" element={<About />} />
                      
                      {/* Buyer Routes */}
                      <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                      <Route path="/buyer/create-rfq" element={<CreateRFQ />} />
                      <Route path="/buyer/edit-rfq/:id" element={<EditRFQ />} />
                      <Route path="/buyer/rfq/:id/bids" element={<ViewBids />} />
                      <Route path="/buyer/profile" element={<Profile />} />
                      <Route path="/buyer/notifications" element={<Notifications />} />
                      
                      {/* Vendor Routes */}
                      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                      <Route path="/vendor/bids" element={<MyBids />} />
                      <Route path="/vendor/bid/:rfqId" element={<SubmitBid />} />
                      <Route path="/vendor/profile" element={<Profile />} />
                      <Route path="/vendor/notifications" element={<Notifications />} />
                      
                      {/* 404 Not Found */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
