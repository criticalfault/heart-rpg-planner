import React, { useState, useEffect } from 'react';
import { Monster } from '../../types';
import { validateMonster } from '../../types/validators';
import { Button, Input, TextArea, ArrayEditor } from '../common';
import './MonsterForm.css';

export interface MonsterFormProps {
  monster?: Monster;
  onSave: (monster: Monster) => void;
  onCancel: () => void;
  isEditing?: boolean;
  className?: string;
}

export const MonsterForm: React.FC<MonsterFormProps> = ({
  monster,
  onSave,
  onCancel,
  isEditing = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Partial<Monster>>({
    id: monster?.id || crypto.randomUUID(),
    name: monster?.name || '',
    resistance: monster?.resistance || 1,
    protection: monster?.protection || 1,
    attacks: monster?.attacks || [],
    resources: monster?.resources || [],
    notes: monster?.notes || ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when monster prop changes
  useEffect(() => {
    if (monster) {
      setFormData({
        id: monster.id,
        name: monster.name,
        resistance: monster.resistance,
        protection: monster.protection,
        attacks: [...monster.attacks],
        resources: [...monster.resources],
        notes: monster.notes
      });
    } else {
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        resistance: 1,
        protection: 1,
        attacks: [],
        resources: [],
        notes: ''
      });
    }
    setValidationErrors([]);
  }, [monster]);

  const handleFieldChange = (field: keyof Monster, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNumberChange = (field: 'resistance' | 'protection', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      handleFieldChange(field, numValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form data
    const errors = validateMonster(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create complete monster object
      const completeMonster: Monster = {
        id: formData.id!,
        name: formData.name!.trim(),
        resistance: formData.resistance!,
        protection: formData.protection!,
        attacks: formData.attacks!,
        resources: formData.resources!,
        notes: formData.notes!.trim()
      };

      await onSave(completeMonster);
    } catch (error) {
      console.error('Error saving monster:', error);
      setValidationErrors(['Failed to save monster. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: crypto.randomUUID(),
      name: '',
      resistance: 1,
      protection: 1,
      attacks: [],
      resources: [],
      notes: ''
    });
    setValidationErrors([]);
    onCancel();
  };

  const formClasses = [
    'monster-form',
    className
  ].filter(Boolean).join(' ');

  const title = isEditing ? 'Edit Monster' : 'Add New Monster';

  return (
    <form className={formClasses} onSubmit={handleSubmit} noValidate>
      <div className="monster-form-header">
        <h3 className="monster-form-title">{title}</h3>
      </div>

      <div className="monster-form-content">
        {validationErrors.length > 0 && (
          <div className="monster-form-errors" role="alert">
            {validationErrors.map((error, index) => (
              <div key={index} className="monster-form-error">
                {error}
              </div>
            ))}
          </div>
        )}

        <Input
          label="Name"
          value={formData.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          error={validationErrors.find(e => e.includes('name')) ? 'Monster name is required' : undefined}
          placeholder="Enter monster name..."
          required
          autoFocus={!isEditing}
        />

        <div className="monster-form-stats">
          <Input
            label="Resistance"
            type="number"
            min="1"
            max="20"
            value={formData.resistance?.toString() || '1'}
            onChange={(e) => handleNumberChange('resistance', e.target.value)}
            error={validationErrors.find(e => e.includes('resistance')) ? 'Resistance must be between 1 and 20' : undefined}
            helperText="Combat difficulty (1-20)"
            required
          />

          <Input
            label="Protection"
            type="number"
            min="1"
            max="12"
            value={formData.protection?.toString() || '1'}
            onChange={(e) => handleNumberChange('protection', e.target.value)}
            error={validationErrors.find(e => e.includes('protection')) ? 'Protection must be between 1 and 12' : undefined}
            helperText="Damage reduction (1-12)"
            required
          />
        </div>

        <ArrayEditor
          label="Attacks"
          items={formData.attacks || []}
          onChange={(attacks) => handleFieldChange('attacks', attacks)}
          placeholder="Enter attack description..."
          addButtonText="Add Attack"
          helperText="Describe the monster's attacks and abilities"
        />

        <ArrayEditor
          label="Resources"
          items={formData.resources || []}
          onChange={(resources) => handleFieldChange('resources', resources)}
          placeholder="Enter resource..."
          addButtonText="Add Resource"
          helperText="Items or rewards obtained from defeating this monster"
        />

        <TextArea
          label="Notes"
          value={formData.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Enter additional notes about this monster..."
          helperText="Behavior, appearance, tactics, or other details"
          rows={4}
          resize="vertical"
        />
      </div>

      <div className="monster-form-actions">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Monster' : 'Add Monster')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};