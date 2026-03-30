export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination) return null;

  const { currentPage, totalPages } = pagination;

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === page
                ? "bg-primary-600 text-white"
                : "border"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};