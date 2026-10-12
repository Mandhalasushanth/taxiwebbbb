import { CircleCheck, Lock, Mail, MessageSquareText, Phone, Send, User } from 'lucide-react'
import { Button } from '@shared/components'
import { CONTACT_FORM_COPY } from '../../data/marketingContent'
import { useEnquiryForm } from '../../hooks/useEnquiryForm'
import { ENQUIRY_LIMITS } from '../../validation/enquiryValidation'
import { EnquiryField } from './EnquiryField'
import { ServiceChips } from './ServiceChips'
import './ContactForm.css'

const FORM_TITLE_ID = 'mk-enquiry-title'
const copy = CONTACT_FORM_COPY

/** Enquiry form for signed-out visitors: live per-field validation and a success state */
export const ContactForm = () => {
  const form = useEnquiryForm()
  const { values, errors, validity, status } = form

  if (status === 'success') {
    return (
      <div className="mk-contact-form mk-contact-form--success" role="status">
        <span className="mk-contact-form__success-badge">
          <CircleCheck aria-hidden="true" />
        </span>
        <h3 className="mk-contact-form__success-title">{copy.successTitle}</h3>
        <p className="mk-contact-form__success-text">{copy.successText}</p>
        <p className="mk-contact-form__reference">
          Reference <strong>{form.reference}</strong>
        </p>
        <Button variant="secondary" onClick={form.reset}>
          {copy.resetLabel}
        </Button>
      </div>
    )
  }

  const messageHint = `${values.message.trim().length}/${ENQUIRY_LIMITS.messageMax}`

  return (
    <form className="mk-contact-form" onSubmit={form.handleSubmit} noValidate aria-labelledby={FORM_TITLE_ID}>
      <header className="mk-contact-form__header">
        <h2 id={FORM_TITLE_ID} className="mk-contact-form__title">
          {copy.title}
        </h2>
        <p className="mk-contact-form__subtitle">{copy.subtitle}</p>
      </header>

      <div className="mk-contact-form__row">
        <EnquiryField
          id="mk-enquiry-name"
          name="fullName"
          label="Full name"
          placeholder="e.g. Ravi Kumar"
          autoComplete="name"
          icon={<User />}
          maxLength={ENQUIRY_LIMITS.name}
          value={values.fullName}
          error={errors.fullName}
          isValid={validity.fullName}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        <EnquiryField
          id="mk-enquiry-mobile"
          name="mobile"
          type="tel"
          label="Mobile number"
          placeholder="10-digit mobile number"
          inputMode="numeric"
          autoComplete="tel-national"
          icon={<Phone />}
          prefix="+91"
          maxLength={ENQUIRY_LIMITS.mobile}
          value={values.mobile}
          error={errors.mobile}
          isValid={validity.mobile}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
      </div>

      <EnquiryField
        id="mk-enquiry-email"
        name="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        inputMode="email"
        autoComplete="email"
        icon={<Mail />}
        maxLength={ENQUIRY_LIMITS.email}
        value={values.email}
        error={errors.email}
        isValid={validity.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />

      <ServiceChips
        name="service"
        label={copy.serviceLabel}
        value={values.service}
        error={errors.service}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />

      <EnquiryField
        id="mk-enquiry-message"
        name="message"
        label="Message"
        placeholder="Tell us briefly how we can help"
        icon={<MessageSquareText />}
        multiline
        maxLength={ENQUIRY_LIMITS.messageMax}
        value={values.message}
        error={errors.message}
        isValid={validity.message}
        hint={messageHint}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />

      {form.submitError && (
        <p className="mk-contact-form__error" role="alert">
          {form.submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={status === 'submitting'}
        rightIcon={<Send size={18} />}
        className="mk-contact-form__submit"
      >
        {copy.submitLabel}
      </Button>

      <p className="mk-contact-form__footnote">
        <Lock aria-hidden="true" />
        {copy.footnote}
      </p>
    </form>
  )
}
