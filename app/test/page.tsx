import { LoadCandidates } from '@/actions/load-candidate-csv'
import { filterCandidates } from '@/lib/tools'

export default async function TestPage() {
  const allCandidates = await LoadCandidates()

  const filtered = filterCandidates(
    {
      include: {
        location: 'india',
        years_experience: '>=2',
        open_to_contract: true,
      },
      exclude: {
        willing_to_relocate: false,
      },
    },
    allCandidates,
  )

  console.log(filtered)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Candidates</h1>
      <div className="flex flex-col gap-2">
        {filtered.map(candidate => (
          <div key={candidate.id}>{candidate.full_name}</div>
        ))}
      </div>
    </div>
  )
}
