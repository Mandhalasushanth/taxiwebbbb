// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ItrFilingHeaderStepper } from '../../src/modules/itr/components/ItrFiling/itrFiling.constants'
import { ItrStepHeaderStepper } from '../../src/modules/itr/components/ItrFiling/ItrStepHeaderStepper'

describe('ITR Stepper Connecting Lines', () => {
  it('renders connecting lines between all steps in ItrFilingHeaderStepper with completed lines for past steps', () => {
    const { container } = render(<ItrFilingHeaderStepper currentStepId={3} />)
    const track = container.querySelector('.itr-stepper-track')
    expect(track).toBeTruthy()

    // 4 step dots
    const dots = container.querySelectorAll('.itr-stepper-dot')
    expect(dots.length).toBe(4)

    // Exactly 3 connecting lines between the 4 dots
    const lines = container.querySelectorAll('.itr-stepper-line')
    expect(lines.length).toBe(3)

    // For currentStepId = 3, lines after steps 1 and 2 should be completed
    const completedLines = container.querySelectorAll('.itr-stepper-line--completed')
    expect(completedLines.length).toBe(2)
  })

  it('renders connecting lines in ItrStepHeaderStepper', () => {
    const { container } = render(<ItrStepHeaderStepper currentStepId={3} />)
    const lines = container.querySelectorAll('.itr-stepper-line')
    expect(lines.length).toBe(3)

    const completedLines = container.querySelectorAll('.itr-stepper-line--completed')
    expect(completedLines.length).toBe(2)
  })
})
