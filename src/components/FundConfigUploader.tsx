import React from 'react';
import { FundConfig } from '../types';

type Props = {
  onConfigUpload: (cfg: FundConfig[]) => void;
};

const FundConfigUploader: React.FC<Props> = ({ onConfigUpload }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const parsed: FundConfig[] = JSON.parse(event.target.result as string);
            onConfigUpload(parsed);
          } catch {
            alert('Invalid JSON format!');
          }
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div>
      <label>
        Load Funds Config:{" "}
        <input type="file" accept=".json" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default FundConfigUploader;
