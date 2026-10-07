import { STAGE_LABELS } from '@modules/staff/constants/staff.constants'
import type { PipelineStage } from '@modules/staff/types/staff.types'
import './PipelineBar.css'

export interface PipelineBarProps {
  stages: PipelineStage[]
}

export const PipelineBar = ({ stages }: PipelineBarProps) => (
  <ol className="pipeline">
    {stages.map((stage) => (
      <li className="pipeline__step" key={stage.stage}>
        <span className="pipeline__count">{stage.count}</span>
        <span className="pipeline__label">{STAGE_LABELS[stage.stage]}</span>
      </li>
    ))}
  </ol>
)
