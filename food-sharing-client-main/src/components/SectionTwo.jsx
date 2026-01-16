import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const SectionTwo = () => {
  const { data: storys = [], isLoading } = useQuery({
    queryKey: ["storys"],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/story`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="section-pad">
        <div className="page-wrap">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="card-surface p-6 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-sand/60 mx-auto" />
                <div className="h-4 w-1/2 bg-sand/60 rounded mt-4 mx-auto" />
                <div className="h-3 w-4/5 bg-sand/50 rounded mt-3 mx-auto" />
                <div className="h-3 w-3/5 bg-sand/40 rounded mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="text-center max-w-2xl mx-auto">
          <p className="section-kicker">Community stories</p>
          <h2 className="section-title mt-4">Making a Difference Together</h2>
          <p className="section-subtitle mt-3">
            Real stories from donors and recipients who are reducing food waste
            and making an impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {storys?.map((story, idx) => (
            <div
              key={idx}
              className="card-surface p-6 text-center transition duration-200 hover:-translate-y-1"
            >
              <img
                src={story?.image}
                alt={story?.name}
                referrerPolicy="no-referrer"
                className="rounded-full w-14 h-14 object-cover mx-auto mb-4 ring-2 ring-amber-100"
              />
              <h3 className="text-lg font-semibold text-cocoa">
                {story?.name}
              </h3>
              <p className="text-clay mt-4 text-sm">"{story?.story}"</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-12">
        <Link to="/shareStory">
          <button className="btn-ghost-warm">Share Your Story</button>
        </Link>
      </div>
    </section>
  );
};

export default SectionTwo;
