import React, { forwardRef, PropsWithChildren } from 'react';
import { Grid, GridProps } from '@mui/material';

// For properly typing the Grid component with container, item, and responsive props
interface ExtendedGridProps extends GridProps {
  item?: boolean;
  container?: boolean;
  xs?: boolean | number | 'auto';
  sm?: boolean | number | 'auto';
  md?: boolean | number | 'auto';
  lg?: boolean | number | 'auto';
  xl?: boolean | number | 'auto';
}

/**
 * A wrapper for Material UI Grid component that handles type issues
 */
const GridItem = forwardRef<HTMLDivElement, PropsWithChildren<ExtendedGridProps>>(
  (props, ref) => {
    return <Grid ref={ref} {...props} />;
  }
);

// Explicitly set the display name for React DevTools
GridItem.displayName = 'GridItem';

export default GridItem; 