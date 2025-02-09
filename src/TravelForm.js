"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Textarea } from "./components/ui/textarea"
import { MapPin, CalendarIcon, Users, Heart } from "lucide-react"

export default function TravelForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    startDate: "",
    endDate: "",
    numberOfPeople: "1",
    groupType: "",
    interests: "",
    additionalInfo: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add form validation here
    onSubmit(formData)
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="from">Departure Location</Label>
                <Input
                  id="from"
                  name="from"
                  placeholder="Enter city or airport"
                  value={formData.from}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">Destination</Label>
                <Input
                  id="to"
                  name="to"
                  placeholder="Where are you going?"
                  value={formData.to}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Start Date
                </Label>
                <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  End Date
                </Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />
              </div>

              <div className="space-y-2">
                <Label>Group Type</Label>
                <Select
                  value={formData.groupType}
                  onValueChange={(value) => handleChange({ target: { name: "groupType", value } })}
                >
                  <SelectTrigger>
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
              </div>
            </div>

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
              />
            </div>

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
  )
}

