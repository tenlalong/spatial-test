const express = require('express');
const app = express();
const { Client } = require('pg');
const cors = require('cors');

app.use(cors());

app.use(express.json());

const dbClient = new Client({
    connectionString: 'postgresql://guest:U8OPtddp@3.235.170.15:5432/gis'
});

dbClient.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

app.get('/foo', async (req, res) => {
  try {
    

    const circleCenterLat = parseFloat(req.query.circleCenterLat);
    const circleCenterLng = parseFloat(req.query.circleCenterLng);

    const circleRadius = parseFloat(req.query.circleRadius);

      const demographicData = await calculateDemographicHarvesting( circleCenterLat, circleCenterLng, circleRadius);

      res.json(demographicData);
  } catch (error) {
      console.error('Error:', error);
      
      res.status(500).json({ error: 'Internal server error' });
  } 
});

async function calculateDemographicHarvesting(circleCenterLng, circleCenterLat, circleRadius) {
   
  try {
      const query = `
          SELECT 
              SUM(population) AS total_population,
              AVG(income) AS average_income
          FROM dfw_demo
          WHERE ST_DWithin(spatialObj, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)`;

    const result = await dbClient.query(query, [circleCenterLng, circleCenterLat, circleRadius]);

    setCircleCenter(null);

      console.log('Query result:', result.rows);

      return {
          totalPopulation: result.rows[0].total_population,
          averageIncome: result.rows[0].average_income,
      };
  } catch (error) {
      console.error('Error executing query:', error);
      throw error;
  }
}

process.on('SIGTERM', async () => {
    console.log('Closing database connection...');
    await dbClient.end();
    console.log('Database connection closed.');
  });

app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });
