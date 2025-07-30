import React, { memo } from 'react';
import { Monster } from '../../types';
import { Button } from '../common/Button';
import './MonsterCard.css';
import '../../styles/animations.css';

export interface MonsterCardProps {
  monster: Monster;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveToLibrary?: (monster: Monster) => void;
  className?: string;
}

const MonsterCardComponent: React.FC<MonsterCardProps> = ({
  monster,
  onEdit,
  onDelete,
  onSaveToLibrary,
  className = ''
}) => {
  const cardClasses = [
    'monster-card',
    'transition-all',
    'hover-lift',
    'focus-ring',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      role="article"
      aria-label={`Monster: ${monster.name}, Resistance: ${monster.resistance}, Protection: ${monster.protection}`}
      tabIndex={0}
    >
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

// Memoized component with custom comparison function for better performance
export const MonsterCard = memo(MonsterCardComponent, (prevProps, nextProps) => {
  // Compare monster data
  if (prevProps.monster.id !== nextProps.monster.id) return false;
  if (prevProps.monster.name !== nextProps.monster.name) return false;
  if (prevProps.monster.resistance !== nextProps.monster.resistance) return false;
  if (prevProps.monster.protection !== nextProps.monster.protection) return false;
  if (prevProps.monster.notes !== nextProps.monster.notes) return false;
  if (JSON.stringify(prevProps.monster.attacks) !== JSON.stringify(nextProps.monster.attacks)) return false;
  if (JSON.stringify(prevProps.monster.resources) !== JSON.stringify(nextProps.monster.resources)) return false;
  
  // Compare other props
  if (prevProps.className !== nextProps.className) return false;
  
  // Function props are assumed to be stable (using useCallback in parent)
  return true;
});