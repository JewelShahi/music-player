import React, { useState, useEffect } from "react";
import { Music } from "lucide-react";

const AlbumArt = ({ src, className }) => {
  const [broken, setBroken] = useState(false);

  // Clean the src: remove empty strings or whitespace so they count as "no image"
  const cleanSrc = src && src.trim() ? src.trim() : null;

  // Reset the broken state whenever the image URL changes
  useEffect(() => {
    setBroken(false);
  }, [cleanSrc]);

  // Render fallback if broken or no valid URL exists
  if (broken || !cleanSrc) {
    return (
      <div className={`${className} bg-base-300 flex items-center justify-center text-base-content/20`}>
        <Music size={18} />
      </div>
    );
  }

  // Render the image
  return (
    <img
      src={cleanSrc}
      alt=""
      className={className}
      onError={() => setBroken(true)}
    />
  );
};

export default AlbumArt;