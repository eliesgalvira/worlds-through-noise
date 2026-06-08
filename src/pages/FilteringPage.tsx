import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { LogoMark } from '@/components/Logo.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'

function FilteringPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <LogoMark className="h-12 w-12 opacity-70" />
      <Badge variant="outline" className="mt-6">
        <Clock className="h-3 w-3" aria-hidden="true" />
        Coming soon
      </Badge>
      <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-foreground">
        Filtering
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
        Detection asked which world produced the data. Estimation asked what
        hidden value made it likely. Filtering will ask how that hidden value
        evolves through time — a prediction-correction loop running over a
        moving signal.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        This route is reserved. Start with the modules that are ready.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/detection">Start with detection</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </Link>
        </Button>
      </div>
    </div>
  )
}

export { FilteringPage }
