import React, { useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";
import { useFilter } from "../context/FilterContext";
import { useNavigate } from "react-router-dom";

const programs = ["PhD", "B.Tech", "M.Tech"];
const branches = ["CSE", "ECE", "EE", "ME", "CE"];
const years = ["1st", "2nd", "3rd", "4th"];

const FilterOnboarding = ({ children }) => {
  const { filters, setFilters } = useFilter();
  const navigate = useNavigate();

  // Initialize filters if they don't exist
  useEffect(() => {
    if (!filters) {
      setFilters({
        program: "",
        branch: "",
        year: "",
        subject: "",
      });
    }
  }, [filters, setFilters]);

  const handleChange = (key, value) => {
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key === "program" ? { branch: "", year: "", subject: "" } : {}),
      ...(key === "branch" ? { year: "", subject: "" } : {}),
      ...(key === "year" ? { subject: "" } : {}),
    }));
  };

  const handleComplete = () => {
    // Save filters to localStorage
    localStorage.setItem("userProgram", filters.program);
    localStorage.setItem("userBranch", filters.branch);
    localStorage.setItem("userYear", filters.year);
    localStorage.setItem("userSubject", filters.subject);
    navigate("/");
  };

  const allSelected = filters?.program && filters?.branch && filters?.year;

  // If filters are not initialized yet, show loading state
  if (!filters) {
    return null;
  }

  return (
    <>
      {!allSelected ? (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Welcome! Select Your Details
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
            >
              <FormControl fullWidth size="medium">
                <InputLabel>Program</InputLabel>
                <Select
                  value={filters.program}
                  onChange={(e) => handleChange("program", e.target.value)}
                  label="Program"
                >
                  {programs.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {filters.program && (
                <FormControl fullWidth size="medium">
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={filters.branch}
                    onChange={(e) => handleChange("branch", e.target.value)}
                    label="Branch"
                  >
                    {branches.map((b) => (
                      <MenuItem key={b} value={b}>
                        {b}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {filters.branch && (
                <FormControl fullWidth size="medium">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    label="Year"
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
                disabled={!allSelected}
                onClick={handleComplete}
                fullWidth
              >
                Continue
              </Button>
            </Box>
          </Paper>
        </Container>
      ) : (
        children
      )}
    </>
  );
};

export default FilterOnboarding;
