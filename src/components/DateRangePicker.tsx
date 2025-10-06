import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  value: [Date | null, Date | null];
  onChange: (v: [Date | null, Date | null]) => void;
};

const CustomDateRangePicker: React.FC<Props> = ({ value, onChange }) => (
  <label>
    Date Range:{" "}
    <DatePicker
      selectsRange
      startDate={value[0]}
      endDate={value[1]}
      onChange={onChange}
      isClearable
      dateFormat="dd-MM-yyyy"
      maxDate={new Date()}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  </label>
);

export default CustomDateRangePicker;
