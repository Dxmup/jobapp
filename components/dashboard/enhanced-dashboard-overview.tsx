import { JobCarousel } from "./job-carousel"

const EnhancedDashboardOverview = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Enhanced Dashboard Overview</h1>
      <p className="text-gray-600">
        Welcome to your enhanced dashboard overview. Here you can see a summary of your key metrics and recent activity.
      </p>

      {/* Grid Layout Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Total Applications</h2>
          <p className="text-3xl font-bold text-blue-500">125</p>
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Interviews Scheduled</h2>
          <p className="text-3xl font-bold text-green-500">32</p>
        </div>
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Offers Received</h2>
          <p className="text-3xl font-bold text-purple-500">5</p>
        </div>
      </div>

      {/* Job Applications Carousel */}
      <div className="mt-8">
        <JobCarousel />
      </div>
    </div>
  )
}

export default EnhancedDashboardOverview
