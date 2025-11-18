export default function Alert({ type = "info", title, message, onClose }) {
  const typeStyles = {
    success: "bg-teal-100 border-t-4 border-teal-500 text-teal-900 shadow-md",
    error: "bg-red-100 border border-red-400 text-red-700 shadow-md",
    warning:
      "bg-orange-100 border-l-4 border-orange-500 text-orange-700 shadow-md",
    info: "bg-blue-100 border-l-4 border-blue-500 text-blue-900 shadow-md",
  };

  return (
    <div
      className={`${typeStyles[type]} relative flex items-start justify-between px-6 py-4 mb-4 rounded-lg max-w-full`}
      role="alert"
    >
      <div className="flex-1 min-w-0 pr-8">
        {title && (
          <strong className="block font-semibold text-base mb-1 break-words">
            {title}
          </strong>
        )}
        <span className="block text-sm leading-snug break-words">
          {message}
        </span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition"
          aria-label="Close alert"
        >
          <svg
            className="fill-current h-5 w-5 text-gray-600 hover:text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      )}
    </div>
  );
}
