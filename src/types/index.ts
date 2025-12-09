/**
 * Common type definitions used across the application
 */

// Generic component props with className support
export interface BaseProps {
  className?: string;
}

// Navigation item
export interface NavItem {
  href: string;
  label: string;
  external?: boolean;
}

// Service item
export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

// Testimonial item
export interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
}

// FAQ item
export interface FaqItem {
  question: string;
  answer: string;
}

// Segment item
export interface SegmentItem {
  icon: string;
  title: string;
  description: string;
}

// Contact form data
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

// Social link
export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

// Section props base
export interface SectionProps extends BaseProps {
  id?: string;
}
