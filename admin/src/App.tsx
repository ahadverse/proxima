import { lazy, Suspense, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/app-layout';
import { ConfirmProvider } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/misc';
import { ApiError } from '@/lib/api';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/not-found';

const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProductsPage = lazy(() => import('@/pages/products'));
const ProductEditorPage = lazy(() => import('@/pages/product-editor'));
const CategoriesPage = lazy(() => import('@/pages/categories'));
const OrdersPage = lazy(() => import('@/pages/orders'));
const OrderDetailPage = lazy(() => import('@/pages/order-detail'));
const UsersPage = lazy(() => import('@/pages/users'));
const UserDetailPage = lazy(() => import('@/pages/user-detail'));
const CouponsPage = lazy(() => import('@/pages/coupons'));
const RatingsPage = lazy(() => import('@/pages/ratings'));
const VideoReviewsPage = lazy(() => import('@/pages/video-reviews'));
const PagesPage = lazy(() => import('@/pages/pages'));
const PageEditorPage = lazy(() => import('@/pages/page-editor'));
const SettingsPage = lazy(() => import('@/pages/settings'));

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="mt-6 h-72 w-full rounded-2xl" />
    </div>
  );
}

const page = (Component: React.ComponentType) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: page(DashboardPage) },
      { path: 'products', element: page(ProductsPage) },
      { path: 'products/new', element: page(ProductEditorPage) },
      { path: 'products/:id', element: page(ProductEditorPage) },
      { path: 'categories', element: page(CategoriesPage) },
      { path: 'orders', element: page(OrdersPage) },
      { path: 'orders/:id', element: page(OrderDetailPage) },
      { path: 'users', element: page(UsersPage) },
      { path: 'users/:id', element: page(UserDetailPage) },
      { path: 'coupons', element: page(CouponsPage) },
      { path: 'ratings', element: page(RatingsPage) },
      { path: 'video-reviews', element: page(VideoReviewsPage) },
      { path: 'pages', element: page(PagesPage) },
      { path: 'pages/new', element: page(PageEditorPage) },
      { path: 'pages/:id', element: page(PageEditorPage) },
      { path: 'settings', element: page(SettingsPage) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20 * 1000,
            refetchOnWindowFocus: false,
            retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <RouterProvider router={router} />
      </ConfirmProvider>
      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { borderRadius: 12 } }} />
    </QueryClientProvider>
  );
}
