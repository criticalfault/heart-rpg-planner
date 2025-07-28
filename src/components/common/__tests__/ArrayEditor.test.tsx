import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ArrayEditor } from '../ArrayEditor';

describe('ArrayEditor', () => {
  it('renders with label when provided', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor label="Test Items" items={[]} onChange={handleChange} />);
    expect(screen.getByText('Test Items')).toBeInTheDocument();
  });

  it('displays existing items', () => {
    const handleChange = vi.fn();
    const items = ['Item 1', 'Item 2', 'Item 3'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('allows adding new items', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    const addButton = screen.getByText('Add Item');
    
    fireEvent.change(input, { target: { value: 'New Item' } });
    fireEvent.click(addButton);
    
    expect(handleChange).toHaveBeenCalledWith(['New Item']);
  });

  it('clears input after adding item', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    const addButton = screen.getByText('Add Item');
    
    fireEvent.change(input, { target: { value: 'New Item' } });
    fireEvent.click(addButton);
    
    expect(input.value).toBe('');
  });

  it('allows adding items by pressing Enter', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'New Item' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(handleChange).toHaveBeenCalledWith(['New Item']);
  });

  it('does not add empty or whitespace-only items', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    const addButton = screen.getByText('Add Item');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(addButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not add duplicate items', () => {
    const handleChange = vi.fn();
    const items = ['Existing Item'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    const addButton = screen.getByText('Add Item');
    
    fireEvent.change(input, { target: { value: 'Existing Item' } });
    fireEvent.click(addButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allows removing items', () => {
    const handleChange = vi.fn();
    const items = ['Item 1', 'Item 2'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    expect(handleChange).toHaveBeenCalledWith(['Item 2']);
  });

  it('allows editing items', () => {
    const handleChange = vi.fn();
    const items = ['Item 1'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    const editInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(editInput, { target: { value: 'Updated Item' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(handleChange).toHaveBeenCalledWith(['Updated Item']);
  });

  it('allows canceling edit', () => {
    const handleChange = vi.fn();
    const items = ['Item 1'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    const editInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(editInput, { target: { value: 'Updated Item' } });
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('allows saving edit by pressing Enter', () => {
    const handleChange = vi.fn();
    const items = ['Item 1'];
    render(<ArrayEditor items={items} onChange={handleChange} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    const editInput = screen.getByDisplayValue('Item 1');
    fireEvent.change(editInput, { target: { value: 'Updated Item' } });
    fireEvent.keyPress(editInput, { key: 'Enter', code: 'Enter' });
    
    expect(handleChange).toHaveBeenCalledWith(['Updated Item']);
  });

  it('displays error message when error prop is provided', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays helper text when provided and no error', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} helperText="Add items to the list" />);
    expect(screen.getByText('Add items to the list')).toBeInTheDocument();
  });

  it('respects maxItems limit', () => {
    const handleChange = vi.fn();
    const items = ['Item 1', 'Item 2'];
    render(<ArrayEditor items={items} onChange={handleChange} maxItems={2} />);
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
    expect(screen.getByText('2 / 2 items')).toBeInTheDocument();
  });

  it('shows item counter when maxItems is set', () => {
    const handleChange = vi.fn();
    const items = ['Item 1'];
    render(<ArrayEditor items={items} onChange={handleChange} maxItems={3} />);
    
    expect(screen.getByText('1 / 3 items')).toBeInTheDocument();
  });

  it('disables all interactions when disabled', () => {
    const handleChange = vi.fn();
    const items = ['Item 1'];
    render(<ArrayEditor items={items} onChange={handleChange} disabled />);
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('Add Item')).toBeDisabled();
    expect(screen.getByText('Edit')).toBeDisabled();
    expect(screen.getByText('Remove')).toBeDisabled();
  });

  it('uses custom placeholder text', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} placeholder="Enter custom text..." />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter custom text...');
  });

  it('uses custom add button text', () => {
    const handleChange = vi.fn();
    render(<ArrayEditor items={[]} onChange={handleChange} addButtonText="Add New" />);
    
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });
});