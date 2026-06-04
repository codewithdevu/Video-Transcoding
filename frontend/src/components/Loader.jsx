
function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>

      <p className="text-gray-600 font-medium">
        Processing Video...
      </p>
    </div>
  );
}

export default Loader;