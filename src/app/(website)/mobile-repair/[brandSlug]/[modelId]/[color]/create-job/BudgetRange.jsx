import { Icon } from "@iconify/react";

export const BudgetRange = ({ Controller, control, errors }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      <Controller
        name="budget.min"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Budget</label>
            <input
              {...field}
              type="number"
              placeholder="0"
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.budget?.min ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.budget?.min && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.budget.min.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="budget.max"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Budget</label>
            <input
              {...field}
              type="number"
              placeholder="1000"
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.budget?.max ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.budget?.max && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.budget.max.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="budget.currency"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
            <select
              {...field}
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.budget?.currency ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            {errors.budget?.currency && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.budget.currency.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  </div>
);