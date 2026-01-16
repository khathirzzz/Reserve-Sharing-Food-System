import { Outlet, useLocation } from "react-router-dom"; // dY`^ Import useLocation
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlobalNotifications from "../components/GlobalNotifications";

const MainLayout = () => {
  const location = useLocation();

  // dY"1 Define pages where notifications should NOT run
  const noNotificationRoutes = ["/login", "/register"];

  // dY"1 Check if current path is in the list
  const showNotifications = !noNotificationRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-parchment text-cocoa flex flex-col">
      {/* dY"1 Only render if NOT on login/register */}
      {showNotifications && <GlobalNotifications />}

      <Navbar />
      <main className="flex-1 pt-20 md:pt-24">
        <div className="min-h-[calc(100vh-280px)]">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
