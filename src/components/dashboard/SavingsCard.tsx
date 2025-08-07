import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { SavingsGoal } from '../../services/savingsService'

interface SavingsCardProps {
  goals: SavingsGoal[]
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'monthly_required' | 'biweekly_required'>) => void
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void
  onDeleteGoal: (id: string) => void
}

export function SavingsCard({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: SavingsCardProps) {
  const [showForm, setShowForm] = useState(false)
  const [showDebitModal, setShowDebitModal] = useState(false)
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false)
  const [selectedGoalForDebit, setSelectedGoalForDebit] = useState<string | null>(null)
  const [selectedGoalForCustomAmount, setSelectedGoalForCustomAmount] = useState<string | null>(null)
  const [debitAmount, setDebitAmount] = useState('')
  const [debitDescription, setDebitDescription] = useState('')
  const [customAmount, setCustomAmount] = useState('')
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

  const handleDebitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(debitAmount)
    
    if (amount > 0 && selectedGoalForDebit && debitDescription.trim()) {
      const goal = goals.find(g => g.id === selectedGoalForDebit)
      if (goal && goal.current_amount >= amount) {
        const newCurrentAmount = Math.max(0, goal.current_amount - amount)
        onUpdateGoal(selectedGoalForDebit, { current_amount: newCurrentAmount })
        
        setDebitAmount('')
        setDebitDescription('')
        setSelectedGoalForDebit(null)
        setShowDebitModal(false)
        
        console.log(`Débito registrado: ${debitDescription} - ${formatCurrency(amount)}`)
      } else if (goal && goal.current_amount < amount) {
        onUpdateGoal(selectedGoalForDebit, { current_amount: 0 })
        
        setDebitAmount('')
        setDebitDescription('')
        setSelectedGoalForDebit(null)
        setShowDebitModal(false)
        
        console.log(`Débito registrado (monto completo): ${debitDescription} - ${formatCurrency(goal.current_amount)}`)
      }
    }
  }

  const handleCustomAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(customAmount)
    
    if (amount > 0 && selectedGoalForCustomAmount) {
      handleAddProgress(selectedGoalForCustomAmount, amount)
      
      setCustomAmount('')
      setSelectedGoalForCustomAmount(null)
      setShowCustomAmountModal(false)
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

  const openDebitModal = (goalId: string) => {
    setSelectedGoalForDebit(goalId)
    setShowDebitModal(true)
  }

  const openCustomAmountModal = (goalId: string) => {
    setSelectedGoalForCustomAmount(goalId)
    setShowCustomAmountModal(true)
  }

  const totalSavings = goals.reduce((total, goal) => total + goal.current_amount, 0)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan de Ahorro</h3>
            {totalSavings > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total ahorrado: <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalSavings)}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDebitModal(true)}
              variant="outline"
              size="sm"
              disabled={goals.length === 0 || totalSavings === 0}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              }
            >
              Débito
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nueva Meta
            </Button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                type="text"
                placeholder="Nombre de la meta (ej: Carro)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Meta (ej: 100000)"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Ahorrado actualmente"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Meses para lograrlo"
                value={formData.target_months}
                onChange={(e) => setFormData({ ...formData, target_months: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Crear Meta
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
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
                  <div className="flex items-center gap-2">
                    {goal.current_amount > 0 && (
                      <button
                        onClick={() => openDebitModal(goal.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Registrar débito"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Eliminar meta"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
                        {goal.monthly_required <= 0 ? 'Meta alcanzada 🎉' : formatCurrency(goal.monthly_required)}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Quincenal requerido</p>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {goal.biweekly_required <= 0 ? 'Meta alcanzada 🎉' : formatCurrency(goal.biweekly_required)}
                      </p>
                    </div>
                  </div>
                )}

                {progress < 100 && (
                  <div className="flex flex-wrap gap-2">
                    {[100, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleAddProgress(goal.id, amount)}
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        +{formatCurrency(amount)}
                      </button>
                    ))}
                    <button
                      onClick={() => openCustomAmountModal(goal.id)}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                    >
                      + Personalizado
                    </button>
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


      <Modal
        isOpen={showDebitModal}
        onClose={() => {
          setShowDebitModal(false)
          setSelectedGoalForDebit(null)
          setDebitAmount('')
          setDebitDescription('')
        }}
        title="Registrar Débito (Gasto Imprevisto)"
      >
        <form onSubmit={handleDebitSubmit} className="space-y-5">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Registrar gasto imprevisto
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Este monto se descontará de tus ahorros actuales para reflejar el dinero real disponible.
                </p>
              </div>
            </div>
          </div>

          {!selectedGoalForDebit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar meta de ahorro
              </label>
              <select
                value={selectedGoalForDebit || ''}
                onChange={(e) => setSelectedGoalForDebit(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Selecciona una meta...</option>
                {goals.filter(goal => goal.current_amount > 0).map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} - {formatCurrency(goal.current_amount)} disponible
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Descripción del gasto"
            placeholder="Ej: Gasolina, emergencia médica, reparación..."
            value={debitDescription}
            onChange={(e) => setDebitDescription(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            required
          />

          <Input
            label="Monto del débito"
            type="number"
            step="0.01"
            placeholder="3000.00"
            value={debitAmount}
            onChange={(e) => setDebitAmount(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            required
          />

          {selectedGoalForDebit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">Meta seleccionada:</span> {goals.find(g => g.id === selectedGoalForDebit)?.name}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                <span className="font-medium">Disponible:</span> {formatCurrency(goals.find(g => g.id === selectedGoalForDebit)?.current_amount || 0)}
              </p>
              {debitAmount && parseFloat(debitAmount) > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  <span className="font-medium">Quedará:</span> {formatCurrency(Math.max(0, (goals.find(g => g.id === selectedGoalForDebit)?.current_amount || 0) - parseFloat(debitAmount)))}
                </p>
              )}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              }
            >
              Registrar Débito
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDebitModal(false)
                setSelectedGoalForDebit(null)
                setDebitAmount('')
                setDebitDescription('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>


      <Modal
        isOpen={showCustomAmountModal}
        onClose={() => {
          setShowCustomAmountModal(false)
          setSelectedGoalForCustomAmount(null)
          setCustomAmount('')
        }}
        title="Agregar Monto Personalizado"
      >
        <form onSubmit={handleCustomAmountSubmit} className="space-y-5">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Agregar dinero a tu meta
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Este monto se sumará a tus ahorros actuales y actualizará automáticamente los cálculos.
                </p>
              </div>
            </div>
          </div>

          {selectedGoalForCustomAmount && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-medium">Meta seleccionada:</span> {goals.find(g => g.id === selectedGoalForCustomAmount)?.name}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                <span className="font-medium">Actualmente tienes:</span> {formatCurrency(goals.find(g => g.id === selectedGoalForCustomAmount)?.current_amount || 0)}
              </p>
              {customAmount && parseFloat(customAmount) > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  <span className="font-medium">Tendrás:</span> {formatCurrency((goals.find(g => g.id === selectedGoalForCustomAmount)?.current_amount || 0) + parseFloat(customAmount))}
                </p>
              )}
            </div>
          )}

          <Input
            label="Monto a agregar"
            type="number"
            step="0.01"
            placeholder="2500.00"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            required
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Agregar Monto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCustomAmountModal(false)
                setSelectedGoalForCustomAmount(null)
                setCustomAmount('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}