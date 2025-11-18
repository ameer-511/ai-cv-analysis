import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const steps = [
  {
    id: 1,
    title: "Create Account",
    description: "Sign up and set up your profile to get started.",
    img: "/images/create-account.jpg",
  },
  {
    id: 2,
    title: "Upload CV",
    description: "Upload your CV to let AI analyze your skills and experience.",
    img: "/images/upload-cv.jpg",
  },
  {
    id: 3,
    title: "Analyze CV with AI",
    description: "Get instant AI analysis of your CV for strengths & gaps.",
    img: "/images/cv-analysis.jpg",
  },
  {
    id: 4,
    title: "Interview Preparation",
    description: "Practice and prepare for interviews with AI-powered tips.",
    img: "/images/interview-guidance.jpg",
  },
  {
    id: 5,
    title: "Smart Job Matching",
    description: "Discover nearby skill-matched jobs powered by Google Maps.",
    img: "/images/job-matching.jpg",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-r from-white via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
          How It Works
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1} // default for mobile
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 3, spaceBetween: 40 },
          }}
        >
          {steps.map((step) => (
            <SwiperSlide key={step.id}>
              <div className="flex flex-col items-center bg-white p-8 m-10 rounded-2xl shadow-lg h-full text-center hover:scale-105 transition-transform duration-300 w-full sm:w-80 mx-auto">
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full mb-4 object-contain"
                />
                <div className="flex items-center justify-center mb-2">
                  <span className="text-white bg-[#050E7F] rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {step.id}
                  </span>
                  <h3 className="text-lg font-semibold text-[#050E7F]">
                    {step.title}
                  </h3>
                </div>
                <p className=" text-sm">{step.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
