const express = require('express');
const app = express();
const { Client } = require('pg');

app.use(express.json());

const dbClient = new Client({
    connectionString: 'postgresql://guest:U8OPtddp@3.235.170.15:5432/gis'
});

app.post('/calculate-demographics', async (req, res) => {
  try {
      await dbClient.connect(); 

      const circleCenter = req.body.circleCenter;
      const circleRadius = req.body.circleRadius;

      const demographicData = await calculateDemographicHarvesting(circleCenter, circleRadius);

      res.json(demographicData);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  } finally {
      await dbClient.end(); 
  }
});

async function calculateDemographicHarvesting(circleCenter, circleRadius) {
  try {
      const query = `
          SELECT 
              SUM(population) AS total_population,
              AVG(income) AS average_income
          FROM dfw_demo
          WHERE ST_DWithin(spatialObj, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
      `;

      const result = await dbClient.query(query, [circleCenter[0], circleCenter[1], circleRadius]);

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

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
