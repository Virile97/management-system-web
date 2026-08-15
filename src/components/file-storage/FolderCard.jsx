import { Folder } from "lucide-react"

function FolderCard({ folder, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(folder)}
      className="group flex min-h-[156px] flex-col justify-between gap-3 rounded-xl border border-[#E5E4E0] bg-white p-4 text-left transition-colors hover:border-[#D8D6D0]"
    >
      <span className="inline-flex h-11 w-12 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#1e2a4a]">
        <Folder className="h-5 w-5" />
      </span>

      <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
        {folder.name}
      </p>
    </button>
  )
}

export { FolderCard }
export default FolderCard
