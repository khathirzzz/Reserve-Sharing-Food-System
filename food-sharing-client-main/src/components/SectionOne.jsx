import img from "../assets/assets/our_food.jpg";

const SectionOne = () => {
  return (
    <section className="section-pad">
      <div className="page-wrap grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <p className="section-kicker">Food sharing platform</p>
          <h2 className="section-title">Welcome to ReServe</h2>
          <p className="section-subtitle">
            At ReServe, we connect those who have surplus food with neighbors in
            need. Reduce waste while making a meaningful impact in your
            community. Whether you want to donate or request food, we make the
            process seamless and rewarding.
          </p>
          <ul className="space-y-2 text-clay">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
              Save food from going to waste.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
              Help those in need in your community.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
              Foster a sustainable and caring culture.
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="card-surface overflow-hidden">
            <img
              src={img}
              alt="Fresh meal"
              className="w-full h-[360px] md:h-[420px] object-cover"
            />
          </div>
          <div className="absolute -bottom-6 right-6 bg-amber-500 text-white text-center px-5 py-4 rounded-2xl shadow-soft">
            <span className="text-2xl font-bold">5+</span>
            <p className="text-xs uppercase tracking-[0.2em] text-white/80 mt-1">
              Years of community care
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionOne;
