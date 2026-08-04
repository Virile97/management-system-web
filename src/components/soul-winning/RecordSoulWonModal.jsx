"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Heart, X, Info } from "lucide-react"

const soulWinnerLabels = {
  "kofi-agyeman": "Kofi Agyeman — Youth",
  "emmanuel-boateng": "Emmanuel Boateng — Elders",
  "grace-mensah": "Grace Mensah — Women's Ministry",
  "yaa-amponsah": "Yaa Amponsah — Choir",
}

const statusLabels = {
  "new-convert": "New Convert",
  "active-member": "Active Member",
}

function RecordSoulWonModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Record Soul Won
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Label>
              Soul Winner <span className="text-red-500">*</span>
            </Label>
            <Select defaultValue="emmanuel-boateng">
              <SelectTrigger className="h-10 w-full rounded-lg">
                <SelectValue>{(value) => soulWinnerLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kofi-agyeman">Kofi Agyeman — Youth</SelectItem>
                <SelectItem value="emmanuel-boateng">Emmanuel Boateng — Elders</SelectItem>
                <SelectItem value="grace-mensah">Grace Mensah — Women's Ministry</SelectItem>
                <SelectItem value="yaa-amponsah">Yaa Amponsah — Choir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="soul-date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input id="soul-date" type="date" defaultValue="2026-08-04" className="h-10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-name">
              Convert&apos;s Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="convert-name"
                placeholder="Full name of the person saved"
                className="h-10 rounded-lg pr-9"
              />
              <Info className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e2a4a]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-phone">Phone</Label>
              <Input id="convert-phone" placeholder="+233 24 000 0000" className="h-10 rounded-lg" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select defaultValue="new-convert">
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{(value) => statusLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-convert">New Convert</SelectItem>
                  <SelectItem value="active-member">Active Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-address">Address / Location</Label>
            <Input
              id="convert-address"
              placeholder="Area or neighbourhood"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-notes">Notes</Label>
            <textarea
              id="convert-notes"
              placeholder="Context about the encounter, follow-up needed, etc."
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col-reverse justify-end gap-3 rounded-b-xl border-t border-border bg-transparent px-4 py-4 sm:flex-row sm:px-6 sm:py-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
          >
            Save Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RecordSoulWonModal }
export default RecordSoulWonModal
