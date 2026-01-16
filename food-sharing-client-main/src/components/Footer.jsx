import React from "react";

const Footer = () => {
  return (
    <footer className="bg-cocoa text-parchment/80 border-t border-sand/10">
      <div className="page-wrap-wide py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <svg
                viewBox="0 0 48 48"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="24" cy="24" r="18" />
                <circle cx="24" cy="24" r="8" opacity="0.4" />
                <path
                  d="M30 14c-4 1-7 4-8 8 4-1 7-4 8-8z"
                  fill="currentColor"
                  stroke="none"
                  opacity="0.7"
                />
              </svg>
            </span>
            <div>
              <p className="text-lg font-semibold text-parchment">ReServe</p>
              <p className="text-xs uppercase tracking-[0.2em] text-parchment/60">
                Food sharing
              </p>
            </div>
          </div>
          <p className="text-sm text-parchment/70">
            A warm, community-first platform for sharing surplus meals with
            neighbors who need them.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-parchment mb-3">Services</h3>
          <ul className="text-sm space-y-2">
            <li className="hover:text-parchment transition">Sharing</li>
            <li className="hover:text-parchment transition">Donations</li>
            <li className="hover:text-parchment transition">Community</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-parchment mb-3">Company</h3>
          <ul className="text-sm space-y-2">
            <li className="hover:text-parchment transition">About us</li>
            <li className="hover:text-parchment transition">Contact</li>
            <li className="hover:text-parchment transition">Jobs</li>
            <li className="hover:text-parchment transition">Press kit</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-parchment mb-3">Contact</h3>
          <div className="text-sm space-y-2">
            <span className="block hover:text-parchment transition">
              hello@reserve.my
            </span>
            <span className="block hover:text-parchment transition">
              +60 12-345 6789
            </span>
          </div>
          <div className="flex space-x-4 mt-4 text-sm">
            <a className="hover:text-parchment transition">Twitter</a>
            <a className="hover:text-parchment transition">Facebook</a>
            <a className="hover:text-parchment transition">YouTube</a>
          </div>
        </div>
      </div>
      <div className="border-t border-parchment/10">
        <div className="page-wrap-wide py-6 text-xs text-parchment/60">
          Built with care for local food sharing communities.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
