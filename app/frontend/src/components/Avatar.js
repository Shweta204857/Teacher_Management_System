import React from 'react';

const COLORS = ['#4F6EF7','#F97316','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#EC4899'];

const Avatar = ({ name = '', size = 36, photo, index = 0 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className="avatar" style={{ width: size, height: size, background: photo ? 'transparent' : color, fontSize: size * 0.36 }}>
      {photo ? <img src={photo.startsWith('http') ? photo : `http://localhost:5000${photo}`} alt={name} /> : initials}
    </div>
  );
};

export default Avatar;
