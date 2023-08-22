import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './map.css'; 

mapboxgl.accessToken = 'pk.eyJ1IjoidGVubGFsb25nIiwiYSI6ImNsbGd0eXA3ZjEyZGYzZ25nYWh2eXVieXoifQ.eeXmLldowSw6uh7489FSOg';

export default function Map() {
  const mapContainer = useRef(null);
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(500);
  const [demographicData, setDemographicData] = useState(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9,
    });

    map.on('click', e => {
      setCircleCenter(e.lngLat);
      map.getSource('circle-source').setData({
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      });
    });

    map.on('load', () => {
      map.addSource('circle-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'circle-layer',
        source: 'circle-source',
        type: 'circle',
        paint: {
          'circle-radius': 50,
          'circle-color': 'rgba(0, 128, 255, 0.5)',
        },
      });
    });

    setMap(map);


    return () => map.remove();
  }, [circleRadius]);

  const [map, setMap] = useState(null);

  const handleRadiusChange = event => {
    const newRadius = parseFloat(event.target.value);
    setCircleRadius(newRadius);
  }

  const handleMapClick = async (e) => {
    setCircleCenter(e.lngLat);
    map.getSource('circle-source').setData({
      type: 'Point',
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    });
  
    try {
      const response = await fetch('http://localhost:3001/calculate-demographics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circleCenter: [e.lngLat.lng, e.lngLat.lat],
          circleRadius: circleRadius,
        }),
      });
  
      if (response.ok) {
        const demographicData = await response.json();
        // const calculatedData = calculateDemographicHarvesting(demographicData);
        setDemographicData(demographicData);
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <div>
      <div className='radius-input'>
        <input 
        type='number'
        value={circleRadius}
        onChange={handleRadiusChange}
        step="100"
        min="100"
        />
      </div>
      <div ref={mapContainer} className="map-container" />;

      {demographicData && (
        <div className='demographic-results'>
          <h3>Demographic Results</h3>
          <p>Total Popluation: {demographicData.totalPopulation}</p>
          <p>Average Income: {demographicData.averageIncome}</p>
        </div>
      )}
    </div>
  )
}



