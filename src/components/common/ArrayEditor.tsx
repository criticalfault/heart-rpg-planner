import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import './ArrayEditor.css';

export interface ArrayEditorProps {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  maxItems?: number;
  addButtonText?: string;
}

export const ArrayEditor: React.FC<ArrayEditorProps> = ({
  label,
  items,
  onChange,
  placeholder = 'Enter item...',
  error,
  helperText,
  disabled = false,
  maxItems,
  addButtonText = 'Add Item'
}) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddItem = () => {
    const trimmedItem = newItem.trim();
    if (trimmedItem && !items.includes(trimmedItem)) {
      onChange([...items, trimmedItem]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const trimmedValue = editingValue.trim();
      if (trimmedValue && !items.some((item, i) => i !== editingIndex && item === trimmedValue)) {
        const newItems = [...items];
        newItems[editingIndex] = trimmedValue;
        onChange(newItems);
      }
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'save') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') {
        handleAddItem();
      } else {
        handleSaveEdit();
      }
    }
  };

  const canAddMore = !maxItems || items.length < maxItems;
  const hasError = Boolean(error);
  const editorId = `array-editor-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="array-editor-group">
      {label && (
        <label className="array-editor-label">
          {label}
        </label>
      )}
      
      <div 
        className={`array-editor ${hasError ? 'array-editor--error' : ''}`}
        aria-describedby={error ? `${editorId}-error` : helperText ? `${editorId}-helper` : undefined}
      >
        {/* Items List */}
        {items.length > 0 && (
          <div className="array-editor-items">
            {items.map((item, index) => (
              <div key={index} className="array-editor-item">
                {editingIndex === index ? (
                  <div className="array-editor-item-edit">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'save')}
                      disabled={disabled}
                      autoFocus
                    />
                    <div className="array-editor-item-actions">
                      <Button
                        size="small"
                        variant="primary"
                        onClick={handleSaveEdit}
                        disabled={disabled || !editingValue.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={disabled}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="array-editor-item-display">
                    <span className="array-editor-item-text">{item}</span>
                    <div className="array-editor-item-actions">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleStartEdit(index)}
                        disabled={disabled}
                        aria-label={`Edit ${item}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleRemoveItem(index)}
                        disabled={disabled}
                        aria-label={`Remove ${item}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Item */}
        {canAddMore && (
          <div className="array-editor-add">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'add')}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button
              onClick={handleAddItem}
              disabled={disabled || !newItem.trim() || items.includes(newItem.trim())}
              variant="primary"
              size="small"
            >
              {addButtonText}
            </Button>
          </div>
        )}

        {maxItems && (
          <div className="array-editor-counter">
            {items.length} / {maxItems} items
          </div>
        )}
      </div>

      {error && (
        <div id={`${editorId}-error`} className="array-editor-error" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={`${editorId}-helper`} className="array-editor-helper">
          {helperText}
        </div>
      )}
    </div>
  );
};