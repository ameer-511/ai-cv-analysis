export default function FeaturesSection() {
  const features = [
    {
      title: "AI CV Analysis",
      desc: "Get detailed insights on your CV, improve structure, format, and keywords to make it ATS-friendly.",
      icon: "🧠",
    },
    {
      title: "Interview Guidance",
      desc: "Receive AI-driven tips and real-time guidance to excel in interviews and boost your confidence.",
      icon: "💬",
    },
    {
  title: "Smart Job Discovery",
  desc: "Get job suggestions based on your skills and real-time location using Google Maps integration.",
  icon: "📍",
}
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-white via-pink-50 to-indigo-50">
      {/* Section Heading */}
      <div className="text-center mb-16 px-6 md:px-0">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 ">
          Powerful Features
        </h2>
        <p className="font-semibold max-w-3xl mx-auto text-base md:text-lg">
          Unlock your full potential with our AI-powered tools designed to
          enhance your CV, guide your interviews, and connect you with the right
          jobs.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6 md:px-0">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl p-8 text-center hover:scale-105 transition-transform border border-gray-200"
          >
            <div className="text-5xl mb-4">{item.icon}</div>
            <h3 className="text-2xl font-semibold mb-3 text-[#050E7F]">
              {item.title}
            </h3>
            <p className=" text-sm md:text-base">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
