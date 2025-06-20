import { RunMigrationsButton } from "@/components/admin/run-migrations-button"

export default function MigrationsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Database Migrations</h1>

      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <h2 className="text-lg font-medium mb-2">Add user_id to job_resumes table</h2>
          <p className="text-muted-foreground mb-4">
            This migration adds the user_id column to the job_resumes table if it doesn't exist. Run this if you're
            experiencing issues with resume-job associations.
          </p>
          <RunMigrationsButton />
        </div>
      </div>
    </div>
  )
}
