import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/card';
import { Input } from '../src//components/ui/input';
import { Button } from '../src/components/ui/button';
import { Label } from '../src//components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src//components/ui/select';
import { Textarea } from '../src//components/ui/textarea';
import { Alert, AlertDescription } from '../src//components/ui/alert';
import { MapPin } from "../src/components/icons/MapPin";
import { CalendarIcon } from "../src/components/icons/CalendarIcon";
import { Users } from "../src/components/icons/Users";
import { Heart } from "../src/components/icons/Heart"


export default function TravelForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    startDate: '',
    endDate: '',
    numberOfPeople: '1',
    groupType: '',
    interests: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.from.trim()) newErrors.from = 'Departure location is required';
    if (!formData.to.trim()) newErrors.to = 'Destination is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.numberOfPeople) newErrors.numberOfPeople = 'Number of people is required';
    if (!formData.groupType) newErrors.groupType = 'Group type is required';
    if (!formData.interests.trim()) newErrors.interests = 'At least one interest is required';

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      newErrors.startDate = 'Start date cannot be in the past';
    }
    if (endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDifference = end - start;
      const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1;
      
      const updatedFormData = {
        ...formData,
        days: daysDifference
      };
      onSubmit(updatedFormData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6" />
          Plan Your Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destinations Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">Departure Location</Label>
              <Input
                id="from"
                name="from"
                placeholder="Enter city or airport"
                value={formData.from}
                onChange={handleChange}
                className={errors.from ? "border-red-500" : ""}
              />
              {errors.from && (
                <p className="text-red-500 text-sm">{errors.from}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">Destination</Label>
              <Input
                id="to"
                name="to"
                placeholder="Where are you going?"
                value={formData.to}
                onChange={handleChange}
                className={errors.to ? "border-red-500" : ""}
              />
              {errors.to && (
                <p className="text-red-500 text-sm">{errors.to}</p>
              )}
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Group Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfPeople" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Travelers
              </Label>
              <Input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                min="1"
                value={formData.numberOfPeople}
                onChange={handleChange}
                className={errors.numberOfPeople ? "border-red-500" : ""}
              />
              {errors.numberOfPeople && (
                <p className="text-red-500 text-sm">{errors.numberOfPeople}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Group Type</Label>
              <Select 
                value={formData.groupType} 
                onValueChange={(value) => handleSelectChange(value, 'groupType')}
              >
                <SelectTrigger className={errors.groupType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Couple">Couple</SelectItem>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
              {errors.groupType && (
                <p className="text-red-500 text-sm">{errors.groupType}</p>
              )}
            </div>
          </div>

          {/* Interests Section */}
          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Interests
            </Label>
            <Input
              id="interests"
              name="interests"
              placeholder="e.g., Culture, Food, Nature, Adventure (comma-separated)"
              value={formData.interests}
              onChange={handleChange}
              className={errors.interests ? "border-red-500" : ""}
            />
            {errors.interests && (
              <p className="text-red-500 text-sm">{errors.interests}</p>
            )}
          </div>

          {/* Additional Information Section */}
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

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Create My Itinerary
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}