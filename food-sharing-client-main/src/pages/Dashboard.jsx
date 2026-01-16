import { NavLink, Link } from "react-router-dom";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "bg-amber-100 text-amber-700 shadow-soft"
      : "text-clay hover:bg-cream hover:text-cocoa"
  }`;

const Dashboard = () => {
  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
          <aside className="hidden lg:block">
            <div className="card-surface p-4 space-y-2 sticky top-28">
              <NavLink to="/dashboard" className={navItemClass}>
                <DashboardIcon />
                Overview
              </NavLink>
              <NavLink to="/addFood" className={navItemClass}>
                <AddIcon />
                Add Food
              </NavLink>
              <NavLink to="/manageFood" className={navItemClass}>
                <ManageIcon />
                Manage Foods
              </NavLink>
              <NavLink to="/foodRequest" className={navItemClass}>
                <RequestIcon />
                Food Requests
              </NavLink>
            </div>
          </aside>

          <main className="flex flex-col gap-8">
            <div className="lg:hidden">
              <div className="card-surface p-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-semibold">
                  <NavLink to="/dashboard" className={navItemClass}>
                    <DashboardIcon />
                    Overview
                  </NavLink>
                  <NavLink to="/addFood" className={navItemClass}>
                    <AddIcon />
                    Add Food
                  </NavLink>
                  <NavLink to="/manageFood" className={navItemClass}>
                    <ManageIcon />
                    Manage Foods
                  </NavLink>
                  <NavLink to="/foodRequest" className={navItemClass}>
                    <RequestIcon />
                    Requests
                  </NavLink>
                </div>
              </div>
            </div>

            <div>
              <p className="section-kicker">Your hub</p>
              <h1 className="section-title mt-3">Dashboard</h1>
              <p className="section-subtitle mt-3 max-w-2xl">
                Manage listings, respond to requests, and keep your community
                plates moving with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/addFood" className="card-surface p-6 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-clay">
                      Quick action
                    </p>
                    <h3 className="text-xl font-semibold text-cocoa mt-2">
                      Add Food
                    </h3>
                    <p className="text-sm text-clay mt-2">
                      Share a fresh listing in minutes.
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:bg-amber-200">
                    <AddIcon />
                  </span>
                </div>
              </Link>

              <Link to="/manageFood" className="card-surface p-6 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-clay">
                      Quick action
                    </p>
                    <h3 className="text-xl font-semibold text-cocoa mt-2">
                      Manage Foods
                    </h3>
                    <p className="text-sm text-clay mt-2">
                      Update, edit, or remove listings.
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:bg-amber-200">
                    <ManageIcon />
                  </span>
                </div>
              </Link>

              <Link to="/foodRequest" className="card-surface p-6 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-clay">
                      Quick action
                    </p>
                    <h3 className="text-xl font-semibold text-cocoa mt-2">
                      Food Requests
                    </h3>
                    <p className="text-sm text-clay mt-2">
                      Respond and confirm pickups.
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:bg-amber-200">
                    <RequestIcon />
                  </span>
                </div>
              </Link>
            </div>

            <div className="card-soft p-6 md:flex md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-cocoa">
                  Trust & safety reminder
                </h3>
                <p className="text-sm text-clay mt-2">
                  Keep pickups smooth by confirming requests quickly and using
                  clear collection instructions.
                </p>
              </div>
              <span className="badge-available mt-4 md:mt-0">
                Community first
              </span>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

const DashboardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

const AddIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const ManageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h10" />
  </svg>
);

const RequestIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 7h10v10H7z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

export default Dashboard;
