import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import driverService from '../../services/driverService';
import vehicleService from '../../services/vehicleService';
import './DriverForm.css';

const DriverForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
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

  const [availableCars, setAvailableCars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableCars();
    if (isEditMode) {
      loadDriver();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAvailableCars = async () => {
    const result = await vehicleService.getVehicles({ limit: 100 });
    if (result.success) {
      // Filtrer les voitures disponibles (sans chauffeur assigné)
      const available = result.data.cars.filter(car => !car.driver_id);
      setAvailableCars(available);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Préparer les données pour l'API
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

    // Ajouter password seulement en mode création
    if (!isEditMode) {
      if (!formData.password) {
        alert('Le mot de passe est requis');
        setLoading(false);
        return;
      }
      apiData.password = formData.password;
    }

    // Appel API
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
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Nom de famille"
                  />
                </div>

                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Prénom"
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
                    disabled={isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    placeholder="+226 XX XX XX XX"
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="form-group">
                  <label>Mot de passe *</label>
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
                  <label>CNIB *</label>
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
                  <label>Date d'entrée *</label>
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
                <label>Lieu de résidence</label>
                <input
                  type="text"
                  name="lieu_residence"
                  value={formData.lieu_residence}
                  onChange={handleChange}
                  placeholder="Adresse"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Information</h3>
              
              <div className="form-group">
                <label>Assigned Car</label>
                <select
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select a car --</option>
                  {availableCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.nom_modele} - {car.plaque_immatriculation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
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
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DriverForm;
