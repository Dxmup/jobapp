const BaselineLandingPage = () => {
  return (
    <div className="container mx-auto py-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Our Landing Page</h1>
        <p className="text-gray-600">Learn more about our amazing product.</p>
      </header>

      <section className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
            <ul className="list-disc list-inside">
              <li>Feature 1: Solves a common problem.</li>
              <li>Feature 2: Easy to use interface.</li>
              <li>Feature 3: Integrates with other services.</li>
            </ul>
          </div>
          <div>
            <img
              src="https://via.placeholder.com/500x300" // Placeholder image URL
              alt="Product Screenshot"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Get Started Today!</h2>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
      </section>

      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; 2023 Your Company. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default BaselineLandingPage
