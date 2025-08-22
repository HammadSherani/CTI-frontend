export const FormSelect = ({ label, name, children }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      <select
        name={name}
        id={name}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out appearance-none bg-white bg-no-repeat bg-right-4"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
      >
        {children}
      </select>
    </div>
);