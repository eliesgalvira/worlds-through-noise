import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-mono text-sm font-medium uppercase tracking-wide text-accent">
        404
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground">
        Lost in the noise
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        This page is below the detection threshold. There is no signal here.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to safety
        </Link>
      </Button>
    </div>
  )
}

export { NotFoundPage }
