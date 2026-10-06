import { useState, useCallback } from 'react'

export interface UseGSTEditFlowOptions<TStep = number> {
  reviewStep: TStep
  onNavigateToStep: (step: TStep) => void
}

export function useGSTEditFlow<TStep = number>({
  reviewStep,
  onNavigateToStep,
}: UseGSTEditFlowOptions<TStep>) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)

  const startEditing = useCallback(
    (stepToEdit: TStep, section?: string) => {
      setIsEditMode(true)
      setEditingSection(section || null)
      onNavigateToStep(stepToEdit)
    },
    [onNavigateToStep]
  )

  const returnToReview = useCallback(() => {
    setIsEditMode(false)
    setEditingSection(null)
    onNavigateToStep(reviewStep)
  }, [onNavigateToStep, reviewStep])

  const cancelEditing = useCallback(() => {
    setIsEditMode(false)
    setEditingSection(null)
    onNavigateToStep(reviewStep)
  }, [onNavigateToStep, reviewStep])

  return {
    isEditMode,
    editingSection,
    startEditing,
    returnToReview,
    cancelEditing,
  }
}

export default useGSTEditFlow
