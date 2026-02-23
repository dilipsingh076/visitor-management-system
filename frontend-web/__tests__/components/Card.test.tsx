/**
 * Tests for Card component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Card className="custom-card" data-testid="card">
        Content
      </Card>
    );
    
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('renders with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card body content</p>
        </CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });

  it('supports onClick handler', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick} data-testid="clickable-card">
        Clickable
      </Card>
    );
    
    screen.getByTestId('clickable-card').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders CardTitle with correct element', () => {
    render(
      <CardTitle data-testid="title">
        Title Text
      </CardTitle>
    );
    
    expect(screen.getByTestId('title')).toHaveTextContent('Title Text');
  });

  it('renders nested content correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Nested Card</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </CardContent>
      </Card>
    );
    
    expect(screen.getByText('Nested Card')).toBeInTheDocument();
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });
});
