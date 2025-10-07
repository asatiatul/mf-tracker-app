import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  value: [Date | null, Date | null];
  onChange: (v: [Date | null, Date | null]) => void;
  inputStyle?: React.CSSProperties;
  inputClassName?: string;
};

const CustomDateRangePicker: React.FC<Props> = ({ value, onChange, inputStyle, inputClassName }) => (
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
    customInput={
      <input style={inputStyle} className={inputClassName}/>
    }
  />
);

export default CustomDateRangePicker;
