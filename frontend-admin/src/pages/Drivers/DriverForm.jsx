import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaBuilding, FaSave, FaTimes } from 'react-icons/fa';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  return (
    <Layout>
      <div className="driver-form-page">
        <div className="form-header">
          <h1>{isEditMode ? 'Edit Driver' : 'Add Driver'}</h1>
          <button className="btn-back" onClick={() => navigate('/drivers')}>
            <FaArrowLeft /> Back to list
          </button>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3><FaUser /> Personal Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>

                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
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
                    disabled={isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
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

                <div className="form-group">
                  <label>Joining Date *</label>
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
                  required
                  placeholder="Adresse"
                />
              </div>
            </div>

            <div className="form-section">
              <h3><FaBuilding /> Professional Information</h3>

              <div className="form-group">
                <label>Assigned Car</label>
                <select
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select a car --</option>
                  {allCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.nom_modele || car.nommodele} - {car.plaque_immatriculation || car.plaqueimmatriculation}
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
                <FaTimes /> Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'En cours...' : (isEditMode ? <><FaSave /> Update</> : <><FaSave /> Add</>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DriverForm;
