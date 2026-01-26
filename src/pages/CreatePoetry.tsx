import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PoemEditor } from '@/components/PoemEditor';
import { useSEO } from '@/hooks/useSEO';

export default function CreatePoetry() {
  useSEO({
    title: "New Poem",
    description: "Write and publish your poetry on WordStack."
  });

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">New Poem</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Form */}
      <main className="p-4 pb-24 max-w-2xl mx-auto">
        <PoemEditor />
      </main>
    </div>
  );
}
