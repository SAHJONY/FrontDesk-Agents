export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">FRONTDESK AGENTS</h1>
        <p className="text-xl text-gray-400 mb-8">World's Most Advanced AI Receptionist</p>
        <a href="/customer/signup" className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition">
          Get Started
        </a>
      </div>
    </div>
  )
}
