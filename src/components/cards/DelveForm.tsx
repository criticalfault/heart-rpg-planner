import React, { useState } from 'react';
import { Delve } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DomainSelector } from '../common/DomainSelector';
import { ArrayEditor } from '../common/ArrayEditor';
import { Modal } from '../common/Modal';
import { validateDelve } from '../../types/validators';
import './DelveForm.css';

export interface DelveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (delve: Delve) => void;
  initialData?: Partial<Delve>;
  title?: string;
}

const createEmptyDelve = (): Omit<Delve, 'id'> => ({
  name: '',
  resistance: 1,
  progress: 0,
  domains: [],
  events: [],
  resources: [],
  monsters: []
});

export const DelveForm: React.FC<DelveFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Create New Delve'
}) => {
  const [formData, setFormData] = useState<Omit<Delve, 'id'>>(() => ({
    ...createEmptyDelve(),
    ...initialData
  }));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        ...createEmptyDelve(),
        ...initialData
      });
      setValidationErrors([]);
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleFieldChange = (field: keyof Omit<Delve, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleResistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleFieldChange('resistance', value);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleFieldChange('progress', Math.max(0, Math.min(value, formData.resistance)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form data
    const errors = validateDelve(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the delve with a generated ID
      const delve: Delve = {
        ...formData,
        id: `delve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      onSubmit(delve);
      onClose();
    } catch (error) {
      console.error('Error creating delve:', error);
      setValidationErrors(['An error occurred while creating the delve']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(createEmptyDelve());
    setValidationErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="delve-form">
        {validationErrors.length > 0 && (
          <div className="delve-form-errors">
            {validationErrors.map((error, index) => (
              <div key={index} className="delve-form-error">
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="delve-form-fields">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Enter delve name..."
            required
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('name')) ? 'Name is required' : undefined}
          />

          <Input
            label="Resistance"
            type="number"
            min="1"
            max="50"
            value={formData.resistance.toString()}
            onChange={handleResistanceChange}
            placeholder="1"
            required
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('resistance')) ? 'Resistance must be between 1 and 50' : undefined}
            helperText="Difficulty rating from 1 to 50"
          />

          <Input
            label="Progress"
            type="number"
            min="0"
            max={formData.resistance.toString()}
            value={formData.progress.toString()}
            onChange={handleProgressChange}
            placeholder="0"
            disabled={isSubmitting}
            helperText={`Progress toward completion (0-${formData.resistance})`}
          />

          <DomainSelector
            label="Domains"
            selectedDomains={formData.domains}
            onChange={(domains) => handleFieldChange('domains', domains)}
            disabled={isSubmitting}
            error={validationErrors.find(e => e.includes('domain')) ? 'At least one domain must be selected' : undefined}
            helperText="Select one or more domains that apply to this delve"
          />

          <ArrayEditor
            label="Events"
            items={formData.events}
            onChange={(events) => handleFieldChange('events', events)}
            placeholder="Enter event description..."
            addButtonText="Add Event"
            disabled={isSubmitting}
            helperText="Events that can occur in this delve"
          />

          <ArrayEditor
            label="Resources"
            items={formData.resources}
            onChange={(resources) => handleFieldChange('resources', resources)}
            placeholder="Enter resource description..."
            addButtonText="Add Resource"
            disabled={isSubmitting}
            helperText="Resources that can be found in this delve"
          />
        </div>

        <div className="delve-form-actions">
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
            {isSubmitting ? 'Creating...' : 'Create Delve'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};