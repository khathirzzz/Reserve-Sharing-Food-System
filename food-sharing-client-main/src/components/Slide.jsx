import { Link } from "react-router-dom";

const Slide = ({ img, text, title }) => {
  return (
    <div
      className="relative bg-cover bg-center h-[440px] sm:h-[520px] lg:h-[580px] w-full"
      style={{ backgroundImage: `url(${img})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cocoa/40 via-cocoa/30 to-cocoa/80" />
      <div className="relative z-10 h-full flex items-center">
        <div className="page-wrap-wide">
          <div className="max-w-2xl text-left text-parchment">
            <p className="section-kicker text-parchment/80">Share a warm plate</p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mt-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-parchment/80 mt-4">
              {text}
            </p>
            <Link to="/addFood" className="inline-flex mt-6">
              <button className="btn-warm">Donate Now</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide;
