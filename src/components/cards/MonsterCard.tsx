import React from 'react';
import { Monster } from '../../types';
import { Button } from '../common/Button';
import './MonsterCard.css';

export interface MonsterCardProps {
  monster: Monster;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveToLibrary?: (monster: Monster) => void;
  className?: string;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({
  monster,
  onEdit,
  onDelete,
  onSaveToLibrary,
  className = ''
}) => {
  const cardClasses = [
    'monster-card',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="monster-card-header">
        <h5 className="monster-card-name">{monster.name}</h5>
        <div className="monster-card-actions">
          {onEdit && (
            <Button
              size="small"
              variant="secondary"
              onClick={onEdit}
              aria-label={`Edit ${monster.name}`}
            >
              Edit
            </Button>
          )}
          {onSaveToLibrary && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => onSaveToLibrary(monster)}
              aria-label={`Save ${monster.name} to library`}
            >
              Save to Library
            </Button>
          )}
          {onDelete && (
            <Button
              size="small"
              variant="danger"
              onClick={onDelete}
              aria-label={`Delete ${monster.name}`}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="monster-card-content">
        <div className="monster-card-stats">
          <div className="monster-card-stat">
            <span className="monster-card-stat-label">Resistance:</span>
            <span className="monster-card-stat-value">{monster.resistance}</span>
          </div>
          <div className="monster-card-stat">
            <span className="monster-card-stat-label">Protection:</span>
            <span className="monster-card-stat-value">{monster.protection}</span>
          </div>
        </div>

        {monster.attacks.length > 0 && (
          <div className="monster-card-field">
            <span className="monster-card-field-label">Attacks:</span>
            <ul className="monster-card-list">
              {monster.attacks.map((attack, index) => (
                <li key={index} className="monster-card-list-item">{attack}</li>
              ))}
            </ul>
          </div>
        )}

        {monster.resources.length > 0 && (
          <div className="monster-card-field">
            <span className="monster-card-field-label">Resources:</span>
            <ul className="monster-card-list">
              {monster.resources.map((resource, index) => (
                <li key={index} className="monster-card-list-item">{resource}</li>
              ))}
            </ul>
          </div>
        )}

        {monster.notes && (
          <div className="monster-card-field">
            <span className="monster-card-field-label">Notes:</span>
            <div className="monster-card-notes">
              {monster.notes.split('\n').map((line, index) => (
                <p key={index} className="monster-card-notes-line">
                  {line || '\u00A0'} {/* Non-breaking space for empty lines */}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};