import { useState } from 'react'
import type { Income } from '../../services/incomeService'

interface IncomeCardProps {
  income: Income | null
  onUpdateMonthly: (monthlyAmount: number) => void
  onUpdateBiweekly: (firstAmount: number, secondAmount: number) => void
}

export function IncomeCard({ income, onUpdateMonthly, onUpdateBiweekly }: IncomeCardProps) {
  const [isEditing, setIsEditing] = useState(!income)
  const [incomeType, setIncomeType] = useState<'monthly' | 'biweekly'>(income?.income_type || 'monthly')
  const [monthlyAmount, setMonthlyAmount] = useState(income?.monthly_amount?.toString() || '')
  const [firstBiweekly, setFirstBiweekly] = useState(income?.first_biweekly_amount?.toString() || '')
  const [secondBiweekly, setSecondBiweekly] = useState(income?.second_biweekly_amount?.toString() || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (incomeType === 'monthly') {
      const amount = parseFloat(monthlyAmount)
      if (amount > 0) {
        onUpdateMonthly(amount)
        setIsEditing(false)
      }
    } else {
      const first = parseFloat(firstBiweekly)
      const second = parseFloat(secondBiweekly)
      if (first > 0 && second > 0) {
        onUpdateBiweekly(first, second)
        setIsEditing(false)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configurar Ingresos</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Ingreso
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="monthly"
                checked={incomeType === 'monthly'}
                onChange={(e) => setIncomeType(e.target.value as 'monthly')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Mensual</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="biweekly"
                checked={incomeType === 'biweekly'}
                onChange={(e) => setIncomeType(e.target.value as 'biweekly')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Por Quincenas</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {incomeType === 'monthly' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingreso Mensual
              </label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primera Quincena
                </label>
                <input
                  type="number"
                  value={firstBiweekly}
                  onChange={(e) => setFirstBiweekly(e.target.value)}
                  placeholder="25000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Segunda Quincena
                </label>
                <input
                  type="number"
                  value={secondBiweekly}
                  onChange={(e) => setSecondBiweekly(e.target.value)}
                  placeholder="25000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Guardar
            </button>
            {income && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="sm:flex-shrink-0 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ingresos</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Editar
        </button>
      </div>
      
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          {income?.income_type === 'monthly' ? 'Ingreso Mensual' : 'Ingreso por Quincenas'}
        </span>
      </div>

      {income?.income_type === 'biweekly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">1ra Quincena</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
              {formatCurrency(income?.first_biweekly_amount || 0)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">2da Quincena</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300 break-words">
              {formatCurrency(income?.second_biweekly_amount || 0)}
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">Total Mensual</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300 break-words">
            {formatCurrency(income?.calculated_monthly || 0)}
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">Promedio Quincenal</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-700 dark:text-indigo-300 break-words">
            {formatCurrency(income?.calculated_biweekly_avg || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}