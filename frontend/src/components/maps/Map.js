import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './map.css'; 

mapboxgl.accessToken = 'pk.eyJ1IjoidGVubGFsb25nIiwiYSI6ImNsbGd0eXA3ZjEyZGYzZ25nYWh2eXVieXoifQ.eeXmLldowSw6uh7489FSOg';

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [circleCenter, setCircleCenter] = useState(null);
  const [circleRadius, setCircleRadius] = useState(500);
  const [demographicData, setDemographicData] = useState(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: circleCenter || [-74.5, 40],
      zoom: 9,
    });

    map.on('click', handleMapClick);

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
  }, [circleCenter, circleRadius]);

  const [map, setMap] = useState(null);

  const handleRadiusChange = event => {
    const newRadius = parseFloat(event.target.value);
    setCircleRadius(newRadius);
  }

  const handleMapClick = async (e) => {
    setCircleCenter(e.lngLat);
    console.log('New Circle Center:', e.lngLat);
    
    if (mapRef.current) {
      mapRef.current.getSource('circle-source').setData({
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      });
    }
    
    console.log('Circle Data:', [e.lngLat.lng, e.lngLat.lat]);

    try {
      const demographicData = await fetchDemographicData(e.lngLat.lng, e.lngLat.lat);
      setDemographicData(demographicData);
    } catch (error) {
      console.error('Error fetching demographic data:', error);
    }
  };

  const fetchDemographicData = async (lng, lat) => {
    try {

      const circleCenterLng = lng;
      const circleCenterLat = lat;
      console.log(lng,lat);

      const response = await fetch(`http://localhost:3001/foo?circleCenterLat=${circleCenterLat}&circleCenterLng=${circleCenterLng}&circleRadius=${circleRadius}`);

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const demographicData = await response.json();
      console.log(demographicData);
      return demographicData;
    } catch (error) {
      console.log('Error fetching demographic data:', error);
      throw error;
    }
  };

  return (
    <div className='container'>
      <div className='radius-input'>
        <input 
        type='number'
        value={circleRadius}
        onChange={handleRadiusChange}
        step="100"
        min="100"
        />
      </div>

      {demographicData && (
        <div className='demographic-results'>
          <h3>Demographic Results</h3>
          <p>Total Popluation: {demographicData.totalPopulation}</p>
          <p>Average Income: {demographicData.averageIncome}</p>
        </div>
      )}
      
      <div ref={mapContainer} className="map-container" />

      
    </div>
  )
}



