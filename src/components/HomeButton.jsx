import React from 'react';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const HomeButton = ({ onClick, className, size = 20, ...props }) => (
  <Button
    onClick={onClick}
    className={cn('bg-green-500/70 hover:bg-green-600/70 text-white px-4 py-2 border-0', className)}
    title="Home (Ctrl+Shift+H)"
    {...props}
  >
    <Home size={size} />
  </Button>
);

export default HomeButton;
