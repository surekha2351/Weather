
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CitiesTable: React.FC = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [sortOption, setSortOption] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: '', order: 'asc' });

  const fetchCities = async (query: string, pageNum: number, countryFilter: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${query}&rows=20&start=${pageNum * 20}`
      );
      let fetchedCities = response.data.records;

      // Filter by country if countryFilter is set
      if (countryFilter) {
        fetchedCities = fetchedCities.filter(
          (city: any) => city.fields.cou_name_en === countryFilter
        );
      }

      setCities((prevCities) => (pageNum === 0 ? fetchedCities : [...prevCities, ...fetchedCities]));
      setHasMore(fetchedCities.length > 0); // Stop fetching if there's no more data
    } catch (error) {
      console.error('Error fetching city data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCities(searchQuery, page, selectedCountry);
  }, [page, searchQuery, selectedCountry]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
      return;
    }
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0); // Reset page when search query changes
  };

  const handleCountryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setPage(0); // Reset page when filter changes
  };

  const handleSort = (key: string) => {
    const order = sortOption.key === key && sortOption.order === 'asc' ? 'desc' : 'asc';
    setSortOption({ key, order });
  };

  const sortCities = (cities: any[]) => {
    if (!sortOption.key) return cities;

    return [...cities].sort((a, b) => {
      const valueA = a.fields[sortOption.key];
      const valueB = b.fields[sortOption.key];

      if (valueA < valueB) return sortOption.order === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOption.order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedCities = sortCities(cities);

  return (
    <div>
      <input
        type="text"
        placeholder="Search cities..."
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '20px', padding: '10px', fontSize: '16px', width: '90%' }}
      />

      <div style={{ marginBottom: '20px' }}>
        <select title='/'   value={selectedCountry} onChange={handleCountryFilter}>
          <option value="">Filter by Country</option>
          {Array.from(new Set(cities.map(city => city.fields.cou_name_en)))
            .filter(country => country)
            .sort()
            .map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
        </select>

        <select title='/'   onChange={(e) => handleSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="name">City Name (A-Z)</option>
          <option value="cou_name_en">Country (A-Z)</option>
          <option value="timezone">Timezone (A-Z)</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>City Name {sortOption.key === 'name' ? (sortOption.order === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => handleSort('cou_name_en')}>Country {sortOption.key === 'cou_name_en' ? (sortOption.order === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => handleSort('timezone')}>Timezone {sortOption.key === 'timezone' ? (sortOption.order === 'asc' ? '↑' : '↓') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {sortedCities.map((city, index) => (
            <tr key={index}>
              <td>
                <Link to={`/weather/${encodeURIComponent(city.fields.name)}`}>
                  {city.fields.name}
                </Link>
              </td>
              <td>{city.fields.cou_name_en}</td>
              <td>{city.fields.timezone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}>Loading more cities...</div>}
      {!hasMore && <div style={{ textAlign: 'center', margin: '20px 0' }}>No more cities to load.</div>}
    </div>
  );
};

export default CitiesTable;
