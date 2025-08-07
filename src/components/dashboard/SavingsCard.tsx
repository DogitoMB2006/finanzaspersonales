import { useState } from 'react'
import type { SavingsGoal } from '../../services/savingsService'

interface SavingsCardProps {
  goals: SavingsGoal[]
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'monthly_required' | 'biweekly_required'>) => void
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void
  onDeleteGoal: (id: string) => void
}

export function SavingsCard({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: SavingsCardProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_months: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetAmount = parseFloat(formData.target_amount)
    const currentAmount = parseFloat(formData.current_amount)
    const targetMonths = parseInt(formData.target_months)

    if (targetAmount > 0 && targetMonths > 0 && formData.name.trim()) {
      onAddGoal({
        user_id: '',
        name: formData.name,
        target_amount: targetAmount,
        current_amount: currentAmount || 0,
        target_months: targetMonths
      })
      setFormData({ name: '', target_amount: '', current_amount: '', target_months: '' })
      setShowForm(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount)
  }

  const calculateProgress = (goal: SavingsGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const handleAddProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      const newCurrentAmount = goal.current_amount + amount
      onUpdateGoal(goalId, { current_amount: newCurrentAmount })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan de Ahorro</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          + Nueva Meta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre de la meta (ej: Carro)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Meta (ej: 100000)"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Ahorrado actualmente"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              placeholder="Meses para lograrlo"
              value={formData.target_months}
              onChange={(e) => setFormData({ ...formData, target_months: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Crear Meta
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {goals.map((goal) => {
          const progress = calculateProgress(goal)
          const remainingAmount = goal.target_amount - goal.current_amount
          
          return (
            <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progreso</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {remainingAmount > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Mensual requerido</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(goal.monthly_required)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Quincenal requerido</p>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(goal.biweekly_required)}
                    </p>
                  </div>
                </div>
              )}

              {progress < 100 && (
                <div className="flex gap-2">
                  {[100, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleAddProgress(goal.id, amount)}
                      className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      +{formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              )}

              {progress >= 100 && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded p-2">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">
                    🎉 ¡Meta alcanzada!
                  </p>
                </div>
              )}
            </div>
          )
        })}
        
        {goals.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-500 dark:text-gray-400">
              No tienes metas de ahorro aún
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Crea tu primera meta para empezar a ahorrar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}