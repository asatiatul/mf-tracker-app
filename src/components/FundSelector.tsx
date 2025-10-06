import React from 'react';
import { FundConfig } from '../types';

type Props = {
  funds: FundConfig[];
  selected: string;
  onChange: (val: string) => void;
};

const FundSelector: React.FC<Props> = ({ funds, selected, onChange }) => (
  <label>
    Select Fund:
    <select value={selected} onChange={e => onChange(e.target.value)}>
      {funds.map(fund => (
        <option key={fund.code} value={fund.code}>
          {fund.name}
        </option>
      ))}
    </select>
  </label>
);

export default FundSelector;
