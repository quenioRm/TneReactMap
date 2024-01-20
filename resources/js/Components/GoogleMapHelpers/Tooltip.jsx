import React from 'react';
import PropTypes from 'prop-types';
import '../css/Tooltip.css'; // Import your custom CSS for styling

/**
 * Tooltip component to display additional information.
 * @param {Object} props Component props
 * @param {Object} props.position Position of the tooltip { x, y }
 * @param {string} props.content Content to be displayed in the tooltip
 */
const Tooltip = ({ position, content }) => {
    const style = {
        left: `${position.x}px`,
        top: `${position.y}px`,
    };

    return (
        <div className="tooltip" style={style}>
            {content}
        </div>
    );
};

Tooltip.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    content: PropTypes.string.isRequired,
};

export default Tooltip;
