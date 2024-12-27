import { useEffect } from 'react';

const PedagoCalendar = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url="https://calendly.com/andersonfelixmsouza/teste"
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
};

export default PedagoCalendar;
