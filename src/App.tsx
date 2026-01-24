import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import PoemDetail from "./pages/PoemDetail";
import TagPage from "./pages/TagPage";
import More from "./pages/More";
import CreatePoetry from "./pages/CreatePoetry";
import Start from "./pages/Start";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPoems from "./pages/MyPoems";
import EditPoem from "./pages/EditPoem";
import PoetProfile from "./pages/PoetProfile";
import Notifications from "./pages/Notifications";
import SavedPoems from "./pages/SavedPoems";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/discover" element={<Discover />} />
            <Route path="/search" element={<Search />} />
            <Route path="/poet/:username" element={<PoetProfile />} />
            <Route path="/poem/:id" element={<PoemDetail />} />
            <Route path="/tag/:tag" element={<TagPage />} />
            <Route path="/more" element={<More />} />
            <Route
              path="/create/poetry"
              element={
                <ProtectedRoute>
                  <CreatePoetry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-poems"
              element={
                <ProtectedRoute>
                  <MyPoems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/poems/:id/edit"
              element={
                <ProtectedRoute>
                  <EditPoem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPoems />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
