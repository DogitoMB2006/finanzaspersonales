import type { Income } from '../../services/incomeService'
import type { Expense } from '../../services/expenseService'

interface BalanceCardProps {
  income: Income | null
  expenses: Expense[]
}

export function BalanceCard({ income, expenses }: BalanceCardProps) {
  const calculateExpenseTotal = (frequency: 'monthly' | 'first' | 'second') => {
    return expenses.reduce((total, expense) => {
      switch (expense.frequency) {
        case 'daily':
          return total + (expense.amount * (frequency === 'monthly' ? 30 : 15))
        case 'weekly':
          return total + (expense.amount * (frequency === 'monthly' ? 4 : 2))
        case 'biweekly':
          return total + (expense.amount * (frequency === 'monthly' ? 2 : 1))
        case 'monthly':
        default:
          if (frequency === 'monthly') {
            return total + expense.amount
          }
          
          if (!expense.biweekly_timing || expense.biweekly_timing === 'both') {
            return total + (expense.amount / 2)
          }
          
          if (expense.biweekly_timing === frequency) {
            return total + expense.amount
          }
          
          return total
      }
    }, 0)
  }

  const monthlyIncome = income?.calculated_monthly || 0
  const biweeklyAvgIncome = income?.calculated_biweekly_avg || 0
  const firstBiweeklyIncome = income?.first_biweekly_amount || biweeklyAvgIncome
  const secondBiweeklyIncome = income?.second_biweekly_amount || biweeklyAvgIncome
  
  const monthlyExpenses = calculateExpenseTotal('monthly')
  const firstBiweeklyExpenses = calculateExpenseTotal('first')
  const secondBiweeklyExpenses = calculateExpenseTotal('second')
  
  const monthlyBalance = monthlyIncome - monthlyExpenses
  const firstBiweeklyBalance = firstBiweeklyIncome - firstBiweeklyExpenses
  const secondBiweeklyBalance = secondBiweeklyIncome - secondBiweeklyExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-700 dark:text-green-300'
    if (balance < 0) return 'text-red-700 dark:text-red-300'
    return 'text-gray-700 dark:text-gray-300'
  }

  const getBalanceBgColor = (balance: number) => {
    if (balance > 0) return 'bg-green-50 dark:bg-green-900/20'
    if (balance < 0) return 'bg-red-50 dark:bg-red-900/20'
    return 'bg-gray-50 dark:bg-gray-700'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Balance Disponible</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className={`${getBalanceBgColor(monthlyBalance)} rounded-lg p-3 lg:p-4`}>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Balance Mensual Total</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getBalanceColor(monthlyBalance)} break-words`}>
            {formatCurrency(monthlyBalance)}
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Ingresos:</span>
              <span>{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos:</span>
              <span>{formatCurrency(monthlyExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`${getBalanceBgColor(firstBiweeklyBalance)} rounded-lg p-3 lg:p-4`}>
          <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">1ra Quincena</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${getBalanceColor(firstBiweeklyBalance)} break-words`}>
            {formatCurrency(firstBiweeklyBalance)}
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Ingresos:</span>
              <span>{formatCurrency(firstBiweeklyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos:</span>
              <span>{formatCurrency(firstBiweeklyExpenses)}</span>
            </div>
          </div>
        </div>
        
        <div className={`${getBalanceBgColor(secondBiweeklyBalance)} rounded-lg p-3 lg:p-4`}>
          <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">2da Quincena</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${getBalanceColor(secondBiweeklyBalance)} break-words`}>
            {formatCurrency(secondBiweeklyBalance)}
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Ingresos:</span>
              <span>{formatCurrency(secondBiweeklyIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos:</span>
              <span>{formatCurrency(secondBiweeklyExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {(firstBiweeklyBalance < 0 || secondBiweeklyBalance < 0) && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">
            ⚠️ {firstBiweeklyBalance < 0 && secondBiweeklyBalance < 0 
              ? 'Ambas quincenas tienen gastos que superan los ingresos' 
              : firstBiweeklyBalance < 0 
                ? 'La primera quincena tiene gastos que superan los ingresos'
                : 'La segunda quincena tiene gastos que superan los ingresos'
            }. Considera ajustar la distribución de gastos.
          </p>
        </div>
      )}

      {monthlyBalance > 0 && firstBiweeklyBalance > 0 && secondBiweeklyBalance > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
            ✅ ¡Excelente! Tienes balance positivo en ambas quincenas. 
            Considera crear metas de ahorro para aprovechar estos fondos.
          </p>
        </div>
      )}
    </div>
  )
}