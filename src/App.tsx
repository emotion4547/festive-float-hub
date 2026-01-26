import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import DeliveryPage from "./pages/DeliveryPage";
import CorporatePage from "./pages/CorporatePage";
import PrintingPage from "./pages/PrintingPage";
import ReviewsPage from "./pages/ReviewsPage";
import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import PartnersPage from "./pages/PartnersPage";
import OfferPage from "./pages/OfferPage";
import PrivacyPage from "./pages/PrivacyPage";
import WarrantyPage from "./pages/WarrantyPage";
import PaymentPage from "./pages/PaymentPage";
import ContactsPage from "./pages/ContactsPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/account/AccountPage";
import OrdersPage from "./pages/account/OrdersPage";
import AddressesPage from "./pages/account/AddressesPage";
import AccountFavoritesPage from "./pages/account/AccountFavoritesPage";
import SettingsPage from "./pages/account/SettingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/corporate" element={<CorporatePage />} />
              <Route path="/printing" element={<PrintingPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsArticlePage />} />
              <Route path="/about/partners" element={<PartnersPage />} />
              <Route path="/about/offer" element={<OfferPage />} />
              <Route path="/about/privacy" element={<PrivacyPage />} />
              <Route path="/about/warranty" element={<WarrantyPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Protected Account Routes */}
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/account/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/account/favorites" element={<ProtectedRoute><AccountFavoritesPage /></ProtectedRoute>} />
              <Route path="/account/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute>} />
              <Route path="/admin/products/:id" element={<ProtectedRoute requireAdmin><AdminProductEditPage /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviewsPage /></ProtectedRoute>} />
              <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><AdminCouponsPage /></ProtectedRoute>} />
              <Route path="/admin/pages" element={<ProtectedRoute requireAdmin><AdminPagesPage /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminCustomersPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNewsPage /></ProtectedRoute>} />
              <Route path="/admin/banners" element={<ProtectedRoute requireAdmin><AdminBannersPage /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
