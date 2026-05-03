import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/alert-dialog';

describe('AlertDialog', () => {
  it('renders alert dialog trigger button', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );

    const trigger = screen.getByRole('button', { name: /delete account/i });
    expect(trigger).toBeInTheDocument();
  });

  it('exports AlertDialog component and its parts', () => {
    expect(AlertDialog).toBeDefined();
    expect(AlertDialogTrigger).toBeDefined();
    expect(AlertDialogContent).toBeDefined();
    expect(AlertDialogHeader).toBeDefined();
    expect(AlertDialogTitle).toBeDefined();
    expect(AlertDialogDescription).toBeDefined();
    expect(AlertDialogFooter).toBeDefined();
    expect(AlertDialogAction).toBeDefined();
    expect(AlertDialogCancel).toBeDefined();
  });

  it('renders AlertDialogHeader and AlertDialogFooter layout components', () => {
    render(
      <div>
        <AlertDialogHeader>Header Content</AlertDialogHeader>
        <AlertDialogFooter>Footer Content</AlertDialogFooter>
      </div>
    );

    const header = screen.getByText('Header Content');
    const footer = screen.getByText('Footer Content');

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('layout components are functional and render children', () => {
    render(
      <div>
        <AlertDialogHeader data-testid="header-test">Header Content</AlertDialogHeader>
        <AlertDialogFooter data-testid="footer-test">Footer Content</AlertDialogFooter>
      </div>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('accepts className prop on AlertDialogTrigger', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger className="trigger-btn">Open</AlertDialogTrigger>
      </AlertDialog>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('trigger-btn');
  });

  it('renders complete alert dialog structure with all parts', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });
});
