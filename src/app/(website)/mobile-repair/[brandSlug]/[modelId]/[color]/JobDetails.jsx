import { Icon } from "@iconify/react";

export const JobDetails = ({ control, errors, Controller }) => {
  const urgencyLevels = [
    { value: 'low', label: 'Low', icon: 'mdi:speedometer-slow', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', icon: 'mdi:speedometer-medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', icon: 'mdi:speedometer', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-3">
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...field}
              rows={4}
              placeholder="Describe the issue or service you need. Include device model, problem details, and any specific requirements..."
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-base text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.description.message}
              </p>
            )}
          </div>
        )}
      />
      
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Urgency Level</label>
        <div className="grid grid-cols-3 gap-2">
          {urgencyLevels.map((level) => (
            <Controller
              key={level.value}
              name="urgency"
              control={control}
              render={({ field }) => (
                <div
                  onClick={() => field.onChange(level.value)}
                  className={`p-2 border rounded-md cursor-pointer text-center text-base ${
                    field.value === level.value 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  <Icon icon={level.icon} className={`text-base ${level.color} mx-auto`} />
                  <span>{level.label}</span>
                </div>
              )}
            />
          ))}
        </div>
        {errors.urgency && (
          <p className="mt-1 text-base text-red-600 flex items-center gap-1">
            <Icon icon="mdi:alert-circle" />
            {errors.urgency.message}
          </p>
        )}
      </div>
    </div>
  );
};