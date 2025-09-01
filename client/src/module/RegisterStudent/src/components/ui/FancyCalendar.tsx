import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from "lucide-react";

/**
 * Flexible calendar:
 * - mode="date": full date picker (day/month/year)
 * - mode="month": month + year picker (NO day)
 * - mode="year": year picker only
 *
 * All modes allow year change, and month change where relevant.
 */
export type FancyCalendarProps = {
  mode?: "date" | "month" | "year";
  value: Date | null;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  inputClassName?: string;
  wrapperClassName?: string;
};

export const FancyCalendar: React.FC<FancyCalendarProps> = ({
  mode = "date",
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  inputClassName = "",
  wrapperClassName = "",
}) => {
  let pickerProps: any = {};
  let format = "yyyy-MM-dd";
  let defaultPlaceholder = "YYYY-MM-DD";

  if (mode === "month") {
    pickerProps.showMonthYearPicker = true;
    format = "MM/yyyy";
    defaultPlaceholder = "MM/YYYY";
  } else if (mode === "year") {
    pickerProps.showYearPicker = true;
    format = "yyyy";
    defaultPlaceholder = "YYYY";
  }

  return (
    <div className={`relative flex items-center ${wrapperClassName}`}>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat={format}
        className={`border rounded pl-10 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${inputClassName}`}
        placeholderText={placeholder || defaultPlaceholder}
        minDate={minDate}
        maxDate={maxDate}
        {...pickerProps}
        showPopperArrow={false}
        isClearable
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => {
          // Years range: 1950 to (current year + 10)
          const years = [];
          const thisYear = new Date().getFullYear();
          for (let i = thisYear - 70; i <= thisYear + 10; i++) {
            years.push(i);
          }
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          return (
            <div className="flex justify-between items-center px-2 py-1 bg-gray-50 border-b">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="px-2 py-1 text-lg"
                type="button"
              >{"<"}</button>
              <div className="flex items-center gap-1">
                {(mode === "date" || mode === "month") && (
                  <select
                    value={date.getMonth()}
                    onChange={e => changeMonth(Number(e.target.value))}
                    className="border rounded px-1 py-0.5 mr-1 bg-white"
                  >
                    {months.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                )}
                <select
                  value={date.getFullYear()}
                  onChange={e => changeYear(Number(e.target.value))}
                  className="border rounded px-1 py-0.5 bg-white"
                >
                  {years.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="px-2 py-1 text-lg"
                type="button"
              >{">"}</button>
            </div>
          );
        }}
      />
      <CalendarIcon className="absolute left-3 text-gray-400 pointer-events-none w-5 h-5" />
    </div>
  );
};