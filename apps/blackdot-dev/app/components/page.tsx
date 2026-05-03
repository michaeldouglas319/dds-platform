'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@dds/ui';
import { useState } from 'react';

export default function ComponentsPage() {
  const [actionResult, setActionResult] = useState<string>('');
  const [cancelResult, setCancelResult] = useState<string>('');

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Component Test Suite</h1>

      {/* AlertDialog — Delete Action */}
      <section style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>AlertDialog — Delete Action</h2>
        <p>Tests: trigger visibility, open/close, action callback, cancel callback</p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" data-testid="delete-trigger">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="delete-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-testid="delete-cancel"
                onClick={() => setCancelResult('Cancel clicked at ' + new Date().toLocaleTimeString())}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-testid="delete-action"
                onClick={() => setActionResult('Delete confirmed at ' + new Date().toLocaleTimeString())}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {actionResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', borderRadius: '4px' }} data-testid="delete-action-result">
            Action: {actionResult}
          </div>
        )}
        {cancelResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#efe', borderRadius: '4px' }} data-testid="delete-cancel-result">
            Cancel: {cancelResult}
          </div>
        )}
      </section>

      {/* AlertDialog — Confirm Submit */}
      <section style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>AlertDialog — Confirm Submit</h2>
        <p>Tests: custom styling, className forwarding</p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button data-testid="submit-trigger">Submit Form</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="custom-dialog-class" data-testid="submit-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle className="custom-title">Confirm Submission</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit this form? Once submitted, you cannot make changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="submit-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction data-testid="submit-action">Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* AlertDialog — Keyboard Navigation */}
      <section style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>AlertDialog — Keyboard Navigation</h2>
        <p>Tests: Escape key closes dialog, Tab navigates between buttons</p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button data-testid="keyboard-trigger">Open Keyboard Test</Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="keyboard-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Keyboard Navigation Test</AlertDialogTitle>
              <AlertDialogDescription>
                Press Tab to navigate buttons. Press Escape to close.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="keyboard-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction data-testid="keyboard-action">Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* AlertDialog — Multiple Instances */}
      <section style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>AlertDialog — Multiple Instances</h2>
        <p>Tests: multiple independent dialogs don't interfere</p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['First', 'Second', 'Third'].map((label, idx) => (
            <AlertDialog key={idx}>
              <AlertDialogTrigger asChild>
                <Button data-testid={`multi-trigger-${idx}`}>{label} Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-testid={`multi-dialog-${idx}`}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{label} Dialog</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is dialog #{idx + 1} of multiple independent instances.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid={`multi-cancel-${idx}`}>Cancel</AlertDialogCancel>
                  <AlertDialogAction data-testid={`multi-action-${idx}`}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </section>
    </main>
  );
}
