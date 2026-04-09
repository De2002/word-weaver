import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fontStyles, type ReadingFont, type ReadingPreferences } from '@/lib/poemReading';

interface PoemReadingControlsProps {
  preferences: ReadingPreferences;
  onChange: (preferences: ReadingPreferences) => void;
  className?: string;
}

export function PoemReadingControls({ preferences, onChange, className }: PoemReadingControlsProps) {
  const updatePreference = <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <section
      className={`rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/85 ${className ?? ''}`}
      aria-label="Reading preferences"
    >
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Reading preferences</h2>
        <p className="text-xs text-muted-foreground">Adjust typography for a calmer poetry reading experience.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reading-font">Font</Label>
          <Select
            value={preferences.font}
            onValueChange={(value) => updatePreference('font', value as ReadingFont)}
          >
            <SelectTrigger id="reading-font" aria-label="Choose a poem font">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(fontStyles).map(([key, font]) => (
                <SelectItem key={key} value={key}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reading-width">Line width: {preferences.lineWidth}px</Label>
          <Slider
            id="reading-width"
            min={500}
            max={700}
            step={10}
            value={[preferences.lineWidth]}
            onValueChange={(value) => updatePreference('lineWidth', value[0])}
            aria-label="Adjust poem line width"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reading-size">Font size: {preferences.fontSize}px</Label>
          <Slider
            id="reading-size"
            min={16}
            max={22}
            step={1}
            value={[preferences.fontSize]}
            onValueChange={(value) => updatePreference('fontSize', value[0])}
            aria-label="Adjust poem font size"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reading-height">Line height: {preferences.lineHeight.toFixed(1)}</Label>
          <Slider
            id="reading-height"
            min={1.6}
            max={1.9}
            step={0.1}
            value={[preferences.lineHeight]}
            onValueChange={(value) => updatePreference('lineHeight', value[0])}
            aria-label="Adjust poem line height"
          />
        </div>
      </div>
    </section>
  );
}
