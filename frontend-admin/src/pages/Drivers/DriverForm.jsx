import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import './DriverForm.css';

const AVAILABLE_CARS = [
  { id: 1, model_name: 'Toyota Corolla', license_plate: 'BF-1234-AB' },
  { id: 2, model_name: 'Honda Civic', license_plate: 'BF-5678-CD' },
  { id: 3, model_name: 'Nissan Sentra', license_plate: 'BF-9012-EF' },
  { id: 4, model_name: 'Hyundai Elantra', license_plate: 'BF-3456-GH' },
  { id: 5, model_name: 'Mazda 3', license_plate: 'BF-7890-IJ' },
];

const DriverForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    phone: '',
    cnib: '',
    joining_date: new Date().toISOString().split('T')[0],
    car_id: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    alert(isEditMode ? 'Driver updated!' : 'Driver added!');
    
    navigate('/drivers');
  };

  return (
    <Layout>
      <div className="driver-form-page">
        <div className="form-header">
          <h1>{isEditMode ? 'Edit Driver' : 'Add Driver'}</h1>
          <button className="btn-back" onClick={() => navigate('/drivers')}>
            ← Back to list
          </button>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>

                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+226 XX XX XX XX"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>CNIB *</label>
                <input
                  type="text"
                  name="cnib"
                  value={formData.cnib}
                  onChange={handleChange}
                  required
                  placeholder="CNIB Number"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Car</label>
                  <select
                    name="car_id"
                    value={formData.car_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Select a car --</option>
                    {AVAILABLE_CARS.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.model_name} - {car.license_plate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/drivers')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DriverForm;
