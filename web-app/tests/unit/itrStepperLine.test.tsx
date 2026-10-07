// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ItrFilingHeaderStepper } from '../../src/modules/itr/components/ItrFiling/itrFiling.constants'
import { ItrStepHeaderStepper } from '../../src/modules/itr/components/ItrFiling/ItrStepHeaderStepper'

describe('ITR Stepper Connecting Lines', () => {
  it('renders connecting lines between all steps in ItrFilingHeaderStepper with completed lines for past steps', () => {
    const { container } = render(<ItrFilingHeaderStepper currentStepId={4} />)
    const track = container.querySelector('.itr-stepper-track')
    expect(track).toBeTruthy()

    // 5 step dots
    const dots = container.querySelectorAll('.itr-stepper-dot')
    expect(dots.length).toBe(5)

    // Exactly 4 connecting lines between the 5 dots
    const lines = container.querySelectorAll('.itr-stepper-line')
    expect(lines.length).toBe(4)

    // For currentStepId = 4, lines after steps 1, 2, and 3 should be completed
    const completedLines = container.querySelectorAll('.itr-stepper-line--completed')
    expect(completedLines.length).toBe(3)
  })

  it('renders connecting lines in ItrStepHeaderStepper', () => {
    const { container } = render(<ItrStepHeaderStepper currentStepId={4} />)
    const lines = container.querySelectorAll('.itr-stepper-line')
    expect(lines.length).toBe(4)

    const completedLines = container.querySelectorAll('.itr-stepper-line--completed')
    expect(completedLines.length).toBe(3)
  })
})
