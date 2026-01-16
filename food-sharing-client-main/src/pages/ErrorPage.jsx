import { Link, useRouteError } from "react-router-dom";
import err from "../assets/assets/404.png";
const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cocoa text-parchment px-6">
      <div className="absolute inset-0">
        <img
          src={err}
          alt="404 Background"
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-cocoa/70" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <p className="section-kicker text-parchment/70">Lost and hungry?</p>
        <h1 className="text-4xl sm:text-5xl font-semibold mt-4">Page not found</h1>
        <p className="text-parchment/80 mt-3">
          The page you are looking for is unavailable. Let us get you back home.
        </p>
        <div className="mt-8">
          <Link to="/">
            <button className="btn-warm">Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
