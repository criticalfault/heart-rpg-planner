import React, { useState } from 'react';
import { Landmark, StressDie } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { DomainSelector } from '../common/DomainSelector';
import { ArrayEditor } from '../common/ArrayEditor';
import { Modal } from '../common/Modal';
import { validateLandmark, VALID_STRESS_DICE } from '../../types/validators';
import './LandmarkForm.css';

export interface LandmarkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (landmark: Landmark) => void;
  initialData?: Partial<Landmark>;
  title?: string;
}

const createEmptyLandmark = (): Omit<Landmark, 'id'> => ({
  name: '',
  domains: [],
  defaultStress: 'd6',
  haunts: [],
  bonds: []
});

export const LandmarkForm: React.FC<LandmarkFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Create New Landmark'
}) => {
  const [formData, setFormData] = useState<Omit<Landmark, 'id'>>(() => ({
    ...createEmptyLandmark(),
    ...initialData
  }));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        ...createEmptyLandmark(),
        ...initialData
      });
      setValidationErrors([]);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleFieldChange = (field: keyof Omit<Landmark, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form data
    const errors = validateLandmark(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the landmark with a generated ID
      const landmark: Landmark = {
        ...formData,
        id: `landmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      onSubmit(landmark);
      onClose();
    } catch (error) {
      console.error('Error creating landmark:', error);
      setValidationErrors(['An error occurred while creating the landmark']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(createEmptyLandmark());
    setValidationErrors([]);
    onClose();
  };

  const stressDieOptions = VALID_STRESS_DICE.map(die => ({
    value: die,
    label: die
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="landmark-form">
        {validationErrors.length > 0 && (
          <div className="landmark-form-errors">
            {validationErrors.map((error, index) => (
              <div key={index} className="landmark-form-error">
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="landmark-form-fields">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter landmark name..."
            required
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('name')) ? 'Name is required' : undefined}
          />

          <DomainSelector
            label="Domains"
            selectedDomains={formData.domains}
            onChange={(domains) => handleFieldChange('domains', domains)}
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('domain')) ? 'At least one domain must be selected' : undefined}
            helperText="Select one or more domains that apply to this landmark"
          />

          <Select
            label="Default Stress Die"
            value={formData.defaultStress}
            onChange={(e) => handleFieldChange('defaultStress', e.target.value as StressDie)}
            options={stressDieOptions}
            required
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('stress')) ? 'Valid stress die must be selected' : undefined}
            helperText="The default stress die used when visiting this landmark"
          />

          <ArrayEditor
            label="Haunts"
            items={formData.haunts}
            onChange={(haunts) => handleFieldChange('haunts', haunts)}
            placeholder="Enter haunt description..."
            addButtonText="Add Haunt"
            disabled={isSubmitting}
            helperText="Supernatural or unsettling aspects of this landmark"
          />

          <ArrayEditor
            label="Bonds"
            items={formData.bonds}
            onChange={(bonds) => handleFieldChange('bonds', bonds)}
            placeholder="Enter bond description..."
            addButtonText="Add Bond"
            disabled={isSubmitting}
            helperText="Connections or relationships tied to this landmark"
          />
        </div>

        <div className="landmark-form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Landmark'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};