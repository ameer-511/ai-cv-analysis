export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-white via-pink-50 to-indigo-50 border-t ">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold  mb-3">CareerAI</h3>
            <p className=" leading-relaxed">
              Your smart companion for CV improvement, interview preparation,
              and job discovery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 ">
              <li>
                <a href="/" className="hover:text-indigo-600">
                  Home
                </a>
              </li>
              <li>
                <a href="/jobs" className="hover:text-indigo-600">
                  Jobs
                </a>
              </li>
              <li>
                <a href="/upload-cv" className="hover:text-indigo-600">
                  Upload CV
                </a>
              </li>
              <li>
                <a href="/my-interviews" className="hover:text-indigo-600">
                  Interviews
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xl font-semibold  mb-3">Account</h4>
            <ul className="space-y-2 ">
              <li>
                <a href="/login" className="hover:text-indigo-600">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-indigo-600">
                  Register
                </a>
              </li>
              <li>
                <a href="/profileSetting" className="hover:text-indigo-600">
                  Settings
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-xl font-semibold  mb-3">Contact Us</h4>

            <p className="">Feel free to reach out anytime:</p>

            <p className="mt-2 font-medium text-indigo-600 break-all">
              ameer.hamza.mayo1029@gmail.com
            </p>

            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-2xl"
              >
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-2xl"
              >
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-2xl"
              >
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 text-2xl"
              >
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-12 pt-6 text-center text-gray-500">
          © {new Date().getFullYear()} CareerAI — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
