import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Skeleton } from "@/components/ui/skeleton";

// Critical path — loaded eagerly
import Index from "./pages/Index";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";

// Lazy-loaded routes for code splitting
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const DeliveryPage = lazy(() => import("./pages/DeliveryPage"));
const CorporatePage = lazy(() => import("./pages/CorporatePage"));
const PrintingPage = lazy(() => import("./pages/PrintingPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsArticlePage = lazy(() => import("./pages/NewsArticlePage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const OfferPage = lazy(() => import("./pages/OfferPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const WarrantyPage = lazy(() => import("./pages/WarrantyPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AboutDetailsPage = lazy(() => import("./pages/AboutDetailsPage"));
const MailingConsentPage = lazy(() => import("./pages/MailingConsentPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Account pages
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const OrdersPage = lazy(() => import("./pages/account/OrdersPage"));
const AddressesPage = lazy(() => import("./pages/account/AddressesPage"));
const AccountFavoritesPage = lazy(() => import("./pages/account/AccountFavoritesPage"));
const SettingsPage = lazy(() => import("./pages/account/SettingsPage"));
const AccountCouponsPage = lazy(() => import("./pages/account/AccountCouponsPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminProductEditPage = lazy(() => import("./pages/admin/AdminProductEditPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/AdminReviewsPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminWheelPage = lazy(() => import("./pages/admin/AdminWheelPage"));
const AdminNewsPage = lazy(() => import("./pages/admin/AdminNewsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminShowcasePage = lazy(() => import("./pages/admin/AdminShowcasePage"));
const AdminCollectionEditPage = lazy(() => import("./pages/admin/AdminCollectionEditPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about/offer" element={<OfferPage />} />
                <Route path="/about/privacy" element={<PrivacyPage />} />
                <Route path="/about/warranty" element={<WarrantyPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/about/details" element={<AboutDetailsPage />} />
                <Route path="/about/mailing" element={<MailingConsentPage />} />
                <Route path="/collection/:slug" element={<CollectionPage />} />
                {/* Protected Account Routes */}
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/account/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                <Route path="/account/favorites" element={<ProtectedRoute><AccountFavoritesPage /></ProtectedRoute>} />
                <Route path="/account/coupons" element={<ProtectedRoute><AccountCouponsPage /></ProtectedRoute>} />
                <Route path="/account/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute>} />
                <Route path="/admin/products/:id" element={<ProtectedRoute requireAdmin><AdminProductEditPage /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviewsPage /></ProtectedRoute>} />
                <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><AdminCouponsPage /></ProtectedRoute>} />
                <Route path="/admin/wheel" element={<ProtectedRoute requireAdmin><AdminWheelPage /></ProtectedRoute>} />
                <Route path="/admin/showcase" element={<ProtectedRoute requireAdmin><AdminShowcasePage /></ProtectedRoute>} />
                <Route path="/admin/collections/:id" element={<ProtectedRoute requireAdmin><AdminCollectionEditPage /></ProtectedRoute>} />
                <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNewsPage /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SiteDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
