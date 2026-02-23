/**
 * Tests for Input component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('calls onChange handler', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} placeholder="Input" />);
    
    await user.type(screen.getByPlaceholderText('Input'), 'a');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled" />);
    
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="tel" placeholder="Phone" />);
    expect(screen.getByPlaceholderText('Phone')).toHaveAttribute('type', 'tel');
  });

  it('displays error state', () => {
    render(<Input error="This field is required" placeholder="Error input" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref input" />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />);
    
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-input');
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="Required" />);
    
    expect(screen.getByPlaceholderText('Required')).toBeRequired();
  });

  it('handles readonly attribute', () => {
    render(<Input readOnly value="Read only" />);
    
    expect(screen.getByDisplayValue('Read only')).toHaveAttribute('readonly');
  });
});
