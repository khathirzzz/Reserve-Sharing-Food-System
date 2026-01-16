import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import banner1 from "../assets/assets/banner1.jpg";
import banner2 from "../assets/assets/banner2.jpg";
import banner3 from "../assets/assets/banner3.jpg";
import Slide from "./Slide";

const Banner = () => {
  return (
    <div className="relative z-10">
      <div className="rounded-b-[32px] overflow-hidden shadow-card">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          <SwiperSlide>
            <Slide
              img={banner1}
              title="Fight Hunger, Spread Love"
              text="Leftovers can be lifesavers. Share your surplus food and bring hope to those in need this season."
            />
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              img={banner2}
              title="Give the Gift of Hope"
              text="Join our mission to reduce food waste. A small contribution can make a big difference."
            />
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              img={banner3}
              title="Warm Hearts, Full Plates"
              text="This winter, share the warmth by sharing your food. Donate today and help us ensure no one sleeps hungry."
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default Banner;
