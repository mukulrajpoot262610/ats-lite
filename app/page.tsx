import { LoadCandidates } from '@/actions/load-candidate-csv'

export default async function HomePage() {
  const candidates = await LoadCandidates()

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Loaded {candidates.length} candidates</h1>
      <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
        {JSON.stringify(candidates.slice(0, 3), null, 2)}
      </pre>
    </div>
  )
}
