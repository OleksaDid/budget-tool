import React from 'react';
import { Grid, GridProps } from '@mui/material';

type GridItemProps = GridProps & {
  item?: boolean;
  container?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
};

/**
 * A wrapper for Material UI Grid component that handles type issues
 */
export const GridItem: React.FC<GridItemProps> = (props) => {
  return <Grid {...props} />;
};

export default GridItem; 