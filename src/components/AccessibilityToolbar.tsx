import { memo } from "react";
import { Minus, Plus, Eye, Pause, Volume2, Power, Hand, Focus } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const fontLabels = ["Normal", "Grande", "Extra grande"];

const AccessibilityToolbar = () => {
  const {
    enabled,
    fontSize,
    highContrast,
    reducedMotion,
    focusMode,
    librasActive,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    toggleEnabled,
    toggleLibras,
    toggleFocusMode,
    isSpeaking,
    stopSpeaking,
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 border-border bg-card shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Abrir configurações de acessibilidade"
        >
          <Eye className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-72 p-4 space-y-4 mb-2"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Acessibilidade</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{enabled ? "Ativo" : "Inativo"}</span>
            <Switch
              checked={enabled}
              onCheckedChange={toggleEnabled}
              aria-label="Ativar ou desativar acessibilidade"
            />
          </div>
        </div>

        {enabled && (
          <>
            {/* Font size */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Tamanho do texto: {fontLabels[fontSize]}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseFontSize}
                  disabled={fontSize === 0}
                  aria-label="Diminuir tamanho do texto"
                  className="flex-1 gap-1"
                >
                  <Minus className="w-3.5 h-3.5" /> A
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseFontSize}
                  disabled={fontSize === 2}
                  aria-label="Aumentar tamanho do texto"
                  className="flex-1 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> A
                </Button>
              </div>
            </div>

            {/* High contrast */}
            <Button
              variant={highContrast ? "default" : "outline"}
              size="sm"
              onClick={toggleHighContrast}
              className="w-full justify-start gap-2"
              aria-pressed={highContrast}
            >
              <Eye className="w-4 h-4" />
              Alto contraste
            </Button>

            {/* Reduced motion */}
            <Button
              variant={reducedMotion ? "default" : "outline"}
              size="sm"
              onClick={toggleReducedMotion}
              className="w-full justify-start gap-2"
              aria-pressed={reducedMotion}
            >
              <Pause className="w-4 h-4" />
              Reduzir animações
            </Button>

            {/* Focus mode */}
            <Button
              variant={focusMode ? "default" : "outline"}
              size="sm"
              onClick={toggleFocusMode}
              className="w-full justify-start gap-2"
              aria-pressed={focusMode}
            >
              <Focus className="w-4 h-4" />
              Modo foco (TDAH)
            </Button>

            {/* Libras */}
            <Button
              variant={librasActive ? "default" : "outline"}
              size="sm"
              onClick={toggleLibras}
              className="w-full justify-start gap-2"
              aria-pressed={librasActive}
            >
              <Hand className="w-4 h-4" />
              Libras (VLibras)
            </Button>

            {/* TTS stop */}
            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopSpeaking}
                className="w-full justify-start gap-2 text-destructive"
              >
                <Volume2 className="w-4 h-4" />
                Parar leitura em voz alta
              </Button>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default memo(AccessibilityToolbar);
