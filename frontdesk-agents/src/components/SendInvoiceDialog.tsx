import { Mail, Loader2 } from "lucide-react"
import type { BillingRecordWithCustomer } from "@/lib/supabase"

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

interface SendInvoiceDialogProps {
  record: BillingRecordWithCustomer
  isSending: boolean
  onClose: () => void
  onSend: () => void
}

export default function SendInvoiceDialog({
  record,
  isSending,
  onClose,
  onSend,
}: SendInvoiceDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Send Invoice</h3>
            <p className="text-sm text-gray-400">
              This will email the invoice PDF to the customer
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-6 p-3 bg-gray-800/50 rounded-lg text-sm">
          {record.customer_name && (
            <div className="flex justify-between">
              <span className="text-gray-400">Customer</span>
              <span className="text-white font-medium">
                {record.customer_name}
              </span>
            </div>
          )}
          {record.business_name && (
            <div className="flex justify-between">
              <span className="text-gray-400">Business</span>
              <span className="text-white">{record.business_name}</span>
            </div>
          )}
          {record.customer_email && (
            <div className="flex justify-between">
              <span className="text-gray-400">Email to</span>
              <span className="text-white">{record.customer_email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">
              {formatCurrency(record.amount, record.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Invoice</span>
            <span className="text-white font-mono text-xs">
              {record.invoice_id}
            </span>
          </div>
          {record.description && (
            <div className="pt-1 border-t border-gray-700/50 text-gray-300 text-xs line-clamp-2">
              {record.description}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Send Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
