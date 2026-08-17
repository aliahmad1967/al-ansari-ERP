import { z } from 'zod'

export const employeeSchema = z.object({
  employeeNumber: z.string().min(2, 'Employee number must be at least 2 characters').max(32),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  firstNameAr: z.string().optional().or(z.literal('')),
  lastNameAr: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  nationalId: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  positionId: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  employmentDate: z.string().min(1, 'Employment date is required'),
  status: z.enum(['active', 'inactive', 'suspended', 'terminated']).default('active'),
  notes: z.string().optional().or(z.literal('')),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

export const contractSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  contractNumber: z.string().min(1, 'Contract number is required').max(32),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).default('full-time'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  salary: z.number().optional().or(z.literal(0)),
  status: z.enum(['active', 'expired', 'terminated']).default('active'),
  notes: z.string().optional().or(z.literal('')),
})

export type ContractFormData = z.infer<typeof contractSchema>

export const documentSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
  fileUrl: z.string().optional().or(z.literal('')),
  expiryDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type DocumentFormData = z.infer<typeof documentSchema>

export const emergencyContactSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  relationship: z.string().min(1, 'Relationship is required'),
})

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>

export const educationSchema = z.object({
  employeeId: z.string().min(1),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type EducationFormData = z.infer<typeof educationSchema>

export const experienceSchema = z.object({
  employeeId: z.string().min(1),
  company: z.string().min(1, 'Company is required'),
  title: z.string().min(1, 'Title is required'),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

export type ExperienceFormData = z.infer<typeof experienceSchema>

export const skillSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  category: z.string().optional().or(z.literal('')),
})

export type SkillFormData = z.infer<typeof skillSchema>
