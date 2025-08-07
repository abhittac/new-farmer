import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { SiWhatsapp, SiFacebook, SiInstagram, SiX } from "react-icons/si";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function SocialShare({
  url,
  title,
  description,
  imageUrl,
}: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");
  const encodedImage = encodeURIComponent(imageUrl || "");

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    instagram: "#", // Instagram doesn't support direct URL sharing, will show message
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      // For Instagram, we'll copy to clipboard since direct sharing isn't supported
      navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
        alert("Link copied to clipboard! You can now paste it on Instagram.");
      });
      return;
    }

    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: description,
          url,
        })
        .catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${title} - ${url}`).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold text-gray-700 flex items-center">
        <Share2 className="w-4 h-4 mr-2" />
        Share this product
      </h3>

      <div className="flex flex-wrap gap-3">
        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300 hover:text-black"
        >
          <SiWhatsapp className="w-4 h-4 text-green-600" />
          <span>WhatsApp</span>
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 hover:text-black"
        >
          <SiFacebook className="w-4 h-4 text-blue-600" />
          <span className="">Facebook</span>
        </Button>

        {/* X (Twitter) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="flex items-center space-x-2 hover:bg-sky-50 hover:border-sky-300 hover:text-black"
        >
          <SiX className="w-4 h-4 text-sky-600" />
          <span>Twitter</span>
        </Button>

        {/* Instagram */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("instagram")}
          className="flex items-center space-x-2 hover:bg-pink-50 hover:border-pink-300 hover:text-black"
        >
          <SiInstagram className="w-4 h-4 text-pink-600" />
          <span>Instagram</span>
        </Button>

        {/* Native Share (if supported) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>More</span>
          </Button>
        )}
      </div>
    </div>
  );
}
