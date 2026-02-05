import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
        <h1 style={{ fontSize: '48px', color: '#00684a', marginBottom: '20px' }}>
          MediStock AI
        </h1>
        <p style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>
          Smart Pharmacy Inventory Management System
        </p>
        <button 
          onClick={handleGetStarted}
          style={{
            backgroundColor: '#00684a',
            color: 'white',
            padding: '12px 24px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Landing;
