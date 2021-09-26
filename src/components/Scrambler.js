import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import HanziDrag from './HanziDrag';
import HanziDrop from './HanziDrop';
import { ZH_TEST, keyOfValue } from '../utils';
import './Scrambler.scss';

function DraggableItem({ hanzi, index, onClick, onOpen }) {
  const {isDragging, setNodeRef, listeners} = useDraggable({id: `${hanzi}:${index}`});

  return (
    <HanziDrag
      hanzi={hanzi}
      dragging={isDragging}
      ref={setNodeRef}
      listeners={listeners}
      style={{
        opacity: isDragging ? 0 : undefined,
      }}
      onClick={onClick}
      onContextMenu={onOpen}
    />
  );
};

const Scrambler = ({ zh, scrambled, onNext, onChange, onOpen, complete, correct }) => {
  const [isDragging, setIsDragging] = useState(null);
  const [parents, setParents] = useState({});

  const nextOpen = useRef(null);
  useEffect(() => {
    const open = zh.split('')
                   .map((ch, i) => ch.match(ZH_TEST) ? `${ch}:${i}` : null)
                   .filter(id => id)
                   .find(id => !keyOfValue(parents, id));
    nextOpen.current = open;
  }, [zh, parents]);

  useEffect(() => {
    if (scrambled.find((ch, i) => !parents[`${ch}:${i}`])) {
      onChange(false, false);
    } else {
      const incorrect = scrambled.find((ch, i) => {
        const id = `${ch}:${i}`;
        return !parents[id] || parents[id].split(':')[0] !== ch;
      });
      onChange(true, !incorrect);
      nextOpen.current = null;
    }
  }, [scrambled, parents]);

  const insertNext = (dragId) => {
    setParents(parents => (
      {
        ...parents,
        [dragId]: nextOpen.current
      }
    ));
  };

  const help = () => {
    if (nextOpen.current) {
      const char = nextOpen.current.split(':')[0];
      const index = scrambled.findIndex((ch, i) => {
        const id = `${ch}:${i}`;
        return ch === char && (!parents[id] || parents[id][0] !== ch);
      });
      insertNext(`${char}:${index}`);
    }
  }

  const removeFromParent = (dragId) => {
    setParents(parents => (
      {
        ...parents,
        [dragId]: undefined
      }
    ));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  return (
    <div className="zh-container">
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => {
          setIsDragging(active.id);
        }}
        onDragEnd={({ over }) => {
          setParents(parents => {
            const currentChild = keyOfValue(parents, over?.id);
            return {
              ...parents,
              [currentChild]: null,
              [isDragging]: over?.id
            };
          });
          setIsDragging(null);
        }}
        onDragCancel={() => setIsDragging(null)}
      >
        <div className="drop-area">
          {zh.split('').map((ch, i) => {
            if (!ch.match(ZH_TEST)) {
              return <span key={i}>{ch}</span>
            }
            const id = `${ch}:${i}`;
            const child = keyOfValue(parents, id);
            const [hanzi, index] = child ? child.split(':') : [];
            return (
              <HanziDrop key={i} id={id} dragging={isDragging}>
                {
                  child
                    ? <DraggableItem hanzi={hanzi} index={index}
                                     onClick={() => removeFromParent(child)}
                                     onOpen={e => onOpen(e, hanzi)} />
                    : null
                }
              </HanziDrop>
            );
          })}
        </div>
        <div className="drag-area">
          {
            correct
              ? (<button onClick={onNext}>Next</button>)
              : scrambled.map((ch, i) => {
                  if (!ch.match(ZH_TEST)) {
                    return <React.Fragment key={i} />
                  }
                  const id = `${ch}:${i}`;
                  return isDragging === id || parents[id]
                    ? <div className="hanzi-drag empty" key={i} />
                    : <DraggableItem key={i} hanzi={ch} index={i}
                                     onClick={() => insertNext(id)}
                                     onOpen={e => onOpen(e, ch)} />
                })
          }
        </div>
        <DragOverlay>
          {
            isDragging
              ? <HanziDrag hanzi={isDragging.split(':')[0]} dragging dragOverlay />
              : null
          }
        </DragOverlay>
      </DndContext>
      { complete ? null : <button onClick={help}>Help!</button> }
    </div>
  );
};

export default Scrambler;
