import React, { useEffect, useRef, useState } from 'react';
import { Grid, Card, CardContent, Typography, Container, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

interface Company {
  name: string;
  ticker: string;
  logo_url: string;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'

const Home: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const fetchDataRef = useRef<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchMostViewed = async () => {
      try {
        fetchDataRef.current = true;
        setLoading(true);
        
        const response = await fetch(`${BACKEND_URL}/api/companies/most-viewed`);
        const data = await response.json();
        setCompanies(data.data);
      } catch (error) {
        console.error('Error fetching most viewed companies:', error);
      } finally {
        setLoading(false);
        fetchDataRef.current = false;
      }
    };

    if(companies.length === 0 && !fetchDataRef.current) {
      fetchMostViewed();
    }
  }, []);

  if(loading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {companies.map((company, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Link 
              to={`/tickers/${company.ticker.toLowerCase()}/overview`} 
              style={{ textDecoration: 'none' }}
            >
              <Card 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'grey.800',
                  boxShadow: 3,
                  transition: 'background-color 0.3s ease-in-out',
                  '&:hover': {
                    bgcolor: 'grey.700',
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <Typography variant="h6" component="h3" sx={{ color: 'white' }}>
                      {company.name}
                    </Typography>
                    <Typography sx={{ color: 'grey.400' }}>
                      {company.ticker}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;