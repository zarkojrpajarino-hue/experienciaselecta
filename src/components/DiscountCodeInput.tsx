import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Tag } from 'lucide-react'

interface DiscountCodeInputProps {
  basketName: string
  purchaseAmount: number
  userEmail: string
  onDiscountApplied: (discount: DiscountResult) => void
  onDiscountRemoved: () => void
}

interface DiscountResult {
  valid: boolean
  code?: string
  discount_code_id?: string
  discount_amount?: number
  final_amount?: number
  original_amount?: number
  savings?: number
  description?: string
  error?: string
}

export default function DiscountCodeInput({
  basketName,
  purchaseAmount,
  userEmail,
  onDiscountApplied,
  onDiscountRemoved
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiscountResult | null>(null)
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountResult | null>(null)

  const handleValidate = async () => {
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: {
          code: code.trim(),
          user_email: userEmail,
          basket_name: basketName,
          purchase_amount: purchaseAmount
        }
      })

      if (error) throw error

      setResult(data)

      if (data.valid) {
        setAppliedDiscount(data)
        onDiscountApplied(data)
      }

    } catch (error) {
      console.error('Error validating discount code:', error)
      setResult({
        valid: false,
        error: 'Error al validar el código. Inténtalo de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setResult(null)
    setAppliedDiscount(null)
    onDiscountRemoved()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Código de descuento"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading || !!appliedDiscount}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !appliedDiscount) {
                handleValidate()
              }
            }}
          />
        </div>
        
        {!appliedDiscount ? (
          <Button
            onClick={handleValidate}
            disabled={!code.trim() || loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Aplicar'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleRemove}
            variant="outline"
            className="text-destructive"
          >
            Quitar
          </Button>
        )}
      </div>

      {result && (
        <Alert 
          variant={result.valid ? 'default' : 'destructive'}
          className={result.valid ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
        >
          {result.valid ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.valid ? (
              <div className="space-y-1">
                <p className="font-semibold text-green-900 dark:text-green-100">
                  ¡Código aplicado con éxito! 🎉
                </p>
                {result.description && (
                  <p className="text-sm text-green-700 dark:text-green-300">{result.description}</p>
                )}
                <p className="text-sm text-green-700 dark:text-green-300">
                  Ahorras: <strong>{result.savings?.toFixed(2)}€</strong>
                </p>
              </div>
            ) : (
              <p>{result.error}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {appliedDiscount && appliedDiscount.valid && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Código: {appliedDiscount.code}
            </span>
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
              -{appliedDiscount.discount_amount?.toFixed(2)}€
            </span>
          </div>
          <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
            <div className="flex justify-between">
              <span>Precio original:</span>
              <span className="line-through">{appliedDiscount.original_amount?.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-bold text-green-900 dark:text-green-100">
              <span>Total a pagar:</span>
              <span>{appliedDiscount.final_amount?.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
