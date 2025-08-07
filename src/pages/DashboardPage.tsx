import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'
import { IncomeCard } from '../components/dashboard/IncomeCard'
import { ExpenseCard } from '../components/dashboard/ExpenseCard'
import { BalanceCard } from '../components/dashboard/BalanceCard'
import { SavingsCard } from '../components/dashboard/SavingsCard'
import { incomeService, type Income } from '../services/incomeService'
import { expenseService, type Expense } from '../services/expenseService'
import { savingsService, type SavingsGoal } from '../services/savingsService'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { toggleTheme } = useTheme()
  const [income, setIncome] = useState<Income | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const [incomeData, expensesData, goalsData] = await Promise.all([
        incomeService.getIncome(user.id),
        expenseService.getExpenses(user.id),
        savingsService.getSavingsGoals(user.id)
      ])
      
      setIncome(incomeData)
      setExpenses(expensesData)
      setSavingsGoals(goalsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIncome = async (monthlyAmount: number) => {
    if (!user) return
    const result = await incomeService.upsertMonthlyIncome(user.id, monthlyAmount)
    if (result) setIncome(result)
  }

  const handleUpdateBiweeklyIncome = async (firstAmount: number, secondAmount: number) => {
    if (!user) return
    const result = await incomeService.upsertBiweeklyIncome(user.id, firstAmount, secondAmount)
    if (result) setIncome(result)
  }

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const cleanExpenseData = {
      ...expenseData,
      user_id: user.id
    }
    
    if (expenseData.frequency !== 'monthly') {
      delete cleanExpenseData.biweekly_timing
    }
    
    const result = await expenseService.createExpense(cleanExpenseData)
    if (result) {
      setExpenses([result, ...expenses])
    } else {
      console.error('Failed to create expense')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    const success = await expenseService.deleteExpense(id)
    if (success) {
      setExpenses(expenses.filter(e => e.id !== id))
    }
  }

  const handleAddSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'monthly_required' | 'biweekly_required'>) => {
    if (!user) return
    const result = await savingsService.createSavingsGoal({
      ...goalData,
      user_id: user.id
    })
    if (result) setSavingsGoals([result, ...savingsGoals])
  }

  const handleUpdateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const result = await savingsService.updateSavingsGoal(id, updates)
    if (result) {
      setSavingsGoals(savingsGoals.map(goal => 
        goal.id === id ? result : goal
      ))
    }
  }

  const handleDeleteSavingsGoal = async (id: string) => {
    const success = await savingsService.deleteSavingsGoal(id)
    if (success) {
      setSavingsGoals(savingsGoals.filter(goal => goal.id !== id))
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Finanzas Personales</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                🌙
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <IncomeCard 
            income={income} 
            onUpdateMonthly={handleUpdateIncome}
            onUpdateBiweekly={handleUpdateBiweeklyIncome}
          />
          
          <BalanceCard 
            income={income}
            expenses={expenses}
          />
          
          <ExpenseCard
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
          
          <div className="xl:col-span-3">
            <SavingsCard
              goals={savingsGoals}
              onAddGoal={handleAddSavingsGoal}
              onUpdateGoal={handleUpdateSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
            />
          </div>
        </div>
      </main>
    </div>
  )
}