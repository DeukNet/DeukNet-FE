import { motion } from 'framer-motion';
import { useViewTransitionNavigate } from '../hooks/useViewTransition';
import '../styles/CategoryThumbnail.css';

interface CategoryThumbnailProps {
  id: string;
  name: string;
  thumbnailUrl?: string | null;
  className?: string;
}

export const CategoryThumbnail = ({ id, name, thumbnailUrl, className = '' }: CategoryThumbnailProps) => {
  const navigate = useViewTransitionNavigate();

  return (
    <motion.button
      className={`category-thumbnail ${className}`}
      onClick={() => navigate(`/categories/${id}`)}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt={name} className="category-thumbnail-image" />
      )}
      <div className="category-thumbnail-overlay">
        <span className="category-thumbnail-name">{name}</span>
      </div>
    </motion.button>
  );
};
