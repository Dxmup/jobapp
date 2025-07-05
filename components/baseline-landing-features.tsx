const BaselineLandingFeatures = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img
              src="https://via.placeholder.com/100" // Placeholder URL
              alt="Feature 1"
              className="mx-auto mb-4"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h3 className="text-xl font-semibold mb-2">Feature One</h3>
            <p className="text-gray-700">Description of feature one. Explain the benefits and how it helps users.</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img
              src="https://via.placeholder.com/100" // Placeholder URL
              alt="Feature 2"
              className="mx-auto mb-4"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h3 className="text-xl font-semibold mb-2">Feature Two</h3>
            <p className="text-gray-700">Description of feature two. Explain the benefits and how it helps users.</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <img
              src="https://via.placeholder.com/100" // Placeholder URL
              alt="Feature 3"
              className="mx-auto mb-4"
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
            <h3 className="text-xl font-semibold mb-2">Feature Three</h3>
            <p className="text-gray-700">Description of feature three. Explain the benefits and how it helps users.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BaselineLandingFeatures
