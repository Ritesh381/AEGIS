import '@testing-library/jest-dom';

HTMLCanvasElement.prototype.getContext = () => {
  return {
    scale: () => {},
    beginPath: () => {},
    arc: () => {},
    stroke: () => {},
    clearRect: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
  };
};

