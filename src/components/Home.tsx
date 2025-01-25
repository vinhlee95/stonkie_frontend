import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import Overview from './Overview';
import Statements from './Statements';
import { FinancialData, ReportType } from '../types';

// Modify Home component to receive props
const Home: React.FC<{
  financialData: Record<ReportType, FinancialData | null>;
}> = ({ financialData }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      {(financialData.income_statement || financialData.balance_sheet || financialData.cash_flow) && (
        <>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3
            }}
          >
            <Tab label="Overview" />
            <Tab label="Statements" />
          </Tabs>

          {activeTab === 0 && <Overview financialData={financialData} />}
          {activeTab === 1 && <Statements financialData={financialData} />}
        </>
      )}
    </>
  );
};

export default Home;