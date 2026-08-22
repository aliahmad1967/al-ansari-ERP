# HR, Attendance & Payroll Modules

---

## 1. HR Module

**Path**: `src/modules/hr/`
**Purpose**: Employee management, departments, positions, contracts, shifts, leave, documents.

### Models (10)
- Employee, Department, Position, Contract, Shift, LeaveType, Leave, Document, EmployeeHistory, ShiftAssignment

### Repositories (10)
- `EmployeeRepository` — `findAll()`, `findByCompanyId()`, `findByDepartmentId()`, `findByStatus()`, `search()`
- `DepartmentRepository` — `findAll()`, `findByCompanyId()`, `findHierarchy()`
- `PositionRepository` — `findAll()`, `findByCompanyId()`, `findByDepartmentId()`
- `ContractRepository` — `findByEmployeeId()`, `findActiveByEmployeeId()`, `findExpiringSoon()`
- `ShiftRepository`, `LeaveTypeRepository`, `LeaveRepository`, `DocumentRepository`, `EmployeeHistoryRepository`, `ShiftAssignmentRepository`

### Services
- `EmployeeService` — Create/update/terminate employee, generate employee number
- `DepartmentService` — CRUD + hierarchy management
- `ContractService` — Create/renew/expire contracts
- `LeaveService` — Request/approve/reject leave, check balance
- `DocumentService` — Upload/retrieve employee documents

### Hooks
| Hook | Purpose |
|---|---|
| `useEmployees(filters?)` | Employee list with filtering |
| `useEmployeeById(id)` | Single employee detail |
| `useEmployeeCreate()` | Create employee mutation |
| `useEmployeeUpdate()` | Update employee mutation |
| `useDepartments()` | Department list |
| `useContracts(employeeId?)` | Contract list |
| `useLeaveRequests(filters?)` | Leave request list |
| `useLeaveBalance(employeeId)` | Leave balance |

### Components
| Component | Description |
|---|---|
| EmployeeForm | Create/edit employee form |
| EmployeeTable | Employee list table |
| EmployeeView | Employee detail view |
| ContractForm | Create/edit contract |
| LeaveRequestForm | Leave request form |
| DocumentUploader | Document upload component |

### Pages
| Page | Route | Permission |
|---|---|---|
| EmployeeListPage | `/hr/employees` | `hr.employee.view` |
| EmployeeDetailPage | `/hr/employees/:id` | `hr.employee.view` |
| EmployeeCreatePage | `/hr/employees/create` | `hr.employee.create` |
| EmployeeEditPage | `/hr/employees/:id/edit` | `hr.employee.update` |
| DepartmentListPage | `/hr/departments` | `hr.department.view` |
| PositionListPage | `/hr/positions` | `hr.position.view` |
| ContractListPage | `/hr/contracts` | `hr.contract.view` |
| LeaveListPage | `/hr/leave` | `hr.leave.view` |

### Tests
- `employee.test.ts` — CRUD, validation, number generation
- `department.test.ts` — CRUD, hierarchy
- `contract.test.ts` — Create, renew, expiry
- `leave.test.ts` — Request, approval, balance calculation
- `employeeHistory.test.ts` — Audit trail

---

## 2. Attendance Module

**Path**: `src/modules/attendance/`
**Purpose**: Clock in/out tracking, daily summaries, shift management, schedules.

### Models (5)
- AttendanceRecord, DailyAttendanceSummary, ShiftAssignment, Schedule, ScheduleEntry

### Repositories (5)
- `AttendanceRecordRepository` — `findByEmployeeAndDate()`, `findByDateRange()`, `findTodaysRecords()`
- `DailyAttendanceSummaryRepository` — `findByEmployeeAndDate()`, `findMonthlySummaries()`
- `ShiftAssignmentRepository` — `findActiveByEmployee()`, `findByDate()`
- `ScheduleRepository`, `ScheduleEntryRepository`

### Services
- `AttendanceService` — Clock in/out, calculate work hours, detect lateness
- `DevAttendanceService` — Generate sample attendance data for testing

### Hooks
| Hook | Purpose |
|---|---|
| `useAttendance(filters?)` | Attendance records list |
| `useClockInOut()` | Clock in/out actions |
| `useTodayAttendance(employeeId?)` | Today's attendance status |
| `useAttendanceSummary(employeeId, month)` | Monthly summary |

### Components
| Component | Description |
|---|---|
| AttendanceTable | Attendance list table |
| ClockInOutButton | Clock in/out button |
| AttendanceCalendar | Calendar view of attendance |

### Pages
| Page | Route | Permission |
|---|---|---|
| AttendanceListPage | `/attendance/records` | `attendance.record.view` |
| AttendanceSummaryPage | `/attendance/summaries` | `attendance.summary.view` |
| SchedulePage | `/attendance/schedules` | `attendance.schedule.view` |

### Tests
- `attendance.test.ts` — Clock in/out, work hours, lateness detection
- `summary.test.ts` — Daily summary calculation

---

## 3. Payroll Module

**Path**: `src/modules/payroll/`
**Purpose**: Payroll run processing, payslips, earning/deduction types, GL export.

### Models (8)
- PayrollRun, Payslip, EarningType, DeductionType, Earning, Deduction, EndOfServiceBenefit, PayrollGLExport

### Repositories (9)
- `PayrollRunRepository` — `findByPeriod()`, `findByStatus()`, `findPosted()`
- `PayslipRepository` — `findByPayrollRun()`, `findByEmployee()`, `findUnpaid()`
- `EarningTypeRepository`, `DeductionTypeRepository`, `EarningRepository`, `DeductionRepository`, `EndOfServiceBenefitRepository`, `PayrollGLExportRepository`

### Services
- `PayrollService` — Run payroll, generate payslips, calculate totals
- `PayrollGLExportService` — Export payroll to journal entries

### Hooks
| Hook | Purpose |
|---|---|
| `usePayrollRuns(filters?)` | Payroll run list |
| `usePayrollRunById(id)` | Single payroll run detail |
| `usePayslips(payrollRunId?)` | Payslips for a run |
| `usePayrollProcess()` | Process payroll action |
| `usePayrollPost()` | Post payroll to GL |
| `useEarningTypes()` | Earning type list |
| `useDeductionTypes()` | Deduction type list |

### Calculation Logic
```
Net Pay = Basic Salary + Total Earnings - Total Deductions
Earnings: Housing + Transport + Other Allowances + Overtime
Deductions: GOSI Employee (11%) + Tax + Loan Repayments + Other
End-of-Service: Based on years of service (Saudi labor law)
```

### Pages
| Page | Route | Permission |
|---|---|---|
| PayrollRunListPage | `/payroll/runs` | `payroll.run.view` |
| PayrollRunDetailPage | `/payroll/runs/:id` | `payroll.run.view` |
| PayslipListPage | `/payroll/payslips` | `payroll.payslip.view` |
| EarningTypePage | `/payroll/earning-types` | `payroll.config.view` |
| DeductionTypePage | `/payroll/deduction-types` | `payroll.config.view` |

### Tests
- `payroll.test.ts` — Run calculation, total verification
- `payslip.test.ts` — Generation, earning/deduction totals
- `endOfService.test.ts` — Benefit calculation per Saudi law
- `payrollGLExport.test.ts` — Journal entry creation
