import axios from "axios";
import { useContext } from "react";
import toast from "react-hot-toast";
import UseTitle from "../components/UseTitle";
import Lottie from "lottie-react";
import ShareLottieData from "../assets/share.json";
import { motion } from "framer-motion";
import { AuthContext } from "../provider/AuthProvider";

import useAxiosSecure from "../hooks/useAxiosSecure";

const ShareStory = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);
  UseTitle("Share Your Story");
  const handleShare = async (e) => {
    e.preventDefault();
    const form = e.target;
    const story = form.story.value;

    const formData = {
      image: user?.photoURL,
      name: user?.displayName,
      story,
    };

    const { data } = await axiosSecure.post("/story", formData);
    if (data.insertedId) {
      toast.success("Story posted successfully");
    }
  };

  return (
    <section className="section-pad">
      <div className="page-wrap">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-title"
        >
          Share Your Story
        </motion.h2>
        <p className="section-subtitle mt-2 max-w-2xl">
          Inspire others by sharing how food sharing has impacted your community.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-8 items-center">
          <form
            className="card-surface p-6 sm:p-8 space-y-6"
            onSubmit={handleShare}
          >
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-lg font-semibold">
                  Your Story
                </span>
              </label>
              <textarea
                name="story"
                placeholder="Write your story here..."
                className="textarea-warm w-full h-40 p-4"
                required
              ></textarea>
            </div>
            <motion.input
              type="submit"
              value="Share Now"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-warm w-full"
            />
          </form>
          <div className="hidden md:block">
            <div className="card-surface p-4">
              <Lottie animationData={ShareLottieData} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShareStory;
