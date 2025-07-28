import React, { useState } from 'react';
import { Landmark } from '../../types';
import { Button } from '../common/Button';
import { DomainSelector } from '../common/DomainSelector';
import { ArrayEditor } from '../common/ArrayEditor';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { validateLandmark, VALID_STRESS_DICE } from '../../types/validators';
import './LandmarkCard.css';

export interface LandmarkCardProps {
  landmark: Landmark;
  onUpdate?: (landmark: Landmark) => void;
  onDelete?: (id: string) => void;
  onSaveToLibrary?: (landmark: Landmark) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
  className?: string;
}

export const LandmarkCard: React.FC<LandmarkCardProps> = ({
  landmark,
  onUpdate,
  onDelete,
  onSaveToLibrary,
  isEditing = false,
  onEditToggle,
  className = ''
}) => {
  const [editData, setEditData] = useState<Landmark>(landmark);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleStartEdit = () => {
    setEditData(landmark);
    setValidationErrors([]);
    onEditToggle?.(true);
  };

  const handleCancelEdit = () => {
    setEditData(landmark);
    setValidationErrors([]);
    onEditToggle?.(false);
  };

  const handleSaveEdit = () => {
    const errors = validateLandmark(editData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onUpdate?.(editData);
    onEditToggle?.(false);
  };

  const handleFieldChange = (field: keyof Landmark, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const stressDieOptions = VALID_STRESS_DICE.map(die => ({
    value: die,
    label: die
  }));

  const cardClasses = [
    'landmark-card',
    isEditing ? 'landmark-card--editing' : '',
    className
  ].filter(Boolean).join(' ');

  if (isEditing) {
    return (
      <div className={cardClasses}>
        <div className="landmark-card-header">
          <h3 className="landmark-card-title">Edit Landmark</h3>
          <div className="landmark-card-actions">
            <Button
              size="small"
              variant="primary"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </div>
        </div>

        <div className="landmark-card-content">
          {validationErrors.length > 0 && (
            <div className="landmark-card-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="landmark-card-error">
                  {error}
                </div>
              ))}
            </div>
          )}

          <Input
            label="Name"
            value={editData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={validationErrors.find(e => e.includes('name')) ? 'Name is required' : undefined}
            required
          />

          <DomainSelector
            label="Domains"
            selectedDomains={editData.domains}
            onChange={(domains) => handleFieldChange('domains', domains)}
            error={validationErrors.find(e => e.includes('domain')) ? 'At least one domain must be selected' : undefined}
          />

          <Select
            label="Default Stress Die"
            value={editData.defaultStress}
            onChange={(e) => handleFieldChange('defaultStress', e.target.value)}
            options={stressDieOptions}
            error={validationErrors.find(e => e.includes('stress')) ? 'Valid stress die must be selected' : undefined}
            required
          />

          <ArrayEditor
            label="Haunts"
            items={editData.haunts}
            onChange={(haunts) => handleFieldChange('haunts', haunts)}
            placeholder="Enter haunt..."
            addButtonText="Add Haunt"
          />

          <ArrayEditor
            label="Bonds"
            items={editData.bonds}
            onChange={(bonds) => handleFieldChange('bonds', bonds)}
            placeholder="Enter bond..."
            addButtonText="Add Bond"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className="landmark-card-header">
        <h3 className="landmark-card-title">{landmark.name}</h3>
        <div className="landmark-card-actions">
          {onEditToggle && (
            <Button
              size="small"
              variant="secondary"
              onClick={handleStartEdit}
            >
              Edit
            </Button>
          )}
          {onSaveToLibrary && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => onSaveToLibrary(landmark)}
            >
              Save to Library
            </Button>
          )}
          {onDelete && (
            <Button
              size="small"
              variant="danger"
              onClick={() => onDelete(landmark.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="landmark-card-content">
        <div className="landmark-card-field">
          <span className="landmark-card-field-label">Domains:</span>
          <div className="landmark-card-domains">
            {landmark.domains.map(domain => (
              <span key={domain} className="landmark-card-domain-chip">
                {domain}
              </span>
            ))}
          </div>
        </div>

        <div className="landmark-card-field">
          <span className="landmark-card-field-label">Default Stress:</span>
          <span className="landmark-card-stress-die">{landmark.defaultStress}</span>
        </div>

        {landmark.haunts.length > 0 && (
          <div className="landmark-card-field">
            <span className="landmark-card-field-label">Haunts:</span>
            <ul className="landmark-card-list">
              {landmark.haunts.map((haunt, index) => (
                <li key={index} className="landmark-card-list-item">{haunt}</li>
              ))}
            </ul>
          </div>
        )}

        {landmark.bonds.length > 0 && (
          <div className="landmark-card-field">
            <span className="landmark-card-field-label">Bonds:</span>
            <ul className="landmark-card-list">
              {landmark.bonds.map((bond, index) => (
                <li key={index} className="landmark-card-list-item">{bond}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};