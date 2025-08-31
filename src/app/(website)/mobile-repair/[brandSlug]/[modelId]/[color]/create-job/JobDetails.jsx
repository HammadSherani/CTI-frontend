import { Icon } from "@iconify/react";

export const JobDetails = ({ control, errors,  Controller}) => {
const urgencyLevels = [
  { value: 'low', label: 'Low', icon: 'mdi:speedometer-slow', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', icon: 'mdi:speedometer-medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', icon: 'mdi:speedometer', color: 'text-red-600' },
];

    return (
        <div className="space-y-3">
            {/* <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            {...field}
                            type="text"
                            placeholder="e.g., iPhone 14 Pro screen replacement"
                            className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <Icon icon="mdi:alert-circle" />
                                {errors.title.message}
                            </p>
                        )}
                    </div>
                )}
            /> */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                    {urgencyLevels.map((level) => (
                        <Controller
                            key={level.value}
                            name="urgency"
                            control={control}
                            render={({ field }) => (
                                <div
                                    onClick={() => field.onChange(level.value)}
                                    className={`p-2 border rounded-md cursor-pointer text-center text-xs ${field.value === level.value ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
                                >
                                    <Icon icon={level.icon} className={`text-base ${level.color} mx-auto`} />
                                    <span>{level.label}</span>
                                </div>
                            )}
                        />
                    ))}
                </div>
                {errors.urgency && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <Icon icon="mdi:alert-circle" />
                        {errors.urgency.message}
                    </p>
                )}
            </div>
        </div>
    )
};