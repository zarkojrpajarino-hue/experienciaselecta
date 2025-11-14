import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { validateAddress, validateAddressWithGoogle } from '@/lib/addressValidation'

interface AddressInputProps {
  address: string
  city: string
  postalCode: string
  onAddressChange: (field: string, value: string) => void
  onValidationComplete?: (valid: boolean) => void
  showValidation?: boolean
}

export default function AddressInput({
  address,
  city,
  postalCode,
  onAddressChange,
  onValidationComplete,
  showValidation = true
}: AddressInputProps) {
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message?: string
    confidence?: 'high' | 'medium' | 'low'
  } | null>(null)

  const handleValidate = async () => {
    // 1. Validación básica primero
    const basicValidation = validateAddress({ address, city, postalCode })
    
    if (!basicValidation.valid) {
      setValidationResult({
        valid: false,
        message: basicValidation.errors.join('. ')
      })
      onValidationComplete?.(false)
      return
    }

    // 2. Validación con Google Maps
    if (showValidation) {
      setValidating(true)
      
      const googleValidation = await validateAddressWithGoogle({
        address,
        city,
        postalCode,
        country: 'España'
      })

      setValidating(false)

      if (googleValidation.valid) {
        setValidationResult({
          valid: true,
          message: 'Dirección verificada correctamente',
          confidence: googleValidation.confidence
        })
        onValidationComplete?.(true)
      } else {
        setValidationResult({
          valid: false,
          message: googleValidation.error || 'No se pudo verificar la dirección'
        })
        onValidationComplete?.(false)
      }
    }
  }

  const handleBlur = () => {
    // Auto-validar cuando el usuario termina de escribir
    if (address && city && postalCode) {
      handleValidate()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          placeholder="Calle y número (ej: Calle Mayor 15)"
          value={address}
          onChange={(e) => onAddressChange('address', e.target.value)}
          onBlur={handleBlur}
          className={validationResult?.valid === false ? 'border-red-500' : ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            placeholder="Madrid"
            value={city}
            onChange={(e) => onAddressChange('city', e.target.value)}
            onBlur={handleBlur}
            className={validationResult?.valid === false ? 'border-red-500' : ''}
          />
        </div>

        <div>
          <Label htmlFor="postalCode">Código Postal *</Label>
          <Input
            id="postalCode"
            placeholder="28001"
            value={postalCode}
            onChange={(e) => onAddressChange('postalCode', e.target.value)}
            onBlur={handleBlur}
            maxLength={5}
            className={validationResult?.valid === false ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {showValidation && (
        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={validating || !address || !city || !postalCode}
          className="w-full"
        >
          {validating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando dirección...
            </>
          ) : (
            'Verificar dirección'
          )}
        </Button>
      )}

      {validationResult && (
        <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
          {validationResult.valid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            {validationResult.message}
            {validationResult.valid && validationResult.confidence === 'medium' && (
              <p className="text-xs mt-1 text-yellow-600">
                ⚠️ Verificación parcial - asegúrate de que el número de portal sea correcto
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
