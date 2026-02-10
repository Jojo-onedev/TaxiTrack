<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import './DriverForm.css';

=======
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

>>>>>>> origin/frontend-admin
const DriverForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
<<<<<<< HEAD
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    lieu_residence: '',
    car_id: '',
    password: '',
    cnib: '',
    date_entree: new Date().toISOString().split('T')[0]
  });

  const [allCars, setAllCars] = useState([]);  // TOUTES les voitures
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllCars();  // Charge TOUTES les voitures
    if (isEditMode) {
      loadDriver();
    }
  }, [id]);

  // Récupère TOUS les voitures de la table cars
  const fetchAllCars = async () => {
    try {
      const result = await vehicleService.getVehicles({ limit: 100 });
      if (result.success) {
        setAllCars(result.data.cars || result.data || []);
      }
    } catch (error) {
      console.error('Erreur voitures:', error);
    }
  };

  const loadDriver = async () => {
    setLoading(true);
    const result = await driverService.getDriverById(id);
    
    if (result.success) {
      const driver = result.data.driver;
      setFormData({
        nom: driver.nom || '',
        prenom: driver.prenom || '',
        email: driver.email || '',
        telephone: driver.telephone || '',
        lieu_residence: driver.lieu_residence || '',
        cnib: driver.cnib || '',
        date_entree: driver.date_entree || new Date().toISOString().split('T')[0],
        car_id: driver.car_id || '',
        password: ''
      });
    } else {
      alert('Erreur: ' + result.error);
    }
    setLoading(false);
  };

=======
    last_name: '',
    first_name: '',
    email: '',
    phone: '',
    cnib: '',
    joining_date: new Date().toISOString().split('T')[0],
    car_id: ''
  });

>>>>>>> origin/frontend-admin
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

<<<<<<< HEAD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiData = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      lieu_residence: formData.lieu_residence,
      cnib: formData.cnib,
      date_entree: formData.date_entree,
      car_id: formData.car_id || null
    };

    if (!isEditMode) {
      if (!formData.password) {
        alert('Le mot de passe est requis');
        setLoading(false);
        return;
      }
      apiData.password = formData.password;
    }

    const result = isEditMode 
      ? await driverService.updateDriver(id, apiData)
      : await driverService.createDriver(apiData);

    setLoading(false);

    if (result.success) {
      alert(isEditMode ? 'Driver updated!' : 'Driver added!');
      navigate('/drivers');
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  if (loading && isEditMode) {
    return (
      <Layout>
        <div className="driver-form-page">
          <div className="loading">Chargement...</div>
        </div>
      </Layout>
    );
  }

=======
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    alert(isEditMode ? 'Driver updated!' : 'Driver added!');
    
    navigate('/drivers');
  };

>>>>>>> origin/frontend-admin
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
<<<<<<< HEAD
                  <label>First_name *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Nom de famille"
=======
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
>>>>>>> origin/frontend-admin
                  />
                </div>

                <div className="form-group">
<<<<<<< HEAD
                  <label>Last_name *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Prénom"
=======
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
>>>>>>> origin/frontend-admin
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
<<<<<<< HEAD
                    disabled={isEditMode}
=======
>>>>>>> origin/frontend-admin
                  />
                </div>

                <div className="form-group">
<<<<<<< HEAD
                  <label>phone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
=======
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
>>>>>>> origin/frontend-admin
                    onChange={handleChange}
                    required
                    placeholder="+226 XX XX XX XX"
                  />
                </div>
              </div>

<<<<<<< HEAD
              {!isEditMode && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required
                    placeholder="Mot de passe"
                    minLength="6"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>CNIB </label>
                  <input
                    type="text"
                    name="cnib"
                    value={formData.cnib}
                    onChange={handleChange}
                    required
                    placeholder="Numéro CNIB"
                  />
                </div>

                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="date_entree"
                    value={formData.date_entree}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Residence *</label>
                <input
                  type="text"
                  name="lieu_residence"
                  value={formData.lieu_residence}
                  onChange={handleChange}
                  placeholder="Adresse"
=======
              <div className="form-group">
                <label>CNIB *</label>
                <input
                  type="text"
                  name="cnib"
                  value={formData.cnib}
                  onChange={handleChange}
                  required
                  placeholder="CNIB Number"
>>>>>>> origin/frontend-admin
                />
              </div>
            </div>

<<<<<<< HEAD
            {/* Voiture - TOUTES les voitures */}
            <div className="form-section">
              <h3>Professional Information</h3>
              
              <div className="form-group">
                <label>Assigned Car</label>
                <select
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                >
                  <option value=""> Select a car </option>
                  {allCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.nom_modele || car.nommodele} - {car.plaque_immatriculation || car.plaqueimmatriculation}
                    </option>
                  ))}
                </select>
=======
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
>>>>>>> origin/frontend-admin
              </div>
            </div>

            <div className="form-actions">
<<<<<<< HEAD
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => navigate('/drivers')}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'En cours...' : (isEditMode ? 'Update' : 'Add')}
=======
              <button type="button" className="btn-cancel" onClick={() => navigate('/drivers')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? 'Update' : 'Add'}
>>>>>>> origin/frontend-admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DriverForm;
