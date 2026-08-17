import { z } from 'zod'

export const checkInSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  source: z.enum(['manual', 'biometric', 'mobile', 'web']).default('manual'),
})

export type CheckInFormData = z.infer<typeof checkInSchema>

export const shiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required'),
  nameAr: z.string().optional().or(z.literal('')),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakMinutes: z.number().min(0).max(240).default(60),
  isActive: z.boolean().default(true),
  notes: z.string().optional().or(z.literal('')),
})

export type ShiftFormData = z.infer<typeof shiftSchema>

export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  nameAr: z.string().optional().or(z.literal('')),
  daysPerYear: z.number().min(1, 'Days per year is required').max(365),
  isPaid: z.boolean().default(true),
  isCarryOver: z.boolean().default(false),
  maxCarryOverDays: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  color: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>

export const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalDays: z.number().min(1, 'At least 1 day is required'),
  reason: z.string().optional().or(z.literal('')),
})

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

export const attendanceFilterSchema = z.object({
  employeeId: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
})

export type AttendanceFilterFormData = z.infer<typeof attendanceFilterSchema>

export const attendanceReportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  employeeId: z.string().optional().or(z.literal('')),
})

export type AttendanceReportFormData = z.infer<typeof attendanceReportSchema>
