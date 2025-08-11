import { Image } from 'lucide-react';

interface ImagePlaceholderProps {
  src?: string;
}

const ImagePlaceholder = ({ src }: ImagePlaceholderProps) => {
  if (src && src.startsWith('http')) { // A simple check to see if it's a real URL
    return (
      <img
        src={src}
        alt="Feature screenshot"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center text-center p-4">
      <Image className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-bold text-foreground/80">Feature Screenshot</h3>
      <p className="text-muted-foreground">A visual preview of this feature will be available soon.</p>
    </div>
  );
};

export default ImagePlaceholder;
