import React from 'react';

type Props = {
  value: "daily" | "weekly" | "monthly";
  onChange: (f: "daily" | "weekly" | "monthly") => void;
};

const FrequencySelector: React.FC<Props> = ({ value, onChange }) => (
  <label>
    Frequency:
    <select value={value} onChange={e => onChange(e.target.value as any)}>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  </label>
);

export default FrequencySelector;
