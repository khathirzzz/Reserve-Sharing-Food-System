import Banner from "../components/Banner";
import FeaturedFoods from "../components/FeaturedFoods";
import UseTitle from "../components/UseTitle";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import Newsletter from "../components/Newsletter";
import CommunityImpact from "../components/CommunityImpact";

const Home = () => {
  UseTitle("Home");
  return (
    <div>
      <section className="pb-6 sm:pb-8">
        <Banner></Banner>
      </section>

      <SectionOne></SectionOne>

      <section className="section-pad bg-cream/60 border-y border-sand/60">
        <div className="page-wrap">
          <div className="max-w-2xl">
            <p className="section-kicker">Available today</p>
            <h2 className="section-title mt-4 leading-tight">
              Fresh meals, shared nearby
            </h2>
            <p className="section-subtitle mt-3 leading-relaxed">
              Browse the newest listings from local donors and reserve a pickup
              in minutes.
            </p>
          </div>
          <div className="mt-8">
            <FeaturedFoods></FeaturedFoods>
          </div>
        </div>
      </section>

      <SectionTwo></SectionTwo>
      <CommunityImpact />
      <Newsletter></Newsletter>
    </div>
  );
};

export default Home;
