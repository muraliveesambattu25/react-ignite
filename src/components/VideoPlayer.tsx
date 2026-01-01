import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string | null;
  title: string;
}

const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  const [error, setError] = useState(false);

  const getEmbedUrl = (videoUrl: string): string | null => {
    // YouTube formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo formats
    const vimeoRegex = /(?:vimeo\.com\/)(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`;
    }

    // Direct embed URL (already formatted)
    if (videoUrl.includes("youtube.com/embed") || videoUrl.includes("player.vimeo.com")) {
      return videoUrl;
    }

    return null;
  };

  if (!url) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
        <div className="text-center">
          <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Video coming soon</p>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl || error) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-muted-foreground mb-2">Unable to load video</p>
          <p className="text-sm text-muted-foreground">
            Please check the video URL format
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-border bg-foreground/5">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={() => setError(true)}
      />
    </div>
  );
};

export default VideoPlayer;
