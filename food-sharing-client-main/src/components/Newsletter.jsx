import toast from "react-hot-toast";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    toast.success("Email sent!");
    setEmail("");
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <div className="card-surface p-8 sm:p-10 text-center">
          <h2 className="text-3xl font-semibold text-cocoa">
            Stay Updated with Food Sharing News
          </h2>
          <p className="text-clay mt-3">
            Subscribe to get updates on food posts, community stories, and
            new initiatives.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="input-warm w-full sm:w-2/3"
              required
            />
            <button type="submit" className="btn-warm">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
