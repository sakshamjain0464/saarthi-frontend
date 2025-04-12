"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectItem } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { MapPin, CalendarIcon, Users, Heart } from "lucide-react";
import { toast } from "react-toastify";

// Import your states array
import states from "../cities"; // adjust the import path as needed

export default function TravelForm({ onSubmit, setLanguage }) {
  // Initialize form state with departure, destination, and viaCities.
  const [formData, setFormData] = useState({
    departureState: "",
    departureCity: "",
    destinationState: "",
    destinationCity: "",
    startDate: "",
    endDate: "",
    numberOfPeople: "1",
    groupType: "Family",
    interests: "",
    additionalInfo: "",
    language: "English",
    viaCities: [] // Array of objects: { state: "", city: "" }
  });

  // For error tracking (optional)
  const [errors, setErrors] = useState({});

  // Separate states for autocomplete queries.
  const [departureCityQuery, setDepartureCityQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  // For each via city row we maintain a query string.
  const [viaCityQueries, setViaCityQueries] = useState([]);

  // Update the language externally whenever it changes.
  useEffect(() => {
    setLanguage(formData.language);
  }, [formData.language, setLanguage]);

  // Handle changes for typical input fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle changes for select inputs (departure/destination).
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "departureState"
        ? { departureCity: "" }
        : name === "destinationState"
          ? { destinationCity: "" }
          : {}
      ),
    }));
    if (name === "departureState") {
      setDepartureCityQuery("");
    } else if (name === "destinationState") {
      setCityQuery("");
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Filter departure cities based on the selected departure state and user query.
  const filteredDepartureCities =
    formData.departureState &&
    (states.find((s) => s.name === formData.departureState)?.cities.filter((city) =>
      city.toLowerCase().includes(departureCityQuery.toLowerCase())
    ) || []);

  // Filter destination cities based on the selected destination state and user query.
  const filteredCities =
    formData.destinationState &&
    (states.find((s) => s.name === formData.destinationState)?.cities.filter((city) =>
      city.toLowerCase().includes(cityQuery.toLowerCase())
    ) || []);

  // For a given via city row, filter its cities based on the selected state and query.
  const getFilteredViaCities = (viaState, query) => {
    return viaState &&
      (states.find((s) => s.name === viaState)?.cities.filter((city) =>
        city.toLowerCase().includes(query.toLowerCase())
      ) || []);
  };

  // Functions to update viaCities and their queries.
  const addViaCity = () => {
    setFormData((prev) => ({
      ...prev,
      viaCities: [...prev.viaCities, { state: "", city: "" }],
    }));
    setViaCityQueries((prev) => [...prev, ""]);
  };

  const updateViaCityState = (index, value) => {
    const newViaCities = [...formData.viaCities];
    newViaCities[index] = { ...newViaCities[index], state: value, city: "" };
    setFormData((prev) => ({ ...prev, viaCities: newViaCities }));

    // Reset query for this row.
    const newQueries = [...viaCityQueries];
    newQueries[index] = "";
    setViaCityQueries(newQueries);
  };

  const updateViaCityQuery = (index, value) => {
    const newQueries = [...viaCityQueries];
    newQueries[index] = value;
    setViaCityQueries(newQueries);

    // Clear selected city if user is still typing.
    const newViaCities = [...formData.viaCities];
    newViaCities[index] = { ...newViaCities[index], city: "" };
    setFormData((prev) => ({ ...prev, viaCities: newViaCities }));
  };

  const selectViaCity = (index, city) => {
    const newQueries = [...viaCityQueries];
    newQueries[index] = city;
    setViaCityQueries(newQueries);

    const newViaCities = [...formData.viaCities];
    newViaCities[index] = { ...newViaCities[index], city };
    setFormData((prev) => ({ ...prev, viaCities: newViaCities }));
  };

  const removeViaCity = (index) => {
    const newViaCities = formData.viaCities.filter((_, i) => i !== index);
    const newQueries = viaCityQueries.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, viaCities: newViaCities }));
    setViaCityQueries(newQueries);
  };

  // Handle form submission with validations.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields.
    if (
      !formData.departureState ||
      !formData.departureCity ||
      !formData.destinationState ||
      !formData.destinationCity ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.numberOfPeople ||
      !formData.groupType ||
      !formData.interests
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Validate via cities: if any via row has one field filled, both must be provided.
    for (let i = 0; i < formData.viaCities.length; i++) {
      const via = formData.viaCities[i];
      if ((via.state && !via.city) || (!via.state && via.city)) {
        toast.error("Please complete all via city entries or remove incomplete ones.");
        return;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    if (parseInt(formData.numberOfPeople, 10) < 1) {
      toast.error("Number of travelers must be at least 1.");
      return;
    }

    if (
      new Date(formData.startDate) < new Date() ||
      new Date(formData.endDate) < new Date()
    ) {
      toast.error("Dates must be in the future.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-6 w-6" />
              Plan Your Journey
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Departure Location */}
            <div>
              <h2 className="text-xl font-bold">Departure Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departure State */}
                <div className="space-y-2">
                  <Label htmlFor="departureState">Departure State</Label>
                  <Select
                    id="departureState"
                    name="departureState"
                    value={formData.departureState}
                    onChange={(e) =>
                      handleSelectChange("departureState", e.target.value)
                    }
                  >
                    <SelectItem value="">Select a state</SelectItem>
                    {states.map((stateObj) => (
                      <SelectItem key={stateObj.name} value={stateObj.name}>
                        {stateObj.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                {/* Departure City Autocomplete */}
                <div className="space-y-2 relative">
                  <Label htmlFor="departureCity">Departure City</Label>
                  <Input
                    id="departureCity"
                    name="departureCity"
                    placeholder="Start typing..."
                    value={departureCityQuery}
                    onChange={(e) => {
                      setDepartureCityQuery(e.target.value);
                      // Clear the stored departure city value when typing.
                      setFormData((prev) => ({ ...prev, departureCity: "" }));
                    }}
                    disabled={!formData.departureState}
                  />
                  {formData.departureState && !formData.departureCity && departureCityQuery && (
                    <ul className="absolute z-10 left-0 right-0 border border-gray-300 bg-white mt-1 max-h-40 overflow-y-auto">
                      {filteredDepartureCities.length > 0 ? (
                        filteredDepartureCities.map((city) => (
                          <li
                            key={city}
                            className="cursor-pointer p-2 hover:bg-gray-200"
                            onClick={() => {
                              setDepartureCityQuery(city);
                              setFormData((prev) => ({ ...prev, departureCity: city }));
                            }}
                          >
                            {city}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500">No matching cities</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Via Cities (Optional) */}
            <div>
              <h2 className="text-xl font-bold">Via Cities (Optional)</h2>
              {formData.viaCities.map((via, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                  {/* Via State Selector */}
                  <div className="space-y-2">
                    <Label htmlFor={`viaState-${index}`}>State</Label>
                    <Select
                      id={`viaState-${index}`}
                      value={via.state}
                      onChange={(e) =>
                        updateViaCityState(index, e.target.value)
                      }
                    >
                      <SelectItem value="">Select a state</SelectItem>
                      {states.map((stateObj) => (
                        <SelectItem key={stateObj.name} value={stateObj.name}>
                          {stateObj.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  {/* Via City Autocomplete */}
                  <div className="space-y-2 relative">
                    <Label htmlFor={`viaCity-${index}`}>City</Label>
                    <Input
                      id={`viaCity-${index}`}
                      placeholder="Start typing..."
                      value={viaCityQueries[index] || ""}
                      onChange={(e) =>
                        updateViaCityQuery(index, e.target.value)
                      }
                      disabled={!via.state}
                    />
                    {via.state && !via.city && viaCityQueries[index] && (
                      <ul className="absolute z-10 left-0 right-0 border border-gray-300 bg-white mt-1 max-h-40 overflow-y-auto">
                        {getFilteredViaCities(via.state, viaCityQueries[index]).length > 0 ? (
                          getFilteredViaCities(via.state, viaCityQueries[index]).map((city) => (
                            <li
                              key={city}
                              className="cursor-pointer p-2 hover:bg-gray-200"
                              onClick={() => selectViaCity(index, city)}
                            >
                              {city}
                            </li>
                          ))
                        ) : (
                          <li className="p-2 text-gray-500">No matching cities</li>
                        )}
                      </ul>
                    )}
                  </div>
                  {/* Remove Button */}
                  <div>
                    <Button type="button" onClick={() => removeViaCity(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addViaCity}>
                Add Via City
              </Button>
            </div>

            {/* Destination Location */}
            <div>
              <h2 className="text-xl font-bold">Destination Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination State Selection */}
                <div className="space-y-2">
                  <Label htmlFor="destinationState">Destination State</Label>
                  <Select
                    id="destinationState"
                    name="destinationState"
                    value={formData.destinationState}
                    onChange={(e) =>
                      handleSelectChange("destinationState", e.target.value)
                    }
                  >
                    <SelectItem value="">Select a state</SelectItem>
                    {states.map((stateObj) => (
                      <SelectItem key={stateObj.name} value={stateObj.name}>
                        {stateObj.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Destination City Autocomplete */}
                <div className="space-y-2 relative">
                  <Label htmlFor="destinationCity">Destination City</Label>
                  <Input
                    id="destinationCity"
                    name="destinationCity"
                    placeholder="Start typing..."
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      // Clear the stored destination city value when typing.
                      setFormData((prev) => ({ ...prev, destinationCity: "" }));
                    }}
                    disabled={!formData.destinationState}
                  />
                  {formData.destinationState && !formData.destinationCity && cityQuery && (
                    <ul className="absolute z-10 left-0 right-0 border border-gray-300 bg-white mt-1 max-h-40 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <li
                            key={city}
                            className="cursor-pointer p-2 hover:bg-gray-200"
                            onClick={() => {
                              setCityQuery(city);
                              setFormData((prev) => ({ ...prev, destinationCity: city }));
                            }}
                          >
                            {city}
                          </li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500">No matching cities</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <CalendarIcon className="h-4 w-4 inline-block mr-1" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  <CalendarIcon className="h-4 w-4 inline-block mr-1" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Number of Travelers and Group Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfPeople">
                  <Users className="h-4 w-4 inline-block mr-1" />
                  Number of Travelers
                </Label>
                <Input
                  id="numberOfPeople"
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupType">Group Type</Label>
                <Select
                  id="groupType"
                  name="groupType"
                  value={formData.groupType}
                  onChange={(e) =>
                    handleSelectChange("groupType", e.target.value)
                  }
                >
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Couple">Couple</SelectItem>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </Select>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label htmlFor="interests">
                <Heart className="h-4 w-4 inline-block mr-1" />
                Interests
              </Label>
              <Input
                id="interests"
                name="interests"
                placeholder="e.g., Culture, Food, Nature, Adventure (comma-separated)"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select
                id="language"
                name="language"
                value={formData.language}
                onChange={(e) =>
                  handleSelectChange("language", e.target.value)
                }
              >
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </Select>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any special requirements or preferences?"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Create My Itinerary
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
