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

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  deceased: "Deceased",
}

const genderLabels = {
  male: "Male",
  female: "Female",
}

const groupLabels = {
  choir: "Choir",
  ushers: "Ushers",
  youth: "Youth",
  elders: "Elders",
  "womens-ministry": "Women's Ministry",
}

function AddMemberModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="font-heading text-lg font-normal sm:text-xl">
            Add New Member
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-name">Full Name</Label>
            <Input id="member-name" placeholder="e.g. Kwame Mensah" className="h-10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-email">Email</Label>
            <Input id="member-email" placeholder="email@example.com" className="h-10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-phone">Phone</Label>
            <Input id="member-phone" placeholder="+233 24 000 0000" className="h-10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-address">Address</Label>
            <Input id="member-address" placeholder="Street, City" className="h-10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-joined">Join Date</Label>
            <Input id="member-joined" type="date" className="h-10 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select defaultValue="active">
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{(value) => statusLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select defaultValue="male">
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{(value) => genderLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Group</Label>
              <Select defaultValue="choir">
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{(value) => groupLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="choir">Choir</SelectItem>
                  <SelectItem value="ushers">Ushers</SelectItem>
                  <SelectItem value="youth">Youth</SelectItem>
                  <SelectItem value="elders">Elders</SelectItem>
                  <SelectItem value="womens-ministry">Women's Ministry</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddMemberModal }
export default AddMemberModal
