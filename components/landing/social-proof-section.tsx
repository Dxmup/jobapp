const SocialProofSection = () => {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-8">Trusted by Leading Companies</h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {/* Placeholder URLs - Replace with actual asset URLs */}
          <img src="https://via.placeholder.com/150" alt="Company 1" className="h-12 w-auto object-contain" />
          <img src="https://via.placeholder.com/150" alt="Company 2" className="h-12 w-auto object-contain" />
          <img src="https://via.placeholder.com/150" alt="Company 3" className="h-12 w-auto object-contain" />
          <img src="https://via.placeholder.com/150" alt="Company 4" className="h-12 w-auto object-contain" />
          <img src="https://via.placeholder.com/150" alt="Company 5" className="h-12 w-auto object-contain" />
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection
