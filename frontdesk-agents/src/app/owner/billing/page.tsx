"use client"

import OwnerBillingContent from "@/components/OwnerBillingContent"

// Renders the shared billing content component as a standalone page.
// The `embedded={false}` prop shows the full header (back button, title, actions).
export default function OwnerBillingPage() {
  return <OwnerBillingContent embedded={false} />
}
