import { useState, useEffect } from "react";
import Alert from "../components/Alert"; // 👈 import your custom Alert component
import BackButton from "../components/BackButton";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function ProfileSetting() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");

  const [userData, setUserData] = useState({
    username: storedUser.username || "",
    email: storedUser.email || "",
    account_type: storedUser.account_type || "",
    first_name: storedUser.first_name || "",
    last_name: storedUser.last_name || "",
    linkedin_profile: storedUser.linkedin_profile || "",
    bio: storedUser.bio || "",
    profile_picture: storedUser.profile_picture || "",
  });

  const [alert, setAlert] = useState(null); // 👈 state for Alert

  useEffect(() => {
    fetch(`${baseURL}/api/users/${storedUser.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        setAlert({
          type: "error",
          title: "Load Error",
          message: "⚠️ Failed to load profile information.",
        });
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("first_name", userData.first_name);
    formData.append("last_name", userData.last_name);
    formData.append("linkedin_profile", userData.linkedin_profile || "");
    formData.append("bio", userData.bio || "");

    if (userData.profile_picture instanceof File) {
      formData.append("profile_picture", userData.profile_picture);
    }

    try {
      const response = await fetch(`${baseURL}/api/users/${storedUser.id}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const updated = await response.json();
        setUserData((prev) => ({ ...prev, ...updated }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, ...updated })
        );

        // ✅ Success Alert
        setAlert({
          type: "success",
          title: "Profile Updated",
          message: "✅ Your profile has been updated successfully!",
        });
      } else {
        // ❌ Failed alert
        setAlert({
          type: "error",
          title: "Update Failed",
          message: "❌ Failed to update your profile. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({
        type: "error",
        title: "Server Error",
        message: "⚠️ Something went wrong. Try again later.",
      });
    }
  };

  const profilePicSrc = userData.profile_picture
    ? userData.profile_picture instanceof File
      ? URL.createObjectURL(userData.profile_picture)
      : userData.profile_picture.startsWith("http")
      ? userData.profile_picture
      : `${baseURL}/media/${userData.profile_picture}?t=${new Date().getTime()}`
    : "https://via.placeholder.com/120x120?text=No+Image";

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 p-8">
      <BackButton to="/" title="Back to Home" />
      <div className="max-w-5xl mx-auto bg-gray-100 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Profile Settings
        </h1>

        {/* ✅ Alert Section */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Profile layout: image left, form right on large screens */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="relative flex flex-col items-center lg:w-1/3 p-4 rounded-2xl">
            {/* Profile Image */}
            <img
              src={profilePicSrc}
              alt="Profile"
              className="w-32 h-32 rounded-full border-gray-300 border-2 object-cover"
            />

            {/* Hidden File Input */}
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={(e) =>
                setUserData({
                  ...userData,
                  profile_picture: e.target.files[0],
                })
              }
              className="hidden"
            />

            {/* Edit Icon Overlay */}
            <label
              htmlFor="profilePicture"
              className="absolute w-32 h-32 rounded-full flex items-center justify-center  bg-opacity-40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M16.5 3.75a2.121 2.121 0 013 3L7 19.25H4v-3L16.5 3.75z"
                />
              </svg>
            </label>
          </div>

          {/* Form Fields */}
          <form
            onSubmit={handleUpdate}
            className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-2"
          >
            {/* Non-editable fields */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium ">Username</label>
              <input
                type="text"
                value={userData.username || ""}
                className="p-2 border rounded cursor-not-allowed border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium ">Email</label>
              <input
                type="email"
                value={userData.email || ""}
                className="p-2 border border-gray-300 rounded-xl cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium ">Account Type</label>
              <input
                type="text"
                value={userData.account_type || ""}
                className="p-2 border border-gray-300 rounded-xl cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
                readOnly
              />
            </div>

            {/* Editable fields */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium ">First Name</label>
              <input
                type="text"
                value={userData.first_name}
                onChange={(e) =>
                  setUserData({ ...userData, first_name: e.target.value })
                }
                className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium ">Last Name</label>
              <input
                type="text"
                value={userData.last_name}
                onChange={(e) =>
                  setUserData({ ...userData, last_name: e.target.value })
                }
                className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
              />
            </div>

            <div className="flex flex-col col-span-2">
              <label className="mb-1 text-sm font-medium ">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={userData.linkedin_profile}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    linkedin_profile: e.target.value,
                  })
                }
                className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
              />
            </div>

            <div className="flex flex-col col-span-2">
              <label className="mb-1 text-sm font-medium ">Bio</label>
              <textarea
                value={userData.bio}
                onChange={(e) =>
                  setUserData({ ...userData, bio: e.target.value })
                }
                className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#050E7F]"
              />
            </div>

            {/* Save button */}
            <button
              type="submit"
              className="mt-4 w-full bg-[#050E7F] text-white py-3 rounded-xl font-semibold transition-all col-span-2 hover:scale-105 transform"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
