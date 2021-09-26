import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const HanziDrop = ({ children, id, dragging }) => {
  const {isOver, setNodeRef} = useDroppable({ id });

  const classes = ['hanzi-drop'];
  if (isOver) classes.push('over');
  if (dragging) classes.push('dragging');
  if (children) classes.push('dropped');

  return (
    <div
      ref={setNodeRef}
      className={classes.join(' ')}
      aria-label="Droppable region"
    >
      {children}
    </div>
  );
};

export default HanziDrop;
