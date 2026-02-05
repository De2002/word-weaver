import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { BottomNav } from "@/components/BottomNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import PoemDetail from "./pages/PoemDetail";
import TagPage from "./pages/TagPage";
import More from "./pages/More";
import About from "./pages/About";
import Rules from "./pages/Rules";
import UserAgreement from "./pages/UserAgreement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import { SubmitEventForm } from "./components/events/SubmitEventForm";
import ChapbooksStore from "./pages/ChapbooksStore";
import ChapbookDetail from "./pages/ChapbookDetail";
import SubmitChapbook from "./pages/SubmitChapbook";
import Meet from "./pages/Meet";
import Trails from "./pages/Trails";
import TrailDetail from "./pages/TrailDetail";
import CreateTrail from "./pages/CreateTrail";
import EditTrail from "./pages/EditTrail";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import PoetJournals from "./pages/PoetJournals";
import JournalDetail from "./pages/JournalDetail";
import CreateJournal from "./pages/CreateJournal";
import EditJournal from "./pages/EditJournal";
import AdminDashboard from "./pages/AdminDashboard";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
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
            <Route path="/poem/:slug" element={<PoemDetail />} />
            <Route path="/tag/:tag" element={<TagPage />} />
            <Route path="/more" element={<More />} />
            <Route path="/meet" element={<Meet />} />
            <Route path="/about" element={<About />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/user-agreement" element={<UserAgreement />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route
              path="/events/submit"
              element={
                <ProtectedRoute>
                  <SubmitEventForm />
                </ProtectedRoute>
              }
            />
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
            {/* Chapbooks Store */}
            <Route path="/chapbooks" element={<ChapbooksStore />} />
            <Route path="/chapbooks/:id" element={<ChapbookDetail />} />
            <Route
              path="/chapbooks/submit"
              element={
                <ProtectedRoute>
                  <SubmitChapbook />
                </ProtectedRoute>
              }
            />
            {/* Trails */}
            <Route path="/trails" element={<Trails />} />
            <Route path="/trails/:id" element={<TrailDetail />} />
            <Route
              path="/trails/create"
              element={
                <ProtectedRoute>
                  <CreateTrail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trails/:id/edit"
              element={
                <ProtectedRoute>
                  <EditTrail />
                </ProtectedRoute>
              }
            />
            {/* Poet Journals */}
            <Route path="/journals" element={<PoetJournals />} />
            <Route path="/journals/:id" element={<JournalDetail />} />
            <Route
              path="/journals/create"
              element={
                <ProtectedRoute>
                  <CreateJournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journals/:id/edit"
              element={
                <ProtectedRoute>
                  <EditJournal />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
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
