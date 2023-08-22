const express = require('express');
const pgp = require('pg-promise')();
const turf = require('@turf/turf');

const app = express();
const db = pgp({
  connectionString: 'postgresql://guest:U8OPtddp@3.235.170.15:5432/gis'
});


app.use(express.json());

app.post('/calculate-demographics', async (req, res) => {
    const circleCenter = req.body.circleCenter;
    const circleRadius = req.body.circleRadius;
  
    const circle = turf.circle(circleCenter, circleRadius);
    const circleGeoJSON = circle.geometry;
  
    const demographicData = await calculateDemographicHarvesting(circleGeoJSON);
  
    res.json(demographicData);
  });

async function calculateDemographicHarvesting(selectedArea) {

  try {
    const query = `SELECT 
    SUM(population) AS total_population,
    AVG(income) AS average_income
    FROM
    dfw_demo
    WHERE
    ST_Intersects(ST_GeomFromGeoJSON($1), spatialObj)`;

    const result = await db.one(query, JSON.stringify(selectedArea));

    console.error(result.total_population, result.average_income);

    return {
      totalPopulation: result.total_population,
      averageIncome: result.average_income,
    }
  } catch(err) {
    console.log(err);
    throw err;
  }
}

app.listen(3001, () => {
  console.log('Server is running on port 3001');
})


