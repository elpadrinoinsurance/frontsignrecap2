import React from 'react';
import { render, screen } from '@testing-library/react';

import {AppRouter} from './AppRouter';

test('renders learn react link', () => {
  render(<AppRouter />);
  expect(screen.getByText(/learn react/i)).toBeInTheDocument();
});
