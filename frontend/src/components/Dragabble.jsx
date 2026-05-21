import { Draggable } from '@hello-pangea/dnd'

/**
 * Reusable draggable card wrapper for @hello-pangea/dnd.
 *
 * Props:
 *  - draggableId (string)  — unique ID for the draggable item
 *  - index (number)        — position index within the droppable
 *  - children (function)   — render prop receiving (provided, snapshot)
 *  - className (string)    — optional extra class on the outer wrapper
 *  - isDragDisabled (bool) — optional, disables drag
 */
function Dragabble({ draggableId, index, children, className = '', isDragDisabled = false }) {
  return (
    <Draggable draggableId={draggableId} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${className} ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#1a73e8]/30 rotate-1' : ''} transition-all`}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging ? { zIndex: 50 } : {}),
          }}
        >
          {typeof children === 'function'
            ? children(provided, snapshot)
            : children
          }
        </div>
      )}
    </Draggable>
  )
}

export default Dragabble