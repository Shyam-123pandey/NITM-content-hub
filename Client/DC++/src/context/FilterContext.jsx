import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    program: '',
    branch: '',
    year: '',
    subject: '',
  });

  const resetFilters = () => setFilters({ program: '', branch: '', year: '', subject: '' });

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}; 