import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
// HashRouter, not BrowserRouter: GitHub Pages has no server to rewrite deep
// links back to index.html, so a refresh on any other path would 404.
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Layout from '@/components/Layout';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import RecipeForm from '@/pages/RecipeForm';
import Plan from '@/pages/Plan';
import Cooking from '@/pages/Cooking';
import ShoppingList from '@/pages/ShoppingList';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Recipes />} />
                <Route path="/recipes/new" element={<RecipeForm />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/recipes/:id/edit" element={<RecipeForm />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/plan/:planId/cook" element={<Cooking />} />
                <Route path="/recipes/:id/cook" element={<Cooking />} />
                <Route path="/shopping" element={<ShoppingList />} />
              </Route>
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
