import { Icon } from "@iconify/react";

export default function SummaryCards({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 py-8 rounded-lg border border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-4">{item.label}</p>

          <div className="flex items-center justify-between gap-2">
            <p className={`text-4xl font-bold text-primary-600  `}>
              {item.value}
            </p>

            <div className={`bg-primary-100  p-2 -mt-14 rounded-full`}>
              <Icon
                icon={item.icon}
                className={`w-6 h-6 text-primary-600`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}