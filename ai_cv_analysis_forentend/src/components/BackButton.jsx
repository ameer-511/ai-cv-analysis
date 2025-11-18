// BackButton.jsx
import { useNavigate } from "react-router-dom";

export default function BackButton({
  to = "/my-cvs",
  title = "Back to My CVs",
  size = "text-6xl",
  position = "fixed top-12 right-9",
  color = "hover:text-[#050E7F]",
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`${position} ${color} ${size}`}
      title={title}
    >
      ←
    </button>
  );
}
