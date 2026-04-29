import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Blob 1 - Blue */}
      <div
        className="blob blob-1 animate-float1"
        style={{
          width: '400px',
          height: '400px',
          top: '-100px',
          left: '-100px',
        }}
      />

      {/* Blob 2 - Purple */}
      <div
        className="blob blob-2 animate-float2"
        style={{
          width: '350px',
          height: '350px',
          top: '50%',
          right: '-80px',
        }}
      />

      {/* Blob 3 - Teal */}
      <div
        className="blob blob-3 animate-float3"
        style={{
          width: '300px',
          height: '300px',
          bottom: '-50px',
          left: '10%',
        }}
      />

      {/* Blob 4 - Orange */}
      <div
        className="blob blob-4 animate-float1"
        style={{
          width: '280px',
          height: '280px',
          top: '20%',
          right: '15%',
          animationDelay: '2s',
        }}
      />
    </div>
  );
};
