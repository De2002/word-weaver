import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Play, Footprints, Edit } from 'lucide-react';
import { Header } from '@/components/Header';
import { TrailStepView } from '@/components/trails/TrailStepView';
import { TrailReviewForm } from '@/components/trails/TrailReviewForm';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  useTrailDetail, 
  useTrailSteps, 
  useTrailProgress, 
  useUpdateProgress,
  useToggleStepReaction,
  useTrailReviews,
  useSubmitReview,
} from '@/hooks/useTrailDetail';
import { useAuth } from '@/context/AuthProvider';

type ViewMode = 'overview' | 'journey' | 'review';

export default function TrailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trail, isLoading: trailLoading } = useTrailDetail(id!);
  const { data: steps, isLoading: stepsLoading } = useTrailSteps(id!);
  const { data: progress } = useTrailProgress(id!);
  const { data: reviews } = useTrailReviews(id!);
  
  const updateProgress = useUpdateProgress();
  const toggleReaction = useToggleStepReaction();
  const submitReview = useSubmitReview();

  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize step from progress
  useEffect(() => {
    if (progress?.current_step) {
      setCurrentStep(progress.current_step);
    }
  }, [progress]);

  const isLoading = trailLoading || stepsLoading;
  const totalSteps = steps?.length || 0;
  const currentStepData = steps?.[currentStep - 1];
  const isOwner = user?.id === trail?.user_id;

  const handleStartJourney = () => {
    setViewMode('journey');
    if (user && id) {
      updateProgress.mutate({ trailId: id, currentStep: 1 });
    }
  };

  const handleContinueJourney = () => {
    setViewMode('journey');
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (user && id) {
        updateProgress.mutate({ trailId: id, currentStep: newStep });
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (user && id) {
        updateProgress.mutate({ trailId: id, currentStep: newStep });
      }
    } else {
      // Trail complete
      if (user && id) {
        updateProgress.mutate({ trailId: id, currentStep: totalSteps, completed: true });
      }
      setViewMode('review');
    }
  };

  const handleReaction = (emoji: string) => {
    if (!currentStepData || !id) return;
    toggleReaction.mutate({
      stepId: currentStepData.id,
      emoji,
      trailId: id,
    });
  };

  const handleSubmitReview = (review: { comment?: string; favoriteStepId?: string; emotion?: string }) => {
    if (!id) return;
    submitReview.mutate(
      { trailId: id, ...review },
      { onSuccess: () => navigate('/trails') }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pt-20">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="aspect-[2/1] rounded-xl mb-6" />
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full" />
        </main>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pt-20 text-center">
          <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Trail not found</h2>
          <Button asChild variant="outline">
            <Link to="/trails">Back to Trails</Link>
          </Button>
        </main>
      </div>
    );
  }

  // Journey mode
  if (viewMode === 'journey' && currentStepData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setViewMode('overview')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Exit Trail</span>
            </button>
            <span className="font-medium text-foreground">{trail.title}</span>
            <div className="w-20" />
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
        </header>

        <main className="px-4 py-8">
          <AnimatePresence mode="wait">
            <TrailStepView
              key={currentStepData.id}
              step={currentStepData}
              stepNumber={currentStep}
              totalSteps={totalSteps}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onReaction={handleReaction}
              isFirst={currentStep === 1}
              isLast={currentStep === totalSteps}
            />
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Review mode
  if (viewMode === 'review') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate('/trails')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Back to Trails</span>
            </button>
            <span className="font-medium text-foreground">{trail.title}</span>
            <div className="w-20" />
          </div>
        </header>

        <main className="px-4 py-8">
          <TrailReviewForm
            steps={steps || []}
            onSubmit={handleSubmitReview}
            isSubmitting={submitReview.isPending}
          />
        </main>
      </div>
    );
  }

  // Overview mode
  const progressPercent = progress?.current_step && totalSteps
    ? Math.round((progress.current_step / totalSteps) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-24">
        {/* Back button */}
        <Link
          to="/trails"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Trails</span>
        </Link>

        {/* Cover image */}
        {trail.cover_url ? (
          <div className="aspect-[2.5/1] rounded-xl overflow-hidden mb-6">
            <img
              src={trail.cover_url}
              alt={trail.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[2.5/1] rounded-xl bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center mb-6">
            <Map className="h-20 w-20 text-primary/30" />
          </div>
        )}

        {/* Trail info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="capitalize">
              {trail.category}
            </Badge>
            {trail.mood && (
              <Badge variant="outline">{trail.mood}</Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              {trail.title}
            </h1>
            {isOwner && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/trails/${trail.id}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {trail.description && (
            <p className="text-muted-foreground mt-3">{trail.description}</p>
          )}
        </div>

        {/* Curator info */}
        {trail.curator && (
          <Link
            to={`/poet/${trail.curator.username}`}
            className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
          >
            <Avatar>
              <AvatarImage src={trail.curator.avatar_url || undefined} />
              <AvatarFallback>
                {(trail.curator.display_name || trail.curator.username || 'C').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm text-muted-foreground">Curated by</span>
              <span className="font-medium text-foreground block">
                {trail.curator.display_name || trail.curator.username}
              </span>
            </div>
          </Link>
        )}

        {/* Curation note */}
        {trail.curation_note && (
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Why this trail was curated
            </p>
            <p className="text-foreground italic">"{trail.curation_note}"</p>
          </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Footprints className="h-5 w-5" />
            <span>{totalSteps} {totalSteps === 1 ? 'poem' : 'poems'}</span>
          </div>
        </div>

        {/* Progress */}
        {progress && !progress.completed && progress.current_step > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Your progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.current_step}/{totalSteps} poems
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-8">
          {progress?.completed ? (
            <Button onClick={handleStartJourney} className="flex-1" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Walk Again
            </Button>
          ) : progress?.current_step ? (
            <Button onClick={handleContinueJourney} className="flex-1" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Continue Journey
            </Button>
          ) : (
            <Button onClick={handleStartJourney} className="flex-1" size="lg">
              <Play className="h-5 w-5 mr-2" />
              Start Journey
            </Button>
          )}
        </div>

        <Separator className="my-6" />

        {/* Reviews */}
        <section>
          <h3 className="font-semibold text-foreground mb-4">
            Reviews ({reviews?.length || 0})
          </h3>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(review.reviewer?.display_name || review.reviewer?.username || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {review.reviewer?.display_name || review.reviewer?.username || 'Anonymous'}
                    </span>
                    {review.emotion && (
                      <Badge variant="secondary" className="text-xs">
                        {review.emotion}
                      </Badge>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground text-sm italic">"{review.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No reviews yet. Complete this trail to leave the first review!
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
