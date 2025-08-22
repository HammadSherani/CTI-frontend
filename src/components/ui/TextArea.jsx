export const TextArea = ({ label, name, placeholder, rows = 4 }) => (
    <div className="md:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
        <textarea
            name={name}
            id={name}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
        ></textarea>
    </div>
);