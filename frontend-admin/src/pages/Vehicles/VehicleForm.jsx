<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import vehicleService from '../../services/vehicleService';
=======
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
>>>>>>> origin/frontend-admin
import './VehicleForm.css';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom_modele: '',
    plaque_immatriculation: '',
    statut: 'available'
  });

<<<<<<< HEAD
  // Charger les données du véhicule si mode édition
  useEffect(() => {
    if (isEditMode) {
      loadVehicle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadVehicle = async () => {
    const result = await vehicleService.getVehicleById(id);
    if (result.success) {
      const vehicle = result.data.car;
      setFormData({
        nom_modele: vehicle.nom_modele || '',
        plaque_immatriculation: vehicle.plaque_immatriculation || '',
        statut: vehicle.status || 'available'
      });
    } else {
      alert('Erreur: ' + result.error);
    }
  };

=======
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
    console.log('Form data:', formData);

    // Préparer les données pour l'API (envoie directement la valeur du select)
    const apiData = {
      nom_modele: formData.nom_modele,
      plaque_immatriculation: formData.plaque_immatriculation,
      status: formData.statut  // Envoie 'available', 'in_use', ou 'maintenance'
    };

    // Appel API
    const result = isEditMode 
      ? await vehicleService.updateVehicle(id, apiData)
      : await vehicleService.createVehicle(apiData);

    if (result.success) {
      alert(isEditMode ? 'Vehicle updated!' : 'Vehicle added!');
      navigate('/vehicles');
    } else {
      alert('Erreur: ' + result.error);
    }
=======
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    alert(isEditMode ? 'Vehicle updated!' : 'Vehicle added!');
    navigate('/vehicles');
>>>>>>> origin/frontend-admin
  };

  return (
    <Layout>
      <div className="vehicle-form-page">
        <div className="form-header">
          <div className="header-title">
            <span className="form-icon">{isEditMode ? '✏️' : '➕'}</span>
            <h1>{isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
          </div>
          <button className="btn-back" onClick={() => navigate('/vehicles')}>
            ← Back to list
          </button>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-header">
                <span className="section-icon">🚗</span>
                <h3>Vehicle Information</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>🏷️ Model Name *</label>
                  <input
                    type="text"
                    name="nom_modele"
                    value={formData.nom_modele}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Toyota Corolla"
                  />
                </div>

                <div className="form-group">
                  <label>🪪 License Plate *</label>
                  <input
                    type="text"
                    name="plaque_immatriculation"
                    value={formData.plaque_immatriculation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. BF-1234-AB"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>📊 Status *</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                >
                  <option value="available">Available - Disponible</option>
                  <option value="in_use">In Use - En service</option>
                  <option value="maintenance">Maintenance - En réparation</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/vehicles')}>
                ❌ Cancel
              </button>
              <button type="submit" className="btn-submit">
                {isEditMode ? '✅ Update' : '✅ Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VehicleForm;
