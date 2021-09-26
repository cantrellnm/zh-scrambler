import React, { forwardRef } from 'react';
import { useDraggable } from '@dnd-kit/core';

const HanziDrag = forwardRef(
  (
    {
      hanzi,
      dragOverlay,
      dragging,
      listeners,
      translate,
      ...props
    },
    ref
  ) => {
    const classes = ['hanzi-drag'];
    if (dragOverlay) classes.push('overlay');
    if (dragging) classes.push('dragging');
    const style = {
      '--translate-x': `${translate?.x ?? 0}px`,
      '--translate-y': `${translate?.y ?? 0}px`,
    };

    return (
      <button
        lang="zh-CN"
        className={classes.join(' ')}
        style={style}
        ref={ref}
        {...props}
        aria-label="Draggable"
        {...listeners}
      >
        {hanzi}
      </button>
    );
  }
);

export default HanziDrag;
