import React, { useState, useEffect } from 'react';
import '../css/Tooltip.css'; // Import your custom CSS for styling
import { CSSTransition } from 'react-transition-group';

const Tooltip = ({ mouseEventData }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeout;

    if (isVisible) {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Especifique o tempo em milissegundos (5 segundos no exemplo)
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isVisible]);

  useEffect(()=>{
    setIsVisible(true)
  },[mouseEventData])

  return (
    <div>
      <CSSTransition
        in={isVisible}
        timeout={300}
        classNames={{
          enter: 'tooltip-enter',
          enterActive: 'tooltip-enter-active',
          exit: 'tooltip-exit',
          exitActive: 'tooltip-exit-active',
        }}
        unmountOnExit
      >
        <div
          className={`tooltip-content${isVisible ? '' : ' tooltip-explode'}`}
          style={{
            left: `${mouseEventData.tooltipPosition.x}px`,
            top: `${mouseEventData.tooltipPosition.y}px`,
          }}
        >
          Coordenadas: {mouseEventData.actualCoordinate.x}, {mouseEventData.actualCoordinate.y}
        </div>
      </CSSTransition>
    </div>
  );
};

export default Tooltip;
