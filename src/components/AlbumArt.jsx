import React, { useState } from "react";
import { Music, Palette } from "lucide-react";

const AlbumArt = ({ src, className }) => {
  const [broken, setBroken] = useState(false);

  if (broken || !src) return (
    <div className={`${className} bg-base-300 flex items-center justify-center text-base-content/20`}>
      <Music size={18} />
    </div>
  );

  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setBroken(true)}
    />
  );
};

export default AlbumArt;