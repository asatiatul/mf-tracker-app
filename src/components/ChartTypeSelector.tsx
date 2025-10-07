import React from 'react';

type Props = {
  value: 'line' | 'bar' | 'pie';
  onChange: (f: 'line' | 'bar' | 'pie') => void;
};

const ChartTypeSelector: React.FC<Props> = ({ value, onChange }) => (
  <label>
    {/* Chart Type: */}
    <select value={value} onChange={e => onChange(e.target.value as any)}>
      <option value="line">Line</option>
      <option value="bar">Bar</option>
      <option value="pie">Pie</option>
    </select>
  </label>
);

export default ChartTypeSelector;
