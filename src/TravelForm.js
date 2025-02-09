import React, { useState } from 'react';
import './App.css';

function TravelForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        from: '',
        to: '',
        startDate: '',
        endDate: '',
        numberOfPeople: '',
        groupType: '',
        interests: '',
        additionalInfo: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.from) newErrors.from = 'From destination is required';
        if (!formData.to) newErrors.to = 'To destination is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.numberOfPeople) newErrors.numberOfPeople = 'Number of people is required';
        if (!formData.groupType) newErrors.groupType = 'Group type is required';
        if (!formData.interests) newErrors.interests = 'Interests are required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Calculate the number of days automatically
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const timeDifference = end - start;
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

            // Add the calculated days to the form data
            const updatedFormData = { ...formData, days: daysDifference };
            onSubmit(updatedFormData);
        }
    };

    return (
        <div className="travel-form">
            <h2>🌍 Plan Your Trip</h2>
            <form onSubmit={handleSubmit}>
                {/* From Destination */}
                <label>
                    From (Departure Location):
                    <input
                        type="text"
                        name="from"
                        value={formData.from}
                        onChange={handleChange}
                        placeholder="Enter departure location"
                    />
                    {errors.from && <span className="error">{errors.from}</span>}
                </label>

                {/* To Destination */}
                <label>
                    To (Destination):
                    <input
                        type="text"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
                        placeholder="Enter destination"
                    />
                    {errors.to && <span className="error">{errors.to}</span>}
                </label>

                {/* Start Date */}
                <label>
                    Start Date:
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                    {errors.startDate && <span className="error">{errors.startDate}</span>}
                </label>

                {/* End Date */}
                <label>
                    End Date:
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                    {errors.endDate && <span className="error">{errors.endDate}</span>}
                </label>

                {/* Number of People */}
                <label>
                    Number of People:
                    <input
                        type="number"
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={handleChange}
                        placeholder="Enter number of travelers"
                    />
                    {errors.numberOfPeople && <span className="error">{errors.numberOfPeople}</span>}
                </label>

                {/* Group Type */}
                <label>
                    Group Type:
                    <select name="groupType" value={formData.groupType} onChange={handleChange}>
                        <option value="">Select Group Type</option>
                        <option value="Family">Family</option>
                        <option value="Friends">Friends</option>
                        <option value="Couple">Couple</option>
                        <option value="Solo">Solo</option>
                    </select>
                    {errors.groupType && <span className="error">{errors.groupType}</span>}
                </label>

                {/* Interests */}
                <label>
                    Interests:
                    <input
                        type="text"
                        name="interests"
                        value={formData.interests}
                        onChange={handleChange}
                        placeholder="e.g., Culture, Food, Nature"
                    />
                    {errors.interests && <span className="error">{errors.interests}</span>}
                </label>

                {/* Additional Information */}
                <label>
                    Any Other Information:
                    <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        placeholder="Enter any other details"
                    />
                </label>

                {/* Submit Button */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default TravelForm;