import React, { useState } from 'react';
import { Delve } from '../../types';
import { Button } from '../common/Button';
import { DomainSelector } from '../common/DomainSelector';
import { ArrayEditor } from '../common/ArrayEditor';
import { Input } from '../common/Input';
import { validateDelve } from '../../types/validators';
import { MonsterCard } from './MonsterCard';
import './DelveCard.css';

export interface DelveCardProps {
  delve: Delve;
  onUpdate?: (delve: Delve) => void;
  onDelete?: (id: string) => void;
  onSaveToLibrary?: (delve: Delve) => void;
  onAddMonster?: (delveId: string) => void;
  onEditMonster?: (delveId: string, monsterId: string) => void;
  onDeleteMonster?: (delveId: string, monsterId: string) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
  className?: string;
}

export const DelveCard: React.FC<DelveCardProps> = ({
  delve,
  onUpdate,
  onDelete,
  onSaveToLibrary,
  onAddMonster,
  onEditMonster,
  onDeleteMonster,
  isEditing = false,
  onEditToggle,
  className = ''
}) => {
  const [editData, setEditData] = useState<Delve>(delve);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleStartEdit = () => {
    setEditData(delve);
    setValidationErrors([]);
    onEditToggle?.(true);
  };

  const handleCancelEdit = () => {
    setEditData(delve);
    setValidationErrors([]);
    onEditToggle?.(false);
  };

  const handleSaveEdit = () => {
    const errors = validateDelve(editData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onUpdate?.(editData);
    onEditToggle?.(false);
  };

  const handleFieldChange = (field: keyof Delve, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleFieldChange('resistance', value);
    }
  };

  const cardClasses = [
    'delve-card',
    isEditing ? 'delve-card--editing' : '',
    className
  ].filter(Boolean).join(' ');

  if (isEditing) {
    return (
      <div className={cardClasses}>
        <div className="delve-card-header">
          <h3 className="delve-card-title">Edit Delve</h3>
          <div className="delve-card-actions">
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

        <div className="delve-card-content">
          {validationErrors.length > 0 && (
            <div className="delve-card-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="delve-card-error">
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

          <Input
            label="Resistance"
            type="number"
            min="1"
            max="50"
            value={editData.resistance.toString()}
            onChange={handleResistanceChange}
            error={validationErrors.find(e => e.includes('resistance')) ? 'Resistance must be between 1 and 50' : undefined}
            helperText="Difficulty rating from 1 to 50"
            required
          />

          <DomainSelector
            label="Domains"
            selectedDomains={editData.domains}
            onChange={(domains) => handleFieldChange('domains', domains)}
            error={validationErrors.find(e => e.includes('domain')) ? 'At least one domain must be selected' : undefined}
          />

          <ArrayEditor
            label="Events"
            items={editData.events}
            onChange={(events) => handleFieldChange('events', events)}
            placeholder="Enter event..."
            addButtonText="Add Event"
          />

          <ArrayEditor
            label="Resources"
            items={editData.resources}
            onChange={(resources) => handleFieldChange('resources', resources)}
            placeholder="Enter resource..."
            addButtonText="Add Resource"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className="delve-card-header">
        <h3 className="delve-card-title">{delve.name}</h3>
        <div className="delve-card-actions">
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
              onClick={() => onSaveToLibrary(delve)}
            >
              Save to Library
            </Button>
          )}
          {onDelete && (
            <Button
              size="small"
              variant="danger"
              onClick={() => onDelete(delve.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="delve-card-content">
        <div className="delve-card-field">
          <span className="delve-card-field-label">Resistance:</span>
          <span className="delve-card-resistance">{delve.resistance}</span>
        </div>

        <div className="delve-card-field">
          <span className="delve-card-field-label">Domains:</span>
          <div className="delve-card-domains">
            {delve.domains.map(domain => (
              <span key={domain} className="delve-card-domain-chip">
                {domain}
              </span>
            ))}
          </div>
        </div>

        {delve.events.length > 0 && (
          <div className="delve-card-field">
            <span className="delve-card-field-label">Events:</span>
            <ul className="delve-card-list">
              {delve.events.map((event, index) => (
                <li key={index} className="delve-card-list-item">{event}</li>
              ))}
            </ul>
          </div>
        )}

        {delve.resources.length > 0 && (
          <div className="delve-card-field">
            <span className="delve-card-field-label">Resources:</span>
            <ul className="delve-card-list">
              {delve.resources.map((resource, index) => (
                <li key={index} className="delve-card-list-item">{resource}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="delve-card-monsters">
          <div className="delve-card-monsters-header">
            <h4 className="delve-card-monsters-title">
              Monsters ({delve.monsters.length})
            </h4>
            {onAddMonster && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => onAddMonster(delve.id)}
              >
                Add Monster
              </Button>
            )}
          </div>

          {delve.monsters.length > 0 ? (
            <div className="delve-card-monsters-list">
              {delve.monsters.map((monster) => (
                <MonsterCard
                  key={monster.id}
                  monster={monster}
                  onEdit={onEditMonster ? () => onEditMonster(delve.id, monster.id) : undefined}
                  onDelete={onDeleteMonster ? () => onDeleteMonster(delve.id, monster.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="delve-card-empty-state">
              No monsters added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

