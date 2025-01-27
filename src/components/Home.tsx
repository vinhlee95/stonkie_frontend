import React, { useEffect, useState } from 'react';

interface Company {
  name: string;
  ticker: string;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const Home: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const fetchMostViewed = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/companies/most-viewed`);
        const data = await response.json();
        setCompanies(data.data);
      } catch (error) {
        console.error('Error fetching most viewed companies:', error);
      }
    };

    fetchMostViewed();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {companies.map((company, index) => (
        <div 
          key={index}
          className="p-4 bg-gray-800 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold">{company.name}</h3>
              <p className="text-gray-400">{company.ticker}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;