import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import CleaningProcess from './pages/CleaningProcess.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import ServiceCity from './pages/ServiceCity.jsx';
import CityPage from './pages/CityPage.jsx';
import Locations from './pages/Locations.jsx';
import Pricing from './pages/Pricing.jsx';
import Government from './pages/Government.jsx';
import Reviews from './pages/Reviews.jsx';
import BeforeAfter from './pages/BeforeAfter.jsx';
import Contact from './pages/Contact.jsx';
import Booking from './pages/Booking.jsx';
import BlogIndex from './pages/BlogIndex.jsx';
import BlogPost from './pages/BlogPost.jsx';
import IndustryDetail from './pages/IndustryDetail.jsx';
import IndustryCity from './pages/IndustryCity.jsx';
import NotFound from './pages/NotFound.jsx';
import Admin from './admin/Admin.jsx';
import CleanlinessReportCard from './components/CleanlinessReportCard.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/about" element={<Navigate to="/about-us" replace />} />
        <Route path="/cleaning-process" element={<CleaningProcess />} />
        <Route path="/services-offered" element={<Services />} />
        <Route path="/services" element={<Navigate to="/services-offered" replace />} />

        {/* Common aliases & legacy redirect helpers */}
        <Route path="/booking" element={<Navigate to="/book" replace />} />
        <Route path="/estimate" element={<Navigate to="/pricing" replace />} />
        <Route path="/quote" element={<Navigate to="/pricing" replace />} />
        <Route path="/calculator" element={<Navigate to="/pricing" replace />} />
        <Route path="/post-title-here*" element={<Navigate to="/blog" replace />} />
        <Route path="/sample-page*" element={<Navigate to="/" replace />} />
        <Route path="/hello-world*" element={<Navigate to="/blog" replace />} />

        {/* Programmatic SEO routes */}
        <Route path="/services/:service" element={<ServiceDetail />} />
        <Route path="/services/:service/:city" element={<ServiceCity />} />
        <Route path="/cleaning-services/:city" element={<CityPage />} />
        <Route path="/industries/:industry" element={<IndustryDetail />} />
        <Route path="/industries/:industry/:city" element={<IndustryCity />} />
        <Route path="/locations" element={<Locations />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/government-contract" element={<Government />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/before-after" element={<BeforeAfter />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/contact" element={<Navigate to="/contact-us" replace />} />
        <Route path="/book" element={<Booking />} />
        <Route path="/report/:id" element={<CleanlinessReportCard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/*" element={<Admin />} />
    </Routes>
  );
}
