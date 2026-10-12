import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { classNames, initialsOf } from '@shared/utils'
import { SectionHeading } from '../../components/SectionHeading/SectionHeading'
import { MARKETING_TESTIMONIALS, TESTIMONIALS_SECTION } from '../../data/marketingContent'
import { useCarousel } from '../../hooks/useCarousel'
import type { MarketingTestimonial } from '../../types/marketing.types'
import './Testimonials.css'

const HEADING_ID = 'mk-testimonials-title'
const MAX_RATING = 5
const STAR_SLOTS = Array.from({ length: MAX_RATING }, (_, slot) => slot + 1)

const renderStars = (rating: number) => (
  <span className="mk-testimonial__stars" role="img" aria-label={`Rated ${rating} out of ${MAX_RATING}`}>
    {STAR_SLOTS.map((slot) => (
      <Star key={slot} aria-hidden="true" className={slot <= rating ? 'is-filled' : undefined} />
    ))}
  </span>
)

const renderSlide = (activeIndex: number) => (testimonial: MarketingTestimonial, index: number) => (
  <figure
    key={testimonial.id}
    className="mk-testimonial"
    role="group"
    aria-roledescription="slide"
    aria-label={`${index + 1} of ${MARKETING_TESTIMONIALS.length}`}
    aria-hidden={index !== activeIndex}
  >
    <Quote className="mk-testimonial__quote-icon" aria-hidden="true" />
    {renderStars(testimonial.rating)}
    <blockquote className="mk-testimonial__quote">“{testimonial.quote}”</blockquote>
    <figcaption className="mk-testimonial__author">
      <span className="mk-testimonial__name">{testimonial.name}</span>
      <span className="mk-testimonial__role">
        {testimonial.role} · {testimonial.city}
      </span>
    </figcaption>
  </figure>
)

/** Auto-playing testimonial carousel with arrows and avatar navigation */
export const Testimonials = () => {
  const { index, isPaused, goTo, next, previous, pauseHandlers } = useCarousel(MARKETING_TESTIMONIALS.length)

  const renderAvatar = (testimonial: MarketingTestimonial, avatarIndex: number) => (
    <button
      key={testimonial.id}
      type="button"
      className={classNames('mk-testimonials__avatar', avatarIndex === index && 'mk-testimonials__avatar--active')}
      aria-label={`Show review from ${testimonial.name}`}
      aria-current={avatarIndex === index}
      onClick={() => goTo(avatarIndex)}
    >
      {initialsOf(testimonial.name)}
    </button>
  )

  return (
    <section className="mk-section" aria-labelledby={HEADING_ID}>
      <div className="mk-container">
        <SectionHeading copy={TESTIMONIALS_SECTION} headingId={HEADING_ID} />

        <div className="mk-testimonials" aria-roledescription="carousel" aria-labelledby={HEADING_ID} {...pauseHandlers}>
          <button type="button" className="mk-testimonials__arrow" aria-label="Previous review" onClick={previous}>
            <ChevronLeft aria-hidden="true" />
          </button>

          {/* Announce slide changes only when the user is driving the carousel, not on autoplay */}
          <div className="mk-testimonials__viewport" aria-live={isPaused ? 'polite' : 'off'}>
            <div className="mk-testimonials__track" style={{ transform: `translateX(-${index * 100}%)` }}>
              {MARKETING_TESTIMONIALS.map(renderSlide(index))}
            </div>
          </div>

          <button type="button" className="mk-testimonials__arrow" aria-label="Next review" onClick={next}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="mk-testimonials__avatars">{MARKETING_TESTIMONIALS.map(renderAvatar)}</div>
      </div>
    </section>
  )
}
