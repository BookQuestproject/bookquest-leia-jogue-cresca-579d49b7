import { Headphones, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface MusicPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const playlists = [
  {
    title: "Lo-fi Reading",
    description: "Batidas suaves para concentração",
    emoji: "🎧",
    url: "https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM",
  },
  {
    title: "Piano Focus",
    description: "Piano instrumental calmo",
    emoji: "🎹",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX7K31D69s4M1",
  },
  {
    title: "Soundtracks",
    description: "Trilhas sonoras épicas e cinematográficas",
    emoji: "🎬",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX5G1tHcGgBNT",
  },
  {
    title: "Sons da Natureza",
    description: "Chuva, floresta e oceano",
    emoji: "🌧️",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWVV27DiNWxkR",
  },
];

const MusicPickerDialog = ({ open, onOpenChange }: MusicPickerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Música para leitura
          </DialogTitle>
          <DialogDescription>
            Escolha uma playlist para acompanhar sua sessão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {playlists.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-muted/50 transition-all"
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
            </a>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          As playlists abrem em uma nova aba.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default MusicPickerDialog;
