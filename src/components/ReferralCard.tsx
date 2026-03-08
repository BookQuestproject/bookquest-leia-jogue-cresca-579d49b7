import { Share2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReferral } from "@/hooks/useReferral";
import { Skeleton } from "@/components/ui/skeleton";

const ReferralCard = () => {
  const { referralCode, loading, copyToClipboard } = useReferral();

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group border border-accent/20">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
          <Gift className="w-8 h-8 text-accent" />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-foreground mb-1">Convide e Ganhe Essência ✦</h3>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Convide amigos! Você ganha <span className="text-accent font-bold">50 ✦</span> e seu amigo <span className="text-accent font-bold">20 ✦</span> quando ele se cadastrar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {loading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <div className="bg-background/50 border border-border px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center">
              <span className="font-mono font-bold tracking-widest text-primary">{referralCode}</span>
            </div>
          )}
          
          <Button 
            onClick={copyToClipboard}
            className="w-full sm:w-auto gap-2"
            variant="accent"
            disabled={loading || !referralCode}
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
