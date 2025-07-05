const LandingHero = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Amazing Platform</h1>
        <p className="text-lg text-gray-700 mb-8">We offer innovative solutions to help you achieve your goals.</p>
        <img
          src="/placeholder.svg?height=400&width=400"
          alt="Landing Page Hero"
          className="mx-auto mb-8 rounded-lg shadow-md"
        />
        <div className="flex justify-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
            Get Started
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default LandingHero
